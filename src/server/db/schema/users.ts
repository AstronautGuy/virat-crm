import { pgTableCreator, varchar, uuid, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { branches } from "./branches";
import { roles } from "./roles";
import { relations } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const users = createTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  employeeCode: varchar("employee_code", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }), // Nullable for existing users migration
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  role: varchar("role", { length: 64 }).default("Employee").notNull().references(() => roles.name),
  branchId: integer("branch_id").references(() => branches.id),
  managerId: uuid("manager_id").references((): AnyPgColumn => users.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  lastLat: varchar("last_lat", { length: 32 }),
  lastLng: varchar("last_lng", { length: 32 }),
   connectivityStatus: varchar("connectivity_status", { length: 32 }),
  phone: varchar("phone", { length: 32 }),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
    relationName: "manager_to_team",
  }),
  teamMembers: many(users, {
    relationName: "manager_to_team",
  }),
}));
