# Virat ERP

## What This Is

Virat ERP is an internal enterprise resource planning and workforce management system. It enables staff attendance tracking via GPS, sales transaction logging, leave management, and secure document storage for branch employees.

## Core Value

Secure, mobile-first operations management that ensures authenticated access and verifiably accurate location tracking for remote workforce punch-ins.

## Requirements

### Validated

- ✓ Manage employee profiles and hierarchy (M1)
- ✓ Track branch locations (M1)
- ✓ Log daily attendance and sales transactions (M1)
- ✓ Manage leave requests (M1)
- ✓ Upload and store staff documents (M1)
- ✓ Mobile-first PWA with bottom navigation (M2)
- ✓ Advanced Field Intelligence (M3)
- ✓ Dynamic RBAC & Feature Gating (M4)
- ✓ Inventory Orchestration & Operational Scaling (M5)
- ✓ CRM Master & Manager Editing (M6)
- ✓ Bulk Operations Utility (M6)
- ✓ Soft Modernism UI/UX Rework (M6)
- ✓ Advanced Predictive Analytics & Mathematical Forecasting (M7)
- ✓ Offline Sync & Isar DB Replication (M7)
- ✓ Sovereign Overrides & Developer License Controls (M7)
- ✓ Location-Gated Fleet Tracking & Background Interceptors (M7)

### Active (Milestone 10: Planning)

- [ ] Expo App Background/Foreground Sync (Perfect location tracking sync from Expo app to backend)
- [ ] Time Sync Fix (Resolve previous time synchronization issues ensuring accurate timestamps)
- [ ] Hardened Live Location & Routes (Maximum reliability, bug fixes, and robust historical route playback)
- [ ] Verified Reports (Accurate historical reports with specific time slab location logs)
- [ ] Global Codebase Audit (Scan the entire project for hard-coded values and correct them)

### Out of Scope

- Automated Email/SMS marketing (Deferred to M8).
- Global credit limit enforcement (Order-wise tracking preferred).

### Shipped Milestones

- **v1: Foundations**: Auth, DB, Geofencing, Storage, PWA.
- **v2: Intelligence**: Analytics, Push, Offline Sync, Hardening.
- **v3: Field Intelligence**: Location Tracking, Org Charts, Automated Reports.
- **v4: Access Control**: Dynamic RBAC, Feature Gating, Security Hardening.
- **v5: Inventory**: Multi-branch stock transfers, atomic transactions, archival.
- **v6: CRM & Bulk**: Customer master, Manager RBAC, Excel utilities, Soft Modernism UI.
- **v7: Advanced Intelligence**: Predictive modeling, Isar sync database queue, sovereign locks & licensing controls.
- **v8: Advanced Multi-Tenant Isolation & Live Alerts**: Hardened DB boundaries, strict branch isolation, live VAPID alerts & mobile background sync.
- **v9: Live Tracking & Location Reports**: Robust real-time tracking, historical routes, mileage reimbursement reports, and geofence analytics for field agents.

### Next Milestone: M10 (Expo App Sync, Hardening & Global Refactoring)

- Goal: Ensure the Expo mobile app perfectly syncs location data in both foreground and background without time discrepancies, while hardening live location/reports and performing a global audit to eliminate hard-coded values.

## Constraints

- **Data Integrity**: Multi-branch consistency — Ensure inventory updates are atomic across locations.
- **Feature Parity**: **STRICT**. Every feature change in the website must be implemented in the mobile app and vice versa to ensure operational consistency for both office and field staff.
- **Admin Control**: **STRICT**. Every single feature (Sales, Customers, Attendance, etc.) must be toggleable by the Admin for each and every role. No feature should be accessible if disabled in the `rolePermissions` table.

## Mobile Compatibility (Native Wrapper Focus)

- **Map Interaction**: All mapping features must be fully touch-optimized with high hit-targets and smooth gestures.
- **Location Efficiency**: Periodic breadcrumbs must be battery-efficient and designed for WebView background execution limits.
- **File Handling**: PDF/Excel report generation and viewing must be designed to work reliably inside a native mobile wrapper (WebView).
- **Responsive Charts**: All analytics and heatmaps must use mobile-first responsive scaling (Recharts/Tremor).

## Key Decisions

| Decision              | Rationale                                               | Outcome             |
| --------------------- | ------------------------------------------------------- | ------------------- |
| Kinde Auth            | Secure, modern RBAC replacement for local `ecode` login | Completed (Phase 1) |
| Server-Side Haversine | Prevent GPS spoofing and secure the punch-in flow       | Completed (Phase 3) |
| Cloudflare R2         | S3-compatible replacement for managed Base44 uploads    | Completed (Phase 5) |
| Serwist PWA           | Modern Service Worker management for Next.js 15         | Completed (Phase 6) |
| Web Push (VAPID)      | Native notifications for real-time workflow alerts      | Completed (Phase 8) |
| IndexedDB Queue       | Robust offline resilience for field agents              | Completed (Phase 9) |
| Turf.js & Map clustering | Offline GPS math & robust DOM clustering for Maps    | Completed (M9)      |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---

_Last updated: 2026-05-27 after Milestone 9 Completion_
