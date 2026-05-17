import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/presentation/providers/auth_provider.dart';
import 'package:virat_mobile/presentation/widgets/app_menu_button.dart';
import 'package:virat_mobile/presentation/screens/new_sale_screen.dart';
import 'package:virat_mobile/presentation/screens/customer_screens.dart';
import 'package:virat_mobile/presentation/screens/profile_screen.dart';


class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);
    final name = ref.watch(userNameProvider);
    final permissions = ref.watch(permissionsProvider);

    // Helper to check user access to a specific feature key
    bool hasAccess(String featureKey) {
      if (role == 'Admin') return true;
      return permissions[featureKey] ?? false;
    }

    final List<Widget> actionButtons = [];

    // 1. NEW SALE (featureKey: 'sales')
    if (hasAccess('sales')) {
      actionButtons.add(
        AppMenuButton(
          label: 'NEW\nSALE',
          icon: Icons.add_shopping_cart_rounded,
          gradient: AppColors.gradientSales,
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NewSaleScreen()),
          ),
        ),
      );
    }

    // 2. CUSTOMERS (featureKey: 'crm')
    if (hasAccess('crm')) {
      actionButtons.add(
        AppMenuButton(
          label: 'CUSTOMERS',
          icon: Icons.people_rounded,
          gradient: AppColors.gradientCustomers,
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CustomerListScreen()),
          ),
        ),
      );
    }

    // 3. ATTENDANCE (featureKey: 'workforce')
    if (hasAccess('workforce')) {
      actionButtons.add(
        AppMenuButton(
          label: 'ATTENDANCE',
          icon: Icons.fingerprint_rounded,
          gradient: AppColors.gradientAttendance,
          onPressed: () {
            // TODO: Navigate to attendance screen
          },
        ),
      );
    }

    // 4. DAILY REPORTS (featureKey: 'reports')
    if (hasAccess('reports')) {
      actionButtons.add(
        AppMenuButton(
          label: 'DAILY\nREPORTS',
          icon: Icons.bar_chart_rounded,
          gradient: AppColors.gradientReports,
          onPressed: () {
            // TODO: Navigate to reports screen
          },
        ),
      );
    }

    // 5. DOCUMENTS (featureKey: 'documents')
    if (hasAccess('documents')) {
      actionButtons.add(
        AppMenuButton(
          label: 'DOCUMENTS',
          icon: Icons.folder_copy_rounded,
          gradient: AppColors.gradientDocuments,
          onPressed: () {
            // TODO: Navigate to documents screen
          },
        ),
      );
    }

    // 6. SYNC DATA (Always visible)
    actionButtons.add(
      AppMenuButton(
        label: 'SYNC\nDATA',
        icon: Icons.cloud_sync_rounded,
        gradient: AppColors.gradientSync,
        onPressed: () {
          // TODO: Trigger manual sync
        },
      ),
    );

    // Initials for avatar
    String initials = 'U';
    if (name != null && name.isNotEmpty) {
      final parts = name.trim().split(' ');
      initials = parts.length >= 2
          ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
          : parts[0][0].toUpperCase();
    }

    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      body: SafeArea(
        child: Column(
          children: [
            // ─── Header ───────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  // Logo / Title
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: 'VIRAT',
                            style: GoogleFonts.poppins(
                              color: AppColors.textPrimary,
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2,
                            ),
                          ),
                          TextSpan(
                            text: ' CRM',
                            style: GoogleFonts.poppins(
                              color: AppColors.primary,
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // GPS pulse indicator
                  const _GpsPulse(),
                  const SizedBox(width: 14),
                  // User avatar button
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ProfileScreen()),
                    ),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: AppColors.gradientSales,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          initials,
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ─── User greeting ────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name != null ? 'Hello, ${name.split(' ').first}!' : 'Welcome back!',
                        style: GoogleFonts.poppins(
                          color: AppColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      if (role != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColors.primary.withOpacity(0.3),
                            ),
                          ),
                          child: Text(
                            role,
                            style: GoogleFonts.poppins(
                              color: AppColors.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ─── Section label ────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Text(
                    'QUICK ACTIONS',
                    style: GoogleFonts.poppins(
                      color: AppColors.textMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(height: 1, color: AppColors.border),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // ─── 2-Column Grid ────────────────────────────────────────
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 1.0,
                  children: actionButtons,
                ),
              ),
            ),

            // ─── Bottom Status Bar ────────────────────────────────────
            Container(
              margin: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_rounded,
                      color: AppColors.statusGreen, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'GPS ACTIVE',
                    style: GoogleFonts.poppins(
                      color: AppColors.statusGreen,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '5 min pulse',
                    style: GoogleFonts.poppins(
                      color: AppColors.textMuted,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 1,
                    height: 14,
                    color: AppColors.border,
                  ),
                  const SizedBox(width: 8),
                  // Logout
                  GestureDetector(
                    onTap: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) {
                        Navigator.of(context).pushReplacementNamed('/');
                      }
                    },
                    child: Row(
                      children: [
                        const Icon(Icons.logout_rounded,
                            color: AppColors.textMuted, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'Logout',
                          style: GoogleFonts.poppins(
                            color: AppColors.textMuted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Animated GPS pulsing dot ──────────────────────────────────────────────────
class _GpsPulse extends StatefulWidget {
  const _GpsPulse();

  @override
  State<_GpsPulse> createState() => _GpsPulseState();
}

class _GpsPulseState extends State<_GpsPulse>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        final pulse = math.sin(_controller.value * 2 * math.pi) * 0.5 + 0.5;
        return Stack(
          alignment: Alignment.center,
          children: [
            // Outer pulse ring
            Container(
              width: 24 + (pulse * 10),
              height: 24 + (pulse * 10),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.statusGreen.withOpacity(0.15 * pulse),
              ),
            ),
            // Inner dot
            Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.statusGreen,
              ),
            ),
          ],
        );
      },
    );
  }
}
