import { pgTable, serial, varchar, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const performanceSnapshots = pgTable("virat-crm_performance_snapshots", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 20 }).notNull(), // 'branch', 'user', 'global'
  entityId: varchar("entity_id", { length: 100 }), // Branch ID or User ID
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
  metrics: jsonb("metrics").$type<{
    revenue: number;
    salesCount: number;
    totalQty: number;
    attendanceCount?: number;
    visitsCount?: number;
  }>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  entityPeriodIdx: uniqueIndex("perf_snapshot_entity_period_idx").on(table.entityType, table.entityId, table.period),
}));
