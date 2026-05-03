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
- ✓ Upload and store staff documents (Phase 5)
- ✓ Mobile-first PWA with bottom navigation (Phase 6)

### Active (Milestone 2)

- [ ] Analytics & Business Intelligence dashboards
- [ ] Web Push Notifications for system alerts
- [ ] Advanced Offline Data Synchronization
- [ ] Real-time workforce location heatmaps

### Out of Scope

- [LLM / AI Features] — Removed per explicit requirement.
- [Base44 SDK] — Entirely replaced by custom tRPC backend.
- [Client-Side Auth] — Replaced due to critical security vulnerability.

## Context

### Shipped Milestones
- **v1: Foundations**: Auth, DB, Geofencing, Storage, PWA.
- **v2: Intelligence**: Analytics, Push, Offline Sync, Hardening.

### Next Milestone: M3 (Operations Expansion)
- Goal: Deepen inventory and financial workflows.

## Constraints

- **Tech Stack**: Next.js App Router, Tailwind v4, Drizzle ORM, tRPC, Kinde Auth, Cloudflare R2, **Tremor/Recharts** (for analytics).
- **Security**: Server-side verification — Geofencing and roles must be validated securely on the backend.
- **Data Integrity**: Conflict resolution for offline sync — Ensure transactions are merged correctly when connectivity returns.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Kinde Auth | Secure, modern RBAC replacement for local `ecode` login | Completed (Phase 1) |
| Server-Side Haversine | Prevent GPS spoofing and secure the punch-in flow | Completed (Phase 3) |
| Cloudflare R2 | S3-compatible replacement for managed Base44 uploads | Completed (Phase 5) |
| Serwist PWA | Modern Service Worker management for Next.js 15 | Completed (Phase 6) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-03 after Milestone 1 Completion*
