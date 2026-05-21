# Phase 28 Plan: Flutter Application Implementation

Initialize the Flutter companion app for Virat CRM, focusing on the "Big Button" UI, persistent tracking, and REST API integration.

## Proposed Changes

### [NEW] Flutter Project Structure

Create a new Flutter project in a `mobile/` directory within the root.

- **Framework**: Flutter (Stable)
- **State Management**: Riverpod
- **Networking**: Dio
- **Architecture**: Clean Architecture (Data/Domain/Presentation)

### 1. Initialization & Dependency Setup

#### [NEW] `mobile/pubspec.yaml`

- `flutter_riverpod`: State management.
- `geolocator`: Location fetching.
- `flutter_background_service`: Foreground service for Android.
- `dio`: HTTP client for REST bridge.
- `flutter_secure_storage`: Safe storage for JWT.
- `connectivity_plus`: Network status.
- `shared_preferences`: Simple persistent flags.

### 2. Core Services & Logic

#### [NEW] `mobile/lib/core/api_client.dart`

- Configure Dio with `baseUrl: https://your-crm-domain.com/api/rest`.
- Add `AuthInterceptor` to inject `Bearer` token.

#### [NEW] `mobile/lib/services/heartbeat_service.dart`

- Implement `flutter_background_service` callback.
- Send pulse to `/heartbeat/pulse` every 5 minutes.
- Handle "Connectivity Status" (Active/Inactive) based on `connectivity_plus`.

#### [NEW] `mobile/lib/guards/location_gate.dart`

- Wrapper widget that listens to `Geolocator.getServiceStatusStream()`.
- If GPS is OFF, render `GpsRequiredScreen`.

### 3. "Big Button" UI Implementation

#### [NEW] `mobile/lib/presentation/theme/app_theme.dart`

- High-contrast colors (Navy/Orange/White).
- `ElevatedButtonTheme` with `minimumSize: Size(double.infinity, 80)`.

#### [NEW] `mobile/lib/presentation/screens/login_screen.dart`

- Simple input for Employee Code and Password.
- Large "LOGIN" button.

#### [NEW] `mobile/lib/presentation/screens/dashboard_screen.dart`

- Grid of 4 big buttons: "NEW SALE", "CUSTOMERS", "ATTENDANCE", "SYNC".
- Status indicator: "📡 TRACKING ACTIVE".

### 4. CRM Workflows

#### [NEW] `mobile/lib/presentation/screens/new_sale_screen.dart`

- Simplified form for selecting product and entering quantity.
- Graceful offline: Save to local `Isar` DB if internet is down.

## Verification Plan

### Automated Tests

- Unit tests for `AuthRepository` and `HeartbeatService` logic.
- Widget tests for "Big Button" dimensions.

### Manual Verification

- **Auth**: Login with employee code and verify 30-day persistence.
- **GPS Gate**: Disable GPS on device and confirm UI locks.
- **Heartbeat**: Monitor server logs (or DB) for heartbeat updates every 5 minutes.
- **Offline**: Turn off Wi-Fi, submit a sale, and verify it syncs when Wi-Fi is restored.
- **Admin Alert**: Stop the heartbeat for 20 minutes and confirm the Admin Dashboard shows a notification.
