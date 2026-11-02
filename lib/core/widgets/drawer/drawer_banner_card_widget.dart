import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class DrawerBannerCardWidget extends StatelessWidget {
  final VoidCallback onTap;

  const DrawerBannerCardWidget({
    super.key,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 10),
        InkWell(
          onTap: onTap,
          child: Stack(
            alignment: Alignment.centerRight,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(
                  top: 10,
                  left: 20,
                  right: 20,
                  bottom: 20,
                ),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.navyLight,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 12,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            AppStrings.drawerReferAndEarn,
                            style: AppTextStyles.labelLarge(
                              color: AppColors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            AppStrings.drawerReferAndEarnSubtitle,
                            style: AppTextStyles.bodyMedium(
                              color: AppColors.white.withValues(alpha: 0.8),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Expanded(flex: 5, child: SizedBox()),
                  ],
                ),
              ),
              Positioned(
                right: 20,
                bottom: 5,
                child: Image.asset(
                  'assets/images/coin.png',
                  fit: BoxFit.contain,
                  height: 120,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Text(
              AppStrings.appVersion,
              style: AppTextStyles.bodySmall(
                color: AppColors.primaryNavy.withValues(alpha: 0.45),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
