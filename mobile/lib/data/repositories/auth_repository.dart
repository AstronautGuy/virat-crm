import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:virat_mobile/core/api_client.dart';

class AuthRepository {
  final ApiClient apiClient;
  final _storage = const FlutterSecureStorage();

  AuthRepository(this.apiClient);

  Future<Map<String, dynamic>> login(String employeeCode, String password) async {
    try {
      final response = await apiClient.dio.post('/auth/login', data: {
        'employeeCode': employeeCode,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = data['user'];
        final permissions = user['permissions'] as Map<String, dynamic>;

        // Save to secure storage
        await _storage.write(key: 'jwt_token', value: token);
        await _storage.write(key: 'user_role', value: user['role']);
        await _storage.write(key: 'user_name', value: '${user['firstName']} ${user['lastName']}');
        await _storage.write(key: 'permissions', value: jsonEncode(permissions));

        return data;
      } else {
        throw Exception('Login failed: ${response.data['message']}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, bool>> getPermissions() async {
    final permsJson = await _storage.read(key: 'permissions');
    if (permsJson != null) {
      final Map<String, dynamic> decoded = jsonDecode(permsJson);
      return decoded.map((key, value) => MapEntry(key, value as bool));
    }
    return {};
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }
}
