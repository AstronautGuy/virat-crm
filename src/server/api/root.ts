import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { locationRouter } from "./routers/location";
import { hierarchyRouter } from "./routers/hierarchy";
import { salesRouter } from "./routers/sales";
import { replacementsRouter } from "./routers/replacements";
import { notificationsRouter } from "./routers/notifications";
import { usersRouter } from "./routers/users";
import { storageRouter } from "./routers/storage";
import { analyticsRouter } from "./routers/analytics";
import { leavesRouter } from "./routers/leaves";
import { reportsRouter } from "./routers/reports";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  location: locationRouter,
  hierarchy: hierarchyRouter,
  sales: salesRouter,
  replacements: replacementsRouter,
  notifications: notificationsRouter,
  users: usersRouter,
  storage: storageRouter,
  analytics: analyticsRouter,
  leaves: leavesRouter,
  reports: reportsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
