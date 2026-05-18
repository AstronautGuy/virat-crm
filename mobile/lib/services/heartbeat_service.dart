import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:virat_mobile/data/models/sync_item.dart';
import 'package:virat_mobile/data/models/product.dart';
import 'package:virat_mobile/data/repositories/sync_repository.dart';
import 'package:virat_mobile/core/api_client.dart';
import 'package:virat_mobile/core/config.dart';

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  // Create standard Android Notification Channel to avoid Bad Notification exceptions
  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'heartbeat_channel', // must match the notificationChannelId below
    'Virat CRM Heartbeat', // user-visible channel name
    description: 'This channel is used for foreground real-time location tracking.',
    importance: Importance.low, // low/min to avoid intrusive sound/vibration loops
  );

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

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
  final dio = Dio(BaseOptions(baseUrl: AppConfig.baseUrl));
  
  // Initialize Isar for background sync
  final dir = await getApplicationDocumentsDirectory();
  Isar? isar = Isar.getInstance();
  if (isar == null) {
    isar = await Isar.open(
      [SyncItemSchema, ProductSchema],
      directory: dir.path,
    );
  }
  
  final syncRepo = SyncRepository(isar, ApiClient());

  // Listen for connectivity changes to trigger sync
  Connectivity().onConnectivityChanged.listen((result) {
    if (!result.contains(ConnectivityResult.none)) {
      syncRepo.syncAll();
    }
  });

  // Local helper to execute the pulse both immediately on startup/login and periodically
  Future<void> performPulse() async {
    if (service is AndroidServiceInstance) {
      if (!(await service.isForegroundService())) {
        return;
      }
    }

    try {
      // Check if location services are enabled at system level
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        final token = await storage.read(key: 'jwt_token');
        if (token != null) {
          await dio.post(
            'heartbeat/pulse',
            data: {
              'status': 'No GPS',
            },
            options: Options(headers: {'Authorization': 'Bearer $token'}),
          );
        }
        service.invoke('update', {
          'last_pulse': DateTime.now().toIso8601String(),
          'status': 'No GPS',
        });
        return;
      }

      // 1. Get Location
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      );

      // 2. Get Connectivity
      final connectivityResult = await Connectivity().checkConnectivity();
      String status = connectivityResult.contains(ConnectivityResult.none) ? 'Offline' : 'Online';

      // 3. Get Auth Token
      final token = await storage.read(key: 'jwt_token');

      if (token != null) {
        // 4. Send Pulse matching backend Zod schema:
        // - lat and lng must be string representation of coordinate doubles
        // - key is 'status' (not 'connectivityStatus') with matching backend enum 'Online' | 'Offline'
        await dio.post(
          'heartbeat/pulse',
          data: {
            'lat': position.latitude.toString(),
            'lng': position.longitude.toString(),
            'status': status,
          },
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );
        
        // 5. Trigger Background Sync
        if (!connectivityResult.contains(ConnectivityResult.none)) {
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
  }

  // Trigger first pulse immediately on startup/login
  performPulse();

  // Schedule subsequent pulses periodically every 2 minutes
  Timer.periodic(const Duration(minutes: 2), (timer) async {
    await performPulse();
  });
}
