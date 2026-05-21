# Phase 8 Plan: Web Push Notifications & Real-time Alerts

## Overview

Implement end-to-end push notifications for the CRM.

## Wave 1: Push Infrastructure (Backend)

- `[ ]` **Task 1.1: Push Subscriptions Schema**
  - `<action>`: Create `src/server/db/schema/pushSubscriptions.ts`. Columns: `id`, `userId`, `endpoint`, `p256dh`, `auth`, `userAgent`.
  - `<acceptance_criteria>`: Migration generated and pushed.
- `[ ]` **Task 1.2: VAPID Keys & Env Configuration**
  - `<action>`: Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to `.env` and `src/env.js`.
  - `<acceptance_criteria>`: Environment variables configured.
- `[ ]` **Task 1.3: Subscription tRPC Router**
  - `<action>`: Add `saveSubscription` and `removeSubscription` to `notifications` router.
  - `<acceptance_criteria>`: Client can send subscription objects to the backend.

## Wave 2: Service Worker & Permissions (Frontend)

- `[ ]` **Task 2.1: SW Push Event Listener**
  - `<read_first>`: `src/app/sw.ts`
  - `<action>`: Add `self.addEventListener("push", ...)` to handle incoming data and call `showNotification`.
  - `<acceptance_criteria>`: SW correctly displays notifications when it receives a push event.
- `[ ]` **Task 2.2: Notification Permission Toggle**
  - `<read_first>`: `src/app/profile/page.tsx` (if exists)
  - `<action>`: Create a `PushSettings` component that handles `Notification.requestPermission()` and VAPID registration.
  - `<acceptance_criteria>`: User can subscribe/unsubscribe via a UI toggle.

## Wave 3: Real-time Triggers (Workflow)

- `[ ]` **Task 3.1: Push Notification Utility**
  - `<action>`: Create `src/server/lib/push.ts` using `web-push`. Implement `sendNotificationToUser`.
  - `<acceptance_criteria>`: Utility correctly sends payload to all active subscriptions of a user.
- `[ ]` **Task 3.2: Hook into Sales/Leave Workflows**
  - `<read_first>`: `src/server/api/routers/sales.ts`, `src/server/api/routers/leaves.ts`
  - `<action>`: Add post-update hooks that trigger `sendNotificationToUser` when a manager approves/rejects a request.
  - `<acceptance_criteria>`: Agent receives a push notification when their sale is approved.

## Verification Criteria

- [ ] Push subscription stored successfully.
- [ ] Browser shows "Allow Notifications" prompt.
- [ ] "Test Push" from backend successfully displays on PWA (Android/iOS/Desktop).
