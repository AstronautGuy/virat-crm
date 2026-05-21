# Phase 8 Context: Advanced Offline Sync & Conflict Resolution

## Core Objective

Ensure the CRM is fully functional in low-connectivity environments (e.g., rural field visits). Agents must be able to create sales and replacement requests offline, with automatic background synchronization once they regain internet access.

## Decisions

- **Storage**: IndexedDB for persistent local storage of "Pending" operations.
- **Sync Logic**:
  - Intercept failed tRPC mutations (when offline).
  - Save operation to IndexedDB.
  - Periodic background check (or `navigator.onLine` event) to flush the queue.
- **Conflict Strategy**:
  - Sales: Sequential processing (queue based).
  - Replacements: Queue based.
  - Conflict resolution is minimal for now (last-write-wins at the queue level).

## Implementation Details

- **Local DB**: `src/lib/offline-db.ts` (Lightweight IndexedDB wrapper).
- **Sync Hook**: `src/hooks/use-offline-sync.ts`.
- **UI Components**: `OfflineBanner` and `SyncIndicator`.

## Success Criteria

- [ ] Sale created while Airplane Mode is ON is saved locally.
- [ ] UI shows "1 Pending Sync" indicator.
- [ ] Disabling Airplane Mode triggers automatic background upload.
- [ ] Notification received once the sync completes successfully.
