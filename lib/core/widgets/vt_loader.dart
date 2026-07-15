import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';

class VTLoader extends StatelessWidget {
  final double size;
  final Color color;

  const VTLoader({
    super.key,
    this.size = 40.0,
    this.color = AppColors.gold,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(color),
          strokeWidth: 3.0,
        ),
      ),
    );
  }
}
