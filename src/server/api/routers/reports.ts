import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { sales, branches, locationLogs, users } from "@/server/db/schema";
import { and, gte, lte, eq, sql, inArray } from "drizzle-orm";
import { getDateRange } from "@/server/lib/date";

export const reportsRouter = createTRPCRouter({
  // Fetch users for selection (Admins see everyone, Managers see their team)
  getSelectableUsers: featureProtectedProcedure("reports").query(
    async ({ ctx }) => {
      const currentUser = ctx.dbUser;

      if (currentUser.role === "Admin") {
        return ctx.db.query.users.findMany({
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            employeeCode: true,
          },
        });
      }

      // Manager case: Immediate team
      return ctx.db.query.users.findMany({
        where: eq(users.managerId, currentUser.id),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          employeeCode: true,
        },
      });
    },
  ),

  getReportData: featureProtectedProcedure("reports")
    .input(
      z.object({
        preset: z.enum(["today", "7d", "30d", "quarter", "year", "all"]),
        scope: z.enum(["individual", "team", "management", "branch"]),
        targetId: z.string().uuid().optional(),
        branchId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset);
      const currentUser = ctx.dbUser;

      // 1. Identify Target Users based on Scope
      let targetUserIds: string[] = [];
      const effectiveId = input.targetId ?? currentUser.id;

      if (input.scope === "individual") {
        targetUserIds = [effectiveId];
      } else if (input.scope === "team") {
        const team = await ctx.db.query.users.findMany({
          where: eq(users.managerId, effectiveId),
          columns: { id: true },
        });
        targetUserIds = team.map((u) => u.id);
      } else if (input.scope === "branch") {
        // Only Admins can see the whole branch report directly
        if (currentUser.role !== "Admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        const branchUsers = await ctx.db.query.users.findMany({
          where: eq(users.branchId, input.branchId!),
          columns: { id: true },
        });
        targetUserIds = branchUsers.map((u) => u.id);
      } else if (input.scope === "management") {
        // Recursive CTE for management subtree
        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${effectiveId}
            UNION
            SELECT e.id FROM "virat-crm_user" e
            INNER JOIN subordinates s ON s.id = e.manager_id
          )
          SELECT id FROM subordinates;
        `;
        const rows = (await ctx.db.execute(descendantsQuery)) as unknown as {
          id: string;
        }[];
        targetUserIds = rows.map((r) => String(r.id));
        // Include the manager themselves if it's management scope?
        // User request: "reports of all the teams under him" - usually excludes the manager unless asked.
        // But for completeness, we'll focus on the subordinates.
      }

      if (targetUserIds.length === 0 && input.scope !== "individual") {
        return {
          sales: [],
          attendance: [],
          summary: { revenue: 0, balance: 0, orders: 0, visits: 0 },
        };
      }

      // 2. Fetch Sales Data
      const salesData = await ctx.db
        .select({
          orderNumber: sales.orderNumber,
          customerName: sales.customerName,
          invoiceAmount: sales.invoiceAmount,
          balanceAmount: sales.balanceAmount,
          status: sales.status,
          date: sales.createdAt,
          branchName: branches.name,
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(sales)
        .innerJoin(branches, eq(sales.branchId, branches.id))
        .innerJoin(users, eq(sales.userId, users.id))
        .where(
          and(
            inArray(sales.userId, targetUserIds),
            gte(sales.createdAt, start),
            lte(sales.createdAt, end),
          ),
        );

      // 3. Fetch Attendance/Visits
      const attendanceData = await ctx.db
        .select({
          id: locationLogs.id,
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          date: locationLogs.date,
          slab: locationLogs.slab,
          latitude: locationLogs.latitude,
          longitude: locationLogs.longitude,
          recordedAt: locationLogs.recordedAt,
        })
        .from(locationLogs)
        .innerJoin(users, eq(locationLogs.userId, users.id))
        .where(
          and(
            inArray(locationLogs.userId, targetUserIds),
            gte(locationLogs.recordedAt, start),
            lte(locationLogs.recordedAt, end),
          ),
        );

      // 4. Yearly Aggregation (for Lifetime reports)
      let yearlyStats: {
        year: number;
        revenue: number;
        balance: number;
        orders: number;
        visits: number;
      }[] = [];
      if (input.preset === "all") {
        const years = new Set<number>();
        salesData.forEach((s) => years.add(new Date(s.date).getFullYear()));
        attendanceData.forEach((a) =>
          years.add(new Date(a.recordedAt).getFullYear()),
        );

        yearlyStats = Array.from(years)
          .sort((a, b) => b - a)
          .map((year) => {
            const yearSales = salesData.filter(
              (s) => new Date(s.date).getFullYear() === year,
            );
            const yearAttendance = attendanceData.filter(
              (a) => new Date(a.recordedAt).getFullYear() === year,
            );

            return {
              year,
              revenue: yearSales.reduce(
                (acc, s) => acc + parseFloat(s.invoiceAmount),
                0,
              ),
              balance: yearSales.reduce(
                (acc, s) => acc + parseFloat(s.balanceAmount),
                0,
              ),
              orders: yearSales.length,
              visits: yearAttendance.length,
            };
          });
      }

      // 5. Summarize
      const summary = {
        revenue: salesData.reduce(
          (acc, s) => acc + parseFloat(s.invoiceAmount),
          0,
        ),
        balance: salesData.reduce(
          (acc, s) => acc + parseFloat(s.balanceAmount),
          0,
        ),
        orders: salesData.length,
        visits: attendanceData.length,
      };

      return {
        sales: salesData,
        attendance: attendanceData,
        yearlyStats,
        summary,
      };
    }),

  getSalesForecast: featureProtectedProcedure("reports")
    .input(
      z.object({
        scope: z.enum(["individual", "team", "management", "branch"]),
        targetId: z.string().uuid().optional(),
        branchId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.dbUser;

      // 1. Identify Target Users based on Scope
      let targetUserIds: string[] = [];
      const effectiveId = input.targetId ?? currentUser.id;

      if (input.scope === "individual") {
        targetUserIds = [effectiveId];
      } else if (input.scope === "team") {
        const team = await ctx.db.query.users.findMany({
          where: eq(users.managerId, effectiveId),
          columns: { id: true },
        });
        targetUserIds = team.map((u) => u.id);
      } else if (input.scope === "branch") {
        if (currentUser.role !== "Admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        const branchUsers = await ctx.db.query.users.findMany({
          where: eq(users.branchId, input.branchId!),
          columns: { id: true },
        });
        targetUserIds = branchUsers.map((u) => u.id);
      } else if (input.scope === "management") {
        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${effectiveId}
            UNION
            SELECT e.id FROM "virat-crm_user" e
            INNER JOIN subordinates s ON s.id = e.manager_id
          )
          SELECT id FROM subordinates;
        `;
        const rows = (await ctx.db.execute(descendantsQuery)) as unknown as {
          id: string;
        }[];
        targetUserIds = rows.map((r) => String(r.id));
      }

      if (targetUserIds.length === 0 && input.scope !== "individual") {
        return {
          history: [],
          forecast: [],
          stats: { trend: 0, confidence: 50, nextMonthRevenue: 0 },
        };
      }

      // Query historical sales for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const salesData = await ctx.db
        .select({
          invoiceAmount: sales.invoiceAmount,
          date: sales.createdAt,
        })
        .from(sales)
        .where(
          and(
            inArray(sales.userId, targetUserIds),
            gte(sales.createdAt, twelveMonthsAgo),
          ),
        );

      // Group sales by month
      const salesByMonth = new Map<string, number>();
      const monthsList: { label: string; key: string; date: Date }[] = [];
      const current = new Date();

      for (let i = 11; i >= 0; i--) {
        const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        monthsList.push({ label, key, date: d });
        salesByMonth.set(key, 0);
      }

      for (const sale of salesData) {
        const d = new Date(sale.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (salesByMonth.has(key)) {
          salesByMonth.set(
            key,
            salesByMonth.get(key)! + parseFloat(sale.invoiceAmount),
          );
        }
      }

      const history = monthsList.map((m, idx) => ({
        index: idx,
        period: m.label,
        revenue: salesByMonth.get(m.key) ?? 0,
      }));

      // Time-series Forecasting using Linear Regression
      const N = history.length;
      const sumX = history.reduce((acc, h) => acc + h.index, 0);
      const sumY = history.reduce((acc, h) => acc + h.revenue, 0);
      const meanX = sumX / N;
      const meanY = sumY / N;

      let num = 0;
      let den = 0;
      for (const h of history) {
        num += (h.index - meanX) * (h.revenue - meanY);
        den += Math.pow(h.index - meanX, 2);
      }

      const slope = den === 0 ? 0 : num / den;
      const intercept = meanY - slope * meanX;

      // Standard Error of Estimate
      let sumSqResiduals = 0;
      let sumSqTotal = 0;
      for (const h of history) {
        const predicted = slope * h.index + intercept;
        sumSqResiduals += Math.pow(h.revenue - predicted, 2);
        sumSqTotal += Math.pow(h.revenue - meanY, 2);
      }

      const standardError = N > 2 ? Math.sqrt(sumSqResiduals / (N - 2)) : 0;

      // Coefficient of determination (R^2)
      const rSquared = sumSqTotal === 0 ? 1 : 1 - sumSqResiduals / sumSqTotal;
      const confidence = Math.min(99, Math.max(50, Math.round(rSquared * 100)));

      // Generate forecast for next 3 periods
      const forecast: {
        period: string;
        revenue: number;
        optimistic: number;
        pessimistic: number;
      }[] = [];
      const nextMonthDate = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1,
      );

      for (let i = 0; i < 3; i++) {
        const futureDate = new Date(
          nextMonthDate.getFullYear(),
          nextMonthDate.getMonth() + i,
          1,
        );
        const label = futureDate.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        const futureIndex = N + i;
        const predicted = Math.max(0, slope * futureIndex + intercept);

        // Standard error escalates over time (error increases further out)
        const errorMultiplier = 1.96 + 0.3 * i;
        const margin = standardError * errorMultiplier;

        forecast.push({
          period: label,
          revenue: Math.round(predicted),
          optimistic: Math.round(predicted + margin),
          pessimistic: Math.round(Math.max(0, predicted - margin)),
        });
      }

      const trend = meanY === 0 ? 0 : Math.round((slope / meanY) * 100);

      return {
        history: history.map((h) => ({
          period: h.period,
          revenue: Math.round(h.revenue),
        })),
        forecast,
        stats: {
          trend,
          confidence,
          nextMonthRevenue: forecast[0]?.revenue ?? 0,
        },
      };
    }),
});
