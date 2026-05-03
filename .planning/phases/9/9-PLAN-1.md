# Phase 9 Plan: Advanced Offline Sync & Conflict Resolution

## Overview
Implement a local-first queue for CRM operations to support seamless offline work.

## Wave 1: Local Data Store (IndexedDB)
- `[ ]` **Task 1.1: IndexedDB Initialization**
  - `<action>`: Create `src/lib/offline-db.ts`. Define a schema with a `pending_ops` store (id, type, data, createdAt).
  - `<acceptance_criteria>`: Local DB is initialized and accessible via browser dev tools.
- `[ ]` **Task 1.2: Local Persistence Layer**
  - `<action>`: Implement `addToOfflineQueue`, `getOfflineQueue`, and `removeFromOfflineQueue` helpers.
  - `<acceptance_criteria>`: Data persists across page reloads in IndexedDB.

## Wave 2: Sync Manager & Background Flush
- `[ ]` **Task 2.1: The Sync Manager**
  - `<action>`: Create `src/lib/sync-manager.ts`. Logic to iterate through the offline queue and re-attempt tRPC calls using `fetch` or the tRPC proxy.
  - `<acceptance_criteria>`: Manager can successfully process a queued sale once online.
- `[ ]` **Task 2.2: Online/Offline Listeners**
  - `<action>`: Use `window.addEventListener('online', ...)` to trigger the Sync Manager.
  - `<acceptance_criteria>`: Recovering internet connection automatically starts the sync.

## Wave 3: UI Integration & Feedback
- `[ ]` **Task 3.1: Global Sync Indicator**
  - `<read_first>`: `src/app/_components/layout/DashboardLayout.tsx`
  - `<action>`: Add a subtle status bar or icon indicating "Offline" or "Syncing (N)...".
  - `<acceptance_criteria>`: User clearly sees their sync status.
- `[ ]` **Task 3.2: Error Handling & Retries**
  - `<action>`: Add exponential backoff for failed sync attempts. Mark "Poison Pill" operations (invalid data) so they don't block the queue.
  - `<acceptance_criteria>`: Robust error handling prevent sync loops.

## Verification Criteria
- [ ] Manual test: Create sale offline -> verify entry in IndexedDB -> go online -> verify sale in SQL DB.
- [ ] Multiple operations queued offline are processed in order.
- [ ] UI correctly reflects the number of pending items.
