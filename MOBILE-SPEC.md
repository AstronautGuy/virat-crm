# Virat CRM - Mobile Flutter Specification (v1.0)

## Overview
A high-accessibility companion app for field staff. Focuses on Mandatory Connectivity, GPS Tracking, and simplified CRM workflows.

## Design Philosophy: "Big Button" UI
- **Accessibility**: Minimalist interface with large interactive elements (min-height: 80px).
- **Typography**: Inter (Match Web UI), minimum font size 18pt for primary actions.
- **Feedback**: Haptic feedback on all successful button presses.
- **Color Palette**: 
  - Primary: `#3B82F6` (Blue 500)
  - Success: `#10B981` (Emerald 500)
  - Alert/Danger: `#EF4444` (Red 500)
  - Background: Soft Gray/White for high contrast.

## Core Features
1. **Persistent Authentication**:
   - Login via Employee Code + Password.
   - Store JWT in `flutter_secure_storage`.
   - Token valid for 30 days.
2. **GPS Heartbeat (Mandatory)**:
   - Use `flutter_background_geolocation`.
   - Send heartbeat every 5 minutes (matches Website frequency) while app is in foreground/background.
   - UI must show "Active Tracking" status.
   - Alert user locally if GPS is disabled or Internet is lost.
3. **Simplified CRM**:
   - **Customers**: List View + Simple Search.
   - **Propose Customer**: Single-page form with big inputs.
   - **Sales**: Quick order entry (Select Product -> Enter Quantity -> Submit).

## API Integration
- **Base URL**: `https://your-crm-domain.com/api/rest`
- **Auth**: `Authorization: Bearer <token>`
- **Endpoints**:
  - `POST /auth/login`: `{ employeeCode, password }` -> `{ token, user }`
  - `POST /heartbeat/pulse`: `{ lat, lng, status }`
  - `GET /crm/customers`: Get branch customers.
  - `POST /crm/propose`: Submit draft customer.
  - `POST /sales/create`: Submit new sale.

## Monitoring & Compliance
- The backend runs a 15-minute inactivity check.
- If a user fails to send a heartbeat, Admins are notified immediately.
- The app should prevent usage of CRM features if Connectivity/GPS status is red.

## Tech Stack (Recommended)
- **Framework**: Flutter (Stable)
- **State Management**: Provider or Riverpod
- **Storage**: `flutter_secure_storage`
- **Background Task**: `workmanager` or `flutter_background_geolocation` (Paid/Reliable)
- **HTTP Client**: `dio`
