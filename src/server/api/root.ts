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
import { permissionsRouter } from "./routers/permissions";
import { inventoryRouter } from "./routers/inventory";
import { maintenanceRouter } from "./routers/maintenance";
import { crmRouter } from "./routers/crm";
import { dailyReportsRouter } from "./routers/dailyReports";
import { authRouter } from "./routers/auth";
import { heartbeatRouter } from "./routers/heartbeat";
import { rolesRouter } from "./routers/roles";
import { developerRouter } from "./routers/developer";
import { alertsRouter } from "./routers/alerts";
import { fieldSupportRouter } from "./routers/fieldSupport";

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
  permissions: permissionsRouter,
  inventory: inventoryRouter,
  maintenance: maintenanceRouter,
  crm: crmRouter,
  dailyReports: dailyReportsRouter,
  auth: authRouter,
  heartbeat: heartbeatRouter,
  roles: rolesRouter,
  developer: developerRouter,
  alerts: alertsRouter,
  fieldSupport: fieldSupportRouter,
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
