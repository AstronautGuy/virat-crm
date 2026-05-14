# Phase 21: CRM Foundation & RBAC - Context

## Domain Boundary
Establishing the customer master database, implementing role-based access for data entry, and setting up the address/pincode infrastructure.

## Locked Decisions

### 1. Customer Schema & Data Depth
- **Fields**: `id`, `name`, `mobile`, `dob` (Date of Birth), `pincode`, `village`, `district`, `state`, `address` (full string), `branchId`, `status`.
- **Status Enum**: `Draft` (added by Employee), `Approved` (verified by Manager/Admin).
- **Address Logic**: Implementation must support a "Pincode to Village" lookup filler. Enter pincode -> auto-populate Village/District/State if possible, or provide a selectable list of villages for that pincode.

### 2. Access Workflow (RBAC)
- **Create**:
    - `Employees`: Can create customers, but they are saved with `status: 'Draft'`.
    - `Managers/Admins`: Can create customers directly with `status: 'Approved'`.
- **Update/Delete**:
    - Strictly restricted to `Manager` and `Admin` roles.
    - Employees have **Read-Only** access to `Approved` customers.
- **Procedures**: Use `managerProcedure` for mutations and `protectedProcedure` for queries.

### 3. Financial Infrastructure (Bill-wise)
- **Shift from Global Balance**: Instead of a single `currentBalance` on the customer, we track balance **per order**.
- **Sales Record Updates**:
    - `totalAmount`: The grand total of the order.
    - `advanceReceived`: Amount paid at the time of order.
    - `balanceAmount`: `totalAmount - advanceReceived`.
- **UI Computation**: The Customer List and Profile should display a "Total Pending" sum calculated from all related `Sales` records where `balanceAmount > 0`.

### 4. Reporting & Interactions
- **Feature**: "Daily Report" (EOD submission).
- **Structure**: Free-form text content + tagging/linking to 1 or more `Customers`.
- **Data Model**: `daily_reports` table linked to `users` (employee) and a many-to-many relationship with `customers`.
- **No Artifacts**: No photo proof or mandatory GPS check-ins for interactions (relying on 24/7 background tracking).

## Technical Constraints
- **Multi-Branch**: Customers MUST be isolated by `branchId` for standard users, while `Admin` users can view/search across all branches.
- **Financial Precision**: Use appropriate decimal types (not floats) for `totalAmount`, `advanceReceived`, and `balanceAmount`.

## Canonical Refs
- `.planning/REQUIREMENTS.md` (CRM-01, CRM-02, CRM-03)
- `src/server/db/schema/users.ts` (Role definitions)
- `src/server/api/trpc.ts` (Procedure types)
