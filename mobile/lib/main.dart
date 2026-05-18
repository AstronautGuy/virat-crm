import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/services/heartbeat_service.dart';
import 'package:virat_mobile/presentation/screens/login_screen.dart';
import 'package:virat_mobile/presentation/guards/location_gate.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Custom global error visualizer
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint('[CRITICAL_FLUTTER_ERROR] Details: ${details.exception}\nStack: ${details.stack}');
  };

  try {
    debugPrint('[STARTUP] Initializing background service...');
    await initializeService();
    debugPrint('[STARTUP] Background service initialized successfully.');
  } catch (e, stack) {
    debugPrint('[STARTUP_CRITICAL_ERROR] Background service failed: $e');
    debugPrint('[STARTUP_CRITICAL_ERROR] Stacktrace: $stack');
  }

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Virat CRM',
      theme: AppTheme.darkTheme,
      builder: (context, child) => LocationGate(child: child!),
      initialRoute: '/',
      // Route '/' is used for logout navigation back to login
      routes: {
        '/': (context) => const LoginScreen(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
