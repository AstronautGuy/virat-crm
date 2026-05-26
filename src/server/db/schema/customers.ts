import { varchar, uuid, integer, timestamp, pgEnum, jsonb, numeric, index } from "drizzle-orm/pg-core";
import { createTable, users } from "./users";
import { branches } from "./branches";
import { relations } from "drizzle-orm";

export const customerStatusEnum = pgEnum("virat-crm_customer_status", [
  "Draft",
  "Approved",
]);

export const customers = createTable("customer", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  dob: timestamp("dob", { withTimezone: true }),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  village: varchar("village", { length: 256 }).notNull(),
  district: varchar("district", { length: 256 }).notNull(),
  state: varchar("state", { length: 256 }).notNull(),
  address: varchar("address", { length: 1024 }).notNull(),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id),
  geofencePolygon: jsonb("geofence_polygon"), // Stores GeoJSON polygon
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  status: customerStatusEnum("status").default("Draft").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
}, (table) => ({
  latLngIdx: index("customers_lat_lng_idx").on(table.latitude, table.longitude),
  branchIdx: index("customers_branch_idx").on(table.branchId),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  branch: one(branches, {
    fields: [customers.branchId],
    references: [branches.id],
  }),
  creator: one(users, {
    fields: [customers.createdBy],
    references: [users.id],
  }),
}));
