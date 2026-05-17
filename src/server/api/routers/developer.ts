import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { systemSettings } from "@/server/db/schema/systemSettings";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Local Developer-only middleware
const developerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.dbUser?.role !== "Developer") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only the sovereign System Developer can access these controls." });
  }
  return next();
});

export const developerRouter = createTRPCRouter({
  getSettings: developerProcedure.query(async ({ ctx }) => {
    return ctx.settings;
  }),

  updateSettings: developerProcedure
    .input(z.object({
      maxUsers: z.number().min(1).max(10000),
      isSystemLocked: z.boolean(),
      isReadOnly: z.boolean(),
      disabledFeaturesGlobal: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(systemSettings)
        .set({
          maxUsers: input.maxUsers,
          isSystemLocked: input.isSystemLocked,
          isReadOnly: input.isReadOnly,
          disabledFeaturesGlobal: input.disabledFeaturesGlobal,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, "global"))
        .returning();

      return updated;
    }),

  deleteAccount: developerProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.dbUser.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete your own System Developer account.",
        });
      }

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      // Perform a clean database delete
      await ctx.db.delete(users).where(eq(users.id, input.userId));

      return { success: true };
    }),
});
