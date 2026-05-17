# Codebase Concerns

**Analysis Date:** 2026-05-17

## Tech Debt

**Kinde Authentication Configuration Residue:**
- Issue: `.env.example` still contains variables for Kinde Auth (e.g. `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, Kinde site and redirect URLs), which was replaced by a custom credentials system.
- Files: `.env.example` (Lines 15-21)
- Impact: Confuses new developers setting up local environments regarding which authentication system is active.
- Fix approach: Deprecate Kinde references from `.env.example`.

**Duplicate OpenAPI Metadata Declarations:**
- Issue: The `authRouter`'s `login` procedure declares `.meta({ openapi: { ... } })` twice.
- Files: `src/server/api/routers/auth.ts` (Lines 11 and 28)
- Impact: Code duplication which can cause sync issues if metadata definitions are updated.
- Fix approach: Remove the duplicate `.meta()` call at line 28.

**Hardcoded Action Handlers in Synchronization Repository:**
- Issue: The Flutter application's synchronization routine explicitly hardcodes switch cases for `createSale` and `proposeCustomer` actions.
- Files: `mobile/lib/data/repositories/sync_repository.dart` (Lines 44-50)
- Impact: Maintenance bottleneck. Every new offline-supported action (such as leaves, expenses, or daily reports) requires manually expanding this switch statement.
- Fix approach: Refactor `SyncRepository` to accept a strategy registry or generic endpoint router mapped to action types.

## Known Bugs

**iOS Background Geolocation Pulse is Dead:**
- Symptoms: Employees using iOS devices stop reporting live coordinate updates when the mobile app goes into the background.
- Trigger: Device locks or app is minimized on iOS hosts.
- Files: `mobile/lib/services/heartbeat_service.dart` (Line 58, `onIosBackground()`)
- Workaround: Force employees to keep the application active in the foreground.
- Root cause: The iOS background service entry point `onIosBackground` merely returns `true` and does not run the periodic location acquisition and API pulse logic.
- Fix approach: Implement iOS background task running (e.g. using `workmanager` or iOS background fetch APIs) to match the foreground service logic.

## Security Considerations

**Fallback Secret Key for JWT Signing:**
- Risk: Next.js JWT session verification defaults to a hardcoded fallback string if `AUTH_SECRET` is unset.
- Files: `src/server/lib/auth.ts` (Line 5)
- Current mitigation: Warning instructions in `.env.example` indicating production keys must be set.
- Recommendations: Throw a fatal error on server startup inside `src/env.js` if `AUTH_SECRET` is empty in production, rather than falling back to `"a_very_secret_key_change_me_in_prod"`.

**Breadcrumb Logging Outside Geofence:**
- Risk: Raw tracking locations are inserted in the `breadcrumbs` table even when the user fails the server geofence validation check.
- Files: `src/server/api/routers/location.ts` (Lines 70-79, `ping()`)
- Current mitigation: The endpoint returns warning messages, and attendance slabs are not recorded.
- Recommendations: Ensure database logging strictly honors company privacy settings regarding tracing locations outside work hours or branch regions.

## Performance Bottlenecks

**Unbounded Breadcrumb Table Growth:**
- Problem: The `breadcrumbs` table accumulates high-resolution tracking logs (every 2 minutes per employee).
- Files: `src/server/api/routers/location.ts` (Lines 105-109, `ping()`)
- Measurement: Estimating ~240 records per employee per day. With large teams, this table will quickly exceed millions of rows.
- Cause: Cleanup of records older than 24 hours (`EOD Cleanup`) is only triggered reactively when an active employee triggers a new location ping *and* no existing slab exists for the day.
- Improvement path: Move historical cleanups to a cron task or utilize PostgreSQL table partitioning.

## Fragile Areas

**Restricted Route Playback Query:**
- File: `src/server/api/routers/location.ts` (Lines 271-275, `getRoutePlayback()`)
- Why fragile: The route throws an error if any historical date is queried other than the current server day (`todayStr`).
- Common failures: Client dashboard UI crashes or fails to display any coordinates if time zone offsets cause date mismatches between the client browser and the server.
- Safe modification: Expand query parameters to accept small date windows with correct timezone offset parameters.

## Scaling Limits

**Sequential Synchronization Abrupt Halt:**
- Resource/System: Offline Synchronization Queue.
- Files: `mobile/lib/data/repositories/sync_repository.dart` (Lines 59-66, `syncAll()`)
- current capacity: Process items sequentially one by one.
- Symptoms at limit: A single bad payload (e.g. throwing a server validation exception 400 Bad Request) triggers a loop `break` and halts the sync process. This permanently blocks all subsequent valid items in the queue from syncing.
- Scaling path: Introduce an error threshold or poison-pill queueing strategy where failed payloads are put aside after 3 retries, allowing other valid actions to proceed.

## Test Coverage Gaps

**Absence of Core API and Mobile Integration Tests:**
- What's not tested: Next.js pages, tRPC endpoints, database transactions, and Flutter widgets.
- Risk: Refactoring database models, roles permissions, or geofence pings can introduce regression bugs.
- Priority: High.
- Difficulty to test: Geolocation and background synchronizations require mocking native hardware bridges (Dio, Isar, Geolocator, and standard browsers).

---

*Concerns audit: 2026-05-17*
*Update as issues are fixed or new ones discovered*
