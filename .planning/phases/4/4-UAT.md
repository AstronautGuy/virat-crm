---
status: testing
phase: 04-transactions
source: 4-VALIDATION.md, 4-SECURITY.md
started: 2026-04-28T19:46:00Z
updated: 2026-05-01T23:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 5
name: Pincode Validation
expected: |
  Entering a valid 6-digit Indian PIN code (e.g., 110001) is accepted. Invalid pincodes (e.g., 5 digits, alphanumeric) are rejected with a validation error.
awaiting: user response

## Tests

### 1. Hierarchical Data Filtering (Managers)
expected: A Manager can see sales and data for their own team and sub-teams, but cannot see data from parallel teams.
result: pass

### 2. Data Isolation (Employees)
expected: An Employee can only see their own sales and data. They cannot view data of other employees.
result: pass

### 3. Sales Status Update (RBAC)
expected: An Admin or direct/recursive Manager can update the status of a sale. Employees cannot update sales statuses.
result: issue
reported: "i can update the status when i am the manager but if i am not it throws an internal error. it shall show a prompt or something"
severity: major

### 4. Replacement Creation (IDOR)
expected: An Employee can only create a replacement request for a sale that they own. Attempting to create a replacement for another user's sale is blocked.
result: issue
reported: "everyone is able to create replacement for any ones sale"
severity: blocker

### 5. Pincode Validation
expected: Entering a valid 6-digit Indian PIN code (e.g., 110001) is accepted. Invalid pincodes (e.g., 5 digits, alphanumeric) are rejected with a validation error.
result: [pending]

## Summary

total: 5
passed: 2
issues: 2
pending: 1
skipped: 0

## Gaps

- truth: "An Admin or direct/recursive Manager can update the status of a sale. Employees cannot update sales statuses."
  status: failed
  reason: "User reported: i can update the status when i am the manager but if i am not it throws an internal error. it shall show a prompt or something"
  severity: major
  test: 3
  artifacts: []
  missing: []

- truth: "An Employee can only create a replacement request for a sale that they own. Attempting to create a replacement for another user's sale is blocked."
  status: failed
  reason: "User reported: everyone is able to create replacement for any ones sale"
  severity: blocker
  test: 4
  artifacts: []
  missing: []

