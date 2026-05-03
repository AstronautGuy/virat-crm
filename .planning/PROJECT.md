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

### Active

- [ ] Mobile-first PWA configuration

### Out of Scope

- [LLM / AI Features] — Removed per explicit requirement.
- [Base44 SDK] — Entirely replaced by custom tRPC backend.
- [Client-Side Auth] — Replaced due to critical security vulnerability.

## Context

The system is migrating from a hosted Base44 BaaS environment to a self-hosted T3 Stack. The legacy system suffered from critical security anti-patterns (client-side role gating, `localStorage` auth, client-side geofencing), which must be corrected. The new frontend must provide a native-like mobile PWA experience with touch-friendly navigation.

## Constraints

- **Tech Stack**: Next.js App Router, Tailwind v4, Drizzle ORM, tRPC, Kinde Auth, Cloudflare R2 — Mandated stack for the rewrite.
- **Security**: Server-side verification — Geofencing and roles must be validated securely on the backend, never trusted from the client.
- **Mobile First**: Minimum 44px hit targets, bottom navigation, no hover reliance — To support on-the-go workforce operations.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Kinde Auth | Secure, modern RBAC replacement for local `ecode` login | Completed (Phase 1) |
| Server-Side Haversine | Prevent GPS spoofing and secure the punch-in flow | Completed (Phase 3) |
| Cloudflare R2 | S3-compatible, cost-effective replacement for managed Base44 uploads | Completed (Phase 5) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-27 after initialization*
