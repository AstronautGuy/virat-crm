# Phase 17 Context: Milestone 4 Audit & Hardening

## Goals

- **RBAC Verification**: Validate that all granular permissions are correctly enforced across UI and API.
- **Performance Hardening**: Ensure that the dynamic permission checks in the sidebar and middleware do not introduce noticeable latency.
- **Security Audit**: Stress-test the `featureProtectedProcedure` to ensure no role can bypass restrictions via direct API calls.
- **UX Consistency**: Final polish on Access Denied states and breadcrumb navigation.

## Initial Assessment

- **Scope**: Focus primarily on features introduced/modified in Milestone 4: Attendance Maps, Team Hierarchy, Advanced Reports, and the Feature Access Dashboard.
- **Assets**: We have the `FeatureGate` component and `featureProtectedProcedure` middleware as core building blocks.

## Decisions

1. **Audit Depth**: We will perform a full cross-reference audit between the `role_permissions` table and all gated components/routers.
2. **Performance Focus**: We will monitor tRPC procedure execution times for gated vs ungated procedures.
3. **Redirection**: Unauthorized attempts will show a consistent "Access Denied" UI with a clear "Request Access" or "Go Back" option.

## Canonical Refs

- [permissions.ts](file:///src/server/api/routers/permissions.ts)
- [FeatureGate.tsx](file:///src/app/_components/auth/FeatureGate.tsx)
- [trpc.ts](file:///src/server/api/trpc.ts)
- [rolePermissions.ts](file:///src/server/db/schema/rolePermissions.ts)
