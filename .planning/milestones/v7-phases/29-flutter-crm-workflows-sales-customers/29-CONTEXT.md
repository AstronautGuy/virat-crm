# Phase 29 Context: Flutter CRM Workflows (Sales & Customers)

## Strategic Decisions

- **Form Layout**: **Single Page Vertical Scroll**. Use large, high-visibility inputs for all fields to minimize navigation overhead.
- **Role-Based Feature Control**: **STRICT**. Every feature (Sales, Customers, Attendance, Sync) must be toggleable by the Admin via the `rolePermissions` table. The mobile app will fetch these permissions upon login and dynamically hide/disable buttons/screens accordingly.
- **Address Intelligence**: No GPS "guessing" for the address. Manual Pincode entry with API-based auto-fill (City/State/Area) only.
- **Sync Strategy**: **Auto-Sync**. The app will automatically attempt to push queued data whenever internet is available, while retaining a manual "Sync" button as a backup.
- **Customer Integration**: Simple "Draft" customer creation will be allowed within the New Sale flow if a customer is missing (if the user role has permission).

## Technical Requirements

- **Feature Gating**:
  - Add `permissions` (Map<String, Boolean>) to the `authRouter.login` response.
  - Implement a `FeatureGate` wrapper in Flutter.
- **Synchronization**:
  - Background process to monitor the `Isar` offline queue and send POST requests to the REST bridge.
- **Form Design**:
  - Standardized "Big Button" style for all dropdowns and multi-selects.

## Success Criteria

- [ ] Users can only see features allowed for their Role (verified via Admin Dashboard).
- [ ] New Sale form successfully posts to `/crm/sales` (or queues if offline).
- [ ] Offline sales automatically sync when the app detects internet.
- [ ] Pincode auto-fill correctly populates City/State/Area fields.
