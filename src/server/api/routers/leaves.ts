import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { leaves } from "@/server/db/schema/leaves";
import { users } from "@/server/db/schema/users";
import { eq, sql, inArray } from "drizzle-orm";
import { sendNotificationToUser } from "@/server/lib/push";

export const leavesRouter = createTRPCRouter({
  createLeave: featureProtectedProcedure("workforce")
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string(),
        type: z.enum(["Sick", "Vacation", "Unpaid"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [leave] = await ctx.db
        .insert(leaves)
        .values({
          userId: ctx.dbUser.id,
          startDate: input.startDate,
          endDate: input.endDate,
          reason: input.reason,
          type: input.type,
          status: "Pending",
        })
        .returning();

      return leave;
    }),

  getMyLeaves: featureProtectedProcedure("workforce").query(async ({ ctx }) => {
    return ctx.db.query.leaves.findMany({
      where: eq(leaves.userId, ctx.dbUser.id),
      orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
    });
  }),

  getLeaves: featureProtectedProcedure("workforce").query(async ({ ctx }) => {
    if (ctx.dbUser.role === "Admin") {
      return ctx.db.query.leaves.findMany({
        with: { user: true },
        orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
      });
    }

    const descendantsQuery = sql`
      WITH RECURSIVE subordinates AS (
        SELECT id FROM "virat-crm_user" WHERE manager_id = ${ctx.dbUser.id}
        UNION
        SELECT e.id FROM "virat-crm_user" e
        INNER JOIN subordinates s ON s.id = e.manager_id
      )
      SELECT id FROM subordinates;
    `;

    const rows = await ctx.db.execute(descendantsQuery);
    const descendantIds = rows.map((row: any) => String(row.id));
    const allowedIds = [ctx.dbUser.id, ...descendantIds];

    return ctx.db.query.leaves.findMany({
      where: inArray(leaves.userId, allowedIds),
      with: { user: true },
      orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
    });
  }),

  updateLeaveStatus: featureProtectedProcedure("workforce")
    .input(z.object({ leaveId: z.number(), status: z.enum(["Pending", "Approved", "Rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const targetLeave = await ctx.db.query.leaves.findFirst({
        where: eq(leaves.id, input.leaveId),
      });

      if (!targetLeave) throw new Error("Leave request not found");

      if (ctx.dbUser.role !== "Admin") {
        if (ctx.dbUser.role !== "Manager") {
          throw new Error("Unauthorized to update status");
        }

        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${ctx.dbUser.id}
            UNION
            SELECT e.id FROM "virat-crm_user" e
            INNER JOIN subordinates s ON s.id = e.manager_id
          )
          SELECT id FROM subordinates WHERE id = ${targetLeave.userId} LIMIT 1;
        `;

        const rows = await ctx.db.execute(descendantsQuery);
        if (rows.length === 0) {
          throw new Error("Unauthorized");
        }
      }

      const [updated] = await ctx.db
        .update(leaves)
        .set({ status: input.status })
        .where(eq(leaves.id, input.leaveId))
        .returning();

      if (updated) {
        void sendNotificationToUser(updated.userId, {
          title: `Leave ${input.status}`,
          body: `Your leave request from ${new Date(updated.startDate).toLocaleDateString()} has been ${input.status.toLowerCase()}.`,
          url: "/leaves",
        });
      }

      return updated;
    }),
});
