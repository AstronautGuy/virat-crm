import 'dart:async';
import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_background_service_android/flutter_background_service_android.dart';
import 'package:geolocator/geolocator.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:virat_mobile/data/models/sync_item.dart';
import 'package:virat_mobile/data/models/product.dart';
import 'package:virat_mobile/data/repositories/sync_repository.dart';
import 'package:virat_mobile/core/api_client.dart';

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'heartbeat_channel',
      initialNotificationTitle: 'Virat CRM Tracking',
      initialNotificationContent: 'Active Tracking Enabled',
      foregroundServiceNotificationId: 888,
    ),
    iosConfiguration: IosConfiguration(
      autoStart: true,
      onForeground: onStart,
      onBackground: onIosBackground,
    ),
  );

  await service.startService();
}

@pragma('vm:entry-point')
bool onIosBackground(ServiceInstance service) {
  WidgetsFlutterBinding.ensureInitialized();
  return true;
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();
  WidgetsFlutterBinding.ensureInitialized();

  final storage = const FlutterSecureStorage();
  final dio = Dio(BaseOptions(baseUrl: 'https://virat-crm.vercel.app/api/rest'));
  
  // Initialize Isar for background sync
  final dir = await getApplicationDocumentsDirectory();
  final isar = await Isar.open(
    [SyncItemSchema, ProductSchema],
    directory: dir.path,
  );
  
  final syncRepo = SyncRepository(isar, ApiClient());

  // Listen for connectivity changes to trigger sync
  Connectivity().onConnectivityChanged.listen((result) {
    if (result != ConnectivityResult.none) {
      syncRepo.syncAll();
    }
  });

  Timer.periodic(const Duration(minutes: 2), (timer) async {
    if (service is AndroidServiceInstance) {
      if (!(await service.isForegroundService())) {
        return;
      }
    }

    try {
      // 1. Get Location
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );

      // 2. Get Connectivity
      final connectivityResult = await Connectivity().checkConnectivity();
      String status = connectivityResult == ConnectivityResult.none ? 'Inactive' : 'Active';

      // 3. Get Auth Token
      final token = await storage.read(key: 'jwt_token');

      if (token != null) {
        // 4. Send Pulse
        await dio.post(
          '/heartbeat/pulse',
          data: {
            'lat': position.latitude,
            'lng': position.longitude,
            'connectivityStatus': status,
          },
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );
        
        // 5. Trigger Background Sync
        if (connectivityResult != ConnectivityResult.none) {
          await syncRepo.syncAll();
        }
      }

      service.invoke('update', {
        'last_pulse': DateTime.now().toIso8601String(),
        'status': status,
      });
    } catch (e) {
      debugPrint('Heartbeat Error: $e');
    }
  });
}
