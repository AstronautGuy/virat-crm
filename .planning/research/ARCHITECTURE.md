# Research: Architecture Additions for Milestone 6

## Data Model Expansion

### 1. Procurement Schema

- **`vendors`**: `id`, `name`, `taxId`, `paymentTerms`, `contactEmail`.
- **`purchase_orders`**: `id`, `vendorId`, `branchId`, `status`, `totalAmount`, `createdBy`, `approvedBy`.
- **`purchase_order_items`**: `id`, `poId`, `productId`, `quantity`, `unitCost`.

### 2. Expense Schema

- **`expense_claims`**: `id`, `userId`, `branchId`, `category`, `amount`, `description`, `receiptUrl`, `status`, `approvedBy`.

### 3. CRM Schema

- **`customers`**: `id`, `branchId`, `name`, `phone`, `email`, `address`, `creditLimit`, `currentBalance`.
- **`customer_interactions`**: `id`, `customerId`, `userId`, `type` (Call/Visit), `notes`, `nextFollowUp`.

## Integration Points

### Inventory Sync

- When a `purchase_order` status changes to `Received`, the system MUST trigger a stock update for the associated `branchId`.
- **Requirement**: Use a shared transaction helper between `procurement` and `inventory` routers.

### RBAC Enhancements

- New permissions required: `procurement:manage`, `expenses:approve`, `crm:admin`.

### Multi-Tenancy

- Every new entity (`vendors`, `purchase_orders`, `expense_claims`, `customers`) MUST include a `branchId` to maintain the data isolation hardened in Milestone 5.
