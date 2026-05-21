# Phase 27: Flutter Discovery & API Architecture — Context

## Goal

Define the technical foundation for a Flutter-based mobile application that integrates with the existing Virat CRM backend, focusing on high availability (GPS/Internet) and user accessibility for non-technical field staff.

## Decisions

### 1. API Architecture: RESTful Bridge

- **Strategy**: We will use `trpc-openapi` to automatically expose existing tRPC routers as standard REST endpoints.
- **Reasoning**: This maintains "Single Source of Truth" in the backend while providing the Dart/Flutter environment with a standard, type-safe OpenAPI specification to consume.

### 2. Authentication: Persistent JWT

- **Mechanism**: JSON Web Tokens (JWT) using Bearer Auth.
- **Persistence**: Tokens will be stored in `flutter_secure_storage` to ensure the user stays logged in across app restarts.
- **Security**: Long-lived refresh tokens will be implemented to prevent session timeouts during field work.

### 3. UI Strategy: Accessibility & Simplicity

- **Design Language**: Simplified "Big Button" interface.
- **Principles**:
  - High contrast and large font sizes.
  - Minimalistic navigation (Tab bar with 3-4 primary actions).
  - Reduced visual clutter; priority on "One Action Per Screen" where possible.
- **Technical**: Use Flutter's `ThemeData` to lock in brand colors but avoid complex web-like animations that might confuse non-tech users.

### 4. Mandatory Connectivity & GPS Tracking

- **Connectivity**: The app will require a persistent internet connection. We will implement a `Connectivity` listener that blocks usage if the network is lost.
- **GPS Heartbeat**:
  - Location tracking must be enabled for the app to function.
  - **Admin Alert**: Implement a "Connection Monitor" service. If the app stops sending heartbeats (due to no internet or GPS being disabled), the server will trigger an alert to the Admin dashboard.
- **Technical**: Use `geolocator` and `connectivity_plus` plugins.

## Technical Constraints

- **State Management**: Provider or Riverpod (for simplicity and reliability).
- **Network Client**: Dio (with OpenAPI generated interceptors).

## Next Steps

- **Task 27.1**: Setup `trpc-openapi` in the Next.js backend and generate the initial `swagger.json`.
- **Task 27.2**: Create the mobile authentication router and JWT signing logic.
- **Task 27.3**: UI Wireframing for the "Big Button" dashboard.
