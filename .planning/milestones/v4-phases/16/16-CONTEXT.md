# Phase 16 Context: Granular Feature Gating

## Goals
- **Enforcement**: Ensure that users cannot access features via direct URL or tRPC calls if they are disabled for their role.
- **Global Middleware/Layout Check**: Implement a centralized check to prevent unauthorized access to entire page routes.
- **tRPC Gating**: Add a reusable tRPC middleware that checks the `role_permissions` table before executing sensitive procedures.

## Initial Assessment
- **Page Level**: We can use a high-level wrapper or a `FeatureGate` component in `layout.tsx` to check permissions.
- **API Level**: We need a helper function in `trpc.ts` that takes a `featureKey` and throws a `FORBIDDEN` error if the feature is disabled for the current user's role.

## Decisions Needed
1.  **Redirection**: If a user hits a disabled page, should we show a "403 Forbidden" component or redirect them to the Dashboard? (I suggest a custom 403 page with an "Access Denied" message).
2.  **Breadcrumbs/Context**: Should we log these blocked attempts for security auditing?
