# Virat ERP

## What This Is

Virat ERP is an internal enterprise resource planning and workforce management system. It enables staff attendance tracking via GPS, sales transaction logging, leave management, and secure document storage for branch employees.

## Core Value

Secure, mobile-first operations management that ensures authenticated access and verifiably accurate location tracking for remote workforce punch-ins.

## Requirements

### Validated

- ✓ Manage employee profiles and hierarchy
- ✓ Track branch locations
- ✓ Log daily attendance and sales transactions
- ✓ Manage leave requests
- ✓ Upload and store staff documents
- ✓ Mobile-first PWA with bottom navigation
- ✓ Analytics & Business Intelligence dashboards (M2)
- ✓ Web Push Notifications for system alerts (M2)
- ✓ Advanced Offline Data Synchronization (M2)

### Active (Milestone 3: Field Intelligence & Advanced Reporting)

- [ ] Real-time Location Tracking (Breadcrumbs & Live Maps)
- [ ] Visual Team Hierarchy & Territory Mapping
- [ ] Advanced Automated Reporting (PDF/Excel scheduled reports)
- [ ] Performance Heatmaps (Sales vs. Location data)

### Out of Scope

- [LLM / AI Features] — Removed per explicit requirement.
- [Base44 SDK] — Entirely replaced by custom tRPC backend.
- [Client-Side Auth] — Replaced due to critical security vulnerability.

## Context

### Shipped Milestones
- **v1: Foundations**: Auth, DB, Geofencing, Storage, PWA.
- **v2: Intelligence**: Analytics, Push, Offline Sync, Hardening.

### Next Milestone: M3 (Field Intelligence & Advanced Reporting)
- Goal: Establish real-time field visibility, visual team mapping, and automated reporting engines.

## Constraints

- **Data Integrity**: Multi-branch consistency — Ensure inventory updates are atomic across locations.

## Mobile Compatibility (Native Wrapper Focus)

- **Map Interaction**: All mapping features must be fully touch-optimized with high hit-targets and smooth gestures.
- **Location Efficiency**: Periodic breadcrumbs must be battery-efficient and designed for WebView background execution limits.
- **File Handling**: PDF/Excel report generation and viewing must be designed to work reliably inside a native mobile wrapper (WebView).
- **Responsive Charts**: All analytics and heatmaps must use mobile-first responsive scaling (Recharts/Tremor).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Kinde Auth | Secure, modern RBAC replacement for local `ecode` login | Completed (Phase 1) |
| Server-Side Haversine | Prevent GPS spoofing and secure the punch-in flow | Completed (Phase 3) |
| Cloudflare R2 | S3-compatible replacement for managed Base44 uploads | Completed (Phase 5) |
| Serwist PWA | Modern Service Worker management for Next.js 15 | Completed (Phase 6) |
| Web Push (VAPID) | Native notifications for real-time workflow alerts | Completed (Phase 8) |
| IndexedDB Queue | Robust offline resilience for field agents | Completed (Phase 9) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-03 after Milestone 2 Completion*
