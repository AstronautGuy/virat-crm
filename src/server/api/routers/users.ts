import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
      with: {
        manager: true,
      },
    });

    const managerPerm = await ctx.getPermission("manager:access");
    const adminPerm = await ctx.getPermission("admin:access");

    return {
      ...user,
      permissions: {
        isManager: !!managerPerm?.isGranted,
        isAdmin: !!adminPerm?.isGranted,
      },
    };
  }),
});
