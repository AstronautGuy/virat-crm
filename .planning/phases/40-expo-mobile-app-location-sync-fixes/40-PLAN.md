# Phase 40: Expo Mobile App Location Sync Fixes - Plan

Ensure the Expo mobile app reliably records and transmits location data in both background and foreground states, and resolves timestamp sync drift issues when offline.

## Database Schema Updates
We need to update the schema to support batching location points that were taken in the past while offline.
#### [MODIFY] [src/server/db/schema/locationLogs.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/db/schema/locationLogs.ts)
- Modify `breadcrumbs` table to add a `timestamp` column (or override `createdAt` explicitly). We'll change `createdAt` to not have a default `now()` constraint or allow passing it explicitly so we can log historical offline points accurately.
#### [NEW] [src/server/api/routers/alerts.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/alerts.ts)
- Add a new endpoint `location.reportLockout` that sends push notifications (via web push/VAPID) and records an alert for the Admin and the User's Manager.

## Backend API Updates
#### [MODIFY] [src/server/api/routers/location.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/location.ts)
- Update `location.logBreadcrumb` to accept an array of locations (batching).
- Use the provided `timestamp` from the client for each breadcrumb.
- Create a new `location.getServerTime` endpoint to allow the Expo app to fetch the accurate UTC server time to calculate its offset.

## Mobile App Updates
#### [MODIFY] [mobile/App.js](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/mobile/App.js)
- **Time Sync**: Fetch `location.getServerTime` on app mount, calculate `timeOffset = serverTime - Date.now()`. Use `Date.now() + timeOffset` for all location timestamps.
- **Offline Batching**: Use `AsyncStorage` to queue locations when `fetch` fails. Create a periodic sync function that flushes the queue when the network is restored.
- **Lockout Mechanism**: Track `lastSuccessfulSync`. If `currentTime - lastSuccessfulSync > 10 minutes`, render a strict "Offline Lockout" screen overlapping the WebView. Call `location.reportLockout` endpoint if network is available (or queue it).

---

## Verification Plan

### Automated Tests
- Run `npm run build` and `npx drizzle-kit generate` to verify schema changes.

### Manual Verification
- Start the Expo app, disconnect the internet. Move around (or use emulator mock locations) for 2 minutes.
- Reconnect the internet. Verify that a batch of locations is sent to the backend with their original timestamps correctly preserved.
- Disconnect the internet for 10 minutes. Verify the app displays the Lockout Screen.
- Reconnect the internet and verify the Lockout Alert is sent to the Admin dashboard.
