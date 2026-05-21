# Phase 11 Context: Real-time Location Intelligence

## Core Objective

Implement the technical foundation for periodic GPS tracking ("Breadcrumbs") and a live map interface for managers. This data must be collected efficiently to preserve mobile battery life and displayed with touch-optimized controls.

## Decisions

- **Tracking Mechanism**: Client-side `navigator.geolocation.watchPosition` or periodic `getCurrentPosition` (every 5-10 mins) when the user is "Checked-In".
- **Backend Storage**: `location_breadcrumbs` table (userId, lat, lng, accuracy, createdAt).
- **Map Library**: Leaflet or Google Maps (Touch-optimized).
- **Visibility**: Only "Checked-In" agents are tracked. Privacy first.

## Implementation Details

- **Sync**: Use the existing `offline-db.ts` to queue breadcrumbs if the network drops.
- **Hook**: `use-location-tracker.ts` to handle background updates.
- **Page**: `/admin/live-map` for managers.

## Success Criteria

- [ ] Breadcrumbs are saved to the database at specified intervals.
- [ ] Live map shows active team members with custom icons.
- [ ] Clicking a member shows their last 30 minutes of movement.
- [ ] Battery consumption remains minimal during tracking.
