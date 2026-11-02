import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/routes/app_routes.dart';

class HomeOverviewSection extends StatelessWidget {
  final String activeQrTags;
  final String walletBalance;
  final String referralsCount;
  final String scratchCardsCount;
  final VoidCallback? onQrTagsTap;
  final VoidCallback? onWalletTap;
  final VoidCallback? onReferralsTap;
  final VoidCallback? onScratchCardsTap;

  const HomeOverviewSection({
    super.key,
    this.activeQrTags = '0/0',
    this.walletBalance = '₹0',
    this.referralsCount = '0',
    this.scratchCardsCount = '0',
    this.onQrTagsTap,
    this.onWalletTap,
    this.onReferralsTap,
    this.onScratchCardsTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Section Title ──
        Text(
          'Overview',
          style: AppTextStyles.headlineMedium(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryNavy,
            fontSize: 18,
          ),
        ),
        const SizedBox(height: 12),

        // ── Row 1: Active QR Tags & Wallet ──
        Row(
          children: [
            Expanded(
              child: _buildOverviewCard(
                icon: const Icon(
                  Icons.qr_code_2_rounded,
                  color: AppColors.primaryNavy,
                  size: 26,
                ),
                iconBg: const Color(0xFFEEF2F6),
                value: activeQrTags,
                label: 'Active QR Tags',
                onTap: onQrTagsTap ??
                    () => Navigator.pushNamed(context, AppRoutes.qrTab),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildOverviewCard(
                icon: const Icon(
                  Icons.account_balance_wallet_rounded,
                  color: AppColors.gold,
                  size: 26,
                ),
                iconBg: const Color(0xFFFEF6E9),
                value: walletBalance,
                label: 'Wallet',
                onTap: onWalletTap ??
                    () => Navigator.pushNamed(context, AppRoutes.withdraw),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // ── Row 2: Referrals & Scratch Cards ──
        Row(
          children: [
            Expanded(
              child: _buildOverviewCard(
                icon: const Icon(
                  Icons.people_alt_rounded,
                  color: AppColors.primaryNavy,
                  size: 26,
                ),
                iconBg: const Color(0xFFEEF2F6),
                value: referralsCount,
                label: 'Referrals',
                onTap: onReferralsTap ??
                    () => Navigator.pushNamed(context, AppRoutes.referral),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildOverviewCard(
                icon: const Icon(
                  Icons.card_giftcard_rounded,
                  color: AppColors.gold,
                  size: 26,
                ),
                iconBg: const Color(0xFFFEF6E9),
                value: scratchCardsCount,
                label: 'Scratch Cards',
                onTap: onScratchCardsTap ??
                    () => Navigator.pushNamed(context, AppRoutes.scratchCard),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOverviewCard({
    required Widget icon,
    required Color iconBg,
    required String value,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: const Color(0xFFF1F4F9),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(child: icon),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      value,
                      style: AppTextStyles.headlineMedium(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                        fontSize: 20,
                      ),
                      maxLines: 1,
                    ),
                  ),
                  const SizedBox(height: 2),
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      label,
                      style: AppTextStyles.bodySmall(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
