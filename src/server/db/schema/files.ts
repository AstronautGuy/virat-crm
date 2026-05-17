import { varchar, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { users, createTable } from "./users";
import { relations } from "drizzle-orm";
import { sales } from "./sales";
import { replacements } from "./replacements";

export const fileEntityTypeEnum = pgEnum("file_entity_type", ["sale", "replacement"]);

export const files = createTable("file", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: fileEntityTypeEnum("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  key: varchar("key", { length: 512 }).notNull(),
  originalName: varchar("original_name", { length: 256 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  sale: one(sales, {
    fields: [files.entityId],
    references: [sales.id],
    relationName: "sale_files",
  }),
  replacement: one(replacements, {
    fields: [files.entityId],
    references: [replacements.id],
    relationName: "replacement_files",
  }),
}));
