import { pgTable, serial, uuid, timestamp, doublePrecision, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const breadcrumbs = pgTable("virat-crm_breadcrumbs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  accuracy: doublePrecision("accuracy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIndex: index("breadcrumbs_created_at_idx").on(table.createdAt),
  userCreatedIdx: index("breadcrumbs_user_created_idx").on(table.userId, table.createdAt),
}));

export const breadcrumbRelations = relations(breadcrumbs, ({ one }) => ({
  user: one(users, {
    fields: [breadcrumbs.userId],
    references: [users.id],
  }),
}));
