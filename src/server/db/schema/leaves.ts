import { pgTableCreator, serial, date, text, timestamp, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const leaveTypeEnum = pgEnum("virat-crm_leave_type", ["Sick", "Vacation", "Unpaid"]);
export const leaveStatusEnum = pgEnum("virat-crm_leave_status", ["Pending", "Approved", "Rejected"]);

export const leaves = createTable(
  "leave",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    type: leaveTypeEnum("type").notNull(),
    status: leaveStatusEnum("status").default("Pending").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("leave_user_idx").on(table.userId),
    statusIdx: index("leave_status_idx").on(table.status),
    startDateIdx: index("leave_start_date_idx").on(table.startDate),
  })
);

export const leavesRelations = relations(leaves, ({ one }) => ({
  user: one(users, {
    fields: [leaves.userId],
    references: [users.id],
  }),
}));
