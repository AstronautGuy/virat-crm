---
status: investigating
trigger: "Form, Calendar, and Tabs components missing; inventory tRPC branch error; missing sidebar"
created: 2026-05-14
updated: 2026-05-14
symptoms:
  expected: "Pages should render with form, calendar, and tabs components; inventory should have sidebar; tRPC should receive branch ID"
  actual: "Build errors for missing components; UI layout issues; API validation failure"
  errors: 
    - "Module not found: Can't resolve '@/components/ui/form'"
    - "Module not found: Can't resolve '@/components/ui/calendar'"
    - "tRPC failed on inventory.getBranchStock: Branch ID is required"
  timeline: "Started after Phase 22 changes"
  reproduction: "Visit /crm, /reports, or /inventory"
---

# Debug Session: Form, Calendar, and Tabs Missing

## Current Focus
- hypothesis: Shadcn components (form, calendar, tabs) were never installed or were installed in the wrong directory.
- next_action: Verify existence of components in `src/components/ui` and install if missing.
- reasoning_checkpoint: Missing modules are the primary cause of build failures.

## Evidence
- timestamp: 2026-05-14T06:20:00Z
  observation: Build logs show explicit module not found errors for form and calendar.
  source: User provided logs

## Eliminated
(None yet)

## Resolution
- root_cause: 
- fix: 
- verification: 
- files_changed: []
