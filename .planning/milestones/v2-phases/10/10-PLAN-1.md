# Phase 10 Plan: Project Hardening & Final Audit

## Overview

Stabilize the codebase and perform final security/performance checks before production.

## Wave 1: Stability & Error Handling

- `[ ]` **Task 1.1: Global Error Boundary**
  - `<action>`: Create `src/app/_components/error-boundary.tsx`. Wrap the root layout or dashboard content.
  - `<acceptance_criteria>`: Simulated crash in a component shows a friendly recovery UI instead of a blank screen.
- `[ ]` **Task 1.2: Loading States & UX Polish**
  - `<action>`: Audit all pages for missing skeleton loaders.
  - `<acceptance_criteria>`: No "content jumps" during data fetching.

## Wave 2: Security & Performance Audit

- `[ ]` **Task 2.1: tRPC RBAC Audit**
  - `<action>`: Review `sales`, `replacements`, `analytics`, and `leaves` routers. Ensure `managerProcedure` or recursive SQL checks are consistently applied.
  - `<acceptance_criteria>`: Field agents cannot view or modify data outside their subordinates/own scope.
- `[ ]` **Task 2.2: Performance Tweaks**
  - `<action>`: Use `useMemo` for heavy dashboard aggregations if necessary. Ensure `public/sw.js` is correctly cached.
  - `<acceptance_criteria>`: Dashboard interactivity remains high under simulated load.

## Wave 3: Final Handover & Docs

- `[ ]` **Task 3.1: Documentation Update**
  - `<action>`: Update `USER-GUIDE.md` (or create it) with instructions on:
    - How to enable Push Notifications.
    - How Offline mode works.
    - Exporting analytics reports.
  - `<acceptance_criteria>`: A non-technical user can follow the guide.
- `[ ]` **Task 3.2: Code Cleanup**
  - `<action>`: Remove `src/app/api/debug/sync` and other test routes. Remove redundant console logs.
  - `<acceptance_criteria>`: Clean build logs and network tab.

## Verification Criteria

- [ ] Role-based access verified for Admin, Manager, and Field Agent.
- [ ] Offline sync stress-tested (10+ items).
- [ ] Production build succeeds with `npm run build`.
