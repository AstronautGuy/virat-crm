# Phase 7 Plan: Backend Analytics & Aggregation Layer

## Overview
Build a high-performance aggregation layer to power the CRM dashboards and reporting tools.

## Wave 1: Aggregation Foundations (Sales Focus)
- `[ ]` **Task 1.1: Database Indexing & Helpers**
  - `<read_first>`: `src/server/db/schema/*.ts`
  - `<action>`: Add indexes to `createdAt`, `status`, and `branchId` on `sales` and `attendance` tables. Create a shared `getDateRange` utility in `src/server/lib/date.ts`.
  - `<acceptance_criteria>`: SQL indexes exist in schema, utility handles "Today", "7d", "30d".
- `[ ]` **Task 1.2: Sales Analytics Router**
  - `<read_first>`: `src/server/api/routers/sales.ts`
  - `<action>`: Create `src/server/api/routers/analytics.ts`. Implement `getSalesSummary` (Total Revenue, Balance, Count) and `getBranchSales` (Grouped by Branch).
  - `<acceptance_criteria>`: tRPC procedures return correct aggregates for selected date ranges.

## Wave 2: Operational Analytics (Workforce & Export)
- `[ ]` **Task 2.1: Workforce Analytics Procedures**
  - `<read_first>`: `src/server/db/schema/attendance.ts` (if exists)
  - `<action>`: Implement `getAttendancePerformance` (Clock-in stats) and `getAlertsSummary` (Geofence breaches, pending approvals).
  - `<acceptance_criteria>`: Attendance metrics correctly calculate "on-time" vs "late" based on branch opening hours.
- `[ ]` **Task 2.2: Server-Side CSV Export**
  - `<read_first>`: `src/server/api/routers/analytics.ts`
  - `<action>`: Implement an endpoint that returns a CSV-formatted string for the current filtered view.
  - `<acceptance_criteria>`: Exported CSV opens correctly in Excel with all expected columns.

## Wave 3: Integration & Security
- `[ ]` **Task 3.1: Backend Integration to Dashboard**
  - `<read_first>`: `src/app/page.tsx`
  - `<action>`: Replace hardcoded dashboard metrics with real data from `analytics.getSalesSummary`.
  - `<acceptance_criteria>`: Dashboard shows live numbers on load.
- `[ ]` **Task 3.2: Role-Based Access Control (RBAC)**
  - `<read_first>`: `src/server/api/trpc.ts`
  - `<action>`: Wrap all analytics procedures in `protectedProcedure` with a `managerOnly` or `adminOnly` check.
  - `<acceptance_criteria>`: Standard agents receive 403 when trying to access analytics endpoints.

## Verification Criteria
- [ ] Analytics queries execute in <200ms on the backend.
- [ ] CSV exports match the data shown in the dashboard.
- [ ] No geofence or PII leaked to unauthorized roles.
