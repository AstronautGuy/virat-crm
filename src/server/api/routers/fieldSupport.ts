import { z } from "zod";
import { createTRPCRouter, protectedProcedure, featureProtectedProcedure } from "../trpc";
import { fieldSupportReports, fieldSupportReportItems } from "../../db/schema/fieldSupportReports";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { branches } from "../../db/schema/branches";
import { users } from "../../db/schema/users";

export const fieldSupportRouter = createTRPCRouter({
  create: featureProtectedProcedure("field-support")
    .input(
      z.object({
        branchId: z.number(),
        month: z.string().min(1),
        totalPoint: z.string().optional(),
        totalCust: z.string().optional(),
        totalAmount: z.string().optional(),
        items: z.array(
          z.object({
            srName: z.string().optional(),
            orderNo: z.string().optional(),
            customerName: z.string().optional(),
            product: z.string().optional(),
            unit: z.string().optional(),
            advanceAmount: z.string().optional(),
            adc: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [report] = await ctx.db
        .insert(fieldSupportReports)
        .values({
          managerId: ctx.dbUser.id,
          branchId: input.branchId,
          month: input.month,
          totalPoint: input.totalPoint,
          totalCust: input.totalCust,
          totalAmount: input.totalAmount,
        })
        .returning();

      if (!report) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create report",
        });
      }

      if (input.items.length > 0) {
        await ctx.db.insert(fieldSupportReportItems).values(
          input.items.map((item) => ({
            reportId: report.id,
            ...item,
          }))
        );
      }

      return report;
    }),

  getAll: featureProtectedProcedure("field-support").query(async ({ ctx }) => {
    const isAdmin = ctx.dbUser.role === "Admin";
    
    return ctx.db.query.fieldSupportReports.findMany({
      where: isAdmin ? undefined : eq(fieldSupportReports.managerId, ctx.dbUser.id),
      orderBy: [desc(fieldSupportReports.createdAt)],
      with: {
        manager: true,
        branch: true,
      },
    });
  }),

  getById: featureProtectedProcedure("field-support")
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.db.query.fieldSupportReports.findFirst({
        where: eq(fieldSupportReports.id, input.id),
        with: {
          manager: true,
          branch: true,
          items: true,
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      return report;
    }),
});
