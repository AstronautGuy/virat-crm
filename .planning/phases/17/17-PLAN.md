---
wave: 1
depends_on: []
files_modified:
  - .planning/phases/17/AUDIT-RESULTS.md
  - src/app/_components/auth/FeatureGate.tsx
  - src/server/api/trpc.ts
autonomous: true
requirements:
  - RBAC-VERIFY-001
  - PERF-AUDIT-001
  - SEC-HARDEN-001
---

# Plan: Milestone 4 Audit & Hardening

This plan covers the final audit of the RBAC system, performance checks for gated components, and security hardening of the feature gating middleware.

## Tasks

### 1. RBAC Verification Matrix [BLOCKING]
<task>
<read_first>
- .planning/phases/17/17-CONTEXT.md
- src/server/api/routers/permissions.ts
- src/server/db/schema/rolePermissions.ts
</read_first>
<action>
Create an `AUDIT-RESULTS.md` file in the phase directory. Document a verification matrix that lists every feature key (e.g., 'sales', 'reports', 'attendance', 'hierarchy') against every role (Admin, Manager, User). 
Manually verify (or simulate) access for each cell in the matrix and record the result (ALLOWED/BLOCKED).
</action>
<acceptance_criteria>
- .planning/phases/17/AUDIT-RESULTS.md exists.
- Matrix contains at least 12 verification points (4 roles x 3+ features).
- All results match the intended logic in the `permissions` router.
</acceptance_criteria>
</task>

### 2. Performance Audit: Gated Components
<task>
<read_first>
- src/app/_components/auth/FeatureGate.tsx
- src/app/_components/layout/DesktopSidebar.tsx
</read_first>
<action>
Analyze the `FeatureGate` component for potential performance bottlenecks. Ensure that it doesn't cause layout shift while checking permissions. 
Verify that `DesktopSidebar` uses the cached permissions from the TRPC query correctly without redundant re-renders.
</action>
<acceptance_criteria>
- FeatureGate has a stable loading state (e.g., Skeleton or null).
- Sidebar re-renders are minimized during navigation.
</acceptance_criteria>
</task>

### 3. Security Hardening: Middleware Stress Test
<task>
<read_first>
- src/server/api/trpc.ts
</read_first>
<action>
Review the `featureProtectedProcedure` logic. Ensure it correctly handles:
1. Missing `dbUser`.
2. Missing feature key in the permissions table (should default to blocked).
3. Database connection failures during permission checks.
Add explicit error logging for blocked attempts to facilitate future audits.
</action>
<acceptance_criteria>
- trpc.ts contains robust error handling for the feature middleware.
- Blocked attempts log the user ID and requested feature.
</acceptance_criteria>
</task>

### 4. UX Polish: Access Denied UI
<task>
<read_first>
- src/app/_components/auth/FeatureGate.tsx
</read_first>
<action>
Refine the fallback UI in `FeatureGate`. Instead of a simple "Access Denied" text, use a premium-looking card with:
- An icon (e.g., `ShieldAlert` from Lucide).
- A clear message: "This feature is not enabled for your current role."
- A "Back to Dashboard" button.
</action>
<acceptance_criteria>
- FeatureGate uses a styled fallback component.
- Fallback includes a navigation button back to the home page.
</acceptance_criteria>
</task>

## Verification
- [ ] AUDIT-RESULTS.md shows 100% compliance with intended RBAC rules.
- [ ] `pnpm exec tsc --noEmit` still passes.
- [ ] Manual walkthrough of a disabled feature shows the new premium "Access Denied" UI.
