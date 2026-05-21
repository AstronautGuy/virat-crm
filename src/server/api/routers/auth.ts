import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { users, rolePermissions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { encrypt } from "@/server/lib/auth";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login",
        summary: "Login and get token",
        tags: ["Auth"],
      },
    })
    .input(
      z.object({
        employeeCode: z.string(),
        password: z.string(),
      }),
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          employeeCode: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          role: z.string(),
          branchName: z.string().optional().nullable(),
          permissions: z.record(z.string(), z.boolean()),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.employeeCode, input.employeeCode.toUpperCase()),
        with: {
          branch: true,
        },
      });

      if (!user?.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Fetch role permissions
      const perms = await ctx.db.query.rolePermissions.findMany({
        where: eq(rolePermissions.role, user.role),
      });

      const permissionsMap = perms.reduce(
        (acc, p) => {
          acc[p.featureKey] = p.isEnabled;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      // 30 days for mobile app persistent login
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = await encrypt({
        userId: user.id,
        expires: expires.toISOString(),
      });

      return {
        token,
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          branchName: user.branch?.name ?? "No Branch Assigned",
          permissions: permissionsMap,
        },
      };
    }),
});
