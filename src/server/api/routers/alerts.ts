import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { sendNotification } from "@/server/lib/push";
import { users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const alertsRouter = createTRPCRouter({
  reportLockout: featureProtectedProcedure("workforce")
    .input(z.void())
    .mutation(async ({ ctx }) => {
      const user = ctx.dbUser;
      if (user.role === "Admin") return { success: true };

      const message = `${user.firstName} ${user.lastName} has been locked out due to location tracking failure for more than 10 minutes.`;

      // Find Admins
      const admins = await ctx.db.query.users.findMany({
        where: eq(users.role, "Admin"),
      });

      const notifyPromises = admins.map((admin) => 
        sendNotification(ctx.db, admin.id, "Employee Location Lockout", message)
      );

      // Find Manager if applicable
      if (user.managerId) {
        notifyPromises.push(
          sendNotification(ctx.db, user.managerId, "Team Member Location Lockout", message)
        );
      }

      await Promise.all(notifyPromises);

      return { success: true };
    }),
});
