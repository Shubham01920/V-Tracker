import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class VTDrawer extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;

  const VTDrawer({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        navigationDrawerTheme: NavigationDrawerThemeData(
          backgroundColor: AppColors.bg,
          indicatorColor: AppColors.gold,
          iconTheme: WidgetStateProperty.resolveWith<IconThemeData?>((states) {
            if (states.contains(WidgetState.selected)) {
              return const IconThemeData(color: AppColors.white);
            }
            return const IconThemeData(color: AppColors.primaryNavy);
          }),
          labelTextStyle: WidgetStateProperty.resolveWith<TextStyle?>((states) {
            if (states.contains(WidgetState.selected)) {
              return AppTextStyles.labelMedium(
                color: AppColors.white,
                fontWeight: FontWeight.w600,
              );
            }
            return AppTextStyles.labelMedium(
              color: AppColors.primaryNavy,
              fontWeight: FontWeight.w500,
            );
          }),
        ),
      ),
      child: NavigationDrawer(
        selectedIndex: selectedIndex,
        onDestinationSelected: onDestinationSelected,
        children: [
        // ── Drawer Header (regular widget, not a Destination) ──
        Padding(
          padding: const EdgeInsets.only(
            left: 20,
            top: 40,
            right: 20,
            bottom: 10,
          ),
          child: Row(
            children: [
              const CircleAvatar(radius: 45, child: Icon(Icons.person)),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(AppStrings.drawerUserName, style: AppTextStyles.headlineMedium()),
                  const SizedBox(height: 4),
                  Text(AppStrings.drawerUserPhone, style: AppTextStyles.bodyMedium()),
                ],
              ),
            ],
          ),
        ),
        const Divider(indent: 20, endIndent: 20),
        const SizedBox(height: 10),

        // ── Destinations (must be direct children) ──
        const NavigationDrawerDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home_rounded),
          label: Text(AppStrings.drawerHome),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.shop_outlined),
          selectedIcon: Icon(Icons.shop_rounded),
          label: Text(AppStrings.drawerShopNow),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.shopping_bag_outlined),
          selectedIcon: Icon(Icons.shopping_bag_rounded),
          label: Text(AppStrings.drawerMyOrders),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.track_changes_outlined),
          selectedIcon: Icon(Icons.track_changes_rounded),
          label: Text(AppStrings.drawerTrackOrder),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.monetization_on_outlined),
          selectedIcon: Icon(Icons.monetization_on_rounded),
          label: Text(AppStrings.drawerReferAndEarn),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.star_border_outlined),
          selectedIcon: Icon(Icons.star_rounded),
          label: Text(AppStrings.drawerRewards),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.info_outline),
          selectedIcon: Icon(Icons.info_rounded),
          label: Text(AppStrings.drawerAboutUs),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.lock_outlined),
          selectedIcon: Icon(Icons.lock_rounded),
          label: Text(AppStrings.drawerPrivacyPolicy),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.question_mark_outlined),
          selectedIcon: Icon(Icons.question_mark_rounded),
          label: Text(AppStrings.drawerTermsAndConditions),
        ),
        const NavigationDrawerDestination(
          icon: Icon(Icons.contact_support_outlined),
          selectedIcon: Icon(Icons.contact_support_rounded),
          label: Text(AppStrings.drawerHelpAndSupport),
        ),

        Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(top: 10, left: 20, right: 20, bottom: 20),
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.navyLight,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppStrings.drawerReferAndEarn,
                style: AppTextStyles.labelLarge(color: AppColors.white),
              ),
              Text(
                AppStrings.drawerReferAndEarnSubtitle,
                style: AppTextStyles.bodyMedium(color: AppColors.white),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}
}
