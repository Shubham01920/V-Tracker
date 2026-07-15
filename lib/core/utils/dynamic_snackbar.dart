import 'dart:async';
import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';

enum SnackbarType { success, error, warning, info }

class DynamicSnackbarWidget extends StatefulWidget {
  final String message;
  final SnackbarType type;
  final Duration duration;
  final VoidCallback? actions;
  final VoidCallback onDismissed;

  const DynamicSnackbarWidget({
    super.key,
    required this.message,
    required this.type,
    required this.duration,
    required this.onDismissed,
    this.actions,
  });

  @override
  State<DynamicSnackbarWidget> createState() => _DynamicSnackbarWidgetState();
}

class _DynamicSnackbarWidgetState extends State<DynamicSnackbarWidget>
    with TickerProviderStateMixin {
  // Stage 1: small circle drops from notch with bounce
  late AnimationController _dropController;
  // Stage 2: circle expands into pill
  late AnimationController _expandController;
  // Stage 3: content fades in
  late AnimationController _contentController;

  Timer? _dismissTimer;
  bool _isDismissing = false;

  // Circle size
  static const double circleSize = 28.0;

  @override
  void initState() {
    super.initState();

    _dropController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 950),
    );

    _expandController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );

    _contentController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    // Chain: drop → (delay) → expand → fade in content
    _dropController.forward().then((_) {
      if (mounted) {
        Future.delayed(const Duration(milliseconds: 250), () {
          if (mounted) {
            _expandController.forward().then((_) {
              if (mounted) _contentController.forward();
            });
          }
        });
      }
    });

    // Total entry animation time is 950ms (drop) + 250ms (delay) + 450ms (expand) + 250ms (content) = 1900ms.
    // We adjust the dismiss timer to start after the animation fully settles.
    _dismissTimer = Timer(
      widget.duration + const Duration(milliseconds: 1000),
      _dismiss,
    );
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    _dropController.dispose();
    _expandController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _dismiss() {
    if (_isDismissing) return;
    _isDismissing = true;

    // Reverse chain: fade out content → shrink to circle → bounce back up into notch
    _contentController.reverse().then((_) {
      if (mounted) {
        _expandController.reverse().then((_) {
          if (mounted) {
            _dropController.reverse().then((_) {
              if (mounted) widget.onDismissed();
            });
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double bottomPadding = MediaQuery.of(context).padding.bottom;

    // Start position: circle starts within the bottom navigation bar height
    final double startBottom = bottomPadding + 15.0;
    // Resting position: floating above the bottom navigation bar (so it doesn't cover tabs)
    final double restingBottom = bottomPadding + 85.0;

    // Expanded pill dimensions
    final double expandedWidth = screenWidth - 32.0;

    // Dynamically calculate height based on message length
    final double horizontalPaddingAndIcons =
        32.0 + 20.0 + 10.0 + (widget.actions != null ? 58.0 : 0.0);
    final double textWidth = (expandedWidth - horizontalPaddingAndIcons).clamp(
      100.0,
      double.infinity,
    );
    final TextPainter textPainter = TextPainter(
      text: TextSpan(
        text: widget.message,
        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
      maxLines: 3,
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: textWidth);

    final double textHeight = textPainter.height;
    final double expandedHeight = (textHeight + 24.0).clamp(52.0, 120.0);

    Color bgColor;
    Color iconColor;
    IconData iconData;
    Color textColor;
    switch (widget.type) {
      case SnackbarType.success:
        bgColor = AppColors.success; // Success Maroon background
        iconColor = AppColors.goldLight; // Gold sparkles color
        iconData = Icons.auto_awesome_rounded; // Sparkles icon
        textColor = AppColors.white;
        break;
      case SnackbarType.error:
        bgColor = AppColors.darkRed; // Dark red for error
        iconColor = AppColors.white;
        iconData = Icons.cancel_rounded; // Cross icon
        textColor = AppColors.white;
        break;
      case SnackbarType.warning:
        bgColor = AppColors.gold; // Gold for warning
        iconColor = AppColors.white;
        iconData = Icons.warning_rounded; // Warning triangle
        textColor = AppColors.white;
        break;
      case SnackbarType.info:
        bgColor = AppColors.primaryNavy; // Pink for info
        iconColor = AppColors.white;
        iconData = Icons.info_rounded; // Info circle
        textColor = AppColors.white;
        break;
    }

    return AnimatedBuilder(
      animation: Listenable.merge([
        _dropController,
        _expandController,
        _contentController,
      ]),
      builder: (context, _) {
        // Stage 1: bounce drop (0→1)
        final double drop = Curves.bounceOut.transform(_dropController.value);
        // Stage 2: smooth expand (0→1)
        final double expand = Curves.easeOutCubic.transform(
          _expandController.value,
        );
        // Stage 3: content fade (0→1)
        final double content = _contentController.value;

        // --- Position: circle rises from bottom to resting spot ---
        final double bottom =
            startBottom + (restingBottom - startBottom) * drop;

        // --- Size: circle → pill ---
        final double width = circleSize + (expandedWidth - circleSize) * expand;
        final double height =
            circleSize + (expandedHeight - circleSize) * expand;
        final double radius = height / 2; // Always capsule

        // --- Color: themed pill color (state specific from the start of animation) ---
        final Color color = bgColor;

        return Positioned(
          bottom: bottom,
          left: (screenWidth - width) / 2,
          child: GestureDetector(
            onVerticalDragEnd: (d) {
              if (d.primaryVelocity != null && d.primaryVelocity! > 0) {
                _dismiss();
              }
            },
            onTap: _dismiss,
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: width,
                height: height,
                decoration: BoxDecoration(
                  // 3D gradient: lighter top edge, darker bottom using state color
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color.lerp(color, Colors.white, 0.08)!,
                      color,
                      Color.lerp(color, Colors.black, 0.06)!,
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                  borderRadius: BorderRadius.circular(radius),
                  border: Border.all(
                    color: Colors.white.withAlpha((30 * expand).toInt()),
                    width: 0.8,
                  ),
                  boxShadow: [
                    // Colored glow
                    BoxShadow(
                      color: color.withAlpha((60 * expand).toInt()),
                      blurRadius: 28 * expand,
                      spreadRadius: 2 * expand,
                      offset: Offset(0, 8 * expand),
                    ),
                    // Close contact shadow
                    BoxShadow(
                      color: Colors.black.withAlpha((35 * expand).toInt()),
                      blurRadius: 8 * expand,
                      offset: Offset(0, 3 * expand),
                    ),
                    // Deep ambient blur
                    BoxShadow(
                      color: Colors.black.withAlpha((18 * expand).toInt()),
                      blurRadius: 50 * expand,
                      spreadRadius: 4 * expand,
                      offset: Offset(0, 16 * expand),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(radius),
                  child: Opacity(
                    opacity: content,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Icon(iconData, color: iconColor, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 8.0,
                              ),
                              child: Text(
                                widget.message,
                                style: TextStyle(
                                  color: textColor,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'Poppins',
                                  height: 1.3,
                                ),
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                          if (widget.actions != null) ...[
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () {
                                widget.actions?.call();
                                _dismiss();
                              },
                              child: Text(
                                'UNDO',
                                style: TextStyle(
                                  color: Colors.white.withValues(
                                    alpha: 0.95,
                                  ), // Readable white
                                  fontWeight: FontWeight.w800,
                                  fontSize: 11,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
