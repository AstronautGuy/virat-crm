import { z } from "zod";
import { createTRPCRouter, protectedProcedure, featureProtectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db/schema/users";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const usersRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
      employeeCode: z.string().min(3),
      password: z.string().min(6),
      branchId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.email, input.email),
          eq(users.employeeCode, input.employeeCode)
        ),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email or employee code already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [newUser] = await ctx.db.insert(users).values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        employeeCode: input.employeeCode,
        password: hashedPassword,
        role: "Employee", // Default role for self-signup
        branchId: input.branchId,
        isActive: true,
      }).returning();

      return {
        success: true,
        userId: newUser?.id,
      };
    }),

  getPublicBranches: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.branches.findMany();
  }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    // In our new system, ctx.dbUser is already fetched in the context
    // We can just return it with calculated permissions
    
    return {
      ...ctx.dbUser,
      permissions: {
        isManager: ctx.dbUser.role === "Manager" || ctx.dbUser.role === "Admin",
        isAdmin: ctx.dbUser.role === "Admin",
      },
    };
  }),

  updatePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.dbUser.id),
      });

      if (!user?.password) {
        throw new Error("User not found or password not set");
      }

      const isValid = await bcrypt.compare(input.currentPassword, user.password);
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
    .input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      employeeCode: z.string(),
      password: z.string().min(6),
      role: z.string().min(2).max(64),
      branchId: z.number(),
      managerId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create users" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      
      return await ctx.db.insert(users).values({
        ...input,
        password: hashedPassword,
      }).returning();
    }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.dbUser.role !== "Admin" && ctx.dbUser.role !== "Manager") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return ctx.db.query.users.findMany({
      with: {
        branch: true,
        manager: true,
      }
    });
  }),

  toggleActiveStatus: protectedProcedure
    .input(z.object({
      userId: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can change active status" });
      }

      await ctx.db
        .update(users)
        .set({ isActive: input.isActive })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  resetUserPassword: protectedProcedure
    .input(z.object({
      userId: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can reset employee passwords" });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  updateUser: protectedProcedure
    .input(z.object({
      userId: z.string(),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
      employeeCode: z.string().min(3),
      role: z.string().min(2).max(64),
      branchId: z.number().nullable().optional(),
      managerId: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can edit user details" });
      }

      if (input.managerId && input.managerId === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An employee cannot be their own manager",
        });
      }

      // Check if another user already uses this email or employee code
      const existingUser = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.email, input.email),
          eq(users.employeeCode, input.employeeCode)
        ),
      });

      if (existingUser && existingUser.id !== input.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Another employee with this email or employee code already exists",
        });
      }

      const { userId, ...updateData } = input;

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      return updatedUser;
    }),


  getOrgTree: featureProtectedProcedure("org-chart").query(async ({ ctx }) => {
    // Fetch all active users
    const allUsers = await ctx.db.query.users.findMany({
      where: eq(users.isActive, true),
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
      managerId: string | null;
      children: OrgNode[];
    }

    const userMap = new Map<string, OrgNode>();
    allUsers.forEach(u => {
      userMap.set(u.id, {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        employeeCode: u.employeeCode,
        managerId: u.managerId,
        children: []
      });
    });

    const roots: OrgNode[] = [];

    // Build the tree
    allUsers.forEach(u => {
      const node = userMap.get(u.id);
      if (node && u.managerId && userMap.has(u.managerId)) {
        userMap.get(u.managerId)?.children.push(node);
      } else if (node) {
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
