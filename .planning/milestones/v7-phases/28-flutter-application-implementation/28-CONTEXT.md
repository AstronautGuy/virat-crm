# Phase 28 Context: Flutter Application Implementation

## Strategic Decisions

- **State Management**: **Riverpod** (Auto-selected). Chosen for its robust provider-based architecture and ease of handling background streams.
- **Background Location**: Use **Geolocator** + **Workmanager** (Free tier). Architecture must be abstracted (Repository Pattern) to allow seamless switching to a paid background geolocation plugin in the future.
- **Enforcement Policy**:
  - **No Location/GPS**: **STRICT**. If the device fails to provide valid coordinates, the app must lock the UI and prevent all CRM/Sales actions.
  - **No Internet**: **GRACEFUL**. The app should show a warning but allow navigation/drafting. Sync will resume once online.
- **Monitoring Threshold**: Admin notifications should trigger after **3 missed heartbeats** (approx. 15-20 minutes of inactivity).
- **Admin Alerts**: Last known location is NOT required in the notification message.

## Implementation Details

- **Project Structure**: Standard Flutter project with clean architecture (data/domain/presentation).
- **Network**: Use `dio` for REST API consumption with a custom interceptor for Bearer token injection.
- **Local Storage**: `flutter_secure_storage` for credentials; `isar` or `sqflite` for graceful offline data queuing.
- **UI**: High-contrast, large buttons (min 80px height). Consistent with Virat CRM brand colors.

## Success Criteria

- [ ] Flutter app successfully authenticates via `/auth/login`.
- [ ] Heartbeats sent every 5 minutes (Background/Foreground).
- [ ] UI locks when GPS is disabled.
- [ ] Admins receive "User Disconnected" alerts on the Web Dashboard after 20 mins of silence.
