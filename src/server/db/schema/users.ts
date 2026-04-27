import { pgTableCreator, varchar, uuid, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { branches } from "./branches";
import { relations } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const roleEnum = pgEnum("virat-crm_role", ["Admin", "Manager", "Employee"]);

export const users = createTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  kindeId: varchar("kinde_id", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  role: roleEnum("role").default("Employee").notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));
