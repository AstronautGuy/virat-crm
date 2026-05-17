import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:permission_handler/permission_handler.dart' hide ServiceStatus;
import 'package:virat_mobile/core/theme.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:virat_mobile/core/api_client.dart';

class LocationGate extends StatefulWidget {
  final Widget child;

  const LocationGate({super.key, required this.child});

  @override
  State<LocationGate> createState() => _LocationGateState();
}

class _LocationGateState extends State<LocationGate> {
  bool _isLocationEnabled = false;
  bool _isNotificationGranted = false;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
    Geolocator.getServiceStatusStream().listen((status) {
      if (status == ServiceStatus.disabled) {
        setState(() => _isLocationEnabled = false);
        _reportGpsViolation();
      } else {
        _checkPermissions();
      }
    });
  }

  Future<void> _reportGpsViolation() async {
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'jwt_token');
      if (token == null) return;

      final dio = ApiClient().dio;
      await dio.post(
        '/heartbeat/pulse',
        data: {
          'status': 'No GPS',
        },
      );
      debugPrint('Reported GPS violation to backend.');
    } catch (e) {
      debugPrint('Error reporting GPS violation: $e');
    }
  }

  Future<void> _checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() => _isLocationEnabled = false);
      _reportGpsViolation();
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() => _isLocationEnabled = false);
        return;
      }
    }
    if (permission == LocationPermission.deniedForever) {
      setState(() => _isLocationEnabled = false);
      return;
    }

    setState(() => _isLocationEnabled = true);

    var notificationStatus = await Permission.notification.status;
    if (notificationStatus.isDenied) {
      notificationStatus = await Permission.notification.request();
    }
    setState(() => _isNotificationGranted = notificationStatus.isGranted);
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: SystemLockController.isLocked,
      builder: (context, isLocked, child) {
        if (isLocked) {
          return const _SystemLockedScreen();
        }
        if (!_isLocationEnabled || !_isNotificationGranted) {
          return _PermissionsScreen(
            isLocationEnabled: _isLocationEnabled,
            isNotificationGranted: _isNotificationGranted,
            onRetry: _checkPermissions,
          );
        }
        return widget.child;
      },
    );
  }
}

class _SystemLockedScreen extends StatelessWidget {
  const _SystemLockedScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Slate 900
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Pulsing Crimson Shield Lock
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEF4444), Color(0xFFB91C1C)], // Red 500 to Red 700
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFEF4444).withOpacity(0.3),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.lock_outline_rounded,
                  size: 48,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),

              Text(
                'SYSTEM SUSPENDED',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'This platform instance has been globally suspended by the developer.\n\nAll mobile and web services are locked. Please contact your system developer to renew or upgrade your license.',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  color: const Color(0xFF94A3B8), // Slate 400
                  fontSize: 13,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 48),
              
              // Loader
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFEF4444)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PermissionsScreen extends StatelessWidget {
  final bool isLocationEnabled;
  final bool isNotificationGranted;
  final VoidCallback onRetry;

  const _PermissionsScreen({
    required this.isLocationEnabled,
    required this.isNotificationGranted,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Shield icon with gradient container
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF97316), Color(0xFFEA580C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.4),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.security_rounded,
                  size: 48,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),

              Text(
                'PERMISSIONS\nREQUIRED',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  color: AppColors.textPrimary,
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'Virat CRM needs GPS & notification access\nto track your location in the background.',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  color: AppColors.textMuted,
                  fontSize: 13,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 40),

              // Permission status cards
              _PermissionRow(
                label: 'GPS Location',
                icon: Icons.location_on_rounded,
                granted: isLocationEnabled,
              ),
              const SizedBox(height: 12),
              _PermissionRow(
                label: 'Notifications',
                icon: Icons.notifications_rounded,
                granted: isNotificationGranted,
              ),

              const SizedBox(height: 48),

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: _OutlineBtn(
                      label: 'RETRY',
                      onPressed: onRetry,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _GradientBtn(
                      label: 'SETTINGS',
                      onPressed: () async {
                        if (!isLocationEnabled) {
                          await Geolocator.openLocationSettings();
                        } else {
                          await openAppSettings();
                        }
                        onRetry();
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PermissionRow extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool granted;

  const _PermissionRow({
    required this.label,
    required this.icon,
    required this.granted,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: granted
              ? AppColors.statusGreen.withOpacity(0.3)
              : AppColors.statusRed.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textSecondary, size: 20),
          const SizedBox(width: 14),
          Text(
            label,
            style: GoogleFonts.poppins(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: granted
                  ? AppColors.statusGreen.withOpacity(0.12)
                  : AppColors.statusRed.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  granted ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  size: 14,
                  color: granted ? AppColors.statusGreen : AppColors.statusRed,
                ),
                const SizedBox(width: 5),
                Text(
                  granted ? 'GRANTED' : 'DENIED',
                  style: GoogleFonts.poppins(
                    color: granted
                        ? AppColors.statusGreen
                        : AppColors.statusRed,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GradientBtn extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const _GradientBtn({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: AppColors.gradientSales,
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onPressed,
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 13,
                letterSpacing: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _OutlineBtn extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const _OutlineBtn({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border, width: 1.5),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onPressed,
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w700,
                fontSize: 13,
                letterSpacing: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
