import webpush from "web-push";
import { env } from "@/env";
import { db } from "@/server/db";
import { pushSubscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Configure VAPID keys
webpush.setVapidDetails(
  "mailto:support@viratcrm.com",
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload,
) {
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });

  const sendPromises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload),
      );
    } catch (error: unknown) {
      // If the subscription is no longer valid, remove it
      const statusCode = (error as { statusCode?: number })?.statusCode;

      if (statusCode === 410 || statusCode === 404) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.id, sub.id));
      } else {
        console.error("Error sending push notification:", error);
      }
    }
  });

  await Promise.allSettled(sendPromises);
}
