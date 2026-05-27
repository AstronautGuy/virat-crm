import { z } from "zod";
import {
  createTRPCRouter,
  featureProtectedProcedure,
  featureManagerProcedure,
} from "@/server/api/trpc";
import { dailyReports } from "@/server/db/schema";
import { eq, and, desc, sql, type SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const dailyReportsRouter = createTRPCRouter({
  submitReport: featureProtectedProcedure("reports")
    .input(
      z.object({
        content: z.string().min(10, "Report content too short"),
        reportDate: z.date().optional(),
        customerId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await db
        .insert(dailyReports)
        .values({
          userId: dbUser.id,
          branchId: dbUser.branchId!,
          reportDate: input.reportDate ?? new Date(),
          content: input.content,
          customerId: input.customerId,
        })
        .returning();
    }),

  listMyReports: featureProtectedProcedure("reports")
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await db.query.dailyReports.findMany({
        where: eq(dailyReports.userId, dbUser.id),
        orderBy: [desc(dailyReports.reportDate)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
          customer: {
            columns: {
              name: true,
            },
          },
        },
      });
    }),

  listBranchReports: featureManagerProcedure("reports")
    .input(
      z
        .object({
          date: z.date().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const filters: SQL[] = [eq(dailyReports.branchId, dbUser.branchId!)];

      if (input?.date) {
        const startOfDay = new Date(input.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(input.date);
        endOfDay.setHours(23, 59, 59, 999);

        filters.push(
          sql`${dailyReports.reportDate} >= ${startOfDay} AND ${dailyReports.reportDate} <= ${endOfDay}`,
        );
      }

      return await db.query.dailyReports.findMany({
        where: and(...filters),
        orderBy: [desc(dailyReports.reportDate)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
          customer: {
            columns: {
              name: true,
            },
          },
        },
      });
    }),
});
