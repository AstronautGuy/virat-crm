import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Base palette
  static const Color bgDeep = Color(0xFF0F172A);      // Deepest dark (page bg)
  static const Color bgCard = Color(0xFF1E293B);      // Card / surface
  static const Color bgElevated = Color(0xFF273549);  // Elevated surface
  static const Color border = Color(0xFF334155);      // Subtle border

  // Brand
  static const Color primary = Color(0xFFF97316);     // Orange 500
  static const Color primaryDark = Color(0xFFEA580C); // Orange 600

  // Text
  static const Color textPrimary = Color(0xFFF1F5F9);   // Slate 100
  static const Color textSecondary = Color(0xFF94A3B8); // Slate 400
  static const Color textMuted = Color(0xFF64748B);     // Slate 500

  // Feature gradients
  static const List<Color> gradientSales = [Color(0xFFF97316), Color(0xFFEA580C)];
  static const List<Color> gradientCustomers = [Color(0xFF3B82F6), Color(0xFF1D4ED8)];
  static const List<Color> gradientAttendance = [Color(0xFF22C55E), Color(0xFF16A34A)];
  static const List<Color> gradientReports = [Color(0xFFA855F7), Color(0xFF7C3AED)];
  static const List<Color> gradientDocuments = [Color(0xFF14B8A6), Color(0xFF0D9488)];
  static const List<Color> gradientSync = [Color(0xFF64748B), Color(0xFF475569)];
  static const List<Color> gradientLogin = [Color(0xFF0F172A), Color(0xFF1E293B)];

  // Status
  static const Color statusGreen = Color(0xFF22C55E);
  static const Color statusRed = Color(0xFFEF4444);
  static const Color statusAmber = Color(0xFFF59E0B);
}

class AppTheme {
  // Keep legacy accessors for code not yet migrated
  static const Color primaryColor = AppColors.bgCard;
  static const Color accentColor = AppColors.primary;
  static const Color backgroundColor = AppColors.bgDeep;

  static ThemeData get lightTheme => darkTheme;

  static ThemeData get darkTheme {
    final base = ThemeData.dark();
    return base.copyWith(
      scaffoldBackgroundColor: AppColors.bgDeep,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.primary,
        surface: AppColors.bgCard,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.bgDeep,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        centerTitle: true,
        titleTextStyle: GoogleFonts.poppins(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.5,
        ),
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      textTheme: GoogleFonts.poppinsTextTheme(base.textTheme).copyWith(
        headlineLarge: GoogleFonts.poppins(
          color: AppColors.textPrimary,
          fontSize: 32,
          fontWeight: FontWeight.w800,
        ),
        headlineMedium: GoogleFonts.poppins(
          color: AppColors.textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.w700,
        ),
        titleLarge: GoogleFonts.poppins(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: GoogleFonts.poppins(
          color: AppColors.textSecondary,
          fontSize: 16,
        ),
        bodyMedium: GoogleFonts.poppins(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
        labelLarge: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bgCard,
        hintStyle: GoogleFonts.poppins(color: AppColors.textMuted, fontSize: 14),
        labelStyle: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 14),
        prefixIconColor: AppColors.textMuted,
        suffixIconColor: AppColors.textMuted,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.statusRed, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 58),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 0,
          textStyle: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2,
          ),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.bgCard,
        contentTextStyle: GoogleFonts.poppins(color: AppColors.textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
