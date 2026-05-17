# External Integrations

**Analysis Date:** 2026-05-17

## APIs & External Services

**PWA Push Notifications:**
- **Web Push (VAPID)** - Transactional user notifications (attendance warnings, leave status, sales updates, etc.) sent via progressive web app (PWA) client service workers.
  - SDK/Client: `web-push` npm package on server; standard service worker Push API on browser.
  - Auth: VAPID keys loaded via `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` env vars.
  - Email endpoint identifier: `mailto:support@viratcrm.com`.

**Geolocation & Tracking:**
- **Geolocator (Mobile)** - Continuous acquisition of coordinates (latitude, longitude, accuracy) of field staff.
  - Integration: Core Geolocator Flutter plugin connecting to Android Location Services / iOS CoreLocation.
- **Leaflet & React-Leaflet (Web)** - Renders interactive maps showing employee live positions, breadcrumb trails, and branch markers.
  - Map tiles provider: OpenStreetMap standard tile server (no API key required).

**Mobile to Server API Bridge:**
- **OpenAPI / JSON-RPC** - Next.js server exposes RESTful HTTP endpoints generated automatically from tRPC routers using `trpc-to-openapi`.
  - SDK/Client: **Dio 5.4.3+1** HTTP client on Flutter, accessing endpoints like `/api/auth/login`, `/api/location/logs` etc.
  - Auth: JWT Bearer Token inside HTTP `Authorization` header.

## Data Storage

**Primary Database:**
- **PostgreSQL Database** - Stores users, roles, hierarchy relations, sales, inventory, daily reports, and location logs.
  - Connection: Connection pool established via `postgres` package using `DATABASE_URL` env var.
  - Client: **Drizzle ORM v0.41.0** executing typesafe queries, inserts, and database joins.
  - Migrations: Automated via Drizzle Kit, stored in `drizzle/` directory and run via `pnpm db:push` or `pnpm db:migrate`.

**File & Document Storage:**
- **Cloudflare R2 Storage** - S3-compatible object storage used to store documents, profile photos, and file attachments.
  - SDK/Client: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for client-side uploads.
  - Auth: Credentials loaded via `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` env vars.
  - Operations: Handles file uploads, down-streaming, and generation of secure presigned URLs with short-term expiry (implemented in `src/server/lib/r2.ts` and `src/server/api/routers/storage.ts`).

**Offline Local Storage:**
- **Isar Database (Mobile)** - High-performance offline-first local database to store products, customers, and pending synchronization queue items.
  - SDK/Client: `isar` & `isar_flutter_libs` Dart packages.
  - Generation: Isar collection schemas auto-generated using `build_runner` and `isar_generator`.
- **Shared Preferences (Mobile)** - Key-value pair storage used to persist lightweight settings, device cache, and current user auth tokens.
  - SDK/Client: `shared_preferences` Dart package.

## Authentication & Identity

**Custom employee credentials:**
- Implements custom session management using signed JWTs via **jose** library.
  - Verification: Next.js cookies middleware handles web authentication. Mobile app provides `Authorization: Bearer <JWT>` header, resolved by custom tRPC context.
  - Token Encryption: Signature key loaded via `AUTH_SECRET` environment variable (defaults to fallback secret in development).
  - Persistence: 7-day rolling expiry for Web clients; 30-day persistent expiry for Mobile application clients.

## Monitoring & Observability

**Process Logs:**
- Standard console stdout/stderr log streams.
- **Timing Middleware:** Every tRPC procedure call automatically prints execution latency in milliseconds to the console logs: `[TRPC] <path> took <n>ms to execute` (implemented in `src/server/api/trpc.ts`).

## Environment Configuration

**Development Environment:**
- Credentials and endpoints specified in local `.env` file (copied from `.env.example`).
- Mobile app connects to host server address loaded in `mobile/lib/core/config.dart`.
- Local PostgreSQL instance is utilized for database operations.

**Production Environment:**
- Host-level environment variables configured via hosting provider (e.g. Vercel dashboard or container parameters).
- Database hosted on a managed high-availability cloud PostgreSQL server.
- Web Push VAPID keys and R2 secrets kept in production secret vaults.

---

*Integration audit: 2026-05-17*
*Update when adding/removing external services*
