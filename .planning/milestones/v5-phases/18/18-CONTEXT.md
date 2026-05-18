# Phase 18: Multi-Branch Inventory Management

## Context
We need to transition from a single-field global stock model to a multi-branch inventory system. This is critical for scaling operations and ensuring data integrity across different physical locations.

## Goals
1.  **Granular Tracking**: Stock levels must be unique per product per branch.
2.  **Auditability**: Every stock change must be logged with a type (Sale, Transfer, Adjustment).
3.  **Workflows**: Implement stock transfers between branches with state management (Pending -> Dispatched -> Received).
4.  **UI/UX**: Provide a premium dashboard for real-time inventory visibility.

## Files to Modify
- `src/server/db/schema/products.ts` (Refactor)
- `src/server/db/schema/index.ts` (Register new tables)
- `src/server/api/root.ts` (Register new router)
- `src/app/_components/layout/DesktopSidebar.tsx` (Add link)

## New Files
- `src/server/db/schema/inventory.ts`
- `src/server/db/schema/inventoryTransactions.ts`
- `src/server/db/schema/stockTransfers.ts`
- `src/server/api/routers/inventory.ts`
- `src/app/inventory/page.tsx`
- `src/app/inventory/transfers/page.tsx`

## Success Criteria (Falsifiable)
- [ ] Product stock can be queried by branch ID.
- [ ] Stock transfer mutation is atomic (Rolls back if any part fails).
- [ ] Inventory dashboard displays "Total SKU" and "Out of Stock" correctly.
- [ ] `tsc --noEmit` returns exit code 0.
