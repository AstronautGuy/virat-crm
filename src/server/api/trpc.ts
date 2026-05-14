import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getSession } from "@/server/lib/auth";

import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { rolePermissions } from "@/server/db/schema/rolePermissions";
import { eq, and } from "drizzle-orm";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getSession();
  const userId = session?.userId;

  // Fetch DB user for role information
  const dbUser = userId 
    ? await db.query.users.findFirst({
        where: eq(users.id, userId),
      })
    : null;

  return {
    db,
    session,
    dbUser,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
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
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.dbUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
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

      if (!permission?.isEnabled) {
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
 * Admin (authenticated + admin role) procedure
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (ctx.dbUser?.role !== "Admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(isAdmin);

/**
 * Manager (authenticated + manager or admin role) procedure
 */
const isManager = t.middleware(async ({ ctx, next }) => {
  if (ctx.dbUser?.role !== "Manager" && ctx.dbUser?.role !== "Admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(isManager);
