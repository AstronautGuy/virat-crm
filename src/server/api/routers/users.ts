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

  getOrgTree: protectedProcedure.query(async ({ ctx }) => {
    // Fetch all active users
    const allUsers = await ctx.db.query.users.findMany({
      where: eq(users.isActive, true),
    });

    const managerPerm = await ctx.getPermission("manager:access");
    const adminPerm = await ctx.getPermission("admin:access");

    const isAdmin = !!adminPerm?.isGranted;
    const isManager = !!managerPerm?.isGranted;

    // Map by ID for easy access
    const userMap = new Map();
    allUsers.forEach(u => {
      userMap.set(u.id, {
        ...u,
        name: `${u.firstName} ${u.lastName}`,
        children: []
      });
    });

    const roots: any[] = [];

    // Build the tree
    allUsers.forEach(u => {
      const node = userMap.get(u.id);
      if (u.managerId && userMap.has(u.managerId)) {
        userMap.get(u.managerId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    if (isAdmin) return roots;

    // If Manager, find the node for current user and return its subtree
    const currentUser = allUsers.find(u => u.kindeId === ctx.user.id);
    if (isManager && currentUser) {
      const myNode = userMap.get(currentUser.id);
      return myNode ? [myNode] : [];
    }

    return [];
  }),
});
