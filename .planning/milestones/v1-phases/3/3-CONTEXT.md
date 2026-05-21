# Phase 3 Context: 24/7 Location Logging

## Domain Ambiguities Resolved

1. **Attendance vs Continuous Logging:** The user explicitly stated: _"i dont need attendence punchin but instead i need 24/7 location logs. no attendence system or punchin or active session at all."_ The traditional punch-in/punch-out concept has been completely removed from scope.
2. **Local Development Testing:** The user confirmed they need local development testing. We will build a mock location pinger to simulate GPS data.

## Architectural Constraints

- Standard PWAs cannot log location continuously in the background on mobile devices (iOS/Android). The app must be wrapped in a Native App (e.g., Capacitor, React Native) for true 24/7 background tracking. We are building the backend assuming this frontend capability will exist or be implemented.

## Key Decisions

- Drop `attendance` table and introduce `location_logs` table.
- Build a tRPC router specifically for location ping ingestion.
- Expose a `MockLocationPinger` component in development mode to simulate GPS movement for testing without a physical device.

## Status

- Discussed and documented. Waiting for implementation plan approval.
