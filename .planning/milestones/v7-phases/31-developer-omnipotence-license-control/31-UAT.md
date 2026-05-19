# User Acceptance Testing (UAT) — Phase 31

This document specifies the core verification steps and checklist items required to validate the Developer Role and anti-misuse safeguards in the Virat ERP system.

---

## 1. Sovereignty and Security Guards

| Target Check | Actions to Perform | Expected Result | Status |
|---|---|---|---|
| **Developer Undeletability** | Attempt to delete the Developer account using an Admin session. | API returns `FORBIDDEN` error. Operation rejected. | [ ] Pending |
| **Developer Unmodifiability** | Attempt to change the Developer user's role or details using an Admin account. | API returns `FORBIDDEN` block. Action rejected. | [ ] Pending |
| **Developer Privacy** | Attempt to view details of the Developer account from a Manager or Employee account. | Account details are fully hidden or action is blocked. | [ ] Pending |

---

## 2. Active User Cap Verification

| Target Check | Actions to Perform | Expected Result | Status |
|---|---|---|---|
| **Max Cap Constraint** | Set `maxUsers` constraint to `N` (where `N` equals the current active user count). Attempt to self-signup or create a user via Admin. | API returns `400 Bad Request` or custom descriptive message indicating user limit reached. Creation fails. | [ ] Pending |
| **Increase Cap Recovery** | Log in as Developer, increment `maxUsers` to `N + 5`, then attempt to create a user. | User is created successfully. | [ ] Pending |

---

## 3. Remote Suspension and Read-Only Freeze

| Target Check | Actions to Perform | Expected Result | Status |
|---|---|---|---|
| **System-wide Kill-switch** | Set `isSystemLocked` to `true` via Developer Portal. Refresh standard admin dashboard. | The screen is fully blocked by a dark modern overlay indicating "System Locked: Contact Developer". Standard API requests fail with 403. | [ ] Pending |
| **Bypass lock** | Refresh the Developer Dashboard while `isSystemLocked` is `true`. | The Developer can navigate, view settings, and untoggle the lock without hindrance. | [ ] Pending |
| **Read-only Freeze** | Set `isReadOnly` to `true`. Attempt to log attendance or create a new sale as a standard employee. | Operation is blocked with message: "System is under maintenance: mutations are currently suspended". | [ ] Pending |

---

## 4. Master Feature Gating

| Target Check | Actions to Perform | Expected Result | Status |
|---|---|---|---|
| **Global Feature Toggling** | Disable the `Sales` feature globally using the Developer Dashboard. | 1. The `Sales` navigation item disappears for Admins and Employees. <br> 2. Standard API routes for Sales throw `FORBIDDEN` even for `Admin` requests. | [ ] Pending |
