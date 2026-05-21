# Phase 27: Flutter Discovery & API Architecture — Plan

## Overview

This phase establishes the communication bridge between the Virat CRM web backend and the upcoming Flutter mobile application. It focuses on exposing a secure REST/OpenAPI layer and defining the "Mandatory Connectivity" architecture.

## Proposed Changes

### 1. Backend: OpenAPI Bridge

We will expose the existing tRPC logic as REST endpoints for Flutter consumption.

#### [MODIFY] [trpc.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/trpc.ts)

- Add `OpenApiMeta` type to tRPC initialization.

#### [NEW] [route.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/api/rest/[...trpc]/route.ts)

- Implement `createOpenApiNextHandler` to serve REST requests at `/api/rest/*`.

#### [MODIFY] [crm.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/crm.ts)

- Add `openapi` metadata to core procedures (`getBranchCustomers`, `createCustomer`).

### 2. Backend: Mandatory Connectivity Monitor

Implementing the "Heartbeat" system to track active field staff.

#### [NEW] [heartbeat.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/heartbeat.ts)

- Create `updateHeartbeat` procedure that accepts:
  - `location`: `{ lat, lng }`
  - `connectivity`: `string` (e.g., "WiFi", "4G", "Offline")
- Update a `user_status` or `heartbeats` table with `lastActiveAt`.

#### [NEW] [monitoring-service.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/services/monitoring.ts)

- Background task (or logic triggered by admin dashboard) to identify users who haven't sent a heartbeat in >5 minutes.

### 3. Mobile: Architecture & UI Spec

Defining the Flutter side (Mockups and Auth flow).

#### [NEW] [MOBILE-SPEC.md](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/phases/27-flutter-discovery-api-architecture/MOBILE-SPEC.md)

- Define the "Big Button" UI requirements.
- Define the `flutter_background_geolocation` configuration.
- Define the JWT storage strategy using `flutter_secure_storage`.

## Verification Plan

### Automated Tests

- **REST Integration**: Run `curl` commands against `/api/rest/crm.getBranchCustomers` with Bearer token to verify output matches tRPC output.
- **Heartbeat Logic**: Simulate a missing heartbeat and verify the monitoring service flags the user.

### Manual Verification

- Generate the `swagger.json` and verify it imports correctly into an API client (Postman/Insomnia).
- Review UI wireframes for "Big Button" accessibility.

## Open Questions

- **Push Notifications**: Should we integrate Firebase (FCM) now for the "Admin Alert" to be sent as a push notification to the Admin's phone, or just a web dashboard alert?
- **Sync Interval**: Is a 1-minute GPS heartbeat acceptable for battery life, or should we use 5 minutes?
