import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:virat_mobile/data/repositories/auth_repository.dart';
import 'package:virat_mobile/presentation/providers/repository_provider.dart';

final permissionsProvider = StateProvider<Map<String, bool>>((ref) => {});

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<void>>((ref) {
  return AuthNotifier(ref.watch(authRepositoryProvider), ref);
});

class AuthNotifier extends StateNotifier<AsyncValue<void>> {
  final AuthRepository _repository;
  final Ref _ref;

  AuthNotifier(this._repository, this._ref) : super(const AsyncValue.data(null)) {
    _loadPermissions();
  }

  Future<void> _loadPermissions() async {
    final perms = await _repository.getPermissions();
    _ref.read(permissionsProvider.notifier).state = perms;
  }

  Future<void> login(String employeeCode, String password) async {
    state = const AsyncValue.loading();
    try {
      await _repository.login(employeeCode, password);
      await _loadPermissions();
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _ref.read(permissionsProvider.notifier).state = {};
    state = const AsyncValue.data(null);
  }
}
