# Requirements: Virat ERP

**Defined:** 2026-04-27
**Core Value:** Secure, mobile-first operations management that ensures authenticated access and verifiably accurate location tracking for remote workforce punch-ins.

## v1 Requirements

### Authentication & Access

- [ ] **AUTH-01**: Implement Kinde Auth for employee login mapping `ecode` to username
- [ ] **AUTH-02**: Enforce strict server-side RBAC using tRPC middleware
- [ ] **AUTH-03**: Secure session management using HTTP-only cookies

### Core Entities & Database

- [ ] **DATA-01**: Implement Drizzle ORM schema for Employees, Branches, Attendance, Transactions, Leaves, Documents, Replacements, Vouchers, Ledgers, Announcements, SystemLogs
- [ ] **DATA-02**: Support relational constraints and cascading rules for the workforce hierarchy

### Workforce Operations

- [ ] **OPS-01**: Geofenced punch-in/out capturing GPS coordinates securely
- [ ] **OPS-02**: Server-side distance calculation (Haversine) from branch coordinates
- [ ] **OPS-03**: Employee leave management (request, approve/deny)
- [ ] **OPS-04**: Sales transaction logging and replacement workflows

### Secure Storage

- [ ] **STOR-01**: Cloudflare R2 integration via pre-signed S3 URLs
- [ ] **STOR-02**: Server-side enforcement of 5MB file upload limit
- [ ] **STOR-03**: Secure retrieval of staff documents

### Mobile Experience (PWA)

- [ ] **MOB-01**: Mobile-first Tailwind layouts with bottom navigation
- [ ] **MOB-02**: Minimum 44px hit targets and touch-friendly interactions
- [ ] **MOB-03**: PWA manifest and service worker configuration

## Out of Scope

| Feature | Reason |
|---------|--------|
| InvokeLLM | Explicitly removed from new architecture |
| Client-Side Geofencing | Security vulnerability |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| OPS-01 | Phase 3 | Pending |
| OPS-02 | Phase 3 | Pending |
| OPS-03 | Phase 4 | Pending |
| OPS-04 | Phase 4 | Pending |
| STOR-01 | Phase 5 | Pending |
| STOR-02 | Phase 5 | Pending |
| STOR-03 | Phase 5 | Pending |
| MOB-01 | Phase 6 | Pending |
| MOB-02 | Phase 6 | Pending |
| MOB-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-04-27 after initial definition*
