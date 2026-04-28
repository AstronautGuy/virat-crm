import { pgTableCreator, serial, varchar, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const products = createTable("product", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
