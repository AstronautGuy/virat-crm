import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import {
  branches,
  locationLogs,
  leaves,
  performanceSnapshots,
  sales,
  users,
} from "@/server/db/schema";
import {
  and,
  gte,
  lte,
  sum,
  count,
  eq,
  sql,
  inArray,
  desc,
  type SQL,
} from "drizzle-orm";
import { getDateRange } from "@/server/lib/date";

export const analyticsRouter = createTRPCRouter({
  getSalesSummary: featureProtectedProcedure("dashboard")
    .input(
      z.object({
        preset: z.enum(["today", "7d", "30d", "all"]),
        branchId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // RBAC: Non-admins are locked to their own branch
      const effectiveBranchId =
        ctx.dbUser.role === "Admin" ? input.branchId : ctx.dbUser.branchId;

      if (input.preset === "all") {
        const filters: SQL[] = [eq(performanceSnapshots.entityType, "branch")];
        if (effectiveBranchId) {
          filters.push(
            eq(performanceSnapshots.entityId, effectiveBranchId.toString()),
          );
        }

        const snapshots = await ctx.db
          .select({
            revenue: sql<string>`sum((metrics->>'revenue')::numeric)`,
            count: sql<string>`sum((metrics->>'salesCount')::numeric)`,
            qty: sql<string>`sum((metrics->>'totalQty')::numeric)`,
          })
          .from(performanceSnapshots)
          .where(and(...filters));

        const s = snapshots[0];
        return {
          revenue: parseFloat(s?.revenue ?? "0"),
          balance: 0,
          count: parseInt(s?.count ?? "0"),
          quantity: parseInt(s?.qty ?? "0"),
        };
      }

      const { start, end } = getDateRange(input.preset);
      const filters: SQL[] = [
        gte(sales.createdAt, start),
        lte(sales.createdAt, end),
        eq(sales.status, "Approved"),
      ];

      if (effectiveBranchId) {
        filters.push(eq(sales.branchId, effectiveBranchId));
      }

      const result = await ctx.db
        .select({
          totalRevenue: sum(sales.invoiceAmount),
          totalBalance: sum(sales.balanceAmount),
          salesCount: count(sales.id),
          totalQty: sum(sales.totalQty),
        })
        .from(sales)
        .where(and(...filters));

      const stats = result[0];

      return {
        revenue: parseFloat(stats?.totalRevenue ?? "0"),
        balance: parseFloat(stats?.totalBalance ?? "0"),
        count: stats?.salesCount ?? 0,
        quantity: parseInt(stats?.totalQty ?? "0"),
      };
    }),

  getBranchComparison: featureProtectedProcedure("analytics")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      // Branch comparison is strictly for Admins or Regional Managers
      if (ctx.dbUser.role !== "Admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Admins can view branch comparisons",
        });
      }

      if (input.preset === "all") {
        const result = await ctx.db
          .select({
            branchId: performanceSnapshots.entityId,
            revenue: sql<string>`sum((metrics->>'revenue')::numeric)`,
            count: sql<string>`sum((metrics->>'salesCount')::numeric)`,
          })
          .from(performanceSnapshots)
          .where(eq(performanceSnapshots.entityType, "branch"))
          .groupBy(performanceSnapshots.entityId);

        const branchList = await ctx.db.query.branches.findMany();
        const branchMap = new Map(
          branchList.map((b) => [b.id.toString(), b.name]),
        );

        return result.map((r) => ({
          name: branchMap.get(r.branchId!) ?? "Unknown",
          revenue: parseFloat(r.revenue ?? "0"),
          count: parseInt(r.count ?? "0"),
        }));
      }

      const { start, end } = getDateRange(input.preset);

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
            eq(sales.status, "Approved"),
          ),
        )
        .groupBy(branches.name);

      return result.map((r) => ({
        name: r.branchName,
        revenue: parseFloat(r.revenue ?? "0"),
        count: r.count,
      }));
    }),

  getWorkforceSummary: featureProtectedProcedure("dashboard")
    .input(z.object({ branchId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const effectiveBranchId =
        ctx.dbUser.role === "Admin" ? input.branchId : ctx.dbUser.branchId;

      const tzDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      );
      const year = tzDate.getFullYear();
      const month = String(tzDate.getMonth() + 1).padStart(2, "0");
      const day = String(tzDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const filters: SQL[] = [eq(locationLogs.date, dateStr)];
      if (effectiveBranchId) {
        const branchUsers = await ctx.db.query.users.findMany({
          where: eq(users.branchId, effectiveBranchId),
          columns: { id: true },
        });
        const branchUserIds = branchUsers.map((u) => u.id);
        if (branchUserIds.length > 0) {
          filters.push(inArray(locationLogs.userId, branchUserIds));
        } else {
          return { activeToday: 0, pendingLeaves: 0 };
        }
      }

      const [activeStaff] = await ctx.db
        .select({ count: count(locationLogs.id) })
        .from(locationLogs)
        .where(and(...filters));

      // Leaves are branch-specific
      const leaveFilters: SQL[] = [eq(leaves.status, "Pending")];
      if (effectiveBranchId) {
        const branchUsers = await ctx.db.query.users.findMany({
          where: eq(users.branchId, effectiveBranchId),
          columns: { id: true },
        });
        const branchUserIds = branchUsers.map((u) => u.id);
        if (branchUserIds.length > 0) {
          leaveFilters.push(inArray(leaves.userId, branchUserIds));
        }
      }

      const [pendingLeaves] = await ctx.db
        .select({ count: count(leaves.id) })
        .from(leaves)
        .where(and(...leaveFilters));

      return {
        activeToday: activeStaff?.count ?? 0,
        pendingLeaves: pendingLeaves?.count ?? 0,
      };
    }),

  getAttendancePerformance: featureProtectedProcedure("analytics")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset);

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
            lte(locationLogs.recordedAt, end),
          ),
        )
        .groupBy(users.firstName);

      return stats;
    }),

  getSalesExport: featureProtectedProcedure("analytics")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset);

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
        .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));

      // Simple CSV generation
      const header = "Order #,Customer,Amount,Status,Date,Branch\n";
      const rows = data
        .map(
          (s) =>
            `${s.orderNumber},"${s.customerName ?? ""}",${s.invoiceAmount},${s.status},${s.date.toISOString()},${s.branch}`,
        )
        .join("\n");

      return header + rows;
    }),

  getAttendanceExport: featureProtectedProcedure("analytics")
    .input(z.object({ preset: z.enum(["today", "7d", "30d", "all"]) }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset);

      const data = await ctx.db
        .select({
          userName: users.firstName,
          userLastName: users.lastName,
          date: locationLogs.date,
          slab: locationLogs.slab,
          lat: locationLogs.latitude,
          lng: locationLogs.longitude,
          recordedAt: locationLogs.recordedAt,
        })
        .from(locationLogs)
        .innerJoin(users, eq(locationLogs.userId, users.id))
        .where(
          and(
            gte(locationLogs.recordedAt, start),
            lte(locationLogs.recordedAt, end),
          ),
        )
        .orderBy(desc(locationLogs.recordedAt));

      const header = "Date,Time Slab,User,Latitude,Longitude,Logged At\n";
      const rows = data
        .map(
          (l) =>
            `${l.date},${l.slab},"${l.userName} ${l.userLastName ?? ""}",${l.lat},${l.lng},${l.recordedAt.toISOString()}`,
        )
        .join("\n");

      return header + rows;
    }),
});
