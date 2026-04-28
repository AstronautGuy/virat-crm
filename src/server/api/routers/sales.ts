import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { sales } from "@/server/db/schema/sales";
import { saleItems } from "@/server/db/schema/saleItems";
import { users } from "@/server/db/schema/users";
import { eq, inArray, sql } from "drizzle-orm";

export const salesRouter = createTRPCRouter({
  createSale: protectedProcedure
    .input(
      z.object({
        branchId: z.number(),
        pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid Pincode").optional(),
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
      // 1. Fetch current user
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      // 2. Fetch delivery address from Pincode API if pincode is provided
      let deliveryAddress = "";
      if (input.pincode) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${input.pincode}`);
          const data = (await res.json()) as Array<{ Status: string; PostOffice: Array<Record<string, unknown>> }>;
          if (Array.isArray(data) && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice?.[0];
            if (postOffice) {
              deliveryAddress = `${String(postOffice.Name)}, ${String(postOffice.District)}, ${String(postOffice.State)}, ${String(postOffice.Country)}`;
            }
          }
        } catch (e) {
          console.error("Failed to fetch pincode details", e);
        }
      }

      // 3. Calculate totals
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

      // 4. Create Sale
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

      // 5. Insert Items
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

  getSales: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.kindeId, ctx.user.id),
      columns: { id: true, role: true },
    });

    if (!currentUser) return [];

    if (currentUser.role === "Admin") {
      return ctx.db.query.sales.findMany({
        with: { user: true, manager: true, branch: true, items: true },
        orderBy: (sales, { desc }) => [desc(sales.createdAt)],
      });
    }

    // CTE to get all descendants for current user
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
    const descendantIds = rows.map((row: Record<string, unknown>) => String(row.id));
    const allowedIds = [currentUser.id, ...descendantIds];

    return ctx.db.query.sales.findMany({
      where: inArray(sales.userId, allowedIds),
      with: { user: true, manager: true, branch: true, items: true },
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
    });
  }),

  updateSaleStatus: protectedProcedure
    .input(z.object({ saleId: z.number(), status: z.enum(["Pending", "Approved", "Rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.kindeId, ctx.user.id),
      });

      if (!currentUser) throw new Error("User not found");

      // Verify the sale exists
      const targetSale = await ctx.db.query.sales.findFirst({
        where: eq(sales.id, input.saleId),
      });

      if (!targetSale) throw new Error("Sale not found");

      if (currentUser.role !== "Admin") {
        // Must be manager to approve
        if (currentUser.role !== "Manager") {
          throw new Error("Unauthorized to update status");
        }

        // Must be an ancestor/manager of the user who made the sale
        // Using CTE to check descendants
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
      return updated;
    }),
});
