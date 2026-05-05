import { z } from "zod";
import { createTRPCRouter, managerProcedure } from "@/server/api/trpc";
import { sales, branches, locationLogs, users } from "@/server/db/schema";
import { and, gte, lte, eq, sql, inArray } from "drizzle-orm";
import { getDateRange, DateRangePreset } from "@/server/lib/date";

export const reportsRouter = createTRPCRouter({
  // Fetch users for selection (Admins see everyone, Managers see their team)
  getSelectableUsers: managerProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
      columns: { id: true, role: true },
    });

    if (!currentUser) return [];

    if (currentUser.role === "Admin") {
      return ctx.db.query.users.findMany({
        columns: { id: true, firstName: true, lastName: true, role: true, employeeCode: true },
      });
    }

    // Manager case: Immediate team
    return ctx.db.query.users.findMany({
      where: eq(users.managerId, currentUser.id),
      columns: { id: true, firstName: true, lastName: true, role: true, employeeCode: true },
    });
  }),

  getReportData: managerProcedure
    .input(z.object({
      preset: z.enum(["today", "7d", "30d", "quarter", "year", "all"]),
      scope: z.enum(["individual", "team", "management"]),
      targetId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { start, end } = getDateRange(input.preset as DateRangePreset);
      
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
        columns: { id: true },
      });

      if (!currentUser) throw new Error("User not found");

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
        targetUserIds = team.map(u => u.id);
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
        const rows = await ctx.db.execute(descendantsQuery);
        targetUserIds = rows.map((r: any) => String(r.id));
        // Include the manager themselves if it's management scope? 
        // User request: "reports of all the teams under him" - usually excludes the manager unless asked.
        // But for completeness, we'll focus on the subordinates.
      }

      if (targetUserIds.length === 0 && input.scope !== "individual") {
        return { sales: [], attendance: [], summary: { revenue: 0, balance: 0, orders: 0, visits: 0 } };
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
          userName: sql`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(sales)
        .innerJoin(branches, eq(sales.branchId, branches.id))
        .innerJoin(users, eq(sales.userId, users.id))
        .where(
          and(
            inArray(sales.userId, targetUserIds),
            gte(sales.createdAt, start),
            lte(sales.createdAt, end)
          )
        );

      // 3. Fetch Attendance/Visits
      const attendanceData = await ctx.db
        .select({
          userName: sql`${users.firstName} || ' ' || ${users.lastName}`,
          date: locationLogs.date,
          recordedAt: locationLogs.recordedAt,
        })
        .from(locationLogs)
        .innerJoin(users, eq(locationLogs.userId, users.id))
        .where(
          and(
            inArray(locationLogs.userId, targetUserIds),
            gte(locationLogs.recordedAt, start),
            lte(locationLogs.recordedAt, end)
          )
        );

      // 4. Summarize
      const summary = {
        revenue: salesData.reduce((acc, s) => acc + parseFloat(s.invoiceAmount), 0),
        balance: salesData.reduce((acc, s) => acc + parseFloat(s.balanceAmount), 0),
        orders: salesData.length,
        visits: attendanceData.length,
      };

      return {
        sales: salesData,
        attendance: attendanceData,
        summary,
      };
    }),
});
