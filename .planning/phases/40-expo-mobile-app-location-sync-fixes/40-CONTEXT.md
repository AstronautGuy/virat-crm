# Phase 40: Expo Mobile App Location Sync Fixes - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Ensure the Expo app reliably captures location data in foreground/background and fixes any timestamp sync drift against the backend.
</domain>

<decisions>
## Implementation Decisions

### Background Execution Strategy
- **Decision:** Auto (Agent Discretion). Recommend using Expo TaskManager with `expo-location` properly configured for background updates to maintain the managed workflow.

### Time Sync Mechanism
- **Decision:** Auto (Agent Discretion). Recommend calculating server-offset on startup via an API call and applying it to local timestamps to ensure accuracy.

### Offline Drift & Batching
- **Decision:** Send batch every 10-15 minutes.
- **Additional Behavior:** If the location fails to update for more than 10 minutes (employee is "off the radar"), the app should automatically lock out.
- **Alerting:** Admin and the respective employee's manager must receive an alert on their portal when this lock-out occurs.
</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<specifics>
## Specific Ideas

- The app lockout mechanism should be visually clear to the employee that they must restore location services/connectivity to continue.
</specifics>

<deferred>
## Deferred Ideas

None
</deferred>

---

*Phase: 40-expo-mobile-app-location-sync-fixes*
*Context gathered: 2026-05-27 via gsd-discuss-phase*
