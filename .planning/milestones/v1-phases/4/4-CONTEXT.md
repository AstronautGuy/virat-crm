# Phase 4 Context: Transactions & Workflow Automation

## Decisions

### 1. Approval Workflow Strategy & Hierarchy
- **Decision:** N-level recursive managerial hierarchy. 
- **Details:** 
  - Employees report to a Manager. Managers report to higher-level Managers. Admin is at the top.
  - Data viewing is strictly scoped: Employees see only their own data. Managers see data for their direct reports and teams below them.
  - *Implementation Note:* Requires adding a self-referencing `managerId` to the `users` table to support infinite levels.

### 2. Sales Data Granularity
- **Decision:** Highly detailed, itemized sales register.
- **Details:**
  - Branch (from sale)
  - Order Date & Invoice Date (auto-generated)
  - Order Number & Transaction Number (auto-generated)
  - Employee Code / Username (with auto-fetched Name)
  - Field Supervisor (auto-fetched manager)
  - Delivery Address (auto-fetched from pincode)
  - Customer Name & Address
  - Sales Product List (fetched from an inventory list)
  - Free Products & Free Qty
  - Main Qty & Total Qty
  - Invoice Amount, Advance Payment Amount, Received Amount, Balance Amount

### 3. Replacement Handling
- **Decision:** Replacements are strictly linked to original sales.
- **Details:** Must include a foreign key linking back to the original `saleId`.

### 4. Status Notifications
- **Decision:** In-app notifications are required.
- **Details:** Employees must receive app notifications when their leaves, sales, or replacements are approved or rejected.
