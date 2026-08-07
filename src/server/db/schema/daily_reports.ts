import { uuid, integer, timestamp, text, serial, varchar } from "drizzle-orm/pg-core";
import { createTable, users } from "./users";
import { branches } from "./branches";
import { customers } from "./customers";
import { relations } from "drizzle-orm";

export const dailyReports = createTable("daily_report", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id),
  reportDate: timestamp("report_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  timeFrom: varchar("time_from", { length: 32 }),
  timeTo: varchar("time_to", { length: 32 }),
  content: text("content").notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const dailyReportsRelations = relations(dailyReports, ({ one }) => ({
  user: one(users, {
    fields: [dailyReports.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [dailyReports.branchId],
    references: [branches.id],
  }),
  customer: one(customers, {
    fields: [dailyReports.customerId],
    references: [customers.id],
  }),
}));
