# Phase 15 Context: Dynamic Role-Based Access Control

## Goals
- **Granular Permissions**: Move from hardcoded role checks to a dynamic feature-access system.
- **Admin Management**: Create a UI for admins to toggle app features for specific roles.
- **Dynamic UI**: Ensure the sidebar and navigation adapt based on these dynamic permissions.

## Initial Assessment
- **Schema**: We need a `role_permissions` table that maps a `role` (Admin, Manager, User) to a `feature_id` (string) with an `isEnabled` (boolean) flag.
- **Feature Registry**: We need a list of all togglable features (e.g., `live-map`, `reports`, `attendance`, `documents`).
- **Middleware**: Our tRPC procedures and Next.js layouts should check this table.

## Decisions Needed
1.  **Feature Granularity**: Do we toggle entire modules (e.g., "Reports") or specific actions within them (e.g., "Export Reports")? (I suggest starting with modules).
2.  **Storage Strategy**: Should we cache these permissions in the user's session (Kinde) or fetch them from the DB on every request/page load? (DB fetch with React Query/tRPC caching is safer).
3.  **Default State**: What happens if a feature is not explicitly defined for a role? (Default to disabled).
