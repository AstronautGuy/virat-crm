import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { replacements } from "@/server/db/schema/replacements";
import { users } from "@/server/db/schema/users";
import { eq, sql } from "drizzle-orm";
import { sales } from "@/server/db/schema/sales";

export const replacementsRouter = createTRPCRouter({
  createReplacement: protectedProcedure
    .input(
      z.object({
        originalSaleId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      // Verify ownership
      const originalSale = await ctx.db.query.sales.findFirst({
        where: eq(sales.id, input.originalSaleId),
      });

      if (!originalSale) throw new Error("Original sale not found");
      
      // Admin and managers shouldn't normally be replacing on behalf, but if they do we could let them.
      // But standard is that replacement is requested by the sale owner.
      if (originalSale.userId !== currentUser.id && currentUser.role === "Employee") {
        throw new Error("Unauthorized: Sale does not belong to you");
      }

      const [replacement] = await ctx.db
        .insert(replacements)
        .values({
          originalSaleId: input.originalSaleId,
          userId: currentUser.id,
          reason: input.reason,
          status: "Pending",
        })
        .returning();

      return replacement;
    }),

  getMyReplacements: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
    });

    if (!currentUser) return [];

    return ctx.db.query.replacements.findMany({
      where: eq(replacements.userId, currentUser.id),
      with: {
        sale: true,
      },
    });
  }),

  updateReplacementStatus: protectedProcedure
    .input(z.object({ replacementId: z.number(), status: z.enum(["Pending", "Approved", "Rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      // Verify the replacement exists
      const targetReplacement = await ctx.db.query.replacements.findFirst({
        where: eq(replacements.id, input.replacementId),
      });

      if (!targetReplacement) throw new Error("Replacement not found");

      if (currentUser.role !== "Admin") {
        if (currentUser.role !== "Manager") {
          throw new Error("Unauthorized to update status");
        }

        // Must be an ancestor/manager of the user who made the replacement request
        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${currentUser.id}
            UNION
            SELECT e.id FROM "virat-crm_user" e
            INNER JOIN subordinates s ON s.id = e.manager_id
          )
          SELECT id FROM subordinates WHERE id = ${targetReplacement.userId} LIMIT 1;
        `;

        const rows = await ctx.db.execute(descendantsQuery);
        if (rows.length === 0) {
          throw new Error("Unauthorized: Replacement request does not belong to your team");
        }
      }

      const [updated] = await ctx.db
        .update(replacements)
        .set({ status: input.status })
        .where(eq(replacements.id, input.replacementId))
        .returning();
      return updated;
    }),
});
