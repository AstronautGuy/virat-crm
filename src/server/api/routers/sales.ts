import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { sales, saleItems, inventory, inventoryTransactions, users } from "@/server/db/schema";
import { eq, inArray, sql, and } from "drizzle-orm";
import { sendNotificationToUser } from "@/server/lib/push";
import { TRPCError } from "@trpc/server";

export const salesRouter = createTRPCRouter({
  createSale: featureProtectedProcedure("sales")
    .input(
      z.object({
        branchId: z.number(),
        pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid Pincode").optional(),
        addressLine1: z.string().optional(),
        landmark: z.string().optional(),
        area: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        customerName: z.string().optional(),
        customerAddress: z.string().optional(),
        invoiceAmount: z.string().optional(),
        advancePaymentAmount: z.string().optional(),
        receivedAmount: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
            isFree: z.boolean().default(false),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.dbUser;

      return await ctx.db.transaction(async (tx) => {
        // 1. Stock Check & Decrement
        for (const item of input.items) {
          const stockEntry = await tx.query.inventory.findFirst({
            where: and(
              eq(inventory.productId, item.productId),
              eq(inventory.branchId, input.branchId)
            ),
          });

          if (!stockEntry || stockEntry.quantity < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient stock for product ID ${item.productId} at this branch.`,
            });
          }

          // Update inventory
          await tx
            .update(inventory)
            .set({ quantity: stockEntry.quantity - item.quantity })
            .where(eq(inventory.id, stockEntry.id));
        }

        // 2. Fetch Pincode Details (Outside transaction if possible, but kept here for simplicity if needed)
        let deliveryAddress = "";
        if (input.pincode) {
          try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${input.pincode}`);
            const data = (await res.json()) as any;
            if (Array.isArray(data) && data[0]?.Status === "Success") {
              const postOffice = data[0].PostOffice?.[0];
              if (postOffice) {
                deliveryAddress = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
              }
            }
          } catch (e) {
            console.error("Failed to fetch pincode details", e);
          }
        }

        let mainQty = 0;
        let freeQty = 0;
        for (const item of input.items) {
          if (item.isFree) freeQty += item.quantity;
          else mainQty += item.quantity;
        }
        const totalQty = mainQty + freeQty;

        const invoiceAmt = parseFloat(input.invoiceAmount ?? "0");
        const advanceAmt = parseFloat(input.advancePaymentAmount ?? "0");
        const receivedAmt = parseFloat(input.receivedAmount ?? "0");
        const balanceAmt = invoiceAmt - advanceAmt - receivedAmt;

        const orderNumber = `ORD-${Date.now()}`;
        const transactionNumber = `TXN-${Date.now()}`;

        // 3. Insert Sale
        const [newSale] = await tx
          .insert(sales)
          .values({
            branchId: input.branchId,
            userId: currentUser.id,
            managerId: currentUser.managerId,
            orderNumber,
            transactionNumber,
            pincode: input.pincode,
            addressLine1: input.addressLine1,
            landmark: input.landmark,
            area: input.area,
            city: input.city,
            state: input.state,
            deliveryAddress: deliveryAddress || undefined,
            customerName: input.customerName,
            customerAddress: input.customerAddress,
            mainQty,
            freeQty,
            totalQty,
            invoiceAmount: invoiceAmt.toString(),
            advancePaymentAmount: advanceAmt.toString(),
            receivedAmount: receivedAmt.toString(),
            balanceAmount: balanceAmt.toString(),
          })
          .returning();

        if (!newSale) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create sale" });

        // 4. Insert Sale Items & Transactions
        if (input.items.length > 0) {
          await tx.insert(saleItems).values(
            input.items.map((item) => ({
              saleId: newSale.id,
              productId: item.productId,
              quantity: item.quantity,
              isFree: item.isFree,
            }))
          );

          await tx.insert(inventoryTransactions).values(
            input.items.map((item) => ({
              productId: item.productId,
              branchId: input.branchId,
              userId: currentUser.id,
              type: "Sale",
              quantity: -item.quantity,
              referenceId: newSale.id.toString(),
              reason: `Sale ${newSale.orderNumber}`,
            }))
          );
        }

        return newSale;
      });
    }),

  getSales: featureProtectedProcedure("sales").query(async ({ ctx }) => {
    const currentUser = ctx.dbUser;

    if (currentUser.role === "Admin") {
      return ctx.db.query.sales.findMany({
        with: { 
          user: true, 
          manager: true, 
          branch: true, 
          items: true, 
          files: {
            where: (files, { eq }) => eq(files.entityType, "sale")
          }
        },
        orderBy: (sales, { desc }) => [desc(sales.createdAt)],
      });
    }

    // Filter by branch for non-admins
    return ctx.db.query.sales.findMany({
      where: eq(sales.branchId, currentUser.branchId!),
      with: { 
        user: true, 
        manager: true, 
        branch: true, 
        items: true, 
        files: {
          where: (files, { eq }) => eq(files.entityType, "sale")
        }
      },
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
    });
  }),

  updateSaleStatus: featureProtectedProcedure("sales")
    .input(z.object({ saleId: z.number(), status: z.enum(["Pending", "Approved", "Rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.dbUser;

      return await ctx.db.transaction(async (tx) => {
        const targetSale = await tx.query.sales.findFirst({
          where: eq(sales.id, input.saleId),
          with: { items: true }
        });

        if (!targetSale) throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

        // RBAC Check for Managers/Admins
        if (currentUser.role !== "Admin") {
          if (currentUser.role !== "Manager") {
            throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized to update status" });
          }

          // Check if sale belongs to manager's team (Simplified recursive check)
          const isOwnTeam = targetSale.managerId === currentUser.id;
          if (!isOwnTeam) {
             throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized: Sale does not belong to your team" });
          }
        }

        // Logic for "Rejected": Replenish inventory
        if (input.status === "Rejected" && targetSale.status !== "Rejected") {
          for (const item of targetSale.items) {
            await tx.insert(inventory)
              .values({ productId: item.productId, branchId: targetSale.branchId, quantity: item.quantity })
              .onConflictDoUpdate({
                target: [inventory.productId, inventory.branchId],
                set: { quantity: sql`${inventory.quantity} + ${item.quantity}` }
              });

            await tx.insert(inventoryTransactions).values({
              productId: item.productId,
              branchId: targetSale.branchId,
              userId: ctx.dbUser.id,
              type: "Adjustment",
              quantity: item.quantity,
              reason: `Sale ${targetSale.orderNumber} Rejected - Stock Reclaimed`,
              referenceId: targetSale.id.toString(),
            });
          }
        }

        // Logic for moving AWAY from Rejected back to Pending/Approved: Deduct inventory again
        if (targetSale.status === "Rejected" && (input.status === "Pending" || input.status === "Approved")) {
           for (const item of targetSale.items) {
             // Atomic decrement
             const decr = await tx.update(inventory)
               .set({ quantity: sql`${inventory.quantity} - ${item.quantity}` })
               .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, targetSale.branchId)))
               .returning();

             if (!decr[0] || decr[0].quantity < 0) {
               throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock to re-activate sale for product ${item.productId}` });
             }

             await tx.insert(inventoryTransactions).values({
               productId: item.productId,
               branchId: targetSale.branchId,
               userId: ctx.dbUser.id,
               type: "Sale",
               quantity: -item.quantity,
               reason: `Sale ${targetSale.orderNumber} Re-activated - Stock Deducted`,
               referenceId: targetSale.id.toString(),
             });
           }
        }

        const [updated] = await tx
          .update(sales)
          .set({ status: input.status })
          .where(eq(sales.id, input.saleId))
          .returning();

        if (updated) {
          void sendNotificationToUser(updated.userId, {
            title: `Sale ${input.status}`,
            body: `Your order ${updated.orderNumber} has been ${input.status.toLowerCase()}.`,
            url: "/sales",
          });
        }

        return updated;
      });
    }),
});
