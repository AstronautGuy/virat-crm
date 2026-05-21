import { db } from "@/server/db";
import { users, notifications } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { sendNotificationToUser } from "./push";

export async function notifyAdmins(title: string, body: string) {
  const admins = await db.query.users.findMany({
    where: eq(users.role, "Admin"),
  });

  await Promise.all(
    admins.map(async (admin) => {
      // 1. Web Push Notification
      await sendNotificationToUser(admin.id, { title, body });

      // 2. In-App Dashboard Notification
      await db.insert(notifications).values({
        userId: admin.id,
        title,
        message: body,
      });
    }),
  );
}
