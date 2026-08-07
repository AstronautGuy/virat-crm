import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  featureProtectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db/schema/users";
import { eq, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const usersRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        employeeCode: z.string().min(3),
        password: z.string().min(6),
        branchId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.email, input.email),
          eq(users.employeeCode, input.employeeCode),
        ),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email or employee code already exists",
        });
      }

      // Max active users license limit check
      const activeUserCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isActive, true));
      const activeUserCount = activeUserCountResult[0]?.count ?? 0;
      if (activeUserCount >= ctx.settings.maxUsers) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Maximum active user limit (${ctx.settings.maxUsers}) has been reached. Contact System Developer to upgrade your license.`,
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          employeeCode: input.employeeCode,
          password: hashedPassword,
          role: "Employee", // Default role for self-signup
          branchId: input.branchId,
          isActive: true,
        })
        .returning();

      return {
        success: true,
        userId: newUser?.id,
      };
    }),

  getPublicBranches: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.branches.findMany();
  }),

  getUsersForDropdown: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        role: true,
      },
      where: eq(users.isActive, true),
    });
  }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    // In our new system, ctx.dbUser is already fetched in the context
    // We can just return it with calculated permissions
    // Fetch managers for the current user since trpc.ts doesn't populate it
    const currentUserWithManagers = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.dbUser.id),
      with: {
        managers: {
          with: { manager: true },
        },
      },
    });

    return {
      ...ctx.dbUser,
      managers: currentUserWithManagers?.managers ?? [],
      permissions: {
        isManager: ctx.dbUser.role === "Manager" || ctx.dbUser.role === "Admin",
        isAdmin: ctx.dbUser.role === "Admin",
      },
      disabledFeaturesGlobal: ctx.settings.disabledFeaturesGlobal ?? [],
    };
  }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.dbUser.id),
      });

      if (!user?.password) {
        throw new Error("User not found or password not set");
      }

      const isValid = await bcrypt.compare(
        input.currentPassword,
        user.password,
      );
      if (!isValid) {
        throw new Error("Invalid current password");
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, ctx.dbUser.id));

      return { success: true };
    }),

  createUser: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        employeeCode: z.string(),
        password: z.string().min(6),
        role: z.string().min(2).max(64),
        branchId: z.number(),
        managerIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins or developers can create users",
        });
      }

      if (input.role === "Developer" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only developers can assign the Developer role",
        });
      }

      // Max active users license limit check
      const activeUserCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isActive, true));
      const activeUserCount = activeUserCountResult[0]?.count ?? 0;
      if (activeUserCount >= ctx.settings.maxUsers) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Maximum active user limit (${ctx.settings.maxUsers}) has been reached. Contact System Developer to upgrade your license.`,
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const { managerIds, ...userData } = input;

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
        })
        .returning();

      if (newUser && managerIds && managerIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { userManagers } = require("@/server/db/schema/users");
        await ctx.db.insert(userManagers).values(
          managerIds.map((managerId) => ({
            userId: newUser.id,
            managerId,
          })),
        );
      }

      return newUser;
    }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.dbUser.role !== "Admin" &&
      ctx.dbUser.role !== "Manager" &&
      ctx.dbUser.role !== "Developer"
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return ctx.db.query.users.findMany({
      with: {
        branch: true,
        managers: {
          with: { manager: true },
        },
      },
    });
  }),

  toggleActiveStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins or developers can change active status",
        });
      }

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (targetUser.role === "Developer" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Developer accounts cannot be deactivated by other roles.",
        });
      }

      // Check max users cap if activating an inactive user
      if (input.isActive && !targetUser.isActive) {
        const activeUserCountResult = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(eq(users.isActive, true));
        const activeUserCount = activeUserCountResult[0]?.count ?? 0;
        if (activeUserCount >= ctx.settings.maxUsers) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Maximum active user limit (${ctx.settings.maxUsers}) has been reached. Contact System Developer to upgrade your license.`,
          });
        }
      }

      await ctx.db
        .update(users)
        .set({ isActive: input.isActive })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  resetUserPassword: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins or developers can reset employee passwords",
        });
      }

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (targetUser.role === "Developer" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Developer passwords cannot be reset by other roles.",
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        employeeCode: z.string().min(3),
        role: z.string().min(2).max(64),
        branchId: z.number().nullable().optional(),
        managerIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins or developers can edit user details",
        });
      }

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (targetUser.role === "Developer" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Developer details can only be modified by the Developer.",
        });
      }

      if (input.role === "Developer" && ctx.dbUser.role !== "Developer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only developers can assign the Developer role",
        });
      }

      if (input.managerIds && input.managerIds.includes(input.userId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An employee cannot be their own manager",
        });
      }

      // Check if another user already uses this email or employee code
      const existingUser = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.email, input.email),
          eq(users.employeeCode, input.employeeCode),
        ),
      });

      if (existingUser && existingUser.id !== input.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Another employee with this email or employee code already exists",
        });
      }

      const { userId, managerIds, ...updateData } = input;

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (managerIds !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { userManagers } = require("@/server/db/schema/users");

        // Remove existing managers
        await ctx.db
          .delete(userManagers)
          .where(eq(userManagers.userId, userId));

        // Add new managers
        if (managerIds.length > 0) {
          await ctx.db.insert(userManagers).values(
            managerIds.map((managerId) => ({
              userId,
              managerId,
            })),
          );
        }
      }

      return updatedUser;
    }),

  getOrgTree: featureProtectedProcedure("org-chart").query(async ({ ctx }) => {
    // Fetch all active users with their managers
    const allUsers = await ctx.db.query.users.findMany({
      where: eq(users.isActive, true),
      with: {
        managers: true,
      },
    });

    const isAdmin = ctx.dbUser.role === "Admin";
    const isManager = ctx.dbUser.role === "Manager";

    // Map by ID for easy access
    interface OrgNode {
      id: string;
      firstName: string | null;
      lastName: string | null;
      name: string;
      role: string | null;
      employeeCode: string | null;
      managerIds: string[];
      children: OrgNode[];
    }

    const userMap = new Map<string, OrgNode>();
    allUsers.forEach((u) => {
      userMap.set(u.id, {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        employeeCode: u.employeeCode,
        managerIds: u.managers.map((m: any) => m.managerId),
        children: [],
      });
    });

    const roots: OrgNode[] = [];

    // Build the tree (a user can be pushed to multiple managers' children)
    allUsers.forEach((u) => {
      const node = userMap.get(u.id);
      if (!node) return;

      const mIds = node.managerIds;
      if (mIds.length > 0) {
        let hasValidManager = false;
        mIds.forEach((mId) => {
          if (userMap.has(mId)) {
            userMap.get(mId)?.children.push(node);
            hasValidManager = true;
          }
        });
        if (!hasValidManager) {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    if (isAdmin) return roots;

    // If Manager, find the node for current user and return its subtree
    if (isManager) {
      const myNode = userMap.get(ctx.dbUser.id);
      return myNode ? [myNode] : [];
    }

    return [];
  }),
});
