# Requirements: Milestone 10 (UI Polish, Data Entry Enhancements & Sync Hardening)

## 1. Inventory Enhancements (`INV-xx`)

- **INV-01**: **New Item Button**: Wire up the "Add Product" button to correctly open the product creation flow/modal.
- **INV-02**: **Remove Transfer Stock**: Remove the "Transfer Stock" button from the inventory UI.
- **INV-03**: **Price Column**: Add a "Price" column to the inventory data grid/list.

## 2. Sales Register Enhancements (`SALES-xx`)

- **SALES-01**: **Order ID**: Add manual Order ID entry (must validate as unique and non-null).
- **SALES-02**: **Invoice ID**: Add auto-generated Invoice ID (numeric part increments automatically but remains editable by user).
- **SALES-03**: **Customer Search**: Replace plain customer name input with a searchable dropdown referencing the Customer Master.
- **SALES-04**: **Add Customer Modal**: Include an "Add Customer" modal accessible directly from the Sales customer dropdown.
- **SALES-05**: **Admin Hierarchy Selection**: Add dropdowns allowing Admins to explicitly select the Employee, Manager, and Manager Hierarchy for a sales entry.
- **SALES-06**: **Admin Auto-Approve**: Sales records created by Admins bypass the pending state and are automatically marked as Approved.

## 3. Live View Enhancements (`LIVE-xx`)

- **LIVE-01**: **Employee Search Bar**: Add a search input in the Live View section to pin/filter employees by name or employee code.

## 4. Expo Background/Foreground Sync (`EXPO-xx`)

- **EXPO-01**: **Background Execution**: Expo mobile app reliably records and transmits location data in both background and foreground states.
- **EXPO-02**: **Time Sync Correction**: Backend explicitly handles local device time sync issues for accurate timestamps.

## 5. Hardening & Polish (`HARDEN-xx`)

- **HARDEN-01**: **Live Location Robustness**: Live team map connection is robust against intermittent disconnects.
- **HARDEN-02**: **Route Playback Fixes**: Historical route playback draws paths correctly without jumping across inaccurate GPS data points.
- **HARDEN-03**: **Time Slab Verification**: History reports bucket GPS locations accurately into specified time slabs.

## 6. Global Refactoring (`REFACTOR-xx`)

- **REFACTOR-01**: **Eliminate Hard Coded Values**: Perform global audit to remove hard-coded strings, URLs, configuration limits into `.env` or enums.

## Traceability

| REQ-ID      | Phase | Status |
| ----------- | ----- | ------ |
| INV-01      | 44    | [ ]    |
| INV-02      | 44    | [ ]    |
| INV-03      | 44    | [ ]    |
| SALES-01    | 45    | [ ]    |
| SALES-02    | 45    | [ ]    |
| SALES-03    | 45    | [ ]    |
| SALES-04    | 45    | [ ]    |
| SALES-05    | 46    | [ ]    |
| SALES-06    | 46    | [ ]    |
| LIVE-01     | 47    | [ ]    |
| EXPO-01     | 40    | [ ]    |
| EXPO-02     | 40    | [ ]    |
| HARDEN-01   | 41    | [ ]    |
| HARDEN-02   | 41    | [ ]    |
| HARDEN-03   | 41    | [ ]    |
| REFACTOR-01 | 42    | [ ]    |
