import { pgTableCreator, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { branches } from "./branches";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const inventory = createTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    branchId: integer("branch_id")
      .references(() => branches.id)
      .notNull(),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => ({
    productBranchIdx: uniqueIndex("product_branch_idx").on(table.productId, table.branchId),
  })
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  branch: one(branches, {
    fields: [inventory.branchId],
    references: [branches.id],
  }),
}));
