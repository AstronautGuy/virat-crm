# Phase 29 Plan: Flutter CRM Workflows (Sales & Customers)

Implement the core CRM features for mobile, focusing on the "Big Button" single-page forms, background auto-sync, and strict role-based feature gating.

## Proposed Changes

### 1. Data Layer & Persistence

#### [NEW] `mobile/lib/data/models/sync_item.dart`

- Isar collection to track pending operations (`type`, `data`, `isSynced`, `createdAt`).

#### [NEW] `mobile/lib/data/repositories/sync_repository.dart`

- Logic to add items to queue and process them when online.
- Integration with `connectivity_plus` to trigger sync.

### 2. Feature Gating (Admin Controls)

#### [MODIFY] `mobile/lib/presentation/providers/auth_provider.dart`

- Store the `permissions` map returned by the updated `authRouter.login`.

#### [NEW] `mobile/lib/presentation/widgets/feature_gate.dart`

- A wrapper widget that checks `permissions[featureKey]`.
- If disabled, hide the child or show a "Locked by Admin" placeholder.

### 3. CRM Screens (Single Page Vertical Scroll)

#### [NEW] `mobile/lib/presentation/screens/new_sale_screen.dart`

- Large input fields for all mandatory sale data.
- **Pincode Auto-fill**: Use `dio` to fetch address details from the postal API.
- **Product Selector**: A "Big Button" list or searchable dropdown for products.

#### [NEW] `mobile/lib/presentation/screens/customer_list_screen.dart`

- Searchable list of customers.
- "PROPOSE NEW" button (Gated by permission).

#### [NEW] `mobile/lib/presentation/screens/new_customer_screen.dart`

- Simplified form for customer details.

### 4. Background Services

#### [MODIFY] `mobile/lib/services/heartbeat_service.dart`

- Add a periodic check of the Isar `SyncQueue` during the heartbeat pulse.

## Verification Plan

### Automated Tests

- Unit tests for `SyncRepository` (Simulated offline/online transitions).
- Unit tests for `PermissionsProvider` logic.

### Manual Verification

- **Feature Gate**: Login as a role with "Sales" disabled; verify the "NEW SALE" button is hidden.
- **Offline Sync**: Create a sale while in Airplane Mode, turn off Airplane Mode, and verify the sale appears in the Web Dashboard.
- **Pincode**: Enter a valid pincode and confirm City/State/Area are populated automatically.
- **"Big Button" UI**: Ensure all inputs have a minimum height of 80px and are easily clickable.
