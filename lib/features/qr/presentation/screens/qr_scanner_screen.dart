import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/features/qr/presentation/widgets/qr_scanner_painters.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen>
    with SingleTickerProviderStateMixin {
  late final MobileScannerController _scannerController;
  bool _isProcessing = false;
  bool _isTorchOn = false;

  // Animation controller for the scanning line
  late final AnimationController _animationController;
  late final Animation<double> _scanLineAnimation;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      autoStart: true,
      torchEnabled: false,
    );

    // Scanning line animation — moves up and down inside the frame
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _scanLineAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _scannerController.dispose();
    super.dispose();
  }

  // ── BARCODE DETECTED ──────────────────────────────────
  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    if (capture.barcodes.isEmpty) return;

    final String? code = capture.barcodes.first.rawValue;
    if (code == null) return;

    _isProcessing = true;
    await _scannerController.stop();

    debugPrint('Scanned QR Code: $code');

    if (mounted) {
      Navigator.pop(context, code);
    }
  }

  // ── TORCH TOGGLE ──────────────────────────────────────
  Future<void> _toggleTorch() async {
    await _scannerController.toggleTorch();
    if (mounted) {
      setState(() {
        _isTorchOn = !_isTorchOn;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Scanner frame occupies 75 % of screen width
    final double frameSize = MediaQuery.of(context).size.width * 0.75;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // ── Camera Preview ─────────────────────────────
          Positioned.fill(
            child: MobileScanner(
              controller: _scannerController,
              onDetect: _onDetect,
              errorBuilder: (context, error) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.error_outline_rounded,
                          color: AppColors.gold,
                          size: 48,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          error.errorCode == MobileScannerErrorCode.permissionDenied
                              ? 'Camera permission denied.\nPlease allow camera access in settings.'
                              : 'Could not start the camera.\n${error.errorDetails?.message ?? ''}',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.bodyMedium(
                            color: AppColors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // ── Dark overlay with transparent cut-out ──────
          ScannerOverlay(frameSize: frameSize),

          // ── Gold corner brackets ──────────────────────
          Center(
            child: SizedBox(
              width: frameSize,
              height: frameSize,
              child: CustomPaint(
                painter: CornerBracketPainter(
                  color: AppColors.gold,
                  strokeWidth: 4,
                  cornerLength: 30,
                  cornerRadius: 12,
                ),
              ),
            ),
          ),

          // ── Scanning line animation ────────────────────
          Center(
            child: SizedBox(
              width: frameSize,
              height: frameSize,
              child: AnimatedBuilder(
                animation: _scanLineAnimation,
                builder: (context, child) {
                  return CustomPaint(
                    painter: ScanLinePainter(
                      progress: _scanLineAnimation.value,
                      color: AppColors.gold,
                    ),
                  );
                },
              ),
            ),
          ),

          // ── Top bar (back button + title) ─────────────
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 8,
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: AppColors.white,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Scan QR Code',
                      style: AppTextStyles.headlineLarge(
                        color: AppColors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Bottom section (instruction + torch + link) ─
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Instruction text
                    Text(
                      'Position the QR code\nwithin the frame',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyLarge(
                        color: AppColors.white.withValues(alpha: 0.85),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Flashlight toggle button
                    GestureDetector(
                      onTap: _toggleTorch,
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: _isTorchOn
                              ? AppColors.gold
                              : AppColors.gold.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.gold.withValues(alpha: 0.4),
                              blurRadius: 16,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          _isTorchOn
                              ? Icons.flash_on_rounded
                              : Icons.flash_off_rounded,
                          color: _isTorchOn
                              ? AppColors.primaryNavy
                              : AppColors.primaryNavy,
                          size: 28,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // "How it works?" link
                    GestureDetector(
                      onTap: () {
                        // TODO: show how-it-works bottom sheet
                      },
                      child: Text(
                        'How it works?',
                        style: AppTextStyles.labelMedium(
                          color: AppColors.gold,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}


