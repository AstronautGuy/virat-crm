import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { breadcrumbs } from "@/server/db/schema/breadcrumbs";
import { dailyMileage } from "@/server/db/schema/daily_mileage";
import { inArray, sql } from "drizzle-orm";
import { distance } from "@turf/turf";
import { point } from "@turf/helpers";

export const maxDuration = 300; // Vercel Cron Max duration (5 mins)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch all breadcrumbs, ordered by userId and createdAt
    const allBreadcrumbs = await db.query.breadcrumbs.findMany({
      orderBy: (breadcrumbs, { asc }) => [
        asc(breadcrumbs.userId),
        asc(breadcrumbs.createdAt),
      ],
    });

    if (allBreadcrumbs.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    // 2. Group by User and Date
    type Breadcrumb = (typeof allBreadcrumbs)[0];
    const grouped: Record<string, Breadcrumb[]> = {};

    for (const b of allBreadcrumbs) {
      // Localize to Asia/Kolkata date
      const tzDate = new Date(
        b.createdAt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      );
      const year = tzDate.getFullYear();
      const month = String(tzDate.getMonth() + 1).padStart(2, "0");
      const day = String(tzDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const key = `${b.userId}_${dateStr}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(b);
    }

    // 3. Process each group
    const updates: {
      userId: string;
      date: string;
      totalDistanceMeters: string;
      validPointsCount: number;
    }[] = [];
    const processedIds: number[] = [];

    for (const [key, points] of Object.entries(grouped)) {
      const [userId, date] = key.split("_") as [string, string];
      let totalDistance = 0;
      let validPointsCount = 0;

      if (points.length > 0) {
        validPointsCount = 1; // First point is always valid
        let lastValidPoint = points[0];

        for (let i = 1; i < points.length; i++) {
          const currentPoint = points[i];
          if (!lastValidPoint || !currentPoint) continue;

          // Calculate distance in meters using Turf
          const dist = distance(
            point([lastValidPoint.longitude, lastValidPoint.latitude]),
            point([currentPoint.longitude, currentPoint.latitude]),
            "meters"
          );

          // Drift Filtering: Ignore distance < 10 meters (typical GPS noise)
          // Also ignore massive spikes > 10,000 meters in a few minutes (unless they took a plane)
          // Since breadcrumbs are polled every ~15m, 10,000 meters is 10km. That's fine.
          if (dist >= 10 && dist < 100000) {
            totalDistance += dist;
            validPointsCount++;
            lastValidPoint = currentPoint;
          }
        }
      }

      updates.push({
        userId,
        date,
        totalDistanceMeters: totalDistance.toFixed(2),
        validPointsCount,
      });

      processedIds.push(...points.map((p) => p.id));
    }

    // 4. Upsert into daily_mileage
    // Drizzle doesn't support bulk upsert perfectly in pg-core without specific constraints sometimes,
    // so we will do it in a transaction or individually.
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .insert(dailyMileage)
          .values({
            userId: update.userId,
            date: update.date,
            totalDistanceMeters: update.totalDistanceMeters,
            validPointsCount: update.validPointsCount,
          })
          .onConflictDoUpdate({
            target: [dailyMileage.userId, dailyMileage.date],
            set: {
              totalDistanceMeters: sql`${dailyMileage.totalDistanceMeters} + excluded.total_distance_meters`,
              validPointsCount: sql`${dailyMileage.validPointsCount} + excluded.valid_points_count`,
              calculatedAt: new Date(),
            },
          });
      }

      // 5. Delete processed breadcrumbs
      // Chunking deletes if there are many
      const chunkSize = 1000;
      for (let i = 0; i < processedIds.length; i += chunkSize) {
        const chunk = processedIds.slice(i, i + chunkSize);
        await tx.delete(breadcrumbs).where(inArray(breadcrumbs.id, chunk));
      }
    });

    return NextResponse.json({
      success: true,
      processedBreadcrumbs: processedIds.length,
      updatedGroups: updates.length,
    });
  } catch (error) {
    console.error("Mileage Cron Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
