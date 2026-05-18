import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:virat_mobile/core/config.dart';

class SystemLockController {
  static final ValueNotifier<bool> isLocked = ValueNotifier<bool>(false);
}

class ApiClient {
  final Dio _dio = Dio();
  final _storage = const FlutterSecureStorage();

  ApiClient() {
    _dio.options.baseUrl = AppConfig.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Strip leading slash if present to prevent Dio from discarding baseUrl's path segment
        if (options.path.startsWith('/')) {
          options.path = options.path.substring(1);
        }
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        // If a successful response is received, we are not locked
        SystemLockController.isLocked.value = false;
        return handler.next(response);
      },
      onError: (e, handler) {
        if (e.response?.statusCode == 401) {
          // Handle unauthorized (logout, etc.)
        }
        if (e.response?.statusCode == 403) {
          final errStr = e.response?.toString() ?? '';
          if (errStr.contains('SYSTEM_LOCKED')) {
            SystemLockController.isLocked.value = true;
          }
        }
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;
}
