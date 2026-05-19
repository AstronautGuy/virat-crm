import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:virat_mobile/core/api_client.dart';
import 'package:virat_mobile/data/models/notification.dart';

class NotificationRepository {
  final ApiClient apiClient;

  NotificationRepository(this.apiClient);

  Future<List<NotificationModel>> fetchNotifications() async {
    try {
      final response = await apiClient.dio.get('/notifications/list');
      if (response.statusCode == 200 && response.data is List) {
        final list = response.data as List;
        return list.map((item) => NotificationModel.fromJson(item as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      debugPrint('[NOTIFICATION_REPO_ERROR] Failed to fetch notifications: ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('[NOTIFICATION_REPO_ERROR] Unexpected error: $e');
      rethrow;
    }
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      await apiClient.dio.post('/notifications/read', data: {
        'notificationId': notificationId,
      });
    } on DioException catch (e) {
      debugPrint('[NOTIFICATION_REPO_ERROR] Failed to mark as read: ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('[NOTIFICATION_REPO_ERROR] Unexpected error: $e');
      rethrow;
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await apiClient.dio.post('/notifications/read-all');
    } on DioException catch (e) {
      debugPrint('[NOTIFICATION_REPO_ERROR] Failed to mark all as read: ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('[NOTIFICATION_REPO_ERROR] Unexpected error: $e');
      rethrow;
    }
  }
}
