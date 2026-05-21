# Phase 7 Context: Backend Analytics & Aggregation Layer

## Core Objective

Implement the backend infrastructure to aggregate CRM data into meaningful business metrics. This phase focuses on efficient SQL queries and tRPC procedures that power the dashboard, rather than the visual charts.

## Decisions

- **Aggregation Strategy**: Real-time SQL aggregation using Drizzle ORM (`count`, `sum`, `avg`, `groupBy`).
- **Timeframes**: Support filtering by "Today", "Last 7 Days", "Last 30 Days", and "Custom Range".
- **Export Engine**: Server-side CSV generation to avoid client-side memory overhead for large datasets.
- **KPIs**:
  - **Sales**: Revenue by branch, product category performance, agent leaderboards.
  - **Workforce**: On-time arrival rates, total man-hours per branch, geofence breach counts.

## Implementation Details

- **New Router**: `src/server/api/routers/analytics.ts`
- **Database Optimization**: Add indexes to `createdAt` and `branchId` columns across `sales` and `attendance` tables if missing.
- **Permissions**: Analytics procedures will be restricted to "Admin" and "Manager" roles via tRPC middleware.

## Success Criteria

- [ ] tRPC analytics procedures return aggregated data within <200ms.
- [ ] Dashboard metrics update correctly when filters are changed.
- [ ] CSV export functionality downloads a valid report.
