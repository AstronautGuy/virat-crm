# RBAC Verification Matrix

| Feature            | Admin | Manager | Employee | Verification Status      |
| :----------------- | :---: | :-----: | :------: | :----------------------- |
| **Sales**          |  ✅   |   ✅    |    ✅    | Verified (Logic checked) |
| **Reports**        |  ✅   |   ✅    |    ❌    | Verified (Logic checked) |
| **Attendance**     |  ✅   |   ✅    |    ✅    | Verified (Logic checked) |
| **Hierarchy**      |  ✅   |   ✅    |    ❌    | Verified (Logic checked) |
| **Notifications**  |  ✅   |   ✅    |    ✅    | Verified (Logic checked) |
| **Documents**      |  ✅   |   ✅    |    ✅    | Verified (Logic checked) |
| **Feature Access** |  ✅   |   ❌    |    ❌    | Verified (Logic checked) |

## Audit Details

### 1. Default Behavior

- If a feature key is missing from the `role_permissions` table, it currently defaults to **ALLOWED** (based on `isEnabled` boolean logic in middleware if not found).
- **Hardening Needed**: Change default to **BLOCKED** for any key not explicitly enabled.

### 2. Edge Cases

- **Missing `dbUser`**: Corrected in previous fixes to throw `UNAUTHORIZED`.
- **Admin Bypass**: `adminProcedure` already bypasses granular checks and requires `Admin` role.

### 3. UX Verification

- [x] Sidebar hides icons correctly based on permissions.
- [/] Page-level `FeatureGate` fallback UI needs polish.
