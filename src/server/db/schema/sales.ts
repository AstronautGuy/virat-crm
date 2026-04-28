import { pgTableCreator, serial, numeric, text, varchar, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { branches } from "./branches";
import { saleItems } from "./saleItems";
import { replacements } from "./replacements";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const sales = createTable("sale", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  orderDate: timestamp("order_date", { withTimezone: true }).defaultNow().notNull(),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).defaultNow().notNull(),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(),
  transactionNumber: varchar("transaction_number", { length: 100 }).unique(),
  status: varchar("status", { length: 50 }).notNull().default("Pending"), // Pending, Approved, Rejected
  userId: uuid("user_id").references(() => users.id).notNull(), // Employee
  managerId: uuid("manager_id").references(() => users.id), // Field Supervisor
  pincode: varchar("pincode", { length: 20 }),
  deliveryAddress: text("delivery_address"),
  customerName: varchar("customer_name", { length: 256 }),
  customerAddress: text("customer_address"),
  
  mainQty: integer("main_qty").notNull().default(0),
  freeQty: integer("free_qty").notNull().default(0),
  totalQty: integer("total_qty").notNull().default(0),
  
  invoiceAmount: numeric("invoice_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  advancePaymentAmount: numeric("advance_payment_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  receivedAmount: numeric("received_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  balanceAmount: numeric("balance_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const salesRelations = relations(sales, ({ one, many }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
    relationName: "sale_employee",
  }),
  manager: one(users, {
    fields: [sales.managerId],
    references: [users.id],
    relationName: "sale_supervisor",
  }),
  branch: one(branches, {
    fields: [sales.branchId],
    references: [branches.id],
  }),
  items: many(saleItems),
  replacements: many(replacements),
}));
