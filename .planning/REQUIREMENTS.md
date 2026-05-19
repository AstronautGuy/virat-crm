# Requirements: Milestone 8 (Advanced Multi-Tenant Isolation & Live Alerts)

## 1. Multi-Tenant Branch Isolation (`ISOL-xx`)

*   **ISOL-01**: **Query-Level Walled Garden**: All read procedures (Sales list, Sales details, Customer records, Branch inventory status, Stock movements) must automatically inject filters using the logged-in user's `branchId` (retrieved from `ctx.dbUser`).
*   **ISOL-02**: **Mutation Lockout**: Any attempt by non-Admin users to update, delete, or create records referencing another branch's ID must trigger a strict `FORBIDDEN` error.
*   **ISOL-03**: **REST Bridging Boundary**: The mobile REST-to-tRPC gateway at `/api/rest/*` must enforce the same strict branch filtering rules for mobile API calls.
*   **ISOL-04**: **Cross-Branch Visibility Exception**: Standard/Manager users can see incoming stock transfer requests initiated by other branches, but cannot view other branches' general stock levels or customer directories.

## 2. Real-Time Low-Stock Alerts (`ALERT-xx`)

*   **ALERT-01**: **Threshold Schema**: Expand the product model with a `minThreshold` column (default: 10 units) to define custom warning points per product.
*   **ALERT-02**: **Audit Trigger**: Evaluate stock levels in the local branch after any sales transactions, stock updates, or stock transfers.
*   **ALERT-03**: **Dispatch Pipeline**: If a stock level falls below `minThreshold`, insert a record into the `notifications` table for the branch manager and system administrators, and dispatch a push notification via the VAPID infrastructure.
*   **ALERT-04**: **Premium UI Alerts Banner**: Build an attention-grabbing warning banner on the manager's web dashboard and a notification drawer inside the mobile application.

## 3. High-Performance Indexing (`PERF-xx`)

*   **PERF-01**: **High-Frequency Compound Indexes**: Add indexes in the PostgreSQL schema for fields frequently queried or filtered (e.g., `(branchId, productId)` in `inventory`, `(userId, createdAt)` in `breadcrumbs`, and `(branchId, createdAt)` in `sales`).
*   **PERF-02**: **Query Refactoring**: Optimize report analytics to retrieve subtrees with pre-aggregated counts and single-join groups instead of memory-heavy post-query filters.

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| ISOL-01 | 33    | [ ]    |
| ISOL-02 | 33    | [ ]    |
| ISOL-03 | 33    | [ ]    |
| ISOL-04 | 33    | [ ]    |
| ALERT-01| 34    | [ ]    |
| ALERT-02| 34    | [ ]    |
| ALERT-03| 34    | [ ]    |
| ALERT-04| 34/35 | [ ]    |
| PERF-01 | 32    | [ ]    |
| PERF-02 | 32    | [ ]    |
