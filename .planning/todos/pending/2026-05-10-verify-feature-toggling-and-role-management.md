---
created: 2026-05-10T16:25:14+05:30
title: Verify Feature Toggling and Role Management
area: auth
files:
  - src/server/api/routers/permissions.ts
  - src/server/db/schema/rolePermissions.ts
  - src/app/_components/layout/DesktopSidebar.tsx
---

## Problem

The current RBAC system needs verification to ensure that every feature implemented (CRM, Inventory, Sales, etc.) can be independently toggled by an Admin for any role (Admin, Manager, Employee). Additionally, the Admin should have the capability to create new roles and define their specific feature access sets, which is currently not fully implemented or verified in the UI/backend.

## Solution

1. Audit `permissionsRouter` to ensure it supports arbitrary feature keys and roles.
2. Verify that `featureProtectedProcedure` correctly handles missing or disabled permission records.
3. Implement/Verify a UI in the Admin panel to:
   - List all available feature keys.
   - Toggle features for existing roles.
   - Add new custom roles to the system.
4. Test the "fail-closed" policy for new roles with no assigned permissions.
