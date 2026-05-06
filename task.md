# Milestone 4: Advanced Access Control & UX Refinement

## Phase 15: Dynamic Role-Based Access Control
- `[x]` Create `rolePermissions` table in schema
- `[x]` Implement `permissions` tRPC router
- `[x]` Develop Admin UI at `/admin/feature-access`
- `[x]` Refactor `DesktopSidebar` to use dynamic permissions
- `[x]` Verify role-based toggling (Manager/Admin/User)
- `[x]` Phase 15 Summary & Audit

## Phase 16: Granular Feature Gating
- `[x]` Implement `featureProtectedProcedure` in tRPC
- `[x]` Create `FeatureGate` component for page-level blocking
- `[x]` Fix TypeScript compilation errors in tRPC routers
    - `[x]` Consolidate duplicate imports in `sales.ts`
    - `[x]` Standardize `ctx.dbUser` usage with null safety
    - `[x]` Fix `DateRangePreset` type imports
    - `[x]` Resolve `leaves.ts` schema and enum mismatches
    - `[x]` Exclude `scratch` from `tsconfig.json`
- `[x]` Verify clean build with `tsc --noEmit`
- `[x]` Wrap sensitive routes (Maps, Reports, etc.) with `FeatureGate`
- `[x]` Apply `featureProtectedProcedure` to existing routers
- `[x]` Verify hard-blocking for disabled features
- `[x]` Phase 16 Summary & Audit

## Phase 17: Milestone 4 Audit & Hardening
- `[x]` Create RBAC Verification Matrix in `.planning/phases/17/AUDIT-RESULTS.md`
- `[x]` Harden `featureProtectedProcedure` (Fail-Closed Policy)
- `[x]` Add security logging for forbidden access attempts
- `[x]` Polish `FeatureGate` fallback UI with premium aesthetics
- `[x]` Verify build integrity with `tsc --noEmit`
- `[x]` Finalize Milestone 4 Walkthrough
