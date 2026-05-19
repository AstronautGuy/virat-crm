# Roadmap

## [v6: CRM & Bulk Operations](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v6-ROADMAP.md) (Shipped 2026-05-15)

## [v7: Advanced Intelligence & Scaling](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/.planning/milestones/v7-ROADMAP.md) (Shipped 2026-05-19)

## Milestone 8: Advanced Multi-Tenant Isolation & Live Alerts

- **Phase 32: Requirements, Discovery & Index Optimization**
  - [ ] **Task 32.1**: Establish query patterns and apply database-level compound indexing for high-frequency operations.
  - [ ] **Task 32.2**: Formulate the multi-tenant isolation boundary spec.

- **Phase 33: Multi-Tenant Hardening (tRPC & REST Gateways)**
  - [ ] **Task 33.1**: Build automated query filters on tRPC procedures for Sales, CRM, Products, and Inventory.
  - [ ] **Task 33.2**: Enforce the exact branch restrictions under `/api/rest/*` REST routes for mobile.
  - [ ] **Task 33.3**: Write backend integration tests for multi-tenant isolation.

- **Phase 34: Real-Time Low Stock Alerts & Background Triggers**
  - [ ] **Task 34.1**: Create `minThreshold` columns and stock level checks inside sales, transfer, and bulk mutations.
  - [ ] **Task 34.2**: Trigger automated notifications (DB inserts & Web Push alerts via Serwist VAPID).
  - [ ] **Task 34.3**: Design the premium UI alerts dashboard banner and analytics bell in the Web Portal.

- **Phase 35: Flutter Mobile Parity & Live Alerts Screen**
  - [ ] **Task 35.1**: Build the notification listener service mapping back to mobile alerts.
  - [ ] **Task 35.2**: Implement premium low-stock bell drawer inside the Flutter application.
  - [ ] **Task 35.3**: Verify strict branch isolation responses throw elegant lockout guards on mobile.

## Backlog

### Phase 999.1: Follow-up — Phase 21 incomplete plans (BACKLOG)

**Goal:** Resolve plans that ran without producing summaries during Phase 21 execution
**Source phase:** 21
**Deferred at:** 2026-05-14 during /gsd-next advancement to Phase 23
**Plans:**
- [ ] 21-PLAN: (ran, no SUMMARY.md)

### Phase 999.2: Follow-up — Phase 22 incomplete plans (BACKLOG)

**Goal:** Resolve plans that ran without producing summaries during Phase 22 execution
**Source phase:** 22
**Deferred at:** 2026-05-14 during /gsd-next advancement to Phase 23
**Plans:**
- [ ] 22-04-PLAN: (ran, no SUMMARY.md)
