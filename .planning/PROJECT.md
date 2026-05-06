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
- ✓ Advanced Field Intelligence (M3)
- ✓ Dynamic RBAC & Feature Gating (M4)

### Active (Milestone 5: Inventory Orchestration & Operational Scaling)

- [ ] Multi-Branch Inventory Management (Stock tracking, transfers)
- [ ] Data Archival Engine (Trimming map data, yearly report summaries)
- [ ] Supply Chain Logic (Purchase orders, vendor tracking)

### Out of Scope
...
### Shipped Milestones
- **v1: Foundations**: Auth, DB, Geofencing, Storage, PWA.
- **v2: Intelligence**: Analytics, Push, Offline Sync, Hardening.
- **v3: Field Intelligence**: Location Tracking, Org Charts, Automated Reports.
- **v4: Access Control**: Dynamic RBAC, Feature Gating, Security Hardening.

### Next Milestone: M5 (Inventory Orchestration & Operational Scaling)
- Goal: Implement robust stock management across multiple branches and optimize long-term data retention for performance.

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
