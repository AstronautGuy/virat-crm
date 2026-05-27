# Phase 40: Expo Mobile App Location Sync Fixes - Research

## Context
Phase 40 aims to fix background/foreground location sync in the Expo app and resolve timestamp issues when syncing with the backend.

## Findings

### Current Architecture
- The mobile app currently uses `expo-location` and `expo-task-manager` for background location updates (`LOCATION_TASK_NAME`).
- The location is sent to the backend endpoint `location.logBreadcrumb` using native `fetch`.
- If the fetch fails (e.g. offline), the error is caught, but the location is dropped. No batching or retry logic exists.
- Timestamping currently relies completely on the backend `breadcrumbs` schema auto-generating `createdAt`, which means if a payload was sent late or batched, its timestamp would reflect the *received* time, not the *captured* time.
- The `App.js` pings the backend every 60000ms (1 minute) or 50 meters distance.

### Technical Limitations & Solutions

1. **Background Location Limits**: 
   - `expo-location` with `startLocationUpdatesAsync` works well if configured properly, but we need to batch requests to save battery and handle offline scenarios.
   - Solution: Use AsyncStorage or expo-sqlite to queue location points with their local timestamps. Run a sync loop or flush the queue when the network is available.

2. **Time Synchronization**:
   - The server must accept a `capturedAt` timestamp from the client.
   - To prevent clients from spoofing time or sending incorrect time due to local device clock drift, the app should fetch the server time on startup, calculate the offset `serverTime - localTime`, and apply this offset to all captured timestamps.
   - We need to modify the `location.logBreadcrumb` endpoint to accept a `timestamp` field instead of relying solely on DB `createdAt`.

3. **Offline Lockout**:
   - Requirement: If location is not updated for 10 minutes, lock out the app and alert admin/manager.
   - Solution: The mobile app can have a `lastSuccessfulSync` timestamp. If `Date.now() - lastSuccessfulSync > 10 * 60 * 1000`, show a Lockout screen. Send an alert via a new tRPC endpoint `location.reportLockout`.

## Plan Implications
- Need to update `mobile/App.js` to implement an offline queue using `AsyncStorage`.
- Need to add a server offset sync at app initialization.
- Modify `location.logBreadcrumb` in `src/server/api/routers/location.ts` to accept an array of locations (batch) with timestamps.
- Update the `breadcrumbs` table schema to have a `timestamp` column (or override `createdAt`). Wait, overriding `createdAt` is better if we just pass it when inserting.
- Implement a Lockout Screen in `mobile/App.js` or via a conditional overlay.
- Add an endpoint for triggering notifications to managers when a lockout occurs.
