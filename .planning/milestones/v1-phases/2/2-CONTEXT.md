# Phase 2: Database Schema & Core Entities - Context

**Status:** Ready for planning

<domain>
## Phase Boundary
Drizzle models, migrations, and database seeding for the core entities of the ERP system.
</domain>

<decisions>
## Implementation Decisions

### User Identity Mapping
- **Decision:** Strictly pre-provisioned via Admin UI (Manual Addition + Bulk CSV Upload).
- **Rationale:** Most secure for an internal ERP; employees are strictly managed by administrators, rather than self-registering.

### Entity Organization
- **Decision:** Split by domain (e.g., `src/server/db/schema/users.ts`, `schema/branches.ts`).
- **Rationale:** Maintains scalability and keeps code clean as the ERP grows.

### Database Seeding Strategy
- **Decision:** Static predefined branch/user sets.
- **Rationale:** Provides consistent test data, which is especially important to predictably test geofencing boundaries later.

### Deletion Strategy
- **Decision:** Soft deletes via `is_active` flag.
- **Rationale:** Preserves historical integrity for attendance and sales logs.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` — Core values and non-negotiables
- `.planning/ROADMAP.md` — Phase definitions
- `.planning/REQUIREMENTS.md` — Acceptance criteria

</canonical_refs>

<specifics>
## Specific Ideas
- The identity mapping will require setting up both a manual addition form and a bulk CSV upload flow for Admins on the frontend in a future UI phase, but the database schema should support this.
</specifics>

<deferred>
## Deferred Ideas
None
</deferred>
