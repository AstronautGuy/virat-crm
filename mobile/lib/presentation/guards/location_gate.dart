import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:virat_mobile/core/theme.dart';

class LocationGate extends StatefulWidget {
  final Widget child;

  const LocationGate({super.key, required this.child});

  @override
  State<LocationGate> createState() => _LocationGateState();
}

class _LocationGateState extends State<LocationGate> {
  bool _isLocationEnabled = true;

  @override
  void initState() {
    super.initState();
    _checkLocation();
    Geolocator.getServiceStatusStream().listen((status) {
      setState(() {
        _isLocationEnabled = status == ServiceStatus.enabled;
      });
    });
  }

  Future<void> _checkLocation() async {
    bool enabled = await Geolocator.isLocationServiceEnabled();
    setState(() {
      _isLocationEnabled = enabled;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLocationEnabled) {
      return const _GpsRequiredScreen();
    }
    return widget.child;
  }
}

class _GpsRequiredScreen extends StatelessWidget {
  const _GpsRequiredScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryColor,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.location_off, size: 100, color: Colors.white),
              const SizedBox(height: 32),
              const Text(
                'GPS REQUIRED',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Virat CRM requires active GPS tracking to function. Please enable location services in your settings.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 18),
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () => Geolocator.openLocationSettings(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentColor,
                ),
                child: const Text('OPEN SETTINGS'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
