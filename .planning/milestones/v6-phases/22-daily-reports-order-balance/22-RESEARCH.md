# Phase 22: Daily Reports & Order Balance - Research

## Objective
Research the implementation of narrative daily reports and granular order-wise financial tracking.

## 1. Daily Reports (EOD Narrative)
- **Data Model**:
  - `id`: serial/uuid
  - `userId`: uuid (references users.id)
  - `branchId`: integer (references branches.id)
  - `reportDate`: timestamp (defaultNow, but allow manual selection for back-filling)
  - `content`: text (for the narrative)
  - `customerId`: uuid (optional, for tagging specific customer visits)
- **Indexing**:
  - Index on `(userId, reportDate)` to quickly fetch history for an employee.
  - Index on `branchId` for manager views.
- **Concurrency**: Prevent multiple reports for the same user on the same date via a unique constraint on `(userId, reportDate::date)` if strict 1-per-day is needed. However, the user said "write its own report however he/she wants", which might imply multiple reports in a day are okay. I'll stick to a simple timestamp-based approach.

## 2. Order-Wise Financial Tracking
- **Requirement**: "dont use customer balance system, keep each order seperate... each order has a seperate total amount, a seperate advance recieved amount and a seperate balanced amount."
- **Fields in `sales` table**:
  - `invoiceAmount`: Total order value.
  - `advancePaymentAmount`: Amount paid at order time.
  - `receivedAmount`: Cumulative amount paid so far.
  - `balanceAmount`: Current outstanding (`invoiceAmount - receivedAmount`).
- **Calculation Logic**:
  - Every time a payment is received, `receivedAmount` increases and `balanceAmount` decreases.
  - **Total Pending Balance**: Calculated as `sum(balanceAmount)` for all sales linked to a `customerId`.
- **Consistency**: Use PostgreSQL transactions when updating `receivedAmount` to ensure `balanceAmount` is always in sync.

## 3. UI/UX Considerations
- **Sidebar**: Add "Daily Reports" link.
- **Employee View**: A "Submit Report" button and a list of "My Reports".
- **Manager View**: A dashboard to view all reports from their branch, filtered by date.
- **Customer Detail**: Show a "Financial Summary" section with:
  - Total Orders Count
  - Total Order Value (Sum of `invoiceAmount`)
  - Total Paid (Sum of `receivedAmount`)
  - Total Pending (Sum of `balanceAmount`)

## 4. Technical Constraints
- **RBAC**: Only Managers/Admins can see reports across the branch. Employees can only see their own.
- **Data Isolation**: All queries MUST filter by `branchId`.

## 5. Validation Architecture
- **API Tests**: Verify that `receivedAmount` + `balanceAmount` always equals `invoiceAmount`.
- **E2E**: Verify that submitting a report with a customer tag shows up in that customer's history.
