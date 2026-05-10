import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { locationLogs, breadcrumbs, users } from "@/server/db/schema";
import { eq, and, desc, inArray, gte, lte, asc, lt } from "drizzle-orm";

function getCurrentSlab() {
  const now = new Date();
  const hours = now.getHours();
  
  if (hours >= 0 && hours < 10) return "00:00-10:00";
  if (hours >= 10 && hours < 14) return "10:00-14:00";
  if (hours >= 14 && hours < 18) return "14:00-18:00";
  if (hours >= 18 && hours < 21) return "18:00-21:00";
  return "21:00-24:00";
}

function getFormattedDate(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export const locationRouter = createTRPCRouter({
  ping: featureProtectedProcedure("workforce")
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.kindeId, ctx.dbUser!.kindeId),
        with: {
          branch: true,
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (!user.branchId || !user.branch) throw new TRPCError({ code: "BAD_REQUEST", message: "User is not assigned to a branch" });

      // 1. Server-Side Geofencing Validation
      const distance = haversineDistance(
        input.latitude,
        input.longitude,
        parseFloat(user.branch.latitude),
        parseFloat(user.branch.longitude)
      );

      const isWithinRadius = distance <= user.branch.radiusMeters;
      
      // We log the ping regardless for route playback, but we only mark "Attendance" (slab logs) 
      // if they are within the geofence to prevent spoofing.
      if (!isWithinRadius) {
        // Log as breadcrumb only, don't update locationLogs (Attendance)
        await ctx.db.insert(breadcrumbs).values({
          userId: user.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
        });
        return { success: true, warning: "Location outside branch geofence. Attendance not recorded." };
      }

      const slabName = getCurrentSlab();
      const dateStr = getFormattedDate();

      // Round coordinates to 4 decimal places (~11 meters)
      const roundedLat = input.latitude.toFixed(4);
      const roundedLng = input.longitude.toFixed(4);
      const coordsKey = `${roundedLat},${roundedLng}`;

      const existingSlab = await ctx.db.query.locationLogs.findFirst({
        where: and(
          eq(locationLogs.userId, user.id),
          eq(locationLogs.date, dateStr),
          eq(locationLogs.slab, slabName)
        )
      });

      let frequencyMap: Record<string, number> = {};
      if (existingSlab?.frequencyMap) {
        frequencyMap = existingSlab.frequencyMap;
      }

      // Increment frequency for current location
      frequencyMap[coordsKey] = (frequencyMap[coordsKey] ?? 0) + 1;

      // EOD Cleanup: Clear breadcrumbs older than 24 hours
      if (!existingSlab) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await ctx.db.delete(breadcrumbs).where(lt(breadcrumbs.createdAt, twentyFourHoursAgo));
      }

      // Find the most frequent location in the slab
      let maxCount = 0;
      let mostFrequentKey = coordsKey;
      for (const [key, count] of Object.entries(frequencyMap)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentKey = key;
        }
      }

      const [finalLat, finalLng] = mostFrequentKey.split(',');

      if (existingSlab) {
        await ctx.db.update(locationLogs).set({
          frequencyMap,
          latitude: finalLat!,
          longitude: finalLng!,
          recordedAt: new Date(),
        }).where(eq(locationLogs.id, existingSlab.id));
      } else {
        await ctx.db.insert(locationLogs).values({
          userId: user.id,
          date: dateStr,
          slab: slabName,
          frequencyMap,
          latitude: finalLat!,
          longitude: finalLng!,
        });
      }

      // Also log breadcrumb for high-resolution tracking
      await ctx.db.insert(breadcrumbs).values({
        userId: user.id,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      });

      return { success: true };
    }),

  getHistory: featureProtectedProcedure("live-map")
    .input(
      z.object({
        userId: z.string().uuid(),
        date: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateStr = getFormattedDate(input.date);

      const logs = await ctx.db.query.locationLogs.findMany({
        where: and(
          eq(locationLogs.userId, input.userId),
          eq(locationLogs.date, dateStr)
        ),
        orderBy: [desc(locationLogs.recordedAt)],
      });

      return logs;
    }),

  logBreadcrumb: featureProtectedProcedure("workforce")
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.kindeId, ctx.dbUser!.kindeId),
      });

      if (!user) {
        throw new Error("User not found in database");
      }

      await ctx.db.insert(breadcrumbs).values({
        userId: user.id,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      });

      return { success: true };
    }),

  getLiveTeam: featureProtectedProcedure("live-map")
    .query(async ({ ctx }) => {
      if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      const currentUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.kindeId, ctx.dbUser!.kindeId),
      });

      if (!currentUser) throw new Error("User not found");

      const adminPermission = await ctx.getPermission("admin:access");
      const isSystemAdmin = adminPermission?.isGranted;

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Find all users this manager can see
      let visibleUserIds: string[] = [];
      if (isSystemAdmin) {
        // Admin sees everyone
        const allUsers = await ctx.db.query.users.findMany({
          columns: { id: true },
        });
        visibleUserIds = allUsers.map(u => u.id);
      } else {
        // Manager sees their subordinates
        const subordinates = await ctx.db.query.users.findMany({
          where: eq(users.managerId, currentUser.id),
          columns: { id: true },
        });
        visibleUserIds = subordinates.map(u => u.id);
      }

      if (visibleUserIds.length === 0) return [];

      const latestBreadcrumbs = await ctx.db.query.breadcrumbs.findMany({
        where: and(
          gte(breadcrumbs.createdAt, fifteenMinutesAgo),
          inArray(breadcrumbs.userId, visibleUserIds)
        ),
        with: {
          user: true,
        },
        orderBy: (breadcrumbs, { desc }) => [desc(breadcrumbs.createdAt)],
      });

      const userMap = new Map();
      latestBreadcrumbs.forEach((b) => {
        if (!userMap.has(b.userId)) {
          userMap.set(b.userId, b);
        }
      });

      return Array.from(userMap.values());
    }),

  getRoutePlayback: featureProtectedProcedure("live-map")
    .input(
      z.object({
        userId: z.string().uuid(),
        date: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      const currentUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.kindeId, ctx.dbUser!.kindeId),
      });

      if (!currentUser) throw new Error("User not found");

      const adminPermission = await ctx.getPermission("admin:access");
      const isSystemAdmin = adminPermission?.isGranted;

      // Check if manager is authorized to see this user
      if (!isSystemAdmin) {
        const targetUser = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.id, input.userId),
            eq(users.managerId, currentUser.id)
          ),
        });
        if (!targetUser) throw new Error("Not authorized to view this user's route");
      }

      // Fetch breadcrumbs for a specific day - RESTRICTED TO TODAY
      const todayStr = getFormattedDate();
      if (input.date !== todayStr) {
        throw new Error("Historical route playback is restricted. Please use Intelligence Reports for long-term analysis.");
      }

      const startOfDay = new Date(`${input.date}T00:00:00Z`);
      const endOfDay = new Date(`${input.date}T23:59:59Z`);

      const path = await ctx.db.query.breadcrumbs.findMany({
        where: and(
          eq(breadcrumbs.userId, input.userId),
          gte(breadcrumbs.createdAt, startOfDay),
          lte(breadcrumbs.createdAt, endOfDay)
        ),
        orderBy: [asc(breadcrumbs.createdAt)],
      });

      return path;
    }),
});
