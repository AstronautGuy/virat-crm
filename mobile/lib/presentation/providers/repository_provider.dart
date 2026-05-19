import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:virat_mobile/core/api_client.dart';
import 'package:virat_mobile/data/models/sync_item.dart';
import 'package:virat_mobile/data/models/product.dart';
import 'package:virat_mobile/data/repositories/auth_repository.dart';
import 'package:virat_mobile/data/repositories/crm_repository.dart';
import 'package:virat_mobile/data/repositories/sync_repository.dart';
import 'package:virat_mobile/data/repositories/notification_repository.dart';

final apiClientProvider = Provider((ref) => ApiClient());

final isarProvider = FutureProvider<Isar>((ref) async {
  final dir = await getApplicationDocumentsDirectory();
  final existing = Isar.getInstance();
  if (existing != null) return existing;
  return Isar.open(
    [SyncItemSchema, ProductSchema],
    directory: dir.path,
  );
});

final authRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(apiClient);
});

final crmRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CrmRepository(apiClient);
});

final notificationRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return NotificationRepository(apiClient);
});

final syncRepositoryProvider = FutureProvider<SyncRepository>((ref) async {
  final isar = await ref.watch(isarProvider.future);
  final apiClient = ref.watch(apiClientProvider);
  return SyncRepository(isar, apiClient);
});

final pendingSyncCountProvider = StreamProvider<int>((ref) {
  final syncRepoFuture = ref.watch(syncRepositoryProvider.future);
  return Stream.fromFuture(syncRepoFuture)
      .asyncExpand((repo) => repo.watchPendingCount());
});


