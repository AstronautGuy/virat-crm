import {
  pgTableCreator,
  varchar,
  timestamp,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { branches } from "./branches";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const fieldSupportReports = createTable("field_support_reports", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  managerId: uuid("manager_id")
    .notNull()
    .references(() => users.id),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id),
  month: varchar("month", { length: 50 }).notNull(),
  
  // Summary fields
  totalPoint: varchar("total_point", { length: 100 }),
  totalCust: varchar("total_cust", { length: 100 }),
  totalAmount: varchar("total_amount", { length: 100 }),
  
  status: varchar("status", { length: 50 }).default("Draft").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const fieldSupportReportItems = createTable("field_support_report_items", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reportId: varchar("report_id", { length: 128 })
    .notNull()
    .references(() => fieldSupportReports.id, { onDelete: "cascade" }),
    
  srName: varchar("sr_name", { length: 255 }),
  orderNo: varchar("order_no", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }),
  product: varchar("product", { length: 255 }),
  unit: varchar("unit", { length: 100 }),
  advanceAmount: varchar("advance_amount", { length: 100 }),
  adc: varchar("adc", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fieldSupportReportsRelations = relations(
  fieldSupportReports,
  ({ one, many }) => ({
    manager: one(users, {
      fields: [fieldSupportReports.managerId],
      references: [users.id],
    }),
    branch: one(branches, {
      fields: [fieldSupportReports.branchId],
      references: [branches.id],
    }),
    items: many(fieldSupportReportItems),
  }),
);

export const fieldSupportReportItemsRelations = relations(
  fieldSupportReportItems,
  ({ one }) => ({
    report: one(fieldSupportReports, {
      fields: [fieldSupportReportItems.reportId],
      references: [fieldSupportReports.id],
    }),
  }),
);
