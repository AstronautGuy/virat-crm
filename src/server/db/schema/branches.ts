import { pgTableCreator, serial, varchar, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const branches = createTable("branch", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  radiusMeters: integer("radius_meters").default(50).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
}));
