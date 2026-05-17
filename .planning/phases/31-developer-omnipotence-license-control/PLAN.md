# Phase 31: Developer Omnipotence & License Control

## Objective
Establish a sovereign `"Developer"` role that enforces maximum active user limits, global application feature locks, read-only maintenance states, and a remote system kill-switch wrapper while remaining fully undeletable and unmodifiable by other users.

## Proposed Changes

### Database & Schema
* **[NEW] `src/server/db/schema/system_settings.ts`**: Database table to manage developer settings (e.g. `maxUsers`, `isSystemLocked`, `isReadOnly`, and globally disabled features).
* **`src/server/db/schema/roles.ts`**: Seed the sovereign `"Developer"` role into the roles table.

### Security Procedures & Gates
* **`src/server/api/trpc.ts`**:
  * Implement intermediate locks in TRPC query and mutation routes for system locking and read-only mode.
  * Update `featureProtectedProcedure` to allow the `"Developer"` role complete bypass, and enforce global disabled features blocking even for standard `"Admin"` users.

### User Management Overrides
* **`src/server/api/routers/users.ts`**:
  * Enforce maximum user count limit during signup (`signup`) and user creation (`createUser`).
  * Enforce non-deletability and non-modifiability guards for Developer accounts.
  * Add a system-level deletion capability for Developer accounts.

### Developer API Router
* **[NEW] `src/server/api/routers/developer.ts`**:
  * Expose developer controls for managing license options, kill-switches, read-only toggles, and account removals.

### Admin Web Frontend
* **[NEW] `src/app/admin/developer/page.tsx`**:
  * Create a high-fidelity dashboard containing active toggles for kill-switches, maximum user configurations, read-only locks, and feature restrictions.
* **`src/app/_components/layout/PageWrapper.tsx`**:
  * Show a gorgeous full-screen lock overlay if the system-lock state is active.

### Mobile Integration
* **`mobile/lib/presentation/guards/location_gate.dart`**:
  * Listen to global API response status. If the system reports locked status, overlay a persistent full-screen blockage.

## Verification Plan
1. **Developer Pre-check**: Verify standard `"Admin"` role cannot modify or delete `"Developer"` accounts.
2. **License Over-use**: Manually set `maxUsers` to current user count and confirm all future signups/creations are blocked.
3. **Suspension Trigger**: Activate system-wide suspension and verify all user operations immediately display the locked screen.
4. **Automated Validation**: Create tests in `tests/developer.test.ts` to assert role boundaries.
