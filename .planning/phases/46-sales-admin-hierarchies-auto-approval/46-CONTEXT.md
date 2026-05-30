# Phase 46: Sales Admin Hierarchies & Auto-Approval

## Domain
Sales workflow for Admins — assigning multi-employee credits, tagging managers, and automatically approving the entries upon creation.

## Decisions

### 1. Multi-Employee Assignment
- **Decision:** Support multiple Employees and multiple Managers per sale. 
- **Rationale:** The business model requires splitting credit or attributing a single invoice to multiple field agents.
- **Mechanism:** `saleAssignments` junction table maps one sale to infinite users.

### 2. Auto-Approval for Admins
- **Decision:** Any sale entered directly by an Admin is inserted with the status `Approved`.
- **Rationale:** Admins are trusted entities; their entries don't need a secondary Manager review process.
- **Mechanism:** Explicit role check in the TRPC `createSale` endpoint.

### 3. Report Crediting
- **Decision:** Each tagged `Employee` receives equal and full credit for the invoice in their Analytics dashboard.
- **Rationale:** Requested by the user to treat all tagged employees equally.

## Canonical Refs
- ROADMAP.md
- `.planning/PROJECT.md`
