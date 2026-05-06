import { z } from "zod";
import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { sales } from "@/server/db/schema/sales";
import { saleItems } from "@/server/db/schema/saleItems";
import { users } from "@/server/db/schema/users";
import { eq, inArray, sql } from "drizzle-orm";
import { sendNotificationToUser } from "@/server/lib/push";

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
      if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.dbUser!.kindeId),
      });

      if (!currentUser) throw new Error("User not found");

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

      const [newSale] = await ctx.db
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

      if (input.items.length > 0 && newSale) {
        await ctx.db.insert(saleItems).values(
          input.items.map((item) => ({
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            isFree: item.isFree,
          }))
        );
      }

      return newSale;
    }),

  getSales: featureProtectedProcedure("sales").query(async ({ ctx }) => {
    if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.dbUser!.kindeId),
      columns: { id: true, role: true },
    });

    if (!currentUser) return [];

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

    const descendantsQuery = sql`
      WITH RECURSIVE subordinates AS (
        SELECT id FROM "virat-crm_user" WHERE manager_id = ${currentUser.id}
        UNION
        SELECT e.id FROM "virat-crm_user" e
        INNER JOIN subordinates s ON s.id = e.manager_id
      )
      SELECT id FROM subordinates;
    `;

    const rows = await ctx.db.execute(descendantsQuery);
    const descendantIds = rows.map((row: any) => String(row.id));
    const allowedIds = [currentUser.id, ...descendantIds];

    return ctx.db.query.sales.findMany({
      where: inArray(sales.userId, allowedIds),
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
      if (!ctx.dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.dbUser!.kindeId),
      });

      if (!currentUser) throw new Error("User not found");

      const targetSale = await ctx.db.query.sales.findFirst({
        where: eq(sales.id, input.saleId),
      });

      if (!targetSale) throw new Error("Sale not found");

      if (currentUser.role !== "Admin") {
        if (currentUser.role !== "Manager") {
          throw new Error("Unauthorized to update status");
        }

        const descendantsQuery = sql`
          WITH RECURSIVE subordinates AS (
            SELECT id FROM "virat-crm_user" WHERE manager_id = ${currentUser.id}
            UNION
            SELECT e.id FROM "virat-crm_user" e
            INNER JOIN subordinates s ON s.id = e.manager_id
          )
          SELECT id FROM subordinates WHERE id = ${targetSale.userId} LIMIT 1;
        `;

        const rows = await ctx.db.execute(descendantsQuery);
        if (rows.length === 0) {
          throw new Error("Unauthorized: Sale does not belong to your team");
        }
      }

      const [updated] = await ctx.db
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
    }),
});
