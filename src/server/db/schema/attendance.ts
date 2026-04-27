import { pgTableCreator, serial, numeric, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const attendanceStatusEnum = pgEnum("virat-crm_attendance_status", ["Present", "Late", "Absent"]);

export const attendance = createTable("attendance", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  punchInTime: timestamp("punch_in_time", { withTimezone: true }).notNull(),
  punchOutTime: timestamp("punch_out_time", { withTimezone: true }),
  punchInLat: numeric("punch_in_lat", { precision: 10, scale: 8 }),
  punchInLng: numeric("punch_in_lng", { precision: 11, scale: 8 }),
  punchOutLat: numeric("punch_out_lat", { precision: 10, scale: 8 }),
  punchOutLng: numeric("punch_out_lng", { precision: 11, scale: 8 }),
  status: attendanceStatusEnum("status").default("Present").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
}));
