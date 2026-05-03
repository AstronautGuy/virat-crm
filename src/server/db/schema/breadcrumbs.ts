import { pgTable, serial, integer, uuid, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const breadcrumbs = pgTable("virat-crm_breadcrumbs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  accuracy: doublePrecision("accuracy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const breadcrumbRelations = relations(breadcrumbs, ({ one }) => ({
  user: one(users, {
    fields: [breadcrumbs.userId],
    references: [users.id],
  }),
}));
