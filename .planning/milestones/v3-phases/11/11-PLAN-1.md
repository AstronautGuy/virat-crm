# Phase 11 Plan: Real-time Location Intelligence

## Overview
Enable real-time field visibility via background breadcrumbs and a mobile-friendly command center map.

## Wave 1: Breadcrumb Infrastructure (Agent Side)
- [x] **Task 1.1: Database Schema**
  - `<action>`: Create `src/server/db/schema/breadcrumbs.ts`.
  - `<acceptance_criteria>`: New table ready for location logs.
- [x] **Task 1.2: Location Tracker Hook**
  - `<action>`: Create `src/hooks/use-location-breadcrumbs.ts`. Logic to check if user is "Checked-In" and ping location every 5 mins.
  - `<acceptance_criteria>`: Browser logs coordinates periodically when active.

## Wave 2: Live Command Center (Manager Side)
- [x] **Task 2.1: Map Integration**
  - `<action>`: Set up Leaflet or similar in a new component `src/app/_components/maps/LiveTeamMap.tsx`.
  - `<acceptance_criteria>`: Map renders on mobile with smooth panning/zooming.
- [x] **Task 2.2: Live Data Feed**
  - `<action>`: Create tRPC procedure `location.getLiveTeam` to fetch the latest breadcrumb for all active subordinates.
  - `<acceptance_criteria>`: Map markers update in real-time or via polling.

## Wave 3: Historical Playback & Refinement
- [x] **Task 3.1: Route Playback**
  - `<action>`: Add a "Playback" mode to the map. Use a polyline to connect historical breadcrumbs for a selected agent/date.
  - `<acceptance_criteria>`: Managers can see the exact path taken by an agent.
- [x] **Task 3.2: Mobile Polish**
  - `<action>`: Optimize map marker clustering and touch targets for small screens.
  - `<acceptance_criteria>`: Map remains usable with 50+ markers on a phone.

## Verification Criteria
- [x] Manual test: Check-in -> Move 50m -> Wait 5 mins -> Verify breadcrumb in DB.
- [x] Manager view: Open Live Map -> See agent marker -> Click for route.
- [x] Verified on mobile viewport (DevTools & Browser).
