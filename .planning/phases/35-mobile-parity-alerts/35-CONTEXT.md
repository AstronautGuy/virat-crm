---
phase: 35
title: "React Native Mobile Parity & Live Alerts Screen"
date: "2026-05-26"
---

# Phase 35 Context

## Domain
This phase focuses on bridging the real-time low stock alerts to the mobile app, and enforcing strict lockout mechanisms when a branch isolation violation occurs.

## Decisions Captured
### Mobile App Architecture Update
- **Decision:** The original Flutter application was replaced with a React Native (Expo) WebView wrapper. We must implement solutions tailored for this RN/Expo wrapper architecture, not Flutter.

### Background Sync & Notifications
- **Decision:** Instead of using native Firebase Cloud Messaging (FCM), we will use periodic background polling (e.g. `expo-background-fetch`) hitting a REST API to trigger local notifications (`expo-notifications`) in the React Native app. This avoids the overhead of Firebase setup while giving reliable periodic alerts.

### Mobile UI Presentation
- **Decision:** Because the app is a web wrapper, the low-stock bell drawer is rendered via the Next.js web application itself. This effectively means the UI requirement is fulfilled by Phase 34, so mobile just needs the native notification triggers to draw attention to it.

### Lockout Guards (403 Forbidden)
- **Decision:** For strict branch isolation, if a user hits a 403 error, they should be forcefully redirected to a "Select Branch" screen instead of just staying on the page with an error toast. We will implement this in the Next.js frontend (global TRPC error handling/interceptor) to ensure both web and WebView mobile users get forcefully redirected.

## Canonical Refs
- ROADMAP.md (Phase 35)

## Deferred Ideas
- None
