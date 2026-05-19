# Phase 32 Plan: Requirements, Discovery & Index Optimization

## Tasks

- [ ] **Task 32.1**: Add `(branchId, createdAt)` compound index in `sales.ts`.
- [ ] **Task 32.2**: Add `(userId, createdAt)` compound index in `breadcrumbs.ts`.
- [ ] **Task 32.3**: Formulate multi-tenant isolation boundaries in `milestone8-architecture.md`.
- [ ] **Task 32.4**: Run Drizzle migrations generation and verify project compilation.

## Verification

*   Generate migrations: `pnpm db:generate`
*   Typecheck: `pnpm typecheck`
