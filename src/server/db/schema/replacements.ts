import { pgTableCreator, serial, integer, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sales } from "./sales";
import { users } from "./users";
import { files } from "./files";

import { branches } from "./branches";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const replacements = createTable("replacement", {
  id: serial("id").primaryKey(),
  originalSaleId: integer("original_sale_id").references(() => sales.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 50 }).default("Pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const replacementsRelations = relations(replacements, ({ one, many }) => ({
  sale: one(sales, {
    fields: [replacements.originalSaleId],
    references: [sales.id],
  }),
  user: one(users, {
    fields: [replacements.userId],
    references: [users.id],
  }),
  files: many(files, { relationName: "replacement_files" }),
}));
