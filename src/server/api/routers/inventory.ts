import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { inventory, inventoryTransactions, stockTransfers, products, branches } from "@/server/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const inventoryRouter = createTRPCRouter({
  getBranchStock: featureProtectedProcedure("inventory")
    .input(z.object({ branchId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const isAdmin = (await ctx.getPermission("admin:access"))?.isGranted;
      const branchId = isAdmin ? (input.branchId ?? ctx.dbUser.branchId) : ctx.dbUser.branchId;
      
      if (!branchId) throw new TRPCError({ code: "BAD_REQUEST", message: "Branch ID is required" });

      return ctx.db.query.inventory.findMany({
        where: eq(inventory.branchId, branchId),
        with: {
          product: true,
        },
      });
    }),

  adjustStock: featureProtectedProcedure("inventory")
    .input(
      z.object({
        productId: z.number(),
        branchId: z.number(),
        quantity: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = (await ctx.getPermission("admin:access"))?.isGranted;
      if (!isAdmin && input.branchId !== ctx.dbUser.branchId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to adjust stock for this branch" });
      }

      return await ctx.db.transaction(async (tx) => {
        // Atomic Upsert: Update quantity or Insert if not exists
        const result = await tx
          .insert(inventory)
          .values({
            productId: input.productId,
            branchId: input.branchId,
            quantity: input.quantity,
          })
          .onConflictDoUpdate({
            target: [inventory.productId, inventory.branchId],
            set: { quantity: sql`${inventory.quantity} + ${input.quantity}` },
          })
          .returning();

        await tx.insert(inventoryTransactions).values({
          productId: input.productId,
          branchId: input.branchId,
          userId: ctx.dbUser.id,
          type: "Adjustment",
          quantity: input.quantity,
          reason: input.reason,
        });

        return { success: true, newQuantity: result[0]?.quantity };
      });
    }),

  requestTransfer: featureProtectedProcedure("inventory")
    .input(
      z.object({
        fromBranchId: z.number(),
        toBranchId: z.number(),
        items: z.array(z.object({ productId: z.number(), quantity: z.number() })),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.fromBranchId !== ctx.dbUser.branchId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Origin branch must be your assigned branch" });
      }

      const [transfer] = await ctx.db
        .insert(stockTransfers)
        .values({
          fromBranchId: input.fromBranchId,
          toBranchId: input.toBranchId,
          status: "Pending",
          requestedById: ctx.dbUser.id,
          items: input.items,
          notes: input.notes,
        })
        .returning();

      return transfer;
    }),

  updateTransferStatus: featureProtectedProcedure("inventory")
    .input(
      z.object({
        transferId: z.number(),
        status: z.enum(["Shipped", "Received", "Cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const transfer = await tx.query.stockTransfers.findFirst({
          where: eq(stockTransfers.id, input.transferId),
        });

        if (!transfer) throw new TRPCError({ code: "NOT_FOUND" });

        // Authorization: User must belong to either origin (to ship/cancel) or destination (to receive)
        const isOriginUser = ctx.dbUser.branchId === transfer.fromBranchId;
        const isDestUser = ctx.dbUser.branchId === transfer.toBranchId;
        const isAdmin = (await ctx.getPermission("admin:access"))?.isGranted;

        if (!isAdmin && !isOriginUser && !isDestUser) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update this transfer" });
        }

        // Logic for Received
        if (input.status === "Received" && transfer.status === "Shipped") {
          if (!isAdmin && !isDestUser) throw new TRPCError({ code: "FORBIDDEN", message: "Only destination branch can mark as Received" });

          const items = transfer.items as { productId: number; quantity: number }[];
          
          for (const item of items) {
            // Atomic decrements and increments
            // Decrement from Origin
            const decr = await tx.update(inventory)
              .set({ quantity: sql`${inventory.quantity} - ${item.quantity}` })
              .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, transfer.fromBranchId)))
              .returning();

            if (!decr[0] || decr[0].quantity < 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Stock level fell below zero for product ${item.productId} at origin` });
            }

            // Increment at Destination (Upsert)
            await tx.insert(inventory)
              .values({ productId: item.productId, branchId: transfer.toBranchId, quantity: item.quantity })
              .onConflictDoUpdate({
                target: [inventory.productId, inventory.branchId],
                set: { quantity: sql`${inventory.quantity} + ${item.quantity}` }
              });

            // Log transactions
            await tx.insert(inventoryTransactions).values([
              {
                productId: item.productId,
                branchId: transfer.fromBranchId,
                userId: ctx.dbUser.id,
                type: "Transfer_Out",
                quantity: -item.quantity,
                referenceId: transfer.id.toString(),
                reason: `Transfer to branch ${transfer.toBranchId}`,
              },
              {
                productId: item.productId,
                branchId: transfer.toBranchId,
                userId: ctx.dbUser.id,
                type: "Transfer_In",
                quantity: item.quantity,
                referenceId: transfer.id.toString(),
                reason: `Transfer from branch ${transfer.fromBranchId}`,
              }
            ]);
          }
        }

        const updateData: any = { status: input.status };
        if (input.status === "Shipped") {
          if (!isAdmin && !isOriginUser) throw new TRPCError({ code: "FORBIDDEN", message: "Only origin branch can ship" });
          updateData.approvedById = ctx.dbUser.id;
        }
        if (input.status === "Received") updateData.receivedById = ctx.dbUser.id;

        return await tx.update(stockTransfers).set(updateData).where(eq(stockTransfers.id, input.transferId)).returning();
      });
    }),

  getTransfers: featureProtectedProcedure("inventory")
    .query(async ({ ctx }) => {
      return ctx.db.query.stockTransfers.findMany({
        where: sql`${stockTransfers.fromBranchId} = ${ctx.dbUser.branchId} OR ${stockTransfers.toBranchId} = ${ctx.dbUser.branchId}`,
        with: {
          fromBranch: true,
          toBranch: true,
          requestedBy: true,
        },
        orderBy: [desc(stockTransfers.createdAt)],
      });
    }),
});
