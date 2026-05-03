import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { replacements } from "@/server/db/schema/replacements";
import { users } from "@/server/db/schema/users";
import { eq, sql, inArray } from "drizzle-orm";
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
      
      if (currentUser.role !== "Admin" && originalSale.userId !== currentUser.id) {
        // If not the owner, must be a manager of the owner
        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${currentUser.id}
            UNION
            SELECT e.id FROM "virat-crm_user" e
            INNER JOIN subordinates s ON s.id = e.manager_id
          )
          SELECT id FROM subordinates WHERE id = ${originalSale.userId} LIMIT 1;
        `;

        const rows = await ctx.db.execute(descendantsQuery);
        if (rows.length === 0) {
          throw new Error("Unauthorized: You do not have permission to request replacement for this sale");
        }
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
        files: {
          where: (files, { eq }) => eq(files.entityType, "replacement")
        }
      },
      orderBy: (replacements, { desc }) => [desc(replacements.createdAt)],
    });
  }),

  getReplacements: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
      columns: { id: true, role: true },
    });

    if (!currentUser) return [];

    if (currentUser.role === "Admin") {
      return ctx.db.query.replacements.findMany({
        with: { 
          sale: true, 
          user: true, 
          files: {
            where: (files, { eq }) => eq(files.entityType, "replacement")
          }
        },
        orderBy: (replacements, { desc }) => [desc(replacements.createdAt)],
      });
    }

    // CTE to get all descendants for current user
    const descendantsQuery = sql`
      WITH RECURSIVE subordinates AS (
        SELECT id FROM "virat-crm_user" WHERE manager_id = ${currentUser.id}
        UNION
        SELECT e.id FROM "virat-crm_user" e
        INNER JOIN subordinates s ON s.id = e.manager_id
      )
      SELECT id FROM subordinates;
    `;

    const rows = await ctx.db.execute(descendantsQuery);
    const descendantIds = rows.map((row: Record<string, unknown>) => String(row.id));
    const allowedIds = [currentUser.id, ...descendantIds];

    return ctx.db.query.replacements.findMany({
      where: inArray(replacements.userId, allowedIds),
      with: { 
        sale: true, 
        user: true, 
        files: {
          where: (files, { eq }) => eq(files.entityType, "replacement")
        }
      },
      orderBy: (replacements, { desc }) => [desc(replacements.createdAt)],
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
