---
wave: 1
depends_on: []
files_modified:
  - src/server/api/trpc.ts
  - src/server/api/routers/sales.ts
  - src/server/api/routers/crm.ts
  - src/server/api/routers/inventory.ts
  - src/app/api/rest/sales/route.ts
  - tests/integration/multi-tenant.test.ts
autonomous: true
---

# Phase 33: Multi-Tenant Hardening (tRPC & REST Gateways)

## Objective
Enforce strict multi-tenant (branch-based) isolation across all tRPC and REST API boundaries, ensuring standard users and managers can only access data belonging to their assigned branch.

## Tasks

<task>
  <id>33.1</id>
  <title>Refactor and Verify `enforceBranchIsolation` helper in tRPC Context</title>
  <read_first>
    - src/server/api/trpc.ts
    - src/server/db/schema/users.ts
  </read_first>
  <action>
    Verify that the `enforceBranchIsolation` function exists in `src/server/api/trpc.ts` and behaves correctly. Ensure it returns the user's `branchId` for standard roles, and optionally allows `targetBranchId` bypasses only for 'Admin' and 'Developer' roles. If needed, refine the type signatures to match the expected DB schema for `users`.
  </action>
  <acceptance_criteria>
    - `src/server/api/trpc.ts` contains `export function enforceBranchIsolation`
    - The helper throws a `TRPCError` with code `FORBIDDEN` if a standard user tries to query a branch they don't belong to.
  </acceptance_criteria>
</task>

<task>
  <id>33.2</id>
  <title>Apply Branch Isolation Checks to tRPC Routers</title>
  <read_first>
    - src/server/api/trpc.ts
    - src/server/api/routers/sales.ts
    - src/server/api/routers/crm.ts
    - src/server/api/routers/inventory.ts
  </read_first>
  <action>
    Inject the `enforceBranchIsolation` helper into all data-fetching and mutation procedures within the `sales`, `crm`, and `inventory` tRPC routers.
    For queries and mutations, extract `ctx.dbUser` and enforce that `eq(table.branchId, branchId)` is appended to all Drizzle ORM `where` clauses when the user is not a super-admin.
  </action>
  <acceptance_criteria>
    - `src/server/api/routers/sales.ts` calls `enforceBranchIsolation(ctx)` in all procedures.
    - `src/server/api/routers/crm.ts` calls `enforceBranchIsolation(ctx)` in all procedures.
    - `src/server/api/routers/inventory.ts` calls `enforceBranchIsolation(ctx)` in all procedures.
    - Drizzle queries explicitly filter by `branchId` using `eq(...)`.
  </acceptance_criteria>
</task>

<task>
  <id>33.3</id>
  <title>Enforce Branch Restrictions in REST Routes</title>
  <read_first>
    - src/server/api/trpc.ts
    - src/app/api/rest/sales/route.ts (to be created)
  </read_first>
  <action>
    Create Next.js Route Handlers (`src/app/api/rest/sales/route.ts` as an example entry point) intended for the mobile application.
    Implement a middleware-like check inside the GET/POST handlers to retrieve the user's session (using `getSessionFromHeaders`) and strictly enforce that any requested data is locked to the user's `branchId`.
  </action>
  <acceptance_criteria>
    - `src/app/api/rest/sales/route.ts` is created and handles GET requests.
    - The REST handler returns a 403 status code if `branchId` does not match the user's branch (or if the user lacks a branch).
  </acceptance_criteria>
</task>

<task>
  <id>33.4</id>
  <title>Write Integration Tests for Multi-Tenant Isolation</title>
  <read_first>
    - src/server/api/trpc.ts
    - tests/validation.test.ts
    - tests/integration/multi-tenant.test.ts (to be created)
  </read_first>
  <action>
    Create a new test file `tests/integration/multi-tenant.test.ts`.
    Write tests that simulate tRPC caller contexts for (a) a Developer, (b) an Admin, (c) a standard User with a specific `branchId`.
    Assert that the standard user throws a `FORBIDDEN` TRPCError when attempting to pass a different `targetBranchId` to `enforceBranchIsolation`.
  </action>
  <acceptance_criteria>
    - `tests/integration/multi-tenant.test.ts` is created.
    - The test file contains cases asserting TRPCError throws for unauthorized branch access.
  </acceptance_criteria>
</task>

## Verification
- Run `pnpm typecheck` to ensure no TypeScript errors were introduced in the routers.
- Run `pnpm lint` to verify code quality.
- Execute the newly created integration tests and verify they pass.

## Must Haves
- The `enforceBranchIsolation` logic must be actively invoked across `sales`, `crm`, and `inventory` routers.
- The system must prevent cross-branch data access for non-admin users.
