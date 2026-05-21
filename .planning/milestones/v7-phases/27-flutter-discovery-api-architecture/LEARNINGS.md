# Phase 27 Learnings: Flutter Discovery & API Architecture

## Decisions

- **REST Adapter Selection**: Adopted `trpc-to-openapi` (community fork) over the "official" `@trpc/openapi` package because the latter is currently limited to generation only, whereas `trpc-to-openapi` provides the necessary Fetch adapter for Next.js App Router.
- **Auth Strategy**: Decided on 30-day persistent JWTs for mobile to balance security with user convenience for field staff.
- **Notification Strategy**: Implemented "Dual-Delivery" (Web Push + DB Notifications) to ensure admins receive alerts regardless of whether they have a browser push subscription active.

## Lessons Learned

- **Heartbeat Drift**: The website's geolocation interval (5 mins) was shorter than the initial 10-minute mobile proposal; synchronized to 5 mins to ensure uniform monitoring across platforms.
- **Next.js 15 Fetch Adapters**: Using `createOpenApiFetchHandler` is the most robust way to handle OpenAPI requests in Next.js App Router route handlers.

## Patterns Discovered

- **Monitoring Catch-all**: A dedicated `/api/monitoring/check` endpoint triggered by an external cron is a reliable way to handle inactivity timeouts in a serverless/stateless environment.

## Surprises

- **Official Package Limitations**: The `@trpc/openapi` package's lack of a server-side adapter was unexpected given the "official" branding; required a quick pivot to `trpc-to-openapi`.
