---
phase: 22
slug: daily-reports-order-balance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value            |
| ---------------------- | ---------------- |
| **Framework**          | Vitest           |
| **Config file**        | vitest.config.ts |
| **Quick run command**  | `npm test`       |
| **Full suite command** | `npm test`       |
| **Estimated runtime**  | ~10 seconds      |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type   | Automated Command      | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | --------------- | ----------- | ---------------------- | ----------- | ---------- |
| 22-01-01 | 01   | 1    | TASK-22.2   | —          | N/A             | schema      | `npx drizzle-kit push` | ❌ W0       | ⬜ pending |
| 22-01-02 | 01   | 2    | TASK-22.1   | —          | N/A             | schema      | `npx drizzle-kit push` | ✅          | ⬜ pending |
| 22-01-03 | 01   | 3    | TASK-22.3   | —          | N/A             | integration | `npm test`             | ❌ W0       | ⬜ pending |
| 22-01-04 | 01   | 4    | TASK-22.4   | —          | N/A             | integration | `npm test`             | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `src/server/db/schema/daily_reports.ts` — new schema file
- [ ] `src/server/api/routers/reports.ts` — new router file

---

## Manual-Only Verifications

| Behavior            | Requirement | Why Manual    | Test Instructions                                                |
| ------------------- | ----------- | ------------- | ---------------------------------------------------------------- |
| Sidebar visibility  | UI-GATE     | Layout change | Check DesktopSidebar and MobileNav for "Daily Reports" link.     |
| Customer Tagging UX | TASK-22.3   | Interactive   | In the Daily Report form, search for a customer and select them. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
