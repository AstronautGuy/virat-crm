# Research: Feature Requirements for Milestone 6

## 1. Procurement & Vendor Management

### Table Stakes

- **Vendor Profiles**: Name, contact details, tax ID, payment terms.
- **Purchase Orders (PO)**: Documenting the intent to buy inventory.
- **PO Status Flow**: `Draft` -> `Pending Approval` -> `Approved` -> `Ordered` -> `Received` -> `Cancelled`.
- **Sourcing Logs**: Linking PO items to branch inventory on "Received" status.

### Differentiators

- **Vendor Performance Tracking**: Late delivery flags, quality dispute logs.

## 2. Expense Tracking

### Table Stakes

- **Expense Categories**: Fuel, Travel, Food, Operational, Maintenance.
- **Receipt Attachment**: Mandatory image upload for specific categories.
- **Approval Workflow**: Subordinate submits -> Manager approves/rejects.
- **Branch-level Budgeting**: Tracking total branch expenses against sales revenue.

### Differentiators

- **GPS-verified Travel**: Auto-calculate fuel reimbursement based on breadcrumb mileage (High Value).

## 3. CRM (Customer Relationship Management)

### Table Stakes

- **Customer Master**: Moving from text strings to a formal table (Name, Phone, Address, Type).
- **Interaction History**: Logging calls, visits, and complaints.
- **Credit Limits**: Maximum outstanding balance allowed per customer.
- **Due Date Alerts**: Notifications for overdue payments.

## 4. Bulk Operations

### Table Stakes

- **Product Import**: Mass update prices/descriptions via Excel.
- **Inventory Audit**: Export current stock to CSV for physical counting, then import corrections.
- **Sales Export**: Yearly/Monthly data dumps for external accounting.
