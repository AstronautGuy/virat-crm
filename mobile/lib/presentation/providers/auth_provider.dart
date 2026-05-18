import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:virat_mobile/data/repositories/auth_repository.dart';
import 'package:virat_mobile/presentation/providers/repository_provider.dart';
import 'package:flutter_background_service/flutter_background_service.dart';

final permissionsProvider = StateProvider<Map<String, bool>>((ref) => {});
final userRoleProvider = StateProvider<String?>((ref) => null);
final userNameProvider = StateProvider<String?>((ref) => null);
final employeeCodeProvider = StateProvider<String?>((ref) => null);
final branchNameProvider = StateProvider<String?>((ref) => null);

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

    final role = await _repository.getUserRole();
    _ref.read(userRoleProvider.notifier).state = role;

    final name = await _repository.getUserName();
    _ref.read(userNameProvider.notifier).state = name;

    final empCode = await _repository.getEmployeeCode();
    _ref.read(employeeCodeProvider.notifier).state = empCode;

    final branchName = await _repository.getBranchName();
    _ref.read(branchNameProvider.notifier).state = branchName;
  }

  Future<void> login(String employeeCode, String password) async {
    state = const AsyncValue.loading();
    try {
      await _repository.login(employeeCode, password);
      await _loadPermissions();
      state = const AsyncValue.data(null);
      // Trigger background service telemetry pulse immediately
      try {
        FlutterBackgroundService().invoke('login');
      } catch (e) {
        // Safe check if service is not running yet
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    // Notify background service to stop tracking on logout
    try {
      FlutterBackgroundService().invoke('stopService');
    } catch (e) {
      // Safe check
    }
    await _repository.logout();
    _ref.read(permissionsProvider.notifier).state = {};
    _ref.read(userRoleProvider.notifier).state = null;
    _ref.read(userNameProvider.notifier).state = null;
    _ref.read(employeeCodeProvider.notifier).state = null;
    _ref.read(branchNameProvider.notifier).state = null;
    state = const AsyncValue.data(null);
  }
}
