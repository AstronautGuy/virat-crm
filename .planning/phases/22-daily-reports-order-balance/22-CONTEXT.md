# Phase 22: Daily Reports & Order Balance - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement a "Daily Report" feature for field employees to submit narrative EOD reports and finalize the order-wise financial tracking system (separate totals, advances, and balances per order).

</domain>

<decisions>
## Implementation Decisions

### Daily Reports
- **D-01:** Implement a narrative-style report where employees can write free-form text.
- **D-02:** Reports must be submitted by the end of the day.
- **D-03:** No images or file attachments are required for the report.
- **D-04:** Support optional tagging of a Customer in the report to link activities to specific accounts.
- **D-05:** Data stored: `userId` (author), `branchId` (isolation), `reportDate`, `content` (narrative), and optional `customerId`.

### Order-Wise Financial Tracking
- **D-06:** Abandon global customer balance system. All tracking is granular per Sale/Order.
- **D-07:** Each `sale` record tracks:
  - `invoiceAmount` (The total amount for the order)
  - `advancePaymentAmount` (The initial deposit/advance)
  - `receivedAmount` (Total amount paid against this specific order to date)
  - `balanceAmount` (Remaining debt for this specific order)
- **D-08:** Total customer debt is calculated dynamically by summing `balanceAmount` across all linked sales.

### the agent's Discretion
- Exact layout of the "Daily Report" submission form.
- The design of the "History" view for reports (list vs calendar).
- Validation rules for preventing multiple reports on the same day.

</decisions>

<specifics>
## Specific Ideas

- "add a 'Daily Report' feature where the employee can write its own report however he/she wants to report it and submit it by the end of the day."
- "dont use customer balance system, keep each order seperate even if its of the same customer."

</specifics>

<canonical_refs>
## Canonical References

### Sales & Financials
- `src/server/db/schema/sales.ts` — Existing sales schema with financial fields.

### CRM Foundation
- `src/server/db/schema/customers.ts` — Customer schema for tagging.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `crmRouter` (src/server/api/routers/crm.ts): Patterns for customer-linked queries and branch isolation.
- `CustomerDetail` (src/app/crm/[id]/page.tsx): Already implements order history and balance summary.

### Established Patterns
- RBAC: Use `protectedProcedure` for submissions and `managerProcedure` for viewing reports across the branch.
- Form handling: `react-hook-form` and `Zod`.

### Integration Points
- `/crm/[id]` page: Should be updated to show related Daily Reports if customer tagging is used.
- Sidebar: Add "Daily Reports" link.

</code_context>

<deferred>
## Deferred Ideas

- Image attachments in reports (User explicitly said "no images needed").
- Automated attendance from reports (Out of scope).

</deferred>

---

*Phase: 22-daily-reports-order-balance*
*Context gathered: 2026-05-10*
