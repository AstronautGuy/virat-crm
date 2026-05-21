---
status: complete
phase: 2
source: [walkthrough.md]
started: 2026-04-27T16:06:00Z
updated: 2026-04-27T16:06:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test

expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass

### 2. Schema Applied via Push

expected: Running `pnpm run db:push` applies the changes to the Neon database without any errors or missing relation warnings.
result: pass

### 3. Database Seeding

expected: Running `npx tsx --env-file=.env src/server/db/seed.ts` inserts 2 branches and 2 users, outputting the counts to the console and completing with exit code 0.
result: pass

### 4. Geofencing & Soft Delete Fields Present

expected: Opening Drizzle Studio (`pnpm run db:studio`) shows the `virat-crm_branch` table with `latitude`, `longitude`, and `radius_meters`, and the `virat-crm_user` table with `is_active` boolean field.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0

## Gaps
