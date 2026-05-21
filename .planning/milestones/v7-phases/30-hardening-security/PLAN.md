# Phase 30: Hardening & Strict Security

## Objective

Enforce 100% admin-toggleable feature access across Web and Mobile platforms and implement mandatory 24/7 location tracking.

## Proposed Changes

### Web Backend

- [x] **Router Protection**: Migrate all tRPC routers (`crm`, `sales`, `location`, `dailyReports`, `heartbeat`) to `featureProtectedProcedure`.
- [x] **Analytics**: Add `getAttendanceExport` for location auditing.

### Web Frontend

- [x] **Security Hardening**: Update `FeatureGate` to default to `disabled`.
- [x] **UI Audit**: Wrap all core pages in `FeatureGate`.

### Mobile Application

- [x] **Global Location Guard**: Implement `LocationGate` in `MaterialApp.builder` to lock app if GPS is off.
- [x] **Heartbeat Optimization**: Reduce interval to 2 minutes for high-resolution tracking.
- [x] **UI Sync**: Ensure mobile dashboard buttons respect the same `rolePermissions` table.

## Verification Plan

1. Test Role Permissions: Disable a feature (e.g., CRM) and verify it disappears from Web/Mobile and API is blocked.
2. Test GPS Guard: Turn off GPS and verify the app locks.
3. Test Reporting: Export a location report and verify data integrity.
