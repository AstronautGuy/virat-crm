import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { notifications } from "@/server/db/schema/notifications";
import { users } from "@/server/db/schema/users";
import { eq, and } from "drizzle-orm";

export const notificationsRouter = createTRPCRouter({
  getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
    });

    if (!currentUser) return [];

    return ctx.db.query.notifications.findMany({
      where: eq(notifications.userId, currentUser.id),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, currentUser.id)
          )
        );

      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
    });

    if (!currentUser) throw new Error("User not found");

    await ctx.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, currentUser.id));

    return { success: true };
  }),
});
