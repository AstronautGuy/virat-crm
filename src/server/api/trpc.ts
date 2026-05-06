/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { rolePermissions } from "@/server/db/schema/rolePermissions";
import { eq, and } from "drizzle-orm";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { getUser, getPermission } = getKindeServerSession();
  let user = await getUser();

  // Mock user for development if no session exists
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "kp_mock_employee_123",
      email: "employee1@viraterp.com",
      given_name: "Test",
      family_name: "Employee",
      picture: null,
    } as any;
  }

  // Fetch DB user for role information
  const dbUser = user 
    ? await db.query.users.findFirst({
        where: eq(users.kindeId, user.id),
      })
    : null;

  const mockGetPermission = async (p: string) => {
    if (process.env.NODE_ENV === "development") return { isGranted: true };
    return getPermission(p);
  };

  return {
    db,
    user,
    dbUser, // Added DB user to context
    getPermission: process.env.NODE_ENV === "development" ? mockGetPermission : getPermission,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.user` is present.
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user?.id || !ctx.dbUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      dbUser: ctx.dbUser,
    },
  });
});

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(isAuthed);

/**
 * Dynamic Feature Gate Middleware
 */
export const featureProtectedProcedure = (featureKey: string) => {
  return protectedProcedure.use(
    t.middleware(async ({ ctx, next }) => {
      // Safety check for TS and runtime
      if (!ctx.dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User profile not found in database." });
      }

      // Admins bypass feature gates
      if (ctx.dbUser.role === "Admin") {
        return next({
          ctx: {
            ...ctx,
            dbUser: ctx.dbUser,
          },
        });
      }

      const permission = await ctx.db.query.rolePermissions.findFirst({
        where: and(
          eq(rolePermissions.role, ctx.dbUser.role),
          eq(rolePermissions.featureKey, featureKey)
        ),
      });

      if (!permission || !permission.isEnabled) {
        console.warn(`[SECURITY] Access denied for user ${ctx.dbUser.id} (${ctx.dbUser.role}) to feature '${featureKey}'`);
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `The feature '${featureKey}' is disabled for your role.`,
        });
      }

      return next({
        ctx: {
          ...ctx,
          dbUser: ctx.dbUser,
        },
      });
    })
  );
};

/**
 * Admin (authenticated + admin permission) procedure
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  const adminPermission = await ctx.getPermission("admin:access");
  if (!adminPermission?.isGranted) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(isAdmin);

/**
 * Manager (authenticated + manager or admin permission) procedure
 */
const isManager = t.middleware(async ({ ctx, next }) => {
  const managerPermission = await ctx.getPermission("manager:access");
  const adminPermission = await ctx.getPermission("admin:access");
  
  if (!managerPermission?.isGranted && !adminPermission?.isGranted) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(isManager);
