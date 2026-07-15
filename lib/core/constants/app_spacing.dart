import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();

  // Padding & Margins
  static const double xs = 4.0;
  static const double s = 8.0;
  static const double m = 16.0;
  static const double l = 24.0;
  static const double xl = 32.0;
  static const double xxl = 40.0;

  // SizedBox Heights
  static const SizedBox heightXs = SizedBox(height: xs);
  static const SizedBox heightS = SizedBox(height: s);
  static const SizedBox heightM = SizedBox(height: m);
  static const SizedBox heightL = SizedBox(height: l);
  static const SizedBox heightXl = SizedBox(height: xl);

  // SizedBox Widths
  static const SizedBox widthXs = SizedBox(width: xs);
  static const SizedBox widthS = SizedBox(width: s);
  static const SizedBox widthM = SizedBox(width: m);
  static const SizedBox widthL = SizedBox(width: l);
  static const SizedBox widthXl = SizedBox(width: xl);

  // Border Radii
  static const double radiusS = 4.0;
  static const double radiusM = 8.0;
  static const double radiusL = 12.0;
  static const double radiusXl = 16.0;
  static const double radiusRound = 99.0;

  static BorderRadius get borderRadiusS => BorderRadius.circular(radiusS);
  static BorderRadius get borderRadiusM => BorderRadius.circular(radiusM);
  static BorderRadius get borderRadiusL => BorderRadius.circular(radiusL);
  static BorderRadius get borderRadiusXl => BorderRadius.circular(radiusXl);
  static BorderRadius get borderRadiusRound => BorderRadius.circular(radiusRound);
}
