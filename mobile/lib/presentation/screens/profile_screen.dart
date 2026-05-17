import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(userNameProvider) ?? 'Unknown Employee';
    final role = ref.watch(userRoleProvider) ?? 'Employee';
    final employeeCode = ref.watch(employeeCodeProvider) ?? 'N/A';
    final branchName = ref.watch(branchNameProvider) ?? 'No Branch Assigned';
    final permissions = ref.watch(permissionsProvider);

    // Dynamic initials
    String initials = 'U';
    if (name.isNotEmpty) {
      final parts = name.trim().split(' ');
      initials = parts.length >= 2
          ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
          : parts[0][0].toUpperCase();
    }

    // Permission definitions to render
    final List<Map<String, dynamic>> featureMetaList = [
      {
        'key': 'sales',
        'label': 'New Sale System',
        'desc': 'Creating sales & invoices',
        'icon': Icons.add_shopping_cart_rounded,
      },
      {
        'key': 'crm',
        'label': 'CRM & Customers',
        'desc': 'Client catalog & tracking',
        'icon': Icons.people_rounded,
      },
      {
        'key': 'workforce',
        'label': 'Workforce / Attendance',
        'desc': 'Biometric & location logouts',
        'icon': Icons.fingerprint_rounded,
      },
      {
        'key': 'reports',
        'label': 'Daily Performance Reports',
        'desc': 'Activity & target analytics',
        'icon': Icons.bar_chart_rounded,
      },
      {
        'key': 'documents',
        'label': 'Document Management',
        'desc': 'Manuals & client files',
        'icon': Icons.folder_copy_rounded,
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      appBar: AppBar(
        title: const Text('MY PROFILE'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Header Card ───────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.bgCard,
                      AppColors.bgElevated,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Avatar Circle
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: AppColors.gradientSales,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          initials,
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 28,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Name
                    Text(
                      name,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        color: AppColors.textPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    // Role Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        role.toUpperCase(),
                        style: GoogleFonts.poppins(
                          color: AppColors.primary,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // ─── Details Section Label ──────────────────────────────
              Text(
                'ACCOUNT DETAILS',
                style: GoogleFonts.poppins(
                  color: AppColors.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),

              // Details Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildDetailRow(
                      icon: Icons.badge_rounded,
                      label: 'Employee Code',
                      value: employeeCode,
                    ),
                    const Divider(height: 1, indent: 56),
                    _buildDetailRow(
                      icon: Icons.store_rounded,
                      label: 'Active Branch',
                      value: branchName,
                    ),
                    const Divider(height: 1, indent: 56),
                    _buildDetailRow(
                      icon: Icons.location_on_rounded,
                      label: 'GPS Tracking',
                      value: 'ACTIVE',
                      valueColor: AppColors.statusGreen,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // ─── Permissions Matrix Label ───────────────────────────
              Text(
                'ROLE AUTHORIZATIONS',
                style: GoogleFonts.poppins(
                  color: AppColors.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),

              // Permissions List Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    // Admin Full Bypass Notice
                    if (role == 'Admin')
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.statusGreen.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.statusGreen.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.stars_rounded,
                                color: AppColors.statusGreen, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'ADMIN BYPASS ACTIVE\nAll operations permitted.',
                                style: GoogleFonts.poppins(
                                  color: AppColors.statusGreen,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    // Permissions List Rows
                    ...featureMetaList.map((meta) {
                      final key = meta['key'] as String;
                      final isAuthorized = role == 'Admin' || (permissions[key] ?? false);
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: AppColors.bgElevated,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(
                                meta['icon'] as IconData,
                                color: isAuthorized
                                    ? AppColors.primary
                                    : AppColors.textMuted,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    meta['label'] as String,
                                    style: GoogleFonts.poppins(
                                      color: AppColors.textPrimary,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    meta['desc'] as String,
                                    style: GoogleFonts.poppins(
                                      color: AppColors.textMuted,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Status Pill
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isAuthorized
                                    ? AppColors.statusGreen.withOpacity(0.1)
                                    : AppColors.statusRed.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isAuthorized
                                      ? AppColors.statusGreen.withOpacity(0.3)
                                      : AppColors.statusRed.withOpacity(0.3),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    isAuthorized
                                        ? Icons.check_circle_outline_rounded
                                        : Icons.lock_outline_rounded,
                                    color: isAuthorized
                                        ? AppColors.statusGreen
                                        : AppColors.statusRed,
                                    size: 11,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    isAuthorized ? 'ACTIVE' : 'LOCKED',
                                    style: GoogleFonts.poppins(
                                      color: isAuthorized
                                          ? AppColors.statusGreen
                                          : AppColors.statusRed,
                                      fontSize: 9,
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
                    }),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // ─── Sign Out Action Button ──────────────────────────────
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.statusRed.withOpacity(0.1),
                  foregroundColor: AppColors.statusRed,
                  side: BorderSide(
                    color: AppColors.statusRed.withOpacity(0.3),
                    width: 1.5,
                  ),
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.of(context).pushReplacementNamed('/');
                  }
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.logout_rounded, size: 18),
                    const SizedBox(width: 10),
                    Text(
                      'SIGN OUT ACCOUNT',
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.bgElevated,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color: AppColors.textSecondary,
              size: 18,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    color: valueColor ?? AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
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
