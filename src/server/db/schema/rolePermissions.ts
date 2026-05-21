import { varchar, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { createTable } from "./users";
import { roles } from "./roles";

export const rolePermissions = createTable("role_permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: varchar("role", { length: 64 })
    .notNull()
    .references(() => roles.name, { onDelete: "cascade" }),
  featureKey: varchar("feature_key", { length: 256 }).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
