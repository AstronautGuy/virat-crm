# Research Summary: Milestone 6

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  GSD ► RESEARCH COMPLETE ✓
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Stack Additions
- **SheetJS (xlsx)**: For robust Excel/CSV processing.
- **Decimal.js**: For financial precision in expenses and POs.
- **Sharp**: For server-side receipt image optimization.

### Feature Table Stakes
- **Procurement**: Multi-stage PO approval flow with atomic inventory receipt.
- **Expenses**: Category-based claims with receipt uploads and manager approvals.
- **CRM**: Centralized customer master with interaction logging and credit limit tracking.
- **Bulk Ops**: CSV/Excel import/export for products and inventory audits.

### Watch Out For
- **Inventory Duplication**: Logic must prevent double-counting stock from POs.
- **Data Privacy**: CRM and Expense data must adhere to the branch-isolation rules established in M5.
- **Memory Management**: Bulk imports must be limited/streamed to prevent server crashes.

---
*Generated: 2026-05-10*
