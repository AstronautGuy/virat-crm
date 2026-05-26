# Walkthrough: Phase 35 — React Native Mobile Parity & Live Alerts Screen

This walkthrough summarizes the implementation of mobile parity for live alerts and the global lockout guards.

## Changes Made

### 1. Backend: Unread Notifications Count
- **File:** `src/server/api/routers/notifications.ts`
- **What:** Added a lightweight `getUnreadCount` TRPC query to return the total number of unread alerts for a user without fetching full payloads.

### 2. Global TRPC Lockout Guard
- **File:** `src/trpc/query-client.ts`
- **What:** Implemented `handleGlobalError` which intercepts all TRPC queries and mutations. If the server responds with a `403 FORBIDDEN` error (e.g., due to strict branch isolation checks), it forcefully redirects the web application or mobile WebView to `/branch-select`. This prevents the UI from breaking or getting stuck.

### 3. Mobile: Background Fetch & Local Notifications
- **Files:** `mobile/package.json`, `mobile/App.js`
- **What:** Installed `expo-background-fetch` and `expo-notifications`.
- **Logic:** Configured `BACKGROUND_NOTIFICATION_TASK` to run periodically in the background (every ~15 minutes). It polls the new `notifications.getUnreadCount` endpoint. If the count of unread alerts is greater than 0 and has increased, it triggers a local push notification to the user's device.

## Validation Results
- **Typecheck & Linting:** Resolved the introduced typing error in `query-client.ts` related to `unknown` error typing.
- **Expo Architecture Check:** The mobile app's dependencies were successfully installed and are compatible with Expo Go and standalone builds. 

You can now use `/gsd-complete-milestone 8` to finalize Milestone 8!
