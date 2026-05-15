import 'package:flutter/material.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/presentation/widgets/feature_gate.dart';
import 'package:virat_mobile/presentation/screens/new_sale_screen.dart';
import 'package:virat_mobile/presentation/screens/customer_screens.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('VIRAT CRM'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            color: Colors.green.shade50,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_on, color: Colors.green, size: 20),
                const SizedBox(width: 8),
                Text(
                  'TRACKING ACTIVE (5m Pulse)',
                  style: TextStyle(
                    color: Colors.green.shade700,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                FeatureGate(
                  featureKey: 'sales',
                  child: _BigMenuButton(
                    label: 'NEW SALE',
                    icon: Icons.add_shopping_cart,
                    color: AppTheme.accentColor,
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const NewSaleScreen()),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
                FeatureGate(
                  featureKey: 'crm',
                  child: _BigMenuButton(
                    label: 'CUSTOMERS',
                    icon: Icons.people_outline,
                    color: AppTheme.primaryColor,
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CustomerListScreen()),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
                FeatureGate(
                  featureKey: 'workforce',
                  child: _BigMenuButton(
                    label: 'ATTENDANCE',
                    icon: Icons.fingerprint,
                    color: AppTheme.primaryColor,
                    onPressed: () {
                      // Navigate to Attendance
                    },
                  ),
                ),
                const SizedBox(height: 16),
                FeatureGate(
                  featureKey: 'reports',
                  child: _BigMenuButton(
                    label: 'DAILY REPORTS',
                    icon: Icons.description_outlined,
                    color: AppTheme.primaryColor,
                    onPressed: () {
                      // Navigate to Reports
                    },
                  ),
                ),
                const SizedBox(height: 16),
                FeatureGate(
                  featureKey: 'documents',
                  child: _BigMenuButton(
                    label: 'DOCUMENTS',
                    icon: Icons.folder_shared_outlined,
                    color: AppTheme.primaryColor,
                    onPressed: () {
                      // Navigate to Documents
                    },
                  ),
                ),
                const SizedBox(height: 16),
                _BigMenuButton(
                  label: 'SYNC PENDING',
                  icon: Icons.cloud_upload_outlined,
                  color: Colors.blueGrey,
                  onPressed: () {
                    // Trigger sync
                  },
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(
              'Logged in as Field Staff',
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ),
        ],
      ),
    );
  }
}

class _BigMenuButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onPressed;

  const _BigMenuButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        elevation: 4,
        minimumSize: const Size(double.infinity, 80),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      onPressed: onPressed,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 32, color: Colors.white),
          const SizedBox(width: 16),
          Text(
            label,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
