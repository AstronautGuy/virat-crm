import { notifications, users, inventory } from "@/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { sendNotificationToUser } from "./push";
import { sendSMSAlert, sendEmailAlert } from "./communication";

export async function checkAndNotifyLowStock(
  tx: any,
  branchId: number,
  productId: number
) {
  try {
    // 1. Fetch inventory record with product and branch associations
    const stock = await tx.query.inventory.findFirst({
      where: and(
        eq(inventory.productId, productId),
        eq(inventory.branchId, branchId)
      ),
      with: {
        product: true,
        branch: true,
      },
    });

    if (!stock || !stock.product || !stock.branch) {
      return;
    }

    // 2. Check if quantity is below or equal to minThreshold
    if (stock.quantity <= stock.minThreshold) {
      const title = "⚠️ Low Stock Alert";
      const message = `Stock level for "${stock.product.name}" at branch "${stock.branch.name}" has fallen to ${stock.quantity} (Threshold: ${stock.minThreshold}).`;

      // 3. Find recipients: Branch Managers, Admins, Developers
      const recipients = await tx.query.users.findMany({
        where: or(
          eq(users.role, "Admin"),
          eq(users.role, "Developer"),
          and(eq(users.role, "Manager"), eq(users.branchId, branchId))
        ),
      });

      for (const recipient of recipients) {
        // 4. Create database notification
        await tx.insert(notifications).values({
          userId: recipient.id,
          title,
          message,
        });

        // 5. Send push notification in background
        void sendNotificationToUser(recipient.id, {
          title,
          body: message,
          url: "/inventory",
        });
      }
    }
  } catch (error) {
    console.error("Error in checkAndNotifyLowStock:", error);
  }
}
