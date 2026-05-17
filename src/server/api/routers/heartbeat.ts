import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema/users";
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

      if (input.status === "No GPS") {
        await notifyAdmins(
          "GPS Violation Alert",
          `${dbUser.firstName} ${dbUser.lastName} (${dbUser.employeeCode}) has disabled their device's GPS!`
        );
      }

      return { success: true };
    }),
});
