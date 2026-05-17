import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:virat_mobile/core/api_client.dart';

import 'package:dio/dio.dart';

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
        await _storage.write(key: 'employee_code', value: user['employeeCode']);
        await _storage.write(key: 'branch_name', value: user['branchName'] ?? 'No Branch');
        await _storage.write(key: 'permissions', value: jsonEncode(permissions));

        return data;
      } else {
        throw Exception(response.data['message'] ?? 'Login failed');
      }
    } on DioException catch (e) {
      final response = e.response;
      if (response != null && response.data != null && response.data is Map) {
        final data = response.data as Map;
        if (data.containsKey('message')) {
          throw Exception(data['message']);
        }
      }
      throw Exception('Network error: ${e.message ?? 'Unknown connection error'}');
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

  Future<String?> getUserName() async {
    return await _storage.read(key: 'user_name');
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: 'user_role');
  }

  Future<String?> getEmployeeCode() async {
    return await _storage.read(key: 'employee_code');
  }

  Future<String?> getBranchName() async {
    return await _storage.read(key: 'branch_name');
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }
}
