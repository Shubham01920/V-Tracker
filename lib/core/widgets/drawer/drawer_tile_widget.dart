import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class DrawerTileWidget extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final Color? customColor;
  final VoidCallback onTap;

  const DrawerTileWidget({
    super.key,
    required this.icon,
    required this.label,
    required this.isSelected,
    this.customColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final Color itemColor =
        customColor ?? (isSelected ? AppColors.white : AppColors.primaryNavy);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: customColor != null
            ? Colors.transparent
            : (isSelected ? AppColors.gold : Colors.transparent),
        borderRadius: BorderRadius.circular(28),
        clipBehavior: Clip.antiAlias,
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
          leading: Icon(icon, color: itemColor),
          title: Text(
            label,
            style: AppTextStyles.labelMedium(
              color: itemColor,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
          onTap: onTap,
        ),
      ),
    );
  }
}
