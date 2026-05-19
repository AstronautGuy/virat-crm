# Phase 30 UAT: Hardening & Strict Security

## Overview
Status: [IN_PROGRESS]
Phase: 30
Last Updated: 2026-05-15

## Test Cases

### 1. Global GPS Lockout (Mobile)
- **Goal**: Verify the app is unusable if GPS is disabled.
- **Pre-condition**: App is running on device/emulator.
- **Action**: Disable GPS/Location services.
- **Expected Result**: App immediately shows "GPS REQUIRED" overlay and blocks all other UI.
- **Result**: [ ]

### 2. Admin Feature Toggling (Sales)
- **Goal**: Verify Admin can disable the "Sales" module.
- **Pre-condition**: Logged in as Admin.
- **Action**: In Admin > Feature Access, disable "Sales" for the current user's role.
- **Expected Result**: "Sales" link disappears from sidebar/dashboard on Web and Mobile. API calls to `sales.*` return 403.
- **Result**: [ ]

### 3. CRM Protection (Backend)
- **Goal**: Verify CRM API is protected even if UI is bypassed.
- **Pre-condition**: CRM is disabled for the role.
- **Action**: Attempt to call `crm.getCustomerById` via tRPC client/console.
- **Expected Result**: Server returns "UNAUTHORIZED" or "FEATURE_DISABLED" error.
- **Result**: [ ]

### 4. 24/7 Heartbeat Frequency
- **Goal**: Verify heartbeat pulses are sent every 2 minutes.
- **Pre-condition**: App in background.
- **Action**: Monitor `breadcrumbs` table or server logs.
- **Expected Result**: Pulse received every 120 seconds.
- **Result**: [ ]

### 5. Attendance Reporting
- **Goal**: Verify CSV export of location logs.
- **Pre-condition**: Some location logs exist in DB.
- **Action**: Call `analytics.getAttendanceExport`.
- **Expected Result**: Returns valid CSV data with Date, Slab, User, and Coordinates.
- **Result**: [ ]

## Feedback Loops
- [ ] No issues found.
