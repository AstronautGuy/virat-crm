import {
  pgTableCreator,
  serial,
  numeric,
  timestamp,
  uuid,
  index,
  uniqueIndex,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `virat-crm_${name}`);

export const locationLogs = createTable(
  "location_logs",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: varchar("date", { length: 10 }).notNull(), // 'YYYY-MM-DD'
    slab: varchar("slab", { length: 20 }).notNull(), // '10:00-14:00'
    latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
    locationName: varchar("location_name", { length: 255 }),
    frequencyMap: jsonb("frequency_map")
      .notNull()
      .$type<Record<string, number>>(), // "lat,lng": count
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Unique index to allow upsert by user, date, and slab
    userDateSlabUniqueIdx: uniqueIndex("user_date_slab_uidx").on(
      table.userId,
      table.date,
      table.slab,
    ),
    recordedAtIndex: index("recorded_at_idx").on(table.recordedAt),
  }),
);

export const locationLogsRelations = relations(locationLogs, ({ one }) => ({
  user: one(users, {
    fields: [locationLogs.userId],
    references: [users.id],
  }),
}));
