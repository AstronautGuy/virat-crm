import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { sales, performanceSnapshots, salesArchive, saleItems, replacements } from "@/server/db/schema";
import { and, gte, lte, sum, count, eq, sql, lt, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const maintenanceRouter = createTRPCRouter({
  rebuildSnapshots: featureProtectedProcedure("admin")
    .input(z.object({ months: z.number().default(12) }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      
      for (let i = 0; i <= input.months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const period = d.toISOString().slice(0, 7); // YYYY-MM
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        // Map to hold merged stats
        const mergedStats = new Map<number, { revenue: number, salesCount: number, totalQty: number }>();

        // 1. Aggregate Live Sales
        const liveStats = await ctx.db
          .select({
            branchId: sales.branchId,
            revenue: sum(sales.invoiceAmount),
            salesCount: count(sales.id),
            totalQty: sum(sales.totalQty),
          })
          .from(sales)
          .where(and(
            gte(sales.createdAt, startOfMonth),
            lte(sales.createdAt, endOfMonth),
            eq(sales.status, "Approved")
          ))
          .groupBy(sales.branchId);

        for (const s of liveStats) {
          mergedStats.set(s.branchId, {
            revenue: parseFloat(s.revenue ?? "0"),
            salesCount: s.salesCount,
            totalQty: parseInt(s.totalQty ?? "0"),
          });
        }

        // 2. Aggregate Archived Sales
        const archiveStats = await ctx.db
          .select({
            branchId: salesArchive.branchId,
            revenue: sum(salesArchive.invoiceAmount),
            salesCount: count(salesArchive.id),
            totalQty: sum(salesArchive.totalQty),
          })
          .from(salesArchive)
          .where(and(
            gte(salesArchive.createdAt, startOfMonth),
            lte(salesArchive.createdAt, endOfMonth),
            eq(salesArchive.status, "Approved")
          ))
          .groupBy(salesArchive.branchId);

        for (const s of archiveStats) {
          const existing = mergedStats.get(s.branchId) ?? { revenue: 0, salesCount: 0, totalQty: 0 };
          mergedStats.set(s.branchId, {
            revenue: existing.revenue + parseFloat(s.revenue ?? "0"),
            salesCount: existing.salesCount + s.salesCount,
            totalQty: existing.totalQty + parseInt(s.totalQty ?? "0"),
          });
        }

        // 3. Upsert Snapshots
        for (const [branchId, metrics] of mergedStats.entries()) {
          await ctx.db
            .insert(performanceSnapshots)
            .values({
              entityType: "branch",
              entityId: branchId.toString(),
              period,
              metrics,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [performanceSnapshots.entityType, performanceSnapshots.entityId, performanceSnapshots.period],
              set: { metrics, updatedAt: new Date() },
            });
        }
      }

      return { success: true };
    }),

  archiveStaleData: featureProtectedProcedure("admin")
    .mutation(async ({ ctx }) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Perform atomic archival using Raw SQL for performance and transaction integrity
      // We use a transaction to move data, aggregate children, and delete originals
      return await ctx.db.transaction(async (tx) => {
        // 1. Identify IDs to archive
        const toArchive = await tx.select({ id: sales.id }).from(sales).where(lt(sales.createdAt, oneYearAgo));
        if (toArchive.length === 0) return { archivedCount: 0 };
        const ids = toArchive.map(s => s.id);

        // 2. Move to Archive in batches or one big SQL for performance
        // We use a custom SQL to handle the JSON aggregation of items and replacements
        for (const id of ids) {
           await tx.execute(sql`
            INSERT INTO "virat-crm_sales_archive" (original_id, branch_id, order_date, order_number, status, user_id, customer_name, invoice_amount, total_qty, details, created_at)
            SELECT 
              s.id, s.branch_id, s.order_date, s.order_number, s.status, s.user_id, s.customer_name, s.invoice_amount, s.total_qty,
              json_build_object(
                'items', (SELECT json_agg(i.*) FROM "virat-crm_sale_item" i WHERE i.sale_id = s.id),
                'replacements', (SELECT json_agg(r.*) FROM "virat-crm_replacement" r WHERE r.original_sale_id = s.id)
              ),
              s.created_at
            FROM "virat-crm_sale" s
            WHERE s.id = ${id}
          `);
        }

        // 3. Delete originals (cascade might not be trusted for manual logic)
        await tx.delete(saleItems).where(inArray(saleItems.saleId, ids));
        await tx.delete(replacements).where(inArray(replacements.originalSaleId, ids));
        await tx.delete(sales).where(inArray(sales.id, ids));

        return { archivedCount: ids.length };
      });
    }),
});
