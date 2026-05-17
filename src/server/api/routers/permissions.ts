import { z } from "zod";
import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/api/trpc";
import { rolePermissions } from "@/server/db/schema/rolePermissions";
import { eq, and } from "drizzle-orm";

export const permissionsRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(rolePermissions);
  }),

  toggle: adminProcedure
    .input(
      z.object({
        role: z.string().min(2).max(64),
        featureKey: z.string(),
        isEnabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if entry exists
      const existing = await ctx.db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.role, input.role),
            eq(rolePermissions.featureKey, input.featureKey)
          )
        );

      if (existing.length > 0) {
        return ctx.db
          .update(rolePermissions)
          .set({ isEnabled: input.isEnabled })
          .where(
            and(
              eq(rolePermissions.role, input.role),
              eq(rolePermissions.featureKey, input.featureKey)
            )
          );
      } else {
        return ctx.db.insert(rolePermissions).values({
          role: input.role,
          featureKey: input.featureKey,
          isEnabled: input.isEnabled,
        });
      }
    }),

  getForRole: publicProcedure
    .input(z.object({ role: z.string().min(2).max(64) }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.role, input.role));
    }),
});
