import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { notifications, pushSubscriptions } from "@/server/db/schema";
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

  savePushSubscription: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      await ctx.db
        .insert(pushSubscriptions)
        .values({
          userId: currentUser.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
          userAgent: input.userAgent,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: {
            userId: currentUser.id,
            p256dh: input.keys.p256dh,
            auth: input.keys.auth,
            userAgent: input.userAgent,
          },
        });

      return { success: true };
    }),

  deletePushSubscription: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint));

      return { success: true };
    }),
});
