import {
  pgTableCreator,
  integer,
  varchar,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { sales } from "./sales";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const saleAssignments = createTable(
  "sale_assignment",
  {
    saleId: integer("sale_id")
      .references(() => sales.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 50 }).notNull(), // 'Employee' or 'Manager'
  },
  (table) => ({
    pk: primaryKey({ columns: [table.saleId, table.userId, table.role] }),
  }),
);

export const saleAssignmentsRelations = relations(
  saleAssignments,
  ({ one }) => ({
    sale: one(sales, {
      fields: [saleAssignments.saleId],
      references: [sales.id],
    }),
    user: one(users, {
      fields: [saleAssignments.userId],
      references: [users.id],
    }),
  }),
);
