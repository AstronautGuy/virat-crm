# Roadmap: Milestone 6 (CRM & Bulk Operations)

## Phase 21: CRM Foundation & RBAC
Establish the customer master and secure data entry.
- [x] **Task 21.1**: Database schema for `customers` (including Draft/Approved status).
- [x] **Task 21.2**: Implement `managerProcedure` and `protectedProcedure` for Customer API.
- [x] **Task 21.3**: Frontend: Customer Directory with search and branch isolation.
- [x] **Task 21.4**: Frontend: Add/Edit Customer form with Pincode lookup logic.

- **Deliverable**: Functional Customer Master with Manager-only editing.

## Phase 22: Daily Reports & Order Balance
Implement field reporting and individual order financial tracking.
- [x] **Task 22.1**: Update `sales` schema for `advanceReceived` and `balanceAmount`.
- [x] **Task 22.2**: Database schema for `daily_reports` and customer tagging.
- [x] **Task 22.3**: Frontend: Daily Report submission and history views.
- [x] **Task 22.4**: Frontend: Customer Profile view with Order-wise balance summary.
- **Deliverable**: EOD reporting system and granular financial tracking.


## Phase 23: Bulk Export Utilities
High-performance data extraction for Admins.
- [ ] **Task 23.1**: Excel/CSV export for Inventory (BULK-01).
- [ ] **Task 23.2**: Excel/CSV export for Sales (BULK-02).
- [ ] **Task 23.3**: Excel/CSV export for Customers (BULK-04).
- **Deliverable**: Downloadable business reports.

## Phase 24: Bulk Import & Audit
Excel-based product management and final M6 hardening.
- [ ] **Task 24.1**: Excel import for Products (BULK-03).
- [ ] **Task 24.2**: Validation & Error handling for large uploads.
- [ ] **Task 24.3**: Milestone 6 UAT and performance audit.
- **Deliverable**: Bulk data management and Milestone 6 sign-off.
