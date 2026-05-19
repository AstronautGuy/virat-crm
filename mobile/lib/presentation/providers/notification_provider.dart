import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:virat_mobile/data/models/notification.dart';
import 'package:virat_mobile/presentation/providers/repository_provider.dart';

class NotificationsNotifier extends StateNotifier<AsyncValue<List<NotificationModel>>> {
  final Ref _ref;
  Timer? _timer;

  NotificationsNotifier(this._ref) : super(const AsyncValue.loading()) {
    fetchNotifications();
    // Periodically poll notifications every 30 seconds for live background alerting
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      fetchNotifications(isBackground: true);
    });
  }

  Future<void> fetchNotifications({bool isBackground = false}) async {
    if (!isBackground) {
      // Don't overwrite existing state with loading on background refresh to prevent flashing
      state = const AsyncValue.loading();
    }
    try {
      final repo = _ref.read(notificationRepositoryProvider);
      final list = await repo.fetchNotifications();
      state = AsyncValue.data(list);
    } catch (e, stack) {
      if (!isBackground) {
        state = AsyncValue.error(e, stack);
      }
    }
  }

  Future<void> markAsRead(int notificationId) async {
    final currentList = state.value ?? [];
    // Optimistic Update
    final updatedList = currentList.map((n) {
      if (n.id == notificationId) {
        return n.copyWith(isRead: true);
      }
      return n;
    }).toList();
    state = AsyncValue.data(updatedList);

    try {
      final repo = _ref.read(notificationRepositoryProvider);
      await repo.markAsRead(notificationId);
    } catch (e) {
      // Rollback on error
      fetchNotifications();
    }
  }

  Future<void> markAllAsRead() async {
    final currentList = state.value ?? [];
    // Optimistic Update
    final updatedList = currentList.map((n) => n.copyWith(isRead: true)).toList();
    state = AsyncValue.data(updatedList);

    try {
      final repo = _ref.read(notificationRepositoryProvider);
      await repo.markAllAsRead();
    } catch (e) {
      // Rollback on error
      fetchNotifications();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final notificationsStateProvider =
    StateNotifierProvider<NotificationsNotifier, AsyncValue<List<NotificationModel>>>((ref) {
  return NotificationsNotifier(ref);
});

final unreadNotificationsCountProvider = Provider<int>((ref) {
  final notificationsAsync = ref.watch(notificationsStateProvider);
  return notificationsAsync.maybeWhen(
    data: (list) => list.where((n) => !n.isRead).length,
    orElse: () => 0,
  );
});
