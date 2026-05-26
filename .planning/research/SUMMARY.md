# Research Synthesis: Live Tracking & Location Reports

## 1. Stack Additions & Changes
- **Existing Mapping Engine**: The project currently uses `react-leaflet` with standard OpenStreetMap tiles (`src/app/_components/maps/LiveTeamMap.tsx`). We should continue using this to avoid rewriting existing UI components.
- **Geospatial Math**: We need `@turf/turf` (specifically `turf/distance` and `turf/boolean-point-in-polygon`) to calculate accurate mileage and detect when agents enter or leave specific client geofences.
- **Reporting UI**: The existing `recharts` stack can be used for graphing distance over time.

## 2. Target Features
- **Real-Time Team Map**: Existing baseline. Needs an auto-refresh poller (tRPC polling or WebSocket) and clustering for large teams.
- **Historical Route Playback**: Render `Polyline` paths with animation over time or a static slider to view paths for previous dates.
- **Mileage Reimbursement Reports**: Sum haversine distances between all valid breadcrumbs per day. Deduplicate points where the agent is stationary (speed < 1m/s) to prevent "GPS drift" from inflating the mileage.
- **Geofence Analytics**: Track time spent inside a polygon or radius around a customer's location to automatically log "Time on Site."

## 3. Architecture & Integration
- **TRPC Polling vs WebSockets**: Since the mobile app pings `/api/trpc/location.logBreadcrumb` periodically, standard HTTP polling (e.g. `refetchInterval: 10000`) on the Web client's map is sufficient and prevents the overhead of managing a WebSocket server on Vercel.
- **Cron Aggregation**: Mileage calculation on-the-fly for a whole month will be slow. We should calculate daily mileage at midnight (or dynamically trigger and cache) and store it in a `daily_reports` or `mileage_logs` table.

## 4. Pitfalls & Anti-Patterns
- **GPS Drift**: A stationary phone's GPS can bounce around, adding false distance. **Fix**: Ignore breadcrumbs where the distance from the last point is less than the accuracy radius, or speed is near 0.
- **DOM Overload**: Leaflet struggles with > 10,000 markers. **Fix**: If an agent's path has 1,000 points in a day, simplify the path (e.g., using Ramer-Douglas-Peucker algorithm or turf's `simplify`) before sending it to the client.
