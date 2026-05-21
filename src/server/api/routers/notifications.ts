import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { notifications, pushSubscriptions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const notificationsRouter = createTRPCRouter({
  getMyNotifications: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/notifications/list",
        summary: "Get notifications for logged-in user",
        tags: ["Notifications"],
      },
    })
    .input(z.void())
    .output(
      z.array(
        z.object({
          id: z.number(),
          userId: z.string(),
          title: z.string(),
          message: z.string(),
          isRead: z.boolean(),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      return ctx.db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.dbUser.id),
        orderBy: (n, { desc }) => [desc(n.createdAt)],
      });
    }),

  markAsRead: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/notifications/read",
        summary: "Mark notification as read",
        tags: ["Notifications"],
      },
    })
    .input(z.object({ notificationId: z.number() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.dbUser.id),
          ),
        );

      return { success: true };
    }),

  markAllAsRead: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/notifications/read-all",
        summary: "Mark all notifications as read",
        tags: ["Notifications"],
      },
    })
    .input(z.void())
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, ctx.dbUser.id));

      return { success: true };
    }),

  savePushSubscription: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(pushSubscriptions)
        .values({
          userId: ctx.dbUser.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
          userAgent: input.userAgent,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: {
            userId: ctx.dbUser.id,
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
