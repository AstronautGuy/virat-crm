---
status: resolved
trigger: "Flutter build errors in heartbeat_service and sync_repository"
created: 2026-05-15
updated: 2026-05-15
---

# Symptoms
- **Expected**: Successful flutter build.
- **Actual**: Compilation fails with "Member not found: 'balanced'" and "'Response' isn't a type".
- **Errors**:
    - `lib/services/heartbeat_service.dart:81:43: Error: Member not found: 'balanced'.`
    - `lib/data/repositories/sync_repository.dart:41:9: Error: 'Response' isn't a type.`

# Current Focus
- **Hypothesis**: `LocationAccuracy.balanced` is not a valid member in the current version, and `Response` type was missing an import.
- **Resolution**:
    - Changed `LocationAccuracy.balanced` to `LocationAccuracy.medium` in `heartbeat_service.dart`.
    - Added `import 'package:dio/dio.dart';` to `sync_repository.dart`.

# Evidence
- [2026-05-15 16:15] User reported build failure.
- [2026-05-15 16:16] Identified missing import in `sync_repository.dart` and enum mismatch in `heartbeat_service.dart`.
- [2026-05-15 16:17] Applied fixes.

# Eliminated
- None yet.
