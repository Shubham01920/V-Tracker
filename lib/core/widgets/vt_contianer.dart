import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';

class VTContianer extends StatelessWidget {
  final Widget? child;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final Color borderColor;
  final Color backgroundColor;
  final double? width;
  final double? height;
  final double borderWidth;

  const VTContianer({
    super.key,
    this.child,
    this.margin,
    this.padding,
    this.borderRadius = 16,
    this.borderColor = AppColors.grey,
    this.backgroundColor = Colors.transparent,
    this.width,
    this.height,
    this.borderWidth = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: borderColor,
          width: borderWidth,
        ),
      ),
      child: child,
    );
  }
}
