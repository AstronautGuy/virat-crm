import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema/users";
import { breadcrumbs } from "@/server/db/schema/breadcrumbs";
import { eq } from "drizzle-orm";
import { notifyAdmins } from "@/server/lib/monitoring";

export const heartbeatRouter = createTRPCRouter({
  pulse: featureProtectedProcedure("workforce")
    .meta({ openapi: { method: "POST", path: "/heartbeat/pulse", summary: "Record user heartbeat", tags: ["Monitoring"] } })
    .input(z.object({
      lat: z.string().optional(),
      lng: z.string().optional(),
      status: z.enum(["Online", "Offline", "Low Battery", "No GPS"]).default("Online"),
    }))
    .output(z.object({
      success: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;

      await db.update(users)
        .set({
          lastActiveAt: new Date(),
          lastLat: input.lat,
          lastLng: input.lng,
          connectivityStatus: input.status,
        })
        .where(eq(users.id, dbUser.id));

      if (input.lat && input.lng) {
        await db.insert(breadcrumbs).values({
          userId: dbUser.id,
          latitude: parseFloat(input.lat),
          longitude: parseFloat(input.lng),
          accuracy: 10,
        });
      }

      if (input.status === "No GPS") {
        await notifyAdmins(
          "GPS Violation Alert",
          `${dbUser.firstName} ${dbUser.lastName} (${dbUser.employeeCode}) has disabled their device's GPS!`
        );
        // Automatically deactivate user for GPS violation lockout
        await db.update(users)
          .set({ isActive: false })
          .where(eq(users.id, dbUser.id));
      }

      return { success: true };
    }),
});
