import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, BUCKET_NAME } from "@/server/lib/r2";
import { files, sales, replacements, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const storageRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const key = `uploads/${Date.now()}-${input.fileName}`;
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: input.fileType,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 minutes

      return {
        url,
        key,
      };
    }),

  saveFileMetadata: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["sale", "replacement"]),
        entityId: z.number(),
        key: z.string(),
        originalName: z.string(),
        mimeType: z.string(),
        size: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (input.size > MAX_SIZE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds the 5MB limit",
        });
      }

      const [newFile] = await ctx.db
        .insert(files)
        .values({
          entityType: input.entityType,
          entityId: input.entityId,
          key: input.key,
          originalName: input.originalName,
          mimeType: input.mimeType,
          size: input.size,
          uploadedBy: ctx.dbUser.id,
        })
        .returning();

      return newFile;
    }),

  getFileUrl: protectedProcedure
    .input(z.object({ fileId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.query.files.findFirst({
        where: eq(files.id, input.fileId),
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      // RBAC Check
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.dbUser.id),
      });

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let hasAccess = user.role === "Admin";

      if (!hasAccess) {
        if (file.entityType === "sale") {
          // Check if user owns or manages the sale
          const sale = await ctx.db.query.sales.findFirst({
            where: eq(sales.id, file.entityId),
          });

          if (sale) {
            if (sale.userId === ctx.dbUser.id) {
              hasAccess = true;
            } else {
              // Manager check (simplified for now: check if sale's user has this user as manager)
              const saleOwner = await ctx.db.query.users.findFirst({
                where: eq(users.id, sale.userId),
              });
              if (saleOwner?.managerId === ctx.dbUser.id) {
                hasAccess = true;
              }
            }
          }
        } else if (file.entityType === "replacement") {
          const replacement = await ctx.db.query.replacements.findFirst({
            where: eq(replacements.id, file.entityId),
          });
          if (replacement?.userId === ctx.dbUser.id) {
            hasAccess = true;
          }
          // Note: Add manager check for replacements if needed
        }
      }

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this file",
        });
      }

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.key,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 minutes

      return {
        url,
        fileName: file.originalName,
      };
    }),

  getEntityFiles: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["sale", "replacement"]),
        entityId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.files.findMany({
        where: and(
          eq(files.entityType, input.entityType),
          eq(files.entityId, input.entityId),
        ),
        orderBy: (files, { desc }) => [desc(files.createdAt)],
      });
    }),
});
