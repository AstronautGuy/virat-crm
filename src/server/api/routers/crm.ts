import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  managerProcedure,
  featureProtectedProcedure,
  featureManagerProcedure,
} from "@/server/api/trpc";
import { customers, sales } from "@/server/db/schema";
import { eq, and, sql, desc, or, type SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const crmRouter = createTRPCRouter({
  getBranchCustomers: featureProtectedProcedure("crm")
    .meta({ openapi: { method: "GET", path: "/crm/customers", summary: "Get branch customers", tags: ["CRM"] } })
    .input(z.object({
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      
      const filters: SQL[] = [];
      
      // Branch isolation: Employees and Managers only see their branch
      if (dbUser.role !== "Admin") {
        filters.push(eq(customers.branchId, dbUser.branchId!));
      }

      if (input?.search) {
        filters.push(
          or(
            sql`LOWER(${customers.name}) LIKE ${`%${input.search.toLowerCase()}%`}`,
            sql`${customers.mobile} LIKE ${`%${input.search}%`}`
          )!
        );
      }

      const results = await db.query.customers.findMany({
        where: filters.length > 0 ? and(...filters) : undefined,
        with: {
          creator: {
            columns: {
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: [desc(customers.createdAt)],
      });

      // Calculate Total Pending for each customer
      // Optimization: In a real heavy app, this would be a join with group by
      const customersWithFinancials = await Promise.all(results.map(async (customer) => {
        const salesData = await db.select({
          totalPending: sql<string>`SUM(${sales.balanceAmount})`
        })
        .from(sales)
        .where(eq(sales.customerId, customer.id));

        return {
          ...customer,
          totalPending: Number(salesData[0]?.totalPending ?? 0),
        };
      }));

      return customersWithFinancials;
    }),

  getCustomerById: featureProtectedProcedure("crm")
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, input.id),
        with: {
          branch: true,
          creator: true,
        }
      });

      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

      // Check access
      if (dbUser.role !== "Admin" && customer.branchId !== dbUser.branchId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Get Order History Summary
      const orders = await db.query.sales.findMany({
        where: eq(sales.customerId, customer.id),
        orderBy: [desc(sales.createdAt)],
      });

      const totalPending = orders.reduce((acc, curr) => acc + Number(curr.balanceAmount), 0);

      return {
        ...customer,
        orders,
        totalPending,
      };
    }),

  createCustomer: featureManagerProcedure("crm")
    .meta({ openapi: { method: "POST", path: "/crm/customers", summary: "Create approved customer (Manager Only)", tags: ["CRM"] } })
    .input(z.object({
      name: z.string().min(2),
      mobile: z.string().min(10),
      dob: z.date().optional(),
      pincode: z.string().length(6),
      village: z.string(),
      district: z.string(),
      state: z.string(),
      address: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      return await db.insert(customers).values({
        ...input,
        branchId: dbUser.branchId!,
        status: "Approved", // Managers/Admins create approved customers
        createdBy: dbUser.id,
      }).returning();
    }),


  proposeCustomer: featureProtectedProcedure("crm")
    .meta({ openapi: { method: "POST", path: "/crm/propose", summary: "Propose draft customer", tags: ["CRM"] } })
    .input(z.object({
      name: z.string().min(2),
      mobile: z.string().min(10),
      dob: z.date().optional(),
      pincode: z.string().length(6),
      village: z.string(),
      district: z.string(),
      state: z.string(),
      address: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, dbUser } = ctx;
      
      return await db.insert(customers).values({
        ...input,
        branchId: dbUser.branchId!,
        status: "Draft", // Employees create draft customers
        createdBy: dbUser.id,
      }).returning();
    }),

  approveCustomer: featureManagerProcedure("crm")
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      return await db.update(customers)
        .set({ status: "Approved" })
        .where(eq(customers.id, input.id))
        .returning();
    }),

  updateCustomer: featureManagerProcedure("crm")
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).optional(),
      mobile: z.string().min(10).optional(),
      dob: z.date().optional(),
      pincode: z.string().length(6).optional(),
      village: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, ...data } = input;
      return await db.update(customers)
        .set(data)
        .where(eq(customers.id, id))
        .returning();
    }),
});
