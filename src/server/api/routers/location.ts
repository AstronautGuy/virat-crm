import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { locationLogs } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

export const locationRouter = createTRPCRouter({
  ping: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.kindeId, ctx.user.id),
      });

      if (!user) {
        throw new Error("User not found in database");
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
      if (existingSlab && existingSlab.frequencyMap) {
        frequencyMap = existingSlab.frequencyMap;
      }

      // Increment frequency for current location
      frequencyMap[coordsKey] = (frequencyMap[coordsKey] || 0) + 1;

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

      return { success: true };
    }),

  getHistory: protectedProcedure
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
});
