import {
  pgTableCreator,
  serial,
  integer,
  boolean,
  timestamp,
  numeric,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sales } from "./sales";
import { products } from "./products";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const saleItems = createTable("sale_item", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id")
    .references(() => sales.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  rate: numeric("rate", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  ptsPerQty: numeric("pts_per_qty", { precision: 12, scale: 2 }),
  totalPts: numeric("total_pts", { precision: 12, scale: 2 }),
  offerNumber: varchar("offer_number", { length: 100 }),
  isFree: boolean("is_free").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));
