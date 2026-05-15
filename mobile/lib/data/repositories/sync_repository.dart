import 'dart:convert';
import 'package:isar/isar.dart';
import 'package:dio/dio.dart';
import 'package:virat_mobile/core/api_client.dart';
import 'package:virat_mobile/data/models/sync_item.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class SyncRepository {
  final Isar isar;
  final ApiClient apiClient;

  SyncRepository(this.isar, this.apiClient);

  /// Add a new action to the offline queue
  Future<void> queueAction(String type, Map<String, dynamic> data) async {
    final item = SyncItem()
      ..type = type
      ..jsonData = jsonEncode(data)
      ..createdAt = DateTime.now()
      ..isSynced = false;

    await isar.writeTxn(() => isar.syncItems.put(item));
    
    // Attempt immediate sync if online
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity != ConnectivityResult.none) {
      await syncAll();
    }
  }

  /// Attempt to sync all pending items
  Future<void> syncAll() async {
    final pendingItems = await isar.syncItems
        .filter()
        .isSyncedEqualTo(false)
        .sortByCreatedAt()
        .findAll();

    for (final item in pendingItems) {
      try {
        final data = jsonDecode(item.jsonData);
        Response response;

        if (item.type == 'createSale') {
          response = await apiClient.dio.post('/crm/sales', data: data);
        } else if (item.type == 'proposeCustomer') {
          response = await apiClient.dio.post('/crm/propose', data: data);
        } else {
          continue;
        }

        if (response.statusCode == 200 || response.statusCode == 201) {
          await isar.writeTxn(() async {
            item.isSynced = true;
            item.error = null;
            await isar.syncItems.put(item);
          });
        }
      } catch (e) {
        await isar.writeTxn(() async {
          item.error = e.toString();
          await isar.syncItems.put(item);
        });
        // Stop processing queue if a server error occurs to maintain order
        break; 
      }
    }
  }

  /// Get count of pending items
  Stream<int> watchPendingCount() {
    return isar.syncItems
        .filter()
        .isSyncedEqualTo(false)
        .watch()
        .map((items) => items.length);
  }
}
