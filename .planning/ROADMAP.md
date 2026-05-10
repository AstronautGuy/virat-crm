# Roadmap: Virat ERP

## Completed Milestones
- **[x] v1: Modernization & Security Rewrite**
- **[x] v2: Intelligence & Advanced Workflows**
- **[x] v3: Field Intelligence & Advanced Reporting**
- **[x] v4: Advanced Access Control & UX Refinement**
- **[x] v5: Inventory Orchestration & Operational Scaling**

## Milestone 6: CRM & Bulk Operations

- **Phase 21: CRM Foundation & RBAC**
  - **Goal**: Establish the customer database with strict manager-only editing rights.
  - **Requirements**: CRM-01, CRM-02, CRM-03
  - **Success Criteria**:
    - Managers can create/edit customers; Field staff can only view.
    - Global search for customers by Name/Phone is fast and isolated by branch.

- **Phase 22: Interaction Logging & Credit Tracking**
  - **Goal**: Enable field staff to log customer visits and track financial credit limits.
  - **Requirements**: CRM-04, CRM-05
  - **Success Criteria**:
    - Users can log calls/visits against any customer record.
    - Customer balance updates correctly when credit is extended/settled.

- **Phase 23: Bulk Data Export Utility**
  - **Goal**: Implement a robust Excel/CSV export engine for high-level auditing.
  - **Requirements**: BULK-01, BULK-02, BULK-04
  - **Success Criteria**:
    - Admin can download full inventory and sales reports in .xlsx format.
    - Exports respect branch-isolation and date filtering.

- **Phase 24: Bulk Product Import & Audit**
  - **Goal**: Streamline product catalog management and finalize the milestone.
  - **Requirements**: BULK-03
  - **Success Criteria**:
    - Admin can bulk-update 500+ products via a single Excel upload.
    - Milestone 6 Audit passes (RBAC, Privacy, and Data Integrity).
