---
wave: 1
depends_on: []
files_modified:
  - src/server/db/schema/products.ts
  - src/server/db/schema/index.ts
---

# Plan: Phase 18 - Multi-Branch Inventory Management

This phase implements the database and logic for tracking stock across multiple branches and managing transfers.

## Wave 1: Schema Evolution (Branch Isolation)

<task>
<read_first>
- src/server/db/schema/products.ts
- src/server/db/schema/sales.ts
- src/server/db/schema/replacements.ts
</read_first>
<action>
1.  **Refactor `products.ts`**: Remove global `stock` column.
2.  **Update `replacements.ts`**: Add `branchId` column (referencing `branches.id`) to ensure replacements are branch-isolated.
3.  **Create `inventory.ts`**: Define `inventory` table with `productId`, `branchId`, and `quantity`.
4.  **Create `inventoryTransactions.ts`**: Define audit log table with `productId`, `branchId`, `type` (Sale, Transfer, Adjustment, Replacement), and `quantity`.
5.  **Create `stockTransfers.ts`**: Define multi-branch movement table.
</action>
<acceptance_criteria>
- `products` table no longer contains `stock`.
- `inventory` table has composite PK/Unique on `[productId, branchId]`.
- `replacements` table has `branchId` with NOT NULL constraint.
</acceptance_criteria>
</task>

## Wave 2: Backend Logic (Branch-Specific Operations)

<task>
<read_first>
- src/server/api/routers/sales.ts
- src/server/api/routers/inventory.ts [NEW]
</read_first>
<action>
1.  **Update `sales` Router**:
    - When `create` mutation is called, verify stock availability in the user's `ctx.dbUser.branchId`.
    - Decrement `inventory` and log an `inventoryTransaction` for that branch.
2.  **Create `inventory` Router**:
    - `getBranchStock`: Fetch stock only for the user's branch (unless Admin).
    - `adjustStock`: Update stock for a specific branch with audit logging.
    - `transferStock`: Move items between origin and destination branches atomically.
</action>
<acceptance_criteria>
- Sales fail if branch stock is insufficient.
- All inventory movements are logged with the correct `branchId`.
- Admin can see all branches; Employees only see their assigned branch.
</acceptance_criteria>
</task>

## Wave 3: Frontend Foundation (Inventory Dashboard)

<task>
<read_first>
- src/app/inventory/page.tsx [NEW]
- src/app/_components/layout/DesktopSidebar.tsx
</read_first>
<action>
1.  **Implement `/inventory/page.tsx`**:
    - Build the Inventory Dashboard per `UI-SPEC.md`.
    - Include summary cards and a searchable product list.
2.  **Update `DesktopSidebar.tsx`**: Add "Inventory" link (ensure it uses `getIsFeatureEnabled("inventory")`).
</action>
<acceptance_criteria>
- `/inventory` page is accessible and displays real-time stock data.
- Sidebar link is visible and active.
- Mobile responsive cards implemented for smaller screens.
</acceptance_criteria>
</task>

## Wave 4: Workflow Implementation (Transfer Center)

<task>
<read_first>
- src/app/inventory/transfers/page.tsx [NEW]
</read_first>
<action>
1.  **Implement `/inventory/transfers/page.tsx`**:
    - Build the Transfer Center with "Incoming" and "Outgoing" lists.
    - Create a "New Transfer" modal/wizard.
2.  **Add `updateTransferStatus`** mutation to the `inventory` router.
</action>
<acceptance_criteria>
- Transfers can be requested, approved (Shipped), and completed (Received).
- Stock levels update atomically upon completion of a transfer.
</acceptance_criteria>
</task>

## Verification

- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] Manual verification of stock adjustment logging in the DB.
- [ ] Simulated stock transfer between Branch A and Branch B confirms atomic updates.
