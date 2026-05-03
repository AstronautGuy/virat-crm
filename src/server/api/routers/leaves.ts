import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { leaves } from "@/server/db/schema/leaves";
import { users } from "@/server/db/schema/users";
import { eq, sql, inArray } from "drizzle-orm";
import { sendNotificationToUser } from "@/server/lib/push";

export const leavesRouter = createTRPCRouter({
  createLeave: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string(),
        type: z.enum(["Casual", "Sick", "Annual", "Other"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      const [leave] = await ctx.db
        .insert(leaves)
        .values({
          userId: currentUser.id,
          managerId: currentUser.managerId,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          reason: input.reason,
          type: input.type,
          status: "Pending",
        })
        .returning();

      return leave;
    }),

  getMyLeaves: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
    });

    if (!currentUser) return [];

    return ctx.db.query.leaves.findMany({
      where: eq(leaves.userId, currentUser.id),
      orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
    });
  }),

  getLeaves: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
      columns: { id: true, role: true },
    });

    if (!currentUser) return [];

    if (currentUser.role === "Admin") {
      return ctx.db.query.leaves.findMany({
        with: { user: true },
        orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
      });
    }

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
    const descendantIds = rows.map((row: any) => String(row.id));
    const allowedIds = [currentUser.id, ...descendantIds];

    return ctx.db.query.leaves.findMany({
      where: inArray(leaves.userId, allowedIds),
      with: { user: true },
      orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
    });
  }),

  updateLeaveStatus: protectedProcedure
    .input(z.object({ leaveId: z.number(), status: z.enum(["Pending", "Approved", "Rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      const targetLeave = await ctx.db.query.leaves.findFirst({
        where: eq(leaves.id, input.leaveId),
      });

      if (!targetLeave) throw new Error("Leave request not found");

      if (currentUser.role !== "Admin") {
        if (currentUser.role !== "Manager") {
          throw new Error("Unauthorized to update status");
        }

        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${currentUser.id}
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
          body: `Your leave request from ${updated.startDate.toLocaleDateString()} has been ${input.status.toLowerCase()}.`,
          url: "/leaves",
        });
      }

      return updated;
    }),
});
