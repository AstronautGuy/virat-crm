# Phase 8 Context: Web Push Notifications & Real-time Alerts

## Core Objective
Implement a real-time notification system using the Web Push API. This will allow the CRM to notify agents of sales/leave approvals and managers of geofence breaches even when the PWA is in the background.

## Decisions
- **Protocol**: Standard Web Push API (VAPID).
- **Library**: `web-push` (Node.js backend) + Service Worker `push` event.
- **Storage**: Store subscriptions in a new `push_subscriptions` table, linked to `userId`.
- **Triggers**:
  - **Sale Approval/Rejection**: Triggered when status changes in `sales` table.
  - **Leave Approval/Rejection**: Triggered when status changes in `leaves` table.
  - **Broadcasts**: Admin ability to send messages to all subscribed devices.

## Implementation Details
- **Schema**: `src/server/db/schema/pushSubscriptions.ts`
- **Router**: `src/server/api/routers/notifications.ts` (extend existing or create new procedures)
- **Service Worker**: Update `src/app/sw.ts` to show notifications using `self.registration.showNotification`.

## Success Criteria
- [ ] Users can "Enable Notifications" from their profile.
- [ ] Push subscriptions are successfully stored in the database.
- [ ] Test notification received on mobile PWA.
- [ ] Status updates (Sales/Leaves) trigger real-time push alerts.
