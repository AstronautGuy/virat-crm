# Research: Potential Pitfalls for Milestone 6

## 1. Procurement Risks

- **Double Counting**: Ensure that stock is only incremented ONCE when a PO is marked "Received". Reverting a PO status must handle stock reclamation carefully.
- **Cost Inconsistency**: The cost of items in a PO might differ from the "Price" in the product catalog. Ensure unit cost is captured at the time of PO creation.

## 2. Expense Risks

- **Ghost Claims**: Users submitting multiple claims for the same receipt.
  - **Mitigation**: Implement a simple hash check on receipt image data or strictly link expenses to unique dates.
- **Approval Deadlocks**: If a manager leaves, claims might get stuck.
  - **Mitigation**: Admins must have the power to override/reassign approvals.

## 3. CRM Risks

- **Privacy Leaks**: Customer interaction notes often contain sensitive info.
  - **Mitigation**: Ensure interaction logs are strictly scoped to the branch or assigned agent.
- **Credit Inflation**: Manually overriding credit limits without an audit trail.
  - **Mitigation**: Log all changes to `creditLimit` in a separate `audit_logs` table.

## 4. Bulk Ops Risks

- **ID Collisions**: Importing products with existing IDs.
  - **Mitigation**: Always use "Upsert" logic and validate schema before processing any row.
- **Memory Bloat**: Parsing 10k+ rows of Excel in a single request.
  - **Mitigation**: Use streaming parsers or impose a strict row limit (e.g., 1000 rows per import).
