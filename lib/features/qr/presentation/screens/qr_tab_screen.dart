import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/utils/dynamic_snackbar.dart';
import 'package:snap_q/core/utils/snackbar_helper.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/routes/app_routes.dart';

/// Placeholder tab shown inside the bottom-nav PageView.
/// Tapping the large CTA requests camera permission, then opens [QrScannerScreen].
class QrTabScreen extends StatelessWidget {
  const QrTabScreen({super.key});

  Future<void> _openScanner(BuildContext context) async {
    // Request camera permission before opening the scanner
    final status = await Permission.camera.request();

    if (!context.mounted) return;

    if (status.isGranted) {
      // Permission granted — open scanner
      final result = await Navigator.pushNamed(
        context,
        AppRoutes.qrScanner,
      );

      if (result is String && context.mounted) {
        debugPrint('QR result from scanner: $result');
        // TODO: handle the scanned QR code result
      }
    } else if (status.isPermanentlyDenied) {
      // Permission permanently denied — guide user to app settings
      _showPermissionDialog(context);
    } else {
      // Permission denied (not permanently) — show dynamic snackbar
      SnackbarHelper.show(
        context: context,
        message: 'Camera permission is required to scan QR codes',
        type: SnackbarType.warning,
      );
    }
  }

  void _showPermissionDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Camera Permission Required',
          style: AppTextStyles.headlineMedium(),
        ),
        content: Text(
          'Camera access has been permanently denied. '
          'Please open Settings and allow camera permission to scan QR codes.',
          style: AppTextStyles.bodyMedium(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: AppTextStyles.labelMedium(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            child: Text(
              'Open Settings',
              style: AppTextStyles.labelMedium(color: AppColors.gold),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Icon
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.qr_code_scanner_rounded,
                    size: 48,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 24),

                Text(
                  'Scan QR Code',
                  style: AppTextStyles.headlineLarge(
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 8),

                Text(
                  'Scan a vehicle QR code to instantly\nconnect with the owner',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 32),

                VTButton(
                  text: 'Open Scanner',
                  onPressed: () => _openScanner(context),
                  textColor: AppColors.white,
                  height: 52,
                  icon: Icons.camera_alt_rounded,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
