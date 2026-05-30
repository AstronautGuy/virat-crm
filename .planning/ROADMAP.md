# Roadmap

## [v8: Advanced Multi-Tenant Isolation & Live Alerts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v8-ROADMAP.md) (Shipped 2026-05-26)
## [v9: Live Tracking & Location Reports](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v9-ROADMAP.md) (Shipped 2026-05-27)

## Milestone 10: UI Polish, Data Entry Enhancements & Sync Hardening

- **Phase 40: Expo Mobile App Location Sync Fixes**
  - Goal: Ensure Expo app reliably captures location data in foreground/background and fixes any timestamp sync drift against the backend.
  - Requirements: EXPO-01, EXPO-02

- **Phase 41: Route Playback & Reports Hardening**
  - Goal: Harden the live team map, optimize historical route playback to avoid jumps, and ensure reports bucket logs perfectly into requested time slabs.
  - Requirements: HARDEN-01, HARDEN-02, HARDEN-03

- **Phase 42: Global Codebase Hard-Code Audit**
  - Goal: Scan the entire Next.js and Expo project for any hard-coded strings, limits, and URLs, moving them to configuration enums or .env variables.
  - Requirements: REFACTOR-01

- **Phase 43: Reporting Verification & Export Testing**
  - Goal: Verify all reporting features, test CSV/PDF generation, and create sample exports in a temporary directory.
  - Requirements: REPORT-01

- **Phase 44: Inventory Page Polish**
  - Goal: Wire up the "Add Product" button, remove the "Transfer Stock" button, and add a "Price" column to the inventory view.
  - Requirements: INV-01, INV-02, INV-03

- **Phase 45: Sales Entry & Customer Selection Upgrades**
  - Goal: Introduce manual Order IDs and auto-incrementing Invoice IDs, and replace plain text customer inputs with a searchable dropdown and Add Customer modal.
  - Requirements: SALES-01, SALES-02, SALES-03, SALES-04

- **Phase 46: Sales Admin Hierarchies & Auto-Approval**
  - Goal: Allow Admins to explicitly assign sales entries to specific Employees and Managers, and auto-approve these entries.
  - Requirements: SALES-05, SALES-06

- **Phase 47: Live View Search**
  - Goal: Add a search bar to the Live View dashboard to allow quick pinning and filtering of employees by name or code.
  - Requirements: LIVE-01
