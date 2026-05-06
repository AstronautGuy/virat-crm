import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { sales, branches, locationLogs, leaves, users } from "@/server/db/schema";
import { and, gte, lte, sum, count, eq, sql } from "drizzle-orm";
import { getDateRange, type DateRangePreset } from "@/server/lib/date";

export const analyticsRouter = createTRPCRouter({
  getSalesSummary: featureProtectedProcedure("dashboard")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset as DateRangePreset);

      const result = await ctx.db
        .select({
          totalRevenue: sum(sales.invoiceAmount),
          totalBalance: sum(sales.balanceAmount),
          salesCount: count(sales.id),
          totalQty: sum(sales.totalQty),
        })
        .from(sales)
        .where(
          and(
            gte(sales.createdAt, start),
            lte(sales.createdAt, end),
            eq(sales.status, "Approved")
          )
        );

      const stats = result[0];

      return {
        revenue: parseFloat(stats?.totalRevenue ?? "0"),
        balance: parseFloat(stats?.totalBalance ?? "0"),
        count: stats?.salesCount ?? 0,
        quantity: parseInt(stats?.totalQty ?? "0"),
      };
    }),

  getBranchComparison: featureProtectedProcedure("dashboard")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset as DateRangePreset);

      const result = await ctx.db
        .select({
          branchName: branches.name,
          revenue: sum(sales.invoiceAmount),
          count: count(sales.id),
        })
        .from(sales)
        .innerJoin(branches, eq(sales.branchId, branches.id))
        .where(
          and(
            gte(sales.createdAt, start),
            lte(sales.createdAt, end),
            eq(sales.status, "Approved")
          )
        )
        .groupBy(branches.name);

      return result.map(r => ({
        name: r.branchName,
        revenue: parseFloat(r.revenue ?? "0"),
        count: r.count,
      }));
    }),

  getWorkforceSummary: featureProtectedProcedure("dashboard")
    .query(async ({ ctx }) => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const [activeStaff] = await ctx.db
        .select({ count: count(locationLogs.id) })
        .from(locationLogs)
        .where(eq(locationLogs.date, dateStr!));

      const [pendingLeaves] = await ctx.db
        .select({ count: count(leaves.id) })
        .from(leaves)
        .where(eq(leaves.status, "Pending"));

      return {
        activeToday: activeStaff?.count ?? 0,
        pendingLeaves: pendingLeaves?.count ?? 0,
      };
    }),

  getAttendancePerformance: featureProtectedProcedure("dashboard")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset as DateRangePreset);

      const stats = await ctx.db
        .select({
          userName: users.firstName,
          logCount: count(locationLogs.id),
        })
        .from(locationLogs)
        .innerJoin(users, eq(locationLogs.userId, users.id))
        .where(
          and(
            gte(locationLogs.recordedAt, start),
            lte(locationLogs.recordedAt, end)
          )
        )
        .groupBy(users.firstName);

      return stats;
    }),

  getSalesExport: featureProtectedProcedure("dashboard")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset as DateRangePreset);

      const data = await ctx.db
        .select({
          orderNumber: sales.orderNumber,
          customerName: sales.customerName,
          invoiceAmount: sales.invoiceAmount,
          status: sales.status,
          date: sales.createdAt,
          branch: branches.name,
        })
        .from(sales)
        .innerJoin(branches, eq(sales.branchId, branches.id))
        .where(
          and(
            gte(sales.createdAt, start),
            lte(sales.createdAt, end)
          )
        );

      // Simple CSV generation
      const header = "Order #,Customer,Amount,Status,Date,Branch\n";
      const rows = data.map(s => 
        `${s.orderNumber},"${s.customerName ?? ""}",${s.invoiceAmount},${s.status},${s.date.toISOString()},${s.branch}`
      ).join("\n");

      return header + rows;
    }),
});
