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
  try {
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

    try {
      await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);
      debugPrint('[BG_INIT] Successfully created notification channel.');
    } catch (e) {
      debugPrint('[BG_INIT_WARN] Non-fatal notification channel warning: $e');
    }

    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        autoStart: false,
        isForegroundMode: true,
        notificationChannelId: 'heartbeat_channel',
        initialNotificationTitle: 'Virat CRM Tracking',
        initialNotificationContent: 'Active Tracking Enabled',
        foregroundServiceNotificationId: 888,
      ),
      iosConfiguration: IosConfiguration(
        autoStart: false,
        onForeground: onStart,
        onBackground: onIosBackground,
      ),
    );

    await service.startService();
    debugPrint('[BG_INIT] Background service started successfully.');
  } catch (e, stack) {
    debugPrint('[BG_INIT_ERROR] Critical failure in background service startup: $e');
    debugPrint('[BG_INIT_ERROR] Stacktrace: $stack');
    rethrow;
  }
}

@pragma('vm:entry-point')
bool onIosBackground(ServiceInstance service) {
  WidgetsFlutterBinding.ensureInitialized();
  return true;
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  try {
    DartPluginRegistrant.ensureInitialized();
    WidgetsFlutterBinding.ensureInitialized();
    debugPrint('[BG_SERVICE] Starting background isolate execution flow...');

    final storage = const FlutterSecureStorage();
    final dio = Dio(BaseOptions(baseUrl: AppConfig.baseUrl));
    
    // Initialize Isar for background sync with safety guards
    final dir = await getApplicationDocumentsDirectory();
    debugPrint('[BG_SERVICE] Isar directory resolved: ${dir.path}');
    Isar? isar = Isar.getInstance();
    if (isar == null) {
      debugPrint('[BG_SERVICE] Opening new Isar instance...');
      isar = await Isar.open(
        [SyncItemSchema, ProductSchema],
        directory: dir.path,
      );
      debugPrint('[BG_SERVICE] Isar opened successfully.');
    } else {
      debugPrint('[BG_SERVICE] Re-using existing Isar instance.');
    }
    
    final syncRepo = SyncRepository(isar, ApiClient());

    // Listen for connectivity changes to trigger sync with safety guards
    Connectivity().onConnectivityChanged.listen((result) {
      try {
        if (!result.contains(ConnectivityResult.none)) {
          debugPrint('[BG_SERVICE] Network restored, triggering background synchronization.');
          syncRepo.syncAll();
        }
      } catch (e) {
        debugPrint('[BG_SERVICE_ERROR] Connectivity listener failure: $e');
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
        debugPrint('[BG_SERVICE] Sending telemetry pulse...');
        // Check if location services are enabled at system level
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          debugPrint('[BG_SERVICE] System GPS location service is currently disabled.');
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
        Position? position;
        try {
          position = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.medium,
              timeLimit: Duration(seconds: 15),
            ),
          );
        } catch (e) {
          debugPrint('[BG_SERVICE_ERROR] Failed to fetch current position: $e. Falling back to last known position.');
          try {
            position = await Geolocator.getLastKnownPosition();
          } catch (_) {}
        }

        if (position != null) {
          debugPrint('[BG_SERVICE] Geolocation pulse coordinates: ${position.latitude}, ${position.longitude}');
        } else {
          debugPrint('[BG_SERVICE] Geolocation coordinates currently unavailable (weak signal or timeout).');
        }

        // 2. Get Connectivity
        final connectivityResult = await Connectivity().checkConnectivity();
        String status = connectivityResult.contains(ConnectivityResult.none) ? 'Offline' : 'Online';

        // 3. Get Auth Token
        final token = await storage.read(key: 'jwt_token');

        if (token != null) {
          // 4. Send Pulse matching backend Zod schema:
          await dio.post(
            'heartbeat/pulse',
            data: {
              'lat': position?.latitude.toString(),
              'lng': position?.longitude.toString(),
              'status': status,
            },
            options: Options(headers: {'Authorization': 'Bearer $token'}),
          );
          debugPrint('[BG_SERVICE] Geolocation pulse sent successfully to server.');

          // 5. Send location ping to update geofenced attendance logs (slabs)
          if (position != null) {
            try {
              await dio.post(
                'location/ping',
                data: {
                  'latitude': position.latitude,
                  'longitude': position.longitude,
                  'accuracy': position.accuracy,
                },
                options: Options(headers: {'Authorization': 'Bearer $token'}),
              );
              debugPrint('[BG_SERVICE] Location ping sent successfully to server.');
            } catch (pingErr) {
              debugPrint('[BG_SERVICE_ERROR] Failed to send location ping to location/ping: $pingErr');
            }
          }
          
          // 6. Trigger Background Sync
          if (!connectivityResult.contains(ConnectivityResult.none)) {
            await syncRepo.syncAll();
          }
        } else {
          debugPrint('[BG_SERVICE] Telemetry omitted: User is not authenticated.');
        }

        service.invoke('update', {
          'last_pulse': DateTime.now().toIso8601String(),
          'status': status,
        });
      } catch (e, stack) {
        debugPrint('[BG_SERVICE_ERROR] Failed during performPulse execution: $e');
        debugPrint('[BG_SERVICE_ERROR] Stacktrace: $stack');
      }
    }

    // Listen for custom events from the UI
    service.on('login').listen((event) async {
      debugPrint('[BG_SERVICE] Login event received, performing immediate telemetry pulse.');
      await performPulse();
    });

    service.on('stopService').listen((event) {
      debugPrint('[BG_SERVICE] Stop signal received, stopping background service.');
      service.stopSelf();
    });

    // Trigger first pulse immediately on startup/login
    await performPulse();

    // Schedule subsequent pulses periodically every 2 minutes
    Timer.periodic(const Duration(minutes: 2), (timer) async {
      await performPulse();
    });
  } catch (e, stack) {
    debugPrint('[BG_SERVICE_CRITICAL] Background service worker encountered a fatal crash: $e');
    debugPrint('[BG_SERVICE_CRITICAL] Stacktrace: $stack');
  }
}
