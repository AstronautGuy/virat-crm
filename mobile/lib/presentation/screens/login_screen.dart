import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/presentation/providers/auth_provider.dart';
import 'package:virat_mobile/presentation/screens/dashboard_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOut));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final employeeCode = _codeController.text.trim();
    final password = _passwordController.text.trim();

    if (employeeCode.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: AppColors.statusAmber),
              const SizedBox(width: 12),
              Text('Please enter your credentials',
                  style: GoogleFonts.poppins(color: AppColors.textPrimary)),
            ],
          ),
        ),
      );
      return;
    }

    try {
      await ref.read(authProvider.notifier).login(employeeCode, password);
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const DashboardScreen(),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 400),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: AppColors.statusRed),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    e.toString().replaceAll('Exception: ', ''),
                    style: GoogleFonts.poppins(color: AppColors.textPrimary),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F172A), Color(0xFF1A2744)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 60),

                    // Logo area
                    Center(
                      child: Column(
                        children: [
                          Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: AppColors.gradientSales,
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.4),
                                  blurRadius: 24,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.business_center_rounded,
                              color: Colors.white,
                              size: 36,
                            ),
                          ),
                          const SizedBox(height: 20),
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: 'VIRAT',
                                  style: GoogleFonts.poppins(
                                    color: AppColors.textPrimary,
                                    fontSize: 34,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 4,
                                  ),
                                ),
                                TextSpan(
                                  text: ' CRM',
                                  style: GoogleFonts.poppins(
                                    color: AppColors.primary,
                                    fontSize: 34,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Field Operations Platform',
                            style: GoogleFonts.poppins(
                              color: AppColors.textMuted,
                              fontSize: 12,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 56),

                    // Employee Code field
                    TextField(
                      controller: _codeController,
                      style: GoogleFonts.poppins(color: AppColors.textPrimary),
                      keyboardType: TextInputType.text,
                      decoration: InputDecoration(
                        labelText: 'Employee Code',
                        prefixIcon: const Icon(Icons.badge_outlined),
                        hintText: 'e.g. EMP001',
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Password field
                    TextField(
                      controller: _passwordController,
                      style: GoogleFonts.poppins(color: AppColors.textPrimary),
                      obscureText: _obscurePassword,
                      onSubmitted: (_) => isLoading ? null : _handleLogin(),
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                          ),
                          onPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                    ),

                    const Spacer(),

                    // Login button
                    Container(
                      width: double.infinity,
                      height: 58,
                      decoration: BoxDecoration(
                        gradient: isLoading
                            ? null
                            : const LinearGradient(
                                colors: AppColors.gradientSales,
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                        color: isLoading ? AppColors.bgCard : null,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: isLoading
                            ? []
                            : [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.45),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: isLoading ? null : _handleLogin,
                          child: Center(
                            child: isLoading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.5,
                                      color: Colors.white,
                                    ),
                                  )
                                : Text(
                                    'LOGIN',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 2,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 36),
                    Center(
                      child: Text(
                        'Authorized Personnel Only',
                        style: GoogleFonts.poppins(
                          color: AppColors.textMuted,
                          fontSize: 11,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
