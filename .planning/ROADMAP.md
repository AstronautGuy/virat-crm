# Roadmap

## [v8: Advanced Multi-Tenant Isolation & Live Alerts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v8-ROADMAP.md) (Shipped 2026-05-26)

## Milestone 9: Live Tracking & Location Reports

- **Phase 36: Geospatial Core & Mileage Analytics**
  - [ ] **Task 36.1**: Add `@turf/turf` and implement distance calculation with GPS drift filtering.
  - [ ] **Task 36.2**: Build cron/background task to aggregate daily agent breadcrumbs into a `daily_mileage` total.

- **Phase 37: Geofence Analytics & Time on Site**
  - [ ] **Task 37.1**: Implement point-in-polygon checks for agent locations against customer branch geofences.
  - [ ] **Task 37.2**: Automatically log "Time on Site" for agents visiting customer locations.

- **Phase 38: Live Team Map & Route Playback UI**
  - [ ] **Task 38.1**: Upgrade `LiveTeamMap.tsx` with optimized auto-refreshing markers and clustering.
  - [ ] **Task 38.2**: Implement `turf/simplify` for historical route playback to avoid DOM overload.

- **Phase 39: Mileage Reimbursement Reports**
  - [ ] **Task 39.1**: Create a new frontend report view for mileage tracking.
  - [ ] **Task 39.2**: Allow managers to export mileage logs by date range for reimbursement processing.
