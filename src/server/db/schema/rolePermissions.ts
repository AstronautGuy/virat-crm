import { varchar, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { roleEnum, createTable } from "./users";

export const rolePermissions = createTable("role_permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: roleEnum("role").notNull(),
  featureKey: varchar("feature_key", { length: 256 }).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
