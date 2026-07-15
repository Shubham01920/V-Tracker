import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class VTAppBar2 extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showAction;
  final IconData actionIcon;
  final VoidCallback? onActionPressed;
  final Color backgroundColor;
  final bool showBackButton;
  final Color? actionIconColor;

  const VTAppBar2({
    super.key,
    required this.title,
    this.showAction = true,
    this.actionIcon = Icons.shopping_cart_outlined,
    this.onActionPressed,
    this.backgroundColor = const Color(0xFFF8FAFC),
    this.showBackButton = false,
    this.actionIconColor,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: backgroundColor,
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      titleSpacing: showBackButton ? 0 : 16,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(
                Icons.arrow_back_rounded,
                color: AppColors.primaryNavy,
                size: 24,
              ),
              onPressed: () => Navigator.pop(context),
            )
          : null,
      title: Text(
        title,
        style: AppTextStyles.headTitleBold(
          fontWeight: FontWeight.w900,
          fontSize: 28,
          color: AppColors.primaryNavy,
        ),
      ),
      actions: [
        if (showAction) ...[
          IconButton(
            onPressed: onActionPressed ?? () {},
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            icon: Icon(
              actionIcon,
              size: 28,
              color: actionIconColor ?? AppColors.primaryNavy,
            ),
          ),
          const SizedBox(width: 16),
        ],
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
