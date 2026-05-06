# Phase 15 Context: Centralized Warehouse Management

## Goals
- **Inventory Foundation**: Implement the core data structures for multi-warehouse management.
- **Warehouse Management UI**: Create a dashboard for tracking inventory levels across different physical locations.
- **Inter-branch Transfers**: Support moving stock between warehouses or from warehouse to branch.

## Initial Assessment
- **Schema**: We need a `warehouses` table and an `inventory` table (linking products to warehouses).
- **Existing Products**: We should ensure the current `products` schema supports warehouse tracking.
- **Stock Movements**: We need a `stock_movements` table to log every addition, removal, or transfer for audit purposes.

## Decisions Needed
1.  **Warehouse Roles**: Should we have a specific "Warehouse Manager" role, or just use the "Admin" role for now?
2.  **Stock Deductions**: When a sale is made at a branch, which warehouse should it deduct from? (Default to nearest, or explicit selection?)
3.  **Transfer Workflow**: Should transfers require an "Approval" step (Request -> Approved -> Shipped -> Received)?
