import { pgTable, serial, numeric, varchar, timestamp, integer, uuid, index, jsonb } from "drizzle-orm/pg-core";

export const salesArchive = pgTable("virat-crm_sales_archive", {
  id: serial("id").primaryKey(),
  originalId: integer("original_id").notNull(),
  branchId: integer("branch_id").notNull(),
  orderDate: timestamp("order_date", { withTimezone: true }).notNull(),
  orderNumber: varchar("order_number", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  userId: uuid("user_id").notNull(),
  customerName: varchar("customer_name", { length: 256 }),
  invoiceAmount: numeric("invoice_amount", { precision: 12, scale: 2 }).notNull(),
  totalQty: integer("total_qty").notNull().default(0),
  
  // Store items and other details as JSON to avoid complex relational archival
  details: jsonb("details").$type<{
    items: unknown[];
    replacements?: unknown[];
    address?: unknown;
    metadata?: unknown;
  }>().notNull(),
  
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  branchIdx: index("archive_branch_idx").on(table.branchId),
  orderNumberIdx: index("archive_order_number_idx").on(table.orderNumber),
  archivedAtIdx: index("archive_date_idx").on(table.archivedAt),
}));

export const replacementsArchive = pgTable("virat-crm_replacements_archive", {
  id: serial("id").primaryKey(),
  originalId: integer("original_id").notNull(),
  branchId: integer("branch_id").notNull(),
  userId: uuid("user_id").notNull(),
  productName: varchar("product_name", { length: 256 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  
  details: jsonb("details").notNull(),
  
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  branchIdx: index("archive_repl_branch_idx").on(table.branchId),
  archivedAtIdx: index("archive_repl_date_idx").on(table.archivedAt),
}));
