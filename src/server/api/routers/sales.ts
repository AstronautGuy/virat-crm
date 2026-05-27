import { z } from "zod";
import { env } from "@/env";
import {
  createTRPCRouter,
  featureProtectedProcedure,
  enforceBranchIsolation,
} from "@/server/api/trpc";
import {
  sales,
  saleItems,
  inventory,
  inventoryTransactions,
} from "@/server/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { sendNotificationToUser } from "@/server/lib/push";
import { checkAndNotifyLowStock } from "@/server/lib/alerts";
import { TRPCError } from "@trpc/server";

export const salesRouter = createTRPCRouter({
  createSale: featureProtectedProcedure("sales")
    .meta({
      openapi: {
        method: "POST",
        path: "/sales/create",
        summary: "Create a new sale",
        tags: ["Sales"],
      },
    })
    .input(
      z.object({
        branchId: z.number().optional(),
        pincode: z
          .string()
          .regex(/^[1-9][0-9]{5}$/, "Invalid Pincode")
          .optional(),
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
          }),
        ),
      }),
    )
    .output(
      z.object({
        id: z.number(),
        orderNumber: z.string(),
        transactionNumber: z.string().nullable(),
        branchId: z.number(),
        userId: z.string(),
        mainQty: z.number(),
        freeQty: z.number(),
        totalQty: z.number(),
        invoiceAmount: z.string(),
        advancePaymentAmount: z.string().nullable().optional(),
        receivedAmount: z.string().nullable().optional(),
        balanceAmount: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetBranchId = enforceBranchIsolation(
        ctx,
        input.branchId ?? undefined,
      );
      if (targetBranchId === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Branch selection is required for this action.",
        });
      }

      return await ctx.db.transaction(async (tx) => {
        // 1. Stock Check & Decrement
        for (const item of input.items) {
          // Update or Insert inventory with negative
          await tx
            .insert(inventory)
            .values({
              productId: item.productId,
              branchId: targetBranchId,
              quantity: -item.quantity,
            })
            .onConflictDoUpdate({
              target: [inventory.productId, inventory.branchId],
              set: { quantity: sql`${inventory.quantity} - ${item.quantity}` },
            });

          // Trigger Low Stock Alerts
          await checkAndNotifyLowStock(tx, targetBranchId, item.productId);
        }

        // 2. Fetch Pincode Details
        let deliveryAddress = "";
        if (input.pincode) {
          try {
            const res = await fetch(
              `${env.NEXT_PUBLIC_PINCODE_API_URL}/${input.pincode}`,
              { signal: AbortSignal.timeout(3000) },
            );
            const data = (await res.json()) as {
              Status: string;
              PostOffice: { Name: string; District: string; State: string }[];
            }[];
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
            branchId: targetBranchId,
            userId: ctx.dbUser.id,
            managerId: ctx.dbUser.managerId,
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

        if (!newSale)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create sale",
          });

        // 4. Insert Sale Items & Transactions
        if (input.items.length > 0) {
          await tx.insert(saleItems).values(
            input.items.map((item) => ({
              saleId: newSale.id,
              productId: item.productId,
              quantity: item.quantity,
              isFree: item.isFree,
            })),
          );

          await tx.insert(inventoryTransactions).values(
            input.items.map((item) => ({
              productId: item.productId,
              branchId: targetBranchId,
              userId: ctx.dbUser.id,
              type: "Sale",
              quantity: -item.quantity,
              referenceId: newSale.id.toString(),
              reason: `Sale ${newSale.orderNumber}`,
            })),
          );
        }

        return {
          id: newSale.id,
          orderNumber: newSale.orderNumber,
          transactionNumber: newSale.transactionNumber,
          branchId: newSale.branchId,
          userId: newSale.userId,
          mainQty: newSale.mainQty,
          freeQty: newSale.freeQty,
          totalQty: newSale.totalQty,
          invoiceAmount: newSale.invoiceAmount,
          advancePaymentAmount: newSale.advancePaymentAmount,
          receivedAmount: newSale.receivedAmount,
          balanceAmount: newSale.balanceAmount,
        };
      });
    }),

  updateSale: featureProtectedProcedure("sales")
    .meta({
      openapi: {
        method: "PUT",
        path: "/sales/{id}",
        summary: "Update an existing sale (Admin only)",
        tags: ["Sales"],
      },
    })
    .input(
      z.object({
        id: z.number(),
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
      if (ctx.dbUser.role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Admins can edit sales" });
      }

      return await ctx.db.transaction(async (tx) => {
        const existingSale = await tx.query.sales.findFirst({
          where: eq(sales.id, input.id),
          with: { items: true },
        });

        if (!existingSale) throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

        // If the sale was not rejected, we must revert the old items' inventory
        if (existingSale.status !== "Rejected") {
          for (const oldItem of existingSale.items) {
            await tx
              .insert(inventory)
              .values({
                productId: oldItem.productId,
                branchId: existingSale.branchId,
                quantity: oldItem.quantity,
              })
              .onConflictDoUpdate({
                target: [inventory.productId, inventory.branchId],
                set: { quantity: sql`${inventory.quantity} + ${oldItem.quantity}` },
              });

            await tx.insert(inventoryTransactions).values({
              productId: oldItem.productId,
              branchId: existingSale.branchId,
              userId: ctx.dbUser.id,
              type: "Adjustment",
              quantity: oldItem.quantity,
              reason: `Edit Sale ${existingSale.orderNumber} - Revert Old Item`,
              referenceId: existingSale.id.toString(),
            });
          }
        }

        // Delete old items
        await tx.delete(saleItems).where(eq(saleItems.saleId, existingSale.id));

        // Decrement new items inventory
        if (existingSale.status !== "Rejected") {
          for (const item of input.items) {
            await tx
              .insert(inventory)
              .values({
                productId: item.productId,
                branchId: existingSale.branchId,
                quantity: -item.quantity,
              })
              .onConflictDoUpdate({
                target: [inventory.productId, inventory.branchId],
                set: { quantity: sql`${inventory.quantity} - ${item.quantity}` },
              });

            await tx.insert(inventoryTransactions).values({
              productId: item.productId,
              branchId: existingSale.branchId,
              userId: ctx.dbUser.id,
              type: "Sale",
              quantity: -item.quantity,
              reason: `Edit Sale ${existingSale.orderNumber} - Apply New Item`,
              referenceId: existingSale.id.toString(),
            });
          }
        }

        // Calculate new quantities and amounts
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

        // Fetch pincode delivery address if pincode changed
        let deliveryAddress = existingSale.deliveryAddress;
        if (input.pincode && input.pincode !== existingSale.pincode) {
          try {
            const res = await fetch(`${env.NEXT_PUBLIC_PINCODE_API_URL}/${input.pincode}`, { signal: AbortSignal.timeout(3000) });
            const data = (await res.json()) as { Status: string; PostOffice: { Name: string; District: string; State: string }[] }[];
            if (Array.isArray(data) && data[0]?.Status === "Success") {
              const postOffice = data[0].PostOffice?.[0];
              if (postOffice) deliveryAddress = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
            }
          } catch { }
        }

        const [updatedSale] = await tx
          .update(sales)
          .set({
            pincode: input.pincode,
            addressLine1: input.addressLine1,
            landmark: input.landmark,
            area: input.area,
            city: input.city,
            state: input.state,
            deliveryAddress: deliveryAddress ?? undefined,
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
          .where(eq(sales.id, input.id))
          .returning();

        if (!updatedSale) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update sale" });
        }

        // Insert new items
        if (input.items.length > 0) {
          await tx.insert(saleItems).values(
            input.items.map((item) => ({
              saleId: updatedSale.id,
              productId: item.productId,
              quantity: item.quantity,
              isFree: item.isFree,
            }))
          );
        }

        return updatedSale;
      });
    }),

  getSales: featureProtectedProcedure("sales").query(async ({ ctx }) => {
    const currentUser = ctx.dbUser;

    if (currentUser.role === "Admin" || currentUser.role === "Developer") {
      return ctx.db.query.sales.findMany({
        with: {
          user: true,
          manager: true,
          branch: true,
          items: true,
          files: {
            where: (files, { eq }) => eq(files.entityType, "sale"),
          },
        },
        orderBy: (sales, { desc }) => [desc(sales.createdAt)],
      });
    }

    const assignedBranchId = enforceBranchIsolation(ctx);

    // Filter by branch for non-admins, and also by userId for Employees
    return ctx.db.query.sales.findMany({
      where:
        currentUser.role === "Employee"
          ? and(
              eq(sales.branchId, assignedBranchId!),
              eq(sales.userId, currentUser.id),
            )
          : eq(sales.branchId, assignedBranchId!),
      with: {
        user: true,
        manager: true,
        branch: true,
        items: true,
        files: {
          where: (files, { eq }) => eq(files.entityType, "sale"),
        },
      },
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
    });
  }),

  getSale: featureProtectedProcedure("sales")
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const sale = await ctx.db.query.sales.findFirst({
        where: eq(sales.id, input.id),
        with: {
          items: true,
          user: true,
        },
      });

      if (!sale) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.dbUser.role !== "Admin" && ctx.dbUser.role !== "Developer") {
        const assignedBranchId = enforceBranchIsolation(ctx);
        if (sale.branchId !== assignedBranchId) throw new TRPCError({ code: "FORBIDDEN" });
        if (ctx.dbUser.role === "Employee" && sale.userId !== ctx.dbUser.id) throw new TRPCError({ code: "FORBIDDEN" });
      }

      return sale;
    }),

  updateSaleStatus: featureProtectedProcedure("sales")
    .input(
      z.object({
        saleId: z.number(),
        status: z.enum(["Pending", "Approved", "Rejected"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.dbUser;

      return await ctx.db.transaction(async (tx) => {
        const targetSale = await tx.query.sales.findFirst({
          where: eq(sales.id, input.saleId),
          with: { items: true },
        });

        if (!targetSale)
          throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

        // Enforce branch isolation for target sale
        enforceBranchIsolation(ctx, targetSale.branchId);

        // RBAC Check for Managers/Admins
        if (currentUser.role !== "Admin") {
          if (currentUser.role !== "Manager") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Unauthorized to update status",
            });
          }

          // Check if sale belongs to manager's team (Simplified recursive check)
          const isOwnTeam = targetSale.managerId === currentUser.id;
          if (!isOwnTeam) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Unauthorized: Sale does not belong to your team",
            });
          }
        }

        // Logic for "Rejected": Replenish inventory
        if (input.status === "Rejected" && targetSale.status !== "Rejected") {
          for (const item of targetSale.items) {
            await tx
              .insert(inventory)
              .values({
                productId: item.productId,
                branchId: targetSale.branchId,
                quantity: item.quantity,
              })
              .onConflictDoUpdate({
                target: [inventory.productId, inventory.branchId],
                set: {
                  quantity: sql`${inventory.quantity} + ${item.quantity}`,
                },
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
        if (
          targetSale.status === "Rejected" &&
          (input.status === "Pending" || input.status === "Approved")
        ) {
          for (const item of targetSale.items) {
            // Atomic decrement via Upsert
            await tx
              .insert(inventory)
              .values({
                productId: item.productId,
                branchId: targetSale.branchId,
                quantity: -item.quantity,
              })
              .onConflictDoUpdate({
                target: [inventory.productId, inventory.branchId],
                set: { quantity: sql`${inventory.quantity} - ${item.quantity}` },
              });

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
