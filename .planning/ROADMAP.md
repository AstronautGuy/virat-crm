# Roadmap

## [v8: Advanced Multi-Tenant Isolation & Live Alerts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v8-ROADMAP.md) (Shipped 2026-05-26)
## [v9: Live Tracking & Location Reports](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v9-ROADMAP.md) (Shipped 2026-05-27)

## Milestone 10: Expo App Sync, Hardening & Global Refactoring

- **Phase 40: Expo Mobile App Location Sync Fixes**
  - Goal: Ensure Expo app reliably captures location data in foreground/background and fixes any timestamp sync drift against the backend.
  - Requirements: EXPO-01, EXPO-02

- **Phase 41: Route Playback & Reports Hardening**
  - Goal: Harden the live team map, optimize historical route playback to avoid jumps, and ensure reports bucket logs perfectly into requested time slabs.
  - Requirements: HARDEN-01, HARDEN-02, HARDEN-03

- **Phase 42: Global Codebase Hard-Code Audit**
  - Goal: Scan the entire Next.js and Expo project for any hard-coded strings, limits, and URLs, moving them to configuration enums or .env variables.
  - Requirements: REFACTOR-01
