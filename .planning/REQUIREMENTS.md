# Milestone 2 Requirements: Analytics & Advanced Workflows

## 1. Analytics & Business Intelligence (BI)
- **Sales Dashboard**: Interactive charts (line/bar) showing sales trends over time, top-performing products, and branch-wise performance.
- **Workforce Dashboard**: Attendance rates, geofence breach frequency, and leave balance summaries.
- **CSV/Excel Export**: Ability to export filtered reports for external accounting.

## 2. Web Push Notifications
- **Status Alerts**: Notify agents when their sales/leaves are approved or rejected.
- **Geofence Alerts**: Notify managers of punch-ins outside the authorized radius (if policy requires).
- **Admin Broadcasts**: Send system-wide announcements to all active PWAs.

## 3. Advanced Offline Data Synchronization
- **Transaction Queue**: Save sales/attendance logs to IndexedDB when offline.
- **Auto-Sync**: Automatically push queued transactions when the network is restored.
- **Conflict Handling**: Handle scenarios where an offline transaction conflicts with server state (e.g., duplicate order numbers).

## 4. Real-time Maps
- **Staff Heatmap**: View last known locations of field staff (during active shift only) on a Mapbox/Leaflet interface.
- **Branch Coverage**: Visualize geographical distribution of sales activity.

## Non-Functional Requirements
- **Responsive Charts**: Analytics must be readable on mobile (portrait and landscape).
- **Battery Efficiency**: Push notifications should not significantly drain mobile battery.
- **Data Privacy**: Location tracking only active during official shift hours.
