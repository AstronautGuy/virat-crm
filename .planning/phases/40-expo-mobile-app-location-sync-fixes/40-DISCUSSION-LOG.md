# Phase 40: Expo Mobile App Location Sync Fixes - Discussion Log

**Gathered:** 2026-05-27

### Background Execution Strategy
- **Options presented:** Expo TaskManager vs Native Modules vs Config Plugin
- **Selected:** Auto
- **Notes:** The agent will choose the best approach, which is likely configuring `expo-location` and `TaskManager` to work optimally without ejecting.

### Time Sync Mechanism
- **Options presented:** API server-offset vs NTP library vs Server timestamps
- **Selected:** Auto
- **Notes:** The agent will implement server-offset calculation on startup.

### Offline Drift & Batching
- **Options presented:** Sync immediately vs Fixed intervals vs Aggressive retry
- **Selected:** send every 10-15 mins but if the location is not passing for more than 10 mins i mean if the employee is off the radar, the app should lock out and the admin and that employees respective manager shoulkd get an alert on their portal.
- **Notes:** Need to implement a 10-15 min batching interval, with a strict 10-minute lockout rule if location tracking fails, which sends an alert to Admin and the Manager.

---
*This log is for human reference and audit purposes. Downstream agents consume CONTEXT.md.*
