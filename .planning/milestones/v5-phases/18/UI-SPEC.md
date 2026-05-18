# UI Specification: Phase 18 (Multi-Branch Inventory Management)

**Status**: DRAFT 📝
**Phase**: 18
**Theme**: Premium Enterprise Utility

## 1. Visual Language & Brand
- **Core Aesthetic**: Clean, data-dense, but breathable. Use high-contrast typography and subtle elevation for cards.
- **Color Palette**:
  - `Primary`: `#0f172a` (Slate 900) - Headers and core navigation.
  - `Action`: `#2563eb` (Blue 600) - Primary buttons and interactive links.
  - `Success/Stock`: `#10b981` (Emerald 500) - Healthy stock levels and completion.
  - `Warning`: `#f59e0b` (Amber 500) - Low stock alerts and pending actions.
- **Typography**: Inter (Sans-serif) with tabular numbers for data consistency.

## 2. Layout & Components

### 2.1 Inventory Overview (Dashboard)
- **Stats Row**:
  - Total SKU Count.
  - Total Inventory Value (calculated).
  - Out of Stock Items (Alert card).
  - Pending Transfers (Action card).
- **Recent Activity**: A scrollable list of the last 10 stock movements across all branches.

### 2.2 Global Product Registry (`/inventory`)
- **Data Grid**:
  - Columns: SKU, Product Name, Category, Total Stock, Primary Branch, Status.
  - Filters: Branch Selector, Category, Stock Status (Low/Out/Good).
  - Action: "Add Product" (Floating Action Button).

### 2.3 Product Deep-Dive (`/inventory/[id]`)
- **Header**: Product Name + SKU + "Transfer" Button.
- **Tab 1: Stock Distribution**:
  - Map overlay showing stock levels geographically.
  - Table: Branch Name | Available | Reserved | On Order | Action (Adjust).
- **Tab 2: History**: Timeline of every stock-in, stock-out, and transfer for this specific item.

### 2.4 Transfer Center (`/inventory/transfers`)
- **Split View**:
  - **Left**: Incoming Requests (Require Approval).
  - **Right**: Outgoing Shipments (In Transit).
- **Transfer Wizard**:
  - Step 1: Select Item + Origin Branch.
  - Step 2: Destination Branch + Quantity.
  - Step 3: Confirmation & Dispatch Note Generation.

## 3. Micro-Animations & Interactions
- **Skeleton States**: Use shimmering skeletons for the data grid while tRPC queries are fetching.
- **Hover Effects**: Rows highlight with a subtle `bg-blue-50/50`.
- **Status Indicators**: Pulsing dot for "Critical Low Stock".
- **Transitions**: Smooth slide-over modals for adjustments to maintain context.

## 4. Mobile Adaptations
- **Mobile Grid**: Switch from table to card-based list on screens < 768px.
- **Quick Scan**: Sticky search bar at the top with a placeholder for future QR/Barcode scanner integration.

## 5. Falsifiable Verification Criteria
- [ ] Dashboard renders 4 summary cards with correct colors.
- [ ] Product list supports filtering by Branch without a full page reload.
- [ ] Transfer wizard prevents selecting the same branch for Origin and Destination.
- [ ] "Access Restricted" UI appears if a user without 'Inventory' permission tries to visit `/inventory`.
