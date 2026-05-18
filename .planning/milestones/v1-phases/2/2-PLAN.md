---
status: approved
phase: 2
updated: 2026-04-27T16:11:00Z
---

# Phase 2 Plan: Database Schema & Core Entities

## Objective
Refactor the initial single-file database schema into a modular, domain-driven structure using Drizzle ORM and prepare the environment for geofencing and related core features.

## Proposed Architecture
- Move from `src/server/db/schema.ts` to `src/server/db/schema/` directory.
- Define core entities: `users`, `branches`, `attendance`, `sales`, and `leaves`.
- Add `isActive` boolean across entities for soft-delete.
- Add spatial fields (`latitude`, `longitude`, `radiusMeters`) to `branches` and `attendance` for upcoming server-side geofencing (Phase 3).
- Implement seeding via `tsx` script (`src/server/db/seed.ts`) and expose via `pnpm db:seed`.

## Implementation Steps
1. **Directory Setup**: Create `src/server/db/schema/` and an `index.ts` aggregator.
2. **Entity Creation**: Implement tables for each core domain ensuring they use the project prefix `virat-crm_`.
3. **Relationships**: Establish Drizzle relations between users, branches, and attendance/sales/leaves.
4. **Tooling & Scripts**: Add `tsx` as a dev dependency, write `seed.ts` to provision initial branches and administrative users, update `package.json` scripts (`db:push` and `db:seed`).
5. **Configuration**: Update `drizzle.config.ts` and `src/server/db/index.ts` to use the modular schema.
6. **Cleanup**: Remove legacy `src/server/db/schema.ts`.

## Verification Strategy
- Test the database push command: `pnpm db:push`.
- Test the database seed command: `pnpm db:seed`.
- Manually inspect database to verify columns, foreign keys, and soft-delete/spatial fields are present.
- Execute full UAT and document in `2-UAT.md`.
