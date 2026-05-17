# Architecture

**Analysis Date:** 2026-05-17

## Pattern Overview

**Overall:** Decoupled Monorepo with Full-Stack Next.js Monolith & Flutter Offline-First Mobile Client

**Key Characteristics:**
- **Layered Architecture:** Decoupled levels for routing/endpoints, business services, database ORM, and client representations.
- **End-to-End Typesafety:** Types shared between backend schemas, tRPC API routers, and web pages.
- **Offline-First Synchronization:** The mobile application uses local Isar database queuing to preserve operations when network is absent, syncing to the server automatically.
- **Real-Time Foreground Geolocation:** Background geolocation service pushes coordinate updates (pulses) every 2 minutes.

## Layers

### 1. Web & Server Components

**Database Schema Layer:**
- Purpose: Defines relational models, columns, tables, database constraints, and relations.
- Contains: Schemas (`src/server/db/schema/*.ts`) like `users.ts`, `sales.ts`, `branches.ts` using `pgTableCreator` to apply custom `virat-crm_` prefixes.
- Used by: API routers, database migration scripts, seeders.

**API Router Layer (tRPC):**
- Purpose: End-to-end type-safe API endpoints that validate parameters and verify permissions.
- Contains: Sub-routers (`src/server/api/routers/*.ts`) aggregated in `src/server/api/root.ts`.
- Depends on: Drizzle database schemas, Zod validation models, and authorization managers.
- Used by: Next.js Client components, and mobile clients via `trpc-to-openapi` REST proxies.

**Application Presentation (Next.js):**
- Purpose: Provides user interface screens, forms, data grids, layouts, and charts.
- Contains: File-based routing pages (`src/app/*`) combined with shared visual UI elements (`src/components/ui/*`).

### 2. Mobile Application (Flutter)

**Data Models Layer:**
- Purpose: Defines physical storage layout for offline persistence inside Isar DB.
- Contains: Collections (`mobile/lib/data/models/*.dart`) like `product.dart` and `sync_item.dart` generated via `build_runner`.

**Repository Layer:**
- Purpose: Encapsulates remote network requests and offline queuing operations.
- Contains: Repositories (`mobile/lib/data/repositories/*.dart`) like `sync_repository.dart`, `crm_repository.dart`, and `auth_repository.dart`.
- Depends on: Isar collections database and `Dio` API client.

**Presentation Layer (Riverpod):**
- Purpose: Visual layout and state management.
- Contains: Screens (`mobile/lib/presentation/screens/*.dart`), Riverpod providers (`mobile/lib/presentation/providers/*.dart`), and interceptors (`mobile/lib/presentation/guards/location_gate.dart`).

## Data Flow

### 1. Web Client Request
1. User interacts with a React component (e.g. creating a sales proposal).
2. The component calls a tRPC mutation: `trpc.sales.create.useMutation()`.
3. The tRPC context extracts the session from HTTP cookies, resolving the authenticated `dbUser`.
4. Role permissions and feature gates verify access: `featureProtectedProcedure` checks if the feature is toggled on.
5. The procedure validates parameters via Zod schemas, executes queries on the database, logs timing, and returns a JSON response.

### 2. Mobile Offline Operations & Sync
1. Sales personnel initiate a sale or propose a customer while offline.
2. The UI calls `SyncRepository.queueAction('createSale', data)`.
3. The repository compiles a `SyncItem` record and saves it locally in the Isar database (`isar.syncItems.put`).
4. A network monitor (`Connectivity().onConnectivityChanged`) tracks connection availability.
5. When connectivity is restored (or when a background periodic pulse runs), `SyncRepository.syncAll()` runs:
   - Fetches un-synced items ordered by creation time: `sortByCreatedAt()`.
   - Posts payloads to REST endpoints: `/crm/sales` or `/crm/propose` via `Dio` client.
   - If successful, sets `isSynced = true`. If it fails, records the server error in the item and halts to maintain transaction ordering.

### 3. Background Geolocation Pulse
1. Flutter host starts the foreground service: `initializeService()`.
2. Registers native channels (`AndroidNotificationChannel`) to preserve active foreground state.
3. Every 2 minutes, a scheduled `Timer` triggers:
   - Obtains coordinate positions using the `Geolocator`.
   - Fetches network status (WiFi/Cellular/Offline).
   - Reads the secure JSON Web Token (JWT) from `FlutterSecureStorage`.
   - Fires an HTTP POST request to `/heartbeat/pulse` containing properties `lat`, `lng`, and `status`.
   - Triggers background queue synchronization.

## Key Abstractions

**tRPC Context (`src/server/api/trpc.ts`):**
- Extracts credentials from cookies or authorization headers.
- Attaches the active `db` client, `session` parameters, and detailed `dbUser` record to all endpoint procedures.

**Feature Protected Procedures:**
- Extends authenticated base routes by verifying feature keys against DB roles (`rolePermissions`).
- Restricts actions dynamically based on feature status without changing endpoint code.

**Isar Collections & Code Generation:**
- Local schema entities compiled from Dart models.
- Provides fluent query interfaces (e.g. `isar.syncItems.filter().isSyncedEqualTo(false)`) for offline caching.

## Entry Points

**Web Monolith Entry:**
- Location: `src/app/page.tsx` & `src/app/layout.tsx`.
- Purpose: Initializes root styles, fonts, service providers, service workers, and landing pages.

**Mobile App Entry:**
- Location: `mobile/lib/main.dart` -> `main()`.
- Purpose: Mounts Widgets bindings, starts the background services, and runs `MyApp` under a Riverpod `ProviderScope`.

**Background Service Entry:**
- Location: `mobile/lib/services/heartbeat_service.dart` -> `onStart()`.
- Purpose: Low-level native thread entry point for geotracking and sync loops, utilizing `@pragma('vm:entry-point')`.

## Error Handling

- **Server-Side:** Custom errors thrown via `TRPCError` with descriptive codes (`UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`). Inputs validated first at the network boundary by Zod schemas, returning structured validation errors.
- **Mobile Local Queue:** Errors returned by the server during sync are written to `item.error`. Queue processing is paused immediately on failure to prevent subsequent actions from completing out-of-order.

---

*Architecture analysis: 2026-05-17*
*Update when major patterns change*
