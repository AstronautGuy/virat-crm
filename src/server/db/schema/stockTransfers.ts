import { pgTableCreator, serial, integer, varchar, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const stockTransfers = createTable("stock_transfer", {
  id: serial("id").primaryKey(),
  fromBranchId: integer("from_branch_id")
    .references(() => branches.id)
    .notNull(),
  toBranchId: integer("to_branch_id")
    .references(() => branches.id)
    .notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Pending"), // Pending, Shipped, Received, Cancelled
  requestedById: uuid("requested_by_id").references(() => users.id).notNull(),
  approvedById: uuid("approved_by_id").references(() => users.id),
  receivedById: uuid("received_by_id").references(() => users.id),
  
  // JSON array of { productId, quantity }
  items: jsonb("items").notNull(),
  
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const stockTransfersRelations = relations(stockTransfers, ({ one }) => ({
  fromBranch: one(branches, {
    fields: [stockTransfers.fromBranchId],
    references: [branches.id],
    relationName: "transfer_origin",
  }),
  toBranch: one(branches, {
    fields: [stockTransfers.toBranchId],
    references: [branches.id],
    relationName: "transfer_destination",
  }),
  requestedBy: one(users, {
    fields: [stockTransfers.requestedById],
    references: [users.id],
    relationName: "transfer_requester",
  }),
}));
