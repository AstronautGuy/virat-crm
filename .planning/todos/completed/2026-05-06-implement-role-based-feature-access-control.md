---
created: 2026-05-06T12:33:00Z
title: Implement Role-Based Feature Access Control
area: auth
files:
  - src/app/_components/layout/DesktopSidebar.tsx
  - src/server/api/trpc.ts
  - src/server/db/schema/index.ts
---

## Problem

Currently, feature visibility and access control (e.g., sidebar links, tRPC procedures) are hardcoded based on the user's role (Admin, Manager, or standard user). The administrator needs the ability to dynamically enable or disable specific features of the application for any specific role through a centralized management interface. This requires moving from static role-based checks to a dynamic feature-flagging or granular permission system.

## Solution

1.  **Database Schema**: Introduce a `role_features` table to store the mapping between roles and enabled features.
2.  **Feature Registry**: Define a central list of features/modules that can be toggled.
3.  **Admin UI**: Create a management dashboard where admins can select a role and toggle access to each module (e.g., "Live Field View", "Intelligence Reports", "Leave Management").
4.  **Middleware/Hook Integration**: Refactor the `DesktopSidebar` and tRPC procedures to check this dynamic configuration instead of relying on hardcoded `isAdmin` or `isManager` checks.
