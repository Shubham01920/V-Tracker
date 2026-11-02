import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_spacing.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class VTButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double height;
  final double? fontSize;
  final EdgeInsets? padding;
  final double? elevation;
  final IconData? icon;

  const VTButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height = 58,
    this.fontSize,
    this.padding,
    this.elevation,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? AppColors.gold,
          foregroundColor: textColor ?? AppColors.white,
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 16),
          disabledBackgroundColor:
              (backgroundColor ?? AppColors.gold).withValues(alpha: 0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          ),
          elevation: elevation ?? 6,
          shadowColor: (backgroundColor ?? AppColors.gold).withValues(alpha: 0.35),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor:
                      AlwaysStoppedAnimation<Color>(AppColors.white),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 22, color: textColor ?? AppColors.white),
                    const SizedBox(width: 10),
                  ],
                  Text(
                    text,
                    style: AppTextStyles.labelLarge(
                      color: textColor ?? AppColors.white,
                      fontSize: fontSize ?? 17,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
