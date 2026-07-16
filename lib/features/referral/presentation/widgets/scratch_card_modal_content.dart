import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/features/referral/data/models/reward_model.dart';
import 'package:snap_q/features/referral/presentation/widgets/ticket_clipper.dart';
import 'package:snap_q/features/referral/presentation/widgets/dotted_line.dart';

class ScratchCardModalContent extends StatelessWidget {
  final RewardModel reward;

  const ScratchCardModalContent({super.key, required this.reward});

  @override
  Widget build(BuildContext context) {
    final isCashback = reward.type == RewardType.cashback;
    final isZero = reward.amount == 0;

    return ClipPath(
      clipper: const TicketClipper(punchRadius: 10),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isCashback) ...[
                if (isZero) ...[
                  const Icon(
                    Icons.sentiment_dissatisfied_outlined,
                    size: 64,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Better Luck\nNext Time!',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.headlineLarge(
                      color: AppColors.primaryNavy,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ] else ...[
                  const CircleAvatar(
                    backgroundColor: AppColors.greenLightBg,
                    radius: 28,
                    child: Icon(
                      Icons.account_balance_wallet_rounded,
                      size: 32,
                      color: AppColors.success,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '₹${reward.amount.toStringAsFixed(0)}',
                    style: AppTextStyles.displayLarge(
                      color: AppColors.success,
                      fontSize: 46,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const DottedLine(),
                  const SizedBox(height: 10),
                  Text(
                    'Cashback Won',
                    style: AppTextStyles.bodyMedium(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ] else ...[
                const CircleAvatar(
                  backgroundColor: AppColors.goldLightBg,
                  radius: 28,
                  child: Icon(
                    Icons.confirmation_number_rounded,
                    size: 32,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  reward.title,
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelLarge(
                    color: AppColors.primaryNavy,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 10),
                const DottedLine(),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.bg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.grey),
                  ),
                  child: Text(
                    reward.code,
                    style: AppTextStyles.headlineMedium(
                      color: AppColors.gold,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
