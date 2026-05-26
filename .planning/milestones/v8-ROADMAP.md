# Milestone v8: Advanced Multi-Tenant Isolation & Live Alerts

**Status:** ✅ SHIPPED 2026-05-26
**Phases:** 32-35
**Total Tasks:** 11

## Overview

Harden database isolation boundaries, implement live alerts, and prepare for multi-branch enterprise expansion.

## Phases

### Phase 32: Requirements, Discovery & Index Optimization

**Goal**: Establish query patterns and apply database-level compound indexing for high-frequency operations.

**Details:**
- [x] **Task 32.1**: Establish query patterns and apply database-level compound indexing for high-frequency operations.
- [x] **Task 32.2**: Formulate the multi-tenant isolation boundary spec.

### Phase 33: Multi-Tenant Hardening (tRPC & REST Gateways)

**Goal**: Build automated query filters on tRPC procedures for Sales, CRM, Products, and Inventory.

**Details:**
- [x] **Task 33.1**: Build automated query filters on tRPC procedures for Sales, CRM, Products, and Inventory.
- [x] **Task 33.2**: Enforce the exact branch restrictions under `/api/rest/*` REST routes for mobile.
- [x] **Task 33.3**: Write backend integration tests for multi-tenant isolation.

### Phase 34: Real-Time Low Stock Alerts & Background Triggers

**Goal**: Trigger automated notifications and create a UI banner.

**Details:**
- [x] **Task 34.1**: Create `minThreshold` columns and stock level checks inside sales, transfer, and bulk mutations.
- [x] **Task 34.2**: Trigger automated notifications (DB inserts & Web Push alerts via Serwist VAPID).
- [x] **Task 34.3**: Design the premium UI alerts dashboard banner and analytics bell in the Web Portal.

### Phase 35: Flutter Mobile Parity & Live Alerts Screen

**Goal**: Build the notification listener service mapping back to mobile alerts and verify strict branch isolation responses.

**Details:**
- [x] **Task 35.1**: Build the notification listener service mapping back to mobile alerts.
- [x] **Task 35.2**: Implement premium low-stock bell drawer inside the Flutter application.
- [x] **Task 35.3**: Verify strict branch isolation responses throw elegant lockout guards on mobile.

---

## Milestone Summary

**Key Decisions:**
- Decision: Replaced Flutter with React Native WebView wrapper for mobile app.
- Decision: Used expo-background-fetch for background alerts instead of full FCM setup.
- Decision: Global 403 redirects on query client instead of localized page errors.

**Issues Resolved:**
- Resolved missing mobile parity for live alerts.
- Fixed unconstrained queries missing branchId filters.

---

_For current project status, see .planning/ROADMAP.md_
