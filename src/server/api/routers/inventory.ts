import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { inventory, inventoryTransactions, stockTransfers, products, branches } from "@/server/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const inventoryRouter = createTRPCRouter({
  getBranchStock: featureProtectedProcedure("inventory")
    .input(z.object({ branchId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const branchId = input.branchId ?? ctx.dbUser.branchId;
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
      return await ctx.db.transaction(async (tx) => {
        const existing = await tx.query.inventory.findFirst({
          where: and(
            eq(inventory.productId, input.productId),
            eq(inventory.branchId, input.branchId)
          ),
        });

        const newQuantity = (existing?.quantity ?? 0) + input.quantity;

        if (existing) {
          await tx
            .update(inventory)
            .set({ quantity: newQuantity })
            .where(eq(inventory.id, existing.id));
        } else {
          await tx.insert(inventory).values({
            productId: input.productId,
            branchId: input.branchId,
            quantity: newQuantity,
          });
        }

        await tx.insert(inventoryTransactions).values({
          productId: input.productId,
          branchId: input.branchId,
          userId: ctx.dbUser.id,
          type: "Adjustment",
          quantity: input.quantity,
          reason: input.reason,
        });

        return { success: true, newQuantity };
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

        // If Received, move stock
        if (input.status === "Received" && transfer.status === "Shipped") {
          const items = transfer.items as { productId: number; quantity: number }[];
          
          for (const item of items) {
            // Decrement from Origin
            const fromEntry = await tx.query.inventory.findFirst({
              where: and(
                eq(inventory.productId, item.productId),
                eq(inventory.branchId, transfer.fromBranchId)
              ),
            });
            if (!fromEntry || fromEntry.quantity < item.quantity) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Origin branch lacks stock for product ${item.productId}` });
            }
            await tx.update(inventory).set({ quantity: fromEntry.quantity - item.quantity }).where(eq(inventory.id, fromEntry.id));

            // Increment at Destination
            const toEntry = await tx.query.inventory.findFirst({
              where: and(
                eq(inventory.productId, item.productId),
                eq(inventory.branchId, transfer.toBranchId)
              ),
            });
            if (toEntry) {
              await tx.update(inventory).set({ quantity: toEntry.quantity + item.quantity }).where(eq(inventory.id, toEntry.id));
            } else {
              await tx.insert(inventory).values({ productId: item.productId, branchId: transfer.toBranchId, quantity: item.quantity });
            }

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
        if (input.status === "Shipped") updateData.approvedById = ctx.dbUser.id;
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
