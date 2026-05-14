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
- `[x]` Create `FeatureGate` component
- `[x]` Multi-Branch Inventory Logic & Schema
    - `[x]` Schema: Inventory, Transactions, Transfers
    - `[x]` Router: `inventory.ts` with atomic procedures
    - `[x]` Logic: Branch-isolated stock management
- `[x]` Inventory Management UI
    - `[x]` Page: `/inventory` Dashboard
    - `[x]` Page: `/inventory/transfers` Center
    - `[x]` Refactor all routers to use ctx.dbUser instead of Kinde lookups
- `[x]` Clean up remaining Kinde references in LiveMapPage
- `[x]` Delete legacy Kinde auth route
- `[x]` Update seed file with new auth credentials
- `[x]` Implement User Management dashboard for admins
- `[x]` Implement "Change Password" in Profile page
- `[x]` Deprecate kindeId in DB schema
- `[x]` Module Isolation & Security
    - `[x]` Feature gating for inventory
    - `[x]` Sidebar integration
- `[x]` Refinement & Verification
    - `[x]` Atomic transactions verification
    - `[x]` Type safety (tsc clean)
    - `[x]` Seed data update
    - `[x]` Remove `scratch` from `tsconfig.json`
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
