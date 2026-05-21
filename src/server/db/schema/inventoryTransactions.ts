import {
  pgTableCreator,
  serial,
  integer,
  varchar,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { branches } from "./branches";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const inventoryTransactions = createTable("inventory_transaction", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // Sale, Transfer_In, Transfer_Out, Adjustment, Replacement
  quantity: integer("quantity").notNull(), // Can be negative for removals
  referenceId: varchar("reference_id", { length: 256 }), // Sale ID, Transfer ID, etc.
  reason: varchar("reason", { length: 256 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    product: one(products, {
      fields: [inventoryTransactions.productId],
      references: [products.id],
    }),
    branch: one(branches, {
      fields: [inventoryTransactions.branchId],
      references: [branches.id],
    }),
    user: one(users, {
      fields: [inventoryTransactions.userId],
      references: [users.id],
    }),
  }),
);
