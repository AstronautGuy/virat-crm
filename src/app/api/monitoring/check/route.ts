import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { and, lt, sql, eq } from "drizzle-orm";
import { notifyAdmins } from "@/server/lib/monitoring";

export async function GET(req: Request) {
  // Security check for cron (e.g. Authorization header with secret)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Find users who were active but haven't sent heartbeat in 15 mins
  // Find users who were active but haven't sent heartbeat in 15 mins
  // Threshold: 15 minutes (approx 3 missed heartbeats at 5-min frequency)
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const disconnectedUsers = await db.query.users.findMany({
    where: and(
      lt(users.lastActiveAt, fifteenMinsAgo),
      eq(users.connectivityStatus, "Online")
    ),
  });

  if (disconnectedUsers.length > 0) {
    for (const user of disconnectedUsers) {
      // Mark as Disconnected/Offline to avoid spamming admins
      await db.update(users)
        .set({ connectivityStatus: "Disconnected" })
        .where(eq(users.id, user.id));

      await notifyAdmins(
        "User Disconnected",
        `${user.firstName} ${user.lastName} (${user.employeeCode}) has disconnected or lost GPS heartbeat.`
      );
    }
  }

  return NextResponse.json({ checked: true, disconnectedCount: disconnectedUsers.length });
}
