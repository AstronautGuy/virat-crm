# Plan: Phase 25 — UI/UX Rework & Stitch MCP

**Status:** Ready for execution
**Created:** 2026-05-14

## Goal
Transform the Virat CRM into a premium, consistent, and robust enterprise application with a fixed light theme and modern typography.

## Context
The user requested a "Fixed Light Mode Only" experience and the integration of the Stitch MCP design system.

## Proposed Changes

### [25.1] Design System Initialization
- [ ] Initialize Stitch MCP design system with primary blue (#2563eb).
- [ ] Update `src/styles/globals.css` with the new design tokens.
- [ ] Force light mode in `src/app/layout.tsx`.

### [25.2] Layout & Typography
- [ ] Standardize typography on the Inter font family.
- [ ] Refine `DesktopSidebar` and `MobileHeader` components.

### [25.3] Component Skinning
- [ ] Apply the new theme to core dashboard and list views.
- [ ] Update forms and tables across the CRM.

## Verification
- [ ] `npm run build`
- [ ] Visual audit of all core pages.
