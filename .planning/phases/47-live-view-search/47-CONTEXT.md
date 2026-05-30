# Phase 47: Live View Search

## Domain
Live tracking dashboard (`/admin/live-map`) — enabling quick filtering of the employee list by name or employee code, which will correspondingly focus the map.

## Decisions

### 1. UI Placement & Behavior
- **Decision:** A simple search input field above the employee list in the `LiveMap` component. 
- **Rationale:** Straightforward client-side filtering of the already-fetched `activeUsers`.
- **Mechanism:** Add a `searchQuery` state. Filter the rendered employee list (which includes their name and employee code). Clicking an employee in the filtered list triggers the existing "pinning" logic to focus the map.

## Canonical Refs
- ROADMAP.md
- `.planning/PROJECT.md`
