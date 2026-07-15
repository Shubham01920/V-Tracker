import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle headTitleBold({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 24,
        fontWeight: fontWeight ?? FontWeight.w700,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle displayLarge({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 32,
        fontWeight: fontWeight ?? FontWeight.w700,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle displayMedium({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 26,
        fontWeight: fontWeight ?? FontWeight.w600,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle headlineLarge({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 22,
        fontWeight: fontWeight ?? FontWeight.w600,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle headlineMedium({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 20,
        fontWeight: fontWeight ?? FontWeight.w500,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle moneyLarge({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 28,
        fontWeight: fontWeight ?? FontWeight.w700,
        color: color ?? AppColors.gold,
      );

  static TextStyle moneyMedium({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 20,
        fontWeight: fontWeight ?? FontWeight.w600,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle labelLarge({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 16,
        fontWeight: fontWeight ?? FontWeight.w600,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle labelMedium({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 14,
        fontWeight: fontWeight ?? FontWeight.w500,
        color: color ?? AppColors.gold,
      );

  static TextStyle bodyLarge({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 16,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color ?? AppColors.primaryNavy,
      );

  static TextStyle bodyMedium({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 14,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color ?? AppColors.textSecondary,
      );

  static TextStyle bodySmall({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 12,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color ?? AppColors.textSecondary,
      );

  static TextStyle captionText({
    double? fontSize,
    Color? color,
    FontWeight? fontWeight,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize ?? 11,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color ?? AppColors.textSecondary,
      );
}
