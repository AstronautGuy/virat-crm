import { env } from "@/env";
import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
// @ts-ignore
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// @ts-ignore
import simplify from "@turf/simplify";
import { lineString, point } from "@turf/helpers";
import {
  breadcrumbs,
  users,
  locationLogs,
  branches,
  customerVisits,
  customers,
  userManagers,
} from "@/server/db/schema";
import { db } from "@/server/db";
import {
  eq,
  and,
  desc,
  inArray,
  gte,
  lte,
  asc,
  isNull,
  type SQL,
} from "drizzle-orm";

function getCurrentSlab(date: Date = new Date()) {
  // Use Intl.DateTimeFormat to reliably extract the hour in IST
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hourCycle: "h23", // 0 to 23
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour");
  const hours = parseInt(hourPart?.value ?? "0", 10);

  if (hours >= 0 && hours < 10) return "00:00-10:00";
  if (hours >= 10 && hours < 14) return "10:00-14:00";
  if (hours >= 14 && hours < 18) return "14:00-18:00";
  if (hours >= 18 && hours < 21) return "18:00-21:00";
  return "21:00-24:00";
}

function getFormattedDate(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `${env.NEXT_PUBLIC_GEOCODING_API_URL}?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ViratCRM/1.0 (contact@viratcrm.com)" },
    });
    if (!res.ok) return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

async function trackCustomerVisit(
  user: { id: string; branchId: number | null },
  latitude: number,
  longitude: number,
) {
  if (!user.branchId) return;

  const dateStr = getFormattedDate();

  // 1. Check for active visit today
  const activeVisit = await db.query.customerVisits.findFirst({
    where: and(
      eq(customerVisits.userId, user.id),
      eq(customerVisits.date, dateStr),
      isNull(customerVisits.departureTime),
    ),
    with: {
      customer: true,
    },
  });

  if (activeVisit) {
    let isInside = false;
    if (activeVisit.customer.geofencePolygon) {
      // @ts-ignore missing types
      isInside = booleanPointInPolygon(
        point([longitude, latitude]),
        activeVisit.customer.geofencePolygon as any,
      );
    } else if (
      activeVisit.customer.latitude &&
      activeVisit.customer.longitude
    ) {
      const dist = haversineDistance(
        latitude,
        longitude,
        parseFloat(activeVisit.customer.latitude),
        parseFloat(activeVisit.customer.longitude),
      );
      isInside = dist <= 50;
    }

    if (!isInside) {
      const durationMs = Date.now() - activeVisit.arrivalTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      await db
        .update(customerVisits)
        .set({
          departureTime: new Date(),
          durationMinutes,
        })
        .where(eq(customerVisits.id, activeVisit.id));
    }
    return;
  }

  // 2. Find nearby customers (~1km bounding box)
  const latMin = (latitude - 0.01).toString();
  const latMax = (latitude + 0.01).toString();
  const lngMin = (longitude - 0.01).toString();
  const lngMax = (longitude + 0.01).toString();

  const nearbyCustomers = await db.query.customers.findMany({
    where: and(
      eq(customers.branchId, user.branchId),
      gte(customers.latitude, latMin),
      lte(customers.latitude, latMax),
      gte(customers.longitude, lngMin),
      lte(customers.longitude, lngMax),
    ),
  });

  for (const customer of nearbyCustomers) {
    let isInside = false;
    if (customer.geofencePolygon) {
      // @ts-ignore missing types
      isInside = booleanPointInPolygon(
        point([longitude, latitude]),
        customer.geofencePolygon as any,
      );
    } else if (customer.latitude && customer.longitude) {
      const dist = haversineDistance(
        latitude,
        longitude,
        parseFloat(customer.latitude),
        parseFloat(customer.longitude),
      );
      isInside = dist <= 50;
    }

    if (isInside) {
      await db.insert(customerVisits).values({
        userId: user.id,
        customerId: customer.id,
        date: dateStr,
        arrivalTime: new Date(),
      });
      break;
    }
  }
}

export const locationRouter = createTRPCRouter({
  getServerTime: featureProtectedProcedure("workforce").query(() => {
    return { serverTime: Date.now() };
  }),

  ping: featureProtectedProcedure("workforce")
    .meta({
      openapi: {
        method: "POST",
        path: "/location/ping",
        summary: "Record location ping",
        tags: ["Location"],
      },
    })
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        warning: z.string().optional(),
        ignored: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.dbUser;
      if (user.role === "Admin") return { success: true, ignored: true }; // Admins are not tracked
      if (!user.branchId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not assigned to a branch",
        });

      // Fetch branch data for geofencing
      const branch = await ctx.db.query.branches.findFirst({
        where: eq(branches.id, user.branchId),
      });
      if (!branch)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Branch not found",
        });

      // 1. Server-Side Geofencing Validation
      const distance = haversineDistance(
        input.latitude,
        input.longitude,
        parseFloat(branch.latitude),
        parseFloat(branch.longitude),
      );

      const isWithinRadius = distance <= branch.radiusMeters;

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
        return {
          success: true,
          warning: "Location outside branch geofence. Attendance not recorded.",
        };
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
          eq(locationLogs.slab, slabName),
        ),
      });

      let frequencyMap: Record<string, number> = {};
      if (existingSlab?.frequencyMap) {
        frequencyMap = existingSlab.frequencyMap;
      }

      // Increment frequency for current location
      frequencyMap[coordsKey] = (frequencyMap[coordsKey] ?? 0) + 1;

      // Note: Breadcrumbs are now aggregated and cleaned up by the daily mileage cron job.

      // Find the most frequent location in the slab
      let maxCount = 0;
      let mostFrequentKey = coordsKey;
      for (const [key, count] of Object.entries(frequencyMap)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentKey = key;
        }
      }

      const [finalLatStr, finalLngStr] = mostFrequentKey.split(",");
      const finalLat = finalLatStr!;
      const finalLng = finalLngStr!;

      let finalLocationName = existingSlab?.locationName;
      if (
        existingSlab?.latitude !== finalLat ||
        existingSlab?.longitude !== finalLng ||
        !finalLocationName
      ) {
        finalLocationName = await reverseGeocode(
          parseFloat(finalLat),
          parseFloat(finalLng),
        );
      }

      if (existingSlab) {
        await ctx.db
          .update(locationLogs)
          .set({
            frequencyMap,
            latitude: finalLat,
            longitude: finalLng,
            locationName: finalLocationName,
            recordedAt: new Date(),
          })
          .where(eq(locationLogs.id, existingSlab.id));
      } else {
        /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
        await ctx.db.insert(locationLogs).values({
          userId: user.id,
          date: dateStr,
          slab: slabName,
          frequencyMap,
          latitude: finalLat,
          longitude: finalLng,
          locationName: finalLocationName,
        });
        /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
      }

      // Also log breadcrumb for high-resolution tracking
      await ctx.db.insert(breadcrumbs).values({
        userId: user.id,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      });

      // Track customer visits in the background
      if ("waitUntil" in ctx && typeof (ctx as any).waitUntil === "function") {
        (ctx as any).waitUntil(
          trackCustomerVisit(user, input.latitude, input.longitude).catch(
            console.error,
          ),
        );
      } else {
        void trackCustomerVisit(user, input.latitude, input.longitude).catch(
          console.error,
        );
      }

      return { success: true };
    }),

  getHistory: featureProtectedProcedure("live-map")
    .input(
      z.object({
        userId: z.string().uuid(),
        date: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const dateStr = getFormattedDate(input.date);

      const logs = await ctx.db.query.locationLogs.findMany({
        where: and(
          eq(locationLogs.userId, input.userId),
          eq(locationLogs.date, dateStr),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.dbUser;
      if (user.role === "Admin") return { success: true, ignored: true }; // Admins are not tracked

      // If user is not assigned to a branch, just log breadcrumb and return
      if (!user.branchId) {
        await ctx.db.insert(breadcrumbs).values({
          userId: user.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
        });
        return { success: true };
      }

      // Fetch branch data for geofencing
      const branch = await ctx.db.query.branches.findFirst({
        where: eq(branches.id, user.branchId),
      });
      if (!branch) {
        // Fallback to breadcrumb only if branch not found
        await ctx.db.insert(breadcrumbs).values({
          userId: user.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
        });
        return { success: true };
      }

      // Geofencing Validation
      const distance = haversineDistance(
        input.latitude,
        input.longitude,
        parseFloat(branch.latitude),
        parseFloat(branch.longitude),
      );

      const isWithinRadius = distance <= branch.radiusMeters;

      if (!isWithinRadius) {
        // Log as breadcrumb only, don't update locationLogs (Attendance)
        await ctx.db.insert(breadcrumbs).values({
          userId: user.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
        });
        return {
          success: true,
          warning: "Location outside branch geofence. Attendance not recorded.",
        };
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
          eq(locationLogs.slab, slabName),
        ),
      });

      let frequencyMap: Record<string, number> = {};
      if (existingSlab?.frequencyMap) {
        frequencyMap = existingSlab.frequencyMap;
      }

      // Increment frequency for current location
      frequencyMap[coordsKey] = (frequencyMap[coordsKey] ?? 0) + 1;

      // Note: Breadcrumbs are now aggregated and cleaned up by the daily mileage cron job.

      // Find the most frequent location in the slab
      let maxCount = 0;
      let mostFrequentKey = coordsKey;
      for (const [key, count] of Object.entries(frequencyMap)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentKey = key;
        }
      }

      const [finalLatStr, finalLngStr] = mostFrequentKey.split(",");
      const finalLat = finalLatStr!;
      const finalLng = finalLngStr!;

      let finalLocationName = existingSlab?.locationName;
      if (
        existingSlab?.latitude !== finalLat ||
        existingSlab?.longitude !== finalLng ||
        !finalLocationName
      ) {
        finalLocationName = await reverseGeocode(
          parseFloat(finalLat),
          parseFloat(finalLng),
        );
      }

      if (existingSlab) {
        await ctx.db
          .update(locationLogs)
          .set({
            frequencyMap,
            latitude: finalLat,
            longitude: finalLng,
            locationName: finalLocationName,
            recordedAt: new Date(),
          })
          .where(eq(locationLogs.id, existingSlab.id));
      } else {
        /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
        await ctx.db.insert(locationLogs).values({
          userId: user.id,
          date: dateStr,
          slab: slabName,
          frequencyMap,
          latitude: finalLat,
          longitude: finalLng,
          locationName: finalLocationName,
        });
        /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
      }

      // Also log breadcrumb for high-resolution tracking
      await ctx.db.insert(breadcrumbs).values({
        userId: user.id,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      });

      // Track customer visits in the background
      if ("waitUntil" in ctx && typeof (ctx as any).waitUntil === "function") {
        (ctx as any).waitUntil(
          trackCustomerVisit(user, input.latitude, input.longitude).catch(
            console.error,
          ),
        );
      } else {
        void trackCustomerVisit(user, input.latitude, input.longitude).catch(
          console.error,
        );
      }

      return { success: true };
    }),

  logBreadcrumbBatch: featureProtectedProcedure("workforce")
    .input(
      z.object({
        locations: z.array(
          z.object({
            latitude: z.number(),
            longitude: z.number(),
            accuracy: z.number().optional(),
            timestamp: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.dbUser;
      if (user.role === "Admin") return { success: true, ignored: true }; // Admins are not tracked

      const branch = user.branchId
        ? await ctx.db.query.branches.findFirst({
            where: eq(branches.id, user.branchId),
          })
        : null;

      for (const loc of input.locations) {
        const locDate = new Date(loc.timestamp);

        let isWithinRadius = false;
        if (branch) {
          const distance = haversineDistance(
            loc.latitude,
            loc.longitude,
            parseFloat(branch.latitude),
            parseFloat(branch.longitude),
          );
          isWithinRadius = distance <= branch.radiusMeters;
        }

        if (!branch || !isWithinRadius) {
          await ctx.db.insert(breadcrumbs).values({
            userId: user.id,
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            createdAt: locDate,
          });
          continue;
        }

        const slabName = getCurrentSlab(locDate);
        const dateStr = getFormattedDate(locDate);

        const roundedLat = loc.latitude.toFixed(4);
        const roundedLng = loc.longitude.toFixed(4);
        const coordsKey = `${roundedLat},${roundedLng}`;

        const existingSlab = await ctx.db.query.locationLogs.findFirst({
          where: and(
            eq(locationLogs.userId, user.id),
            eq(locationLogs.date, dateStr),
            eq(locationLogs.slab, slabName),
          ),
        });

        let frequencyMap: Record<string, number> = {};
        if (existingSlab?.frequencyMap) {
          frequencyMap = existingSlab.frequencyMap;
        }

        frequencyMap[coordsKey] = (frequencyMap[coordsKey] ?? 0) + 1;

        let maxCount = 0;
        let mostFrequentKey = coordsKey;
        for (const [key, count] of Object.entries(frequencyMap)) {
          if (count > maxCount) {
            maxCount = count;
            mostFrequentKey = key;
          }
        }

        const [finalLatStr, finalLngStr] = mostFrequentKey.split(",");
        const finalLat = finalLatStr!;
        const finalLng = finalLngStr!;

        let finalLocationName = existingSlab?.locationName;
        if (
          existingSlab?.latitude !== finalLat ||
          existingSlab?.longitude !== finalLng ||
          !finalLocationName
        ) {
          finalLocationName = await reverseGeocode(
            parseFloat(finalLat),
            parseFloat(finalLng),
          );
        }

        if (existingSlab) {
          await ctx.db
            .update(locationLogs)
            .set({
              frequencyMap,
              latitude: finalLat,
              longitude: finalLng,
              locationName: finalLocationName,
              recordedAt: new Date(), // updated time
            })
            .where(eq(locationLogs.id, existingSlab.id));
        } else {
          await ctx.db.insert(locationLogs).values({
            userId: user.id,
            date: dateStr,
            slab: slabName,
            frequencyMap,
            latitude: finalLat,
            longitude: finalLng,
            locationName: finalLocationName,
          });
        }

        await ctx.db.insert(breadcrumbs).values({
          userId: user.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          createdAt: locDate,
        });

        if (
          "waitUntil" in ctx &&
          typeof (ctx as any).waitUntil === "function"
        ) {
          (ctx as any).waitUntil(
            trackCustomerVisit(user, loc.latitude, loc.longitude).catch(
              console.error,
            ),
          );
        } else {
          void trackCustomerVisit(user, loc.latitude, loc.longitude).catch(
            console.error,
          );
        }
      }

      return { success: true };
    }),

  getLiveTeam: featureProtectedProcedure("live-map")
    .input(z.object({ branchId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.dbUser;
      const isSystemAdmin = currentUser.role === "Admin";

      // 1. Identify Visible Users based on RBAC and Branch
      let visibleUserIds: string[] = [];

      if (!isSystemAdmin) {
        // Manager sees their branch + subordinates
        const teamMappings = await ctx.db.query.userManagers.findMany({
          where: eq(userManagers.managerId, currentUser.id),
        });
        visibleUserIds = teamMappings.map((m) => m.userId);

        if (currentUser.branchId && visibleUserIds.length > 0) {
          const branchUsers = await ctx.db.query.users.findMany({
            where: and(
              eq(users.branchId, currentUser.branchId),
              inArray(users.id, visibleUserIds),
            ),
            columns: { id: true },
          });
          visibleUserIds = branchUsers.map((u) => u.id);
        }
      } else if (input.branchId) {
        // Admin filters by specific branch
        const branchUsers = await ctx.db.query.users.findMany({
          where: eq(users.branchId, input.branchId),
          columns: { id: true },
        });
        visibleUserIds = branchUsers.map((u) => u.id);
      } else {
        const allUsers = await ctx.db.query.users.findMany({
          columns: { id: true },
        });
        visibleUserIds = allUsers.map((u) => u.id);
      }

      if (visibleUserIds.length === 0) return [];

      const latestBreadcrumbs = await ctx.db
        .selectDistinctOn([breadcrumbs.userId], {
          id: breadcrumbs.id,
          userId: breadcrumbs.userId,
          latitude: breadcrumbs.latitude,
          longitude: breadcrumbs.longitude,
          accuracy: breadcrumbs.accuracy,
          createdAt: breadcrumbs.createdAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            role: users.role,
            employeeCode: users.employeeCode,
          },
        })
        .from(breadcrumbs)
        .innerJoin(users, eq(breadcrumbs.userId, users.id))
        .where(inArray(breadcrumbs.userId, visibleUserIds))
        .orderBy(breadcrumbs.userId, desc(breadcrumbs.createdAt));

      return latestBreadcrumbs.map((b) => {
        const isOnline = Date.now() - b.createdAt.getTime() < 15 * 60 * 1000;
        return {
          ...b,
          latitude: parseFloat(String(b.latitude)),
          longitude: parseFloat(String(b.longitude)),
          isOnline,
        };
      });
    }),

  getRoutePlayback: featureProtectedProcedure("live-map")
    .input(
      z.object({
        userId: z.string().uuid(),
        date: z.string(), // YYYY-MM-DD
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.dbUser;
      const isSystemAdmin = currentUser.role === "Admin";

      // Check if manager is authorized to see this user
      if (!isSystemAdmin) {
        const targetUserMapping = await ctx.db.query.userManagers.findFirst({
          where: and(
            eq(userManagers.userId, input.userId),
            eq(userManagers.managerId, currentUser.id),
          ),
        });
        if (!targetUserMapping)
          throw new Error("Not authorized to view this user's route");
      }

      // Fetch breadcrumbs for a specific day - RESTRICTED TO TODAY
      const todayStr = getFormattedDate();
      if (input.date !== todayStr) {
        throw new Error(
          "Historical route playback is restricted. Please use Intelligence Reports for long-term analysis.",
        );
      }

      const startOfDay = new Date(`${input.date}T00:00:00Z`);
      const endOfDay = new Date(`${input.date}T23:59:59Z`);

      const path = await ctx.db.query.breadcrumbs.findMany({
        where: and(
          eq(breadcrumbs.userId, input.userId),
          gte(breadcrumbs.createdAt, startOfDay),
          lte(breadcrumbs.createdAt, endOfDay),
        ),
        orderBy: [asc(breadcrumbs.createdAt)],
      });

      // Filter out low accuracy points
      let filteredPath = path.filter((p) => !p.accuracy || p.accuracy <= 100);

      // Filter out impossible jumps (> 150km/h)
      const validPath = [];
      let lastValidPoint = null;
      for (const p of filteredPath) {
        if (!lastValidPoint) {
          validPath.push(p);
          lastValidPoint = p;
          continue;
        }

        const dist = haversineDistance(
          parseFloat(String(lastValidPoint.latitude)),
          parseFloat(String(lastValidPoint.longitude)),
          parseFloat(String(p.latitude)),
          parseFloat(String(p.longitude)),
        );
        const timeDiffHours =
          (p.createdAt.getTime() - lastValidPoint.createdAt.getTime()) /
          (1000 * 60 * 60);

        // If speed > 150km/h and distance > 500m, it's likely a GPS jump
        if (
          timeDiffHours > 0 &&
          dist / 1000 / timeDiffHours > 150 &&
          dist > 500
        ) {
          continue; // Skip this point
        }

        validPath.push(p);
        lastValidPoint = p;
      }

      if (validPath.length < 2) {
        return validPath.map((p) => ({
          latitude: parseFloat(String(p.latitude)),
          longitude: parseFloat(String(p.longitude)),
        }));
      }

      // Convert to GeoJSON LineString
      const line = lineString(
        validPath.map((p) => [
          parseFloat(String(p.longitude)),
          parseFloat(String(p.latitude)),
        ]),
      );

      // Simplify route (tolerance 0.0001 roughly equals 11 meters)
      // @ts-ignore simplify types might differ
      const simplifiedLine = simplify(line, {
        tolerance: 0.0001,
        highQuality: true,
      }) as any;

      // Map back to expected array format
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return simplifiedLine.geometry.coordinates.map((coord: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        longitude: coord[0],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        latitude: coord[1],
      }));
    }),
});
