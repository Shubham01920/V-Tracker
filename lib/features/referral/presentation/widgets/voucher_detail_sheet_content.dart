import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/referral/data/models/reward_model.dart';
import 'package:snap_q/features/referral/presentation/widgets/ticket_clipper.dart';

class VoucherDetailSheetContent extends StatelessWidget {
  final RewardModel reward;

  const VoucherDetailSheetContent({super.key, required this.reward});

  String _getMonthName(int month) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    if (month >= 1 && month <= 12) {
      return months[month - 1];
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final isCashback = reward.type == RewardType.cashback;
    final isZero = reward.amount == 0;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Drag Handle Indicator
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: AppColors.grey,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Coupon Header Card Style
          ClipPath(
            clipper: const TicketClipper(punchRadius: 10),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20.0),
              decoration: const BoxDecoration(
                color: AppColors.bg,
                borderRadius: BorderRadius.all(Radius.circular(16)),
              ),
              child: Column(
                children: [
                  if (isZero) ...[
                    const Icon(Icons.sentiment_dissatisfied,
                        size: 48, color: AppColors.textSecondary),
                    const SizedBox(height: 10),
                    Text(
                      'Better luck next time!',
                      style: AppTextStyles.headlineMedium(
                        color: AppColors.primaryNavy,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ] else ...[
                    Text(
                      isCashback
                          ? '₹${reward.amount.toStringAsFixed(0)} Cashback'
                          : 'Flat ₹${reward.amount.toStringAsFixed(0)} Off',
                      style: AppTextStyles.displayLarge(
                        color: isCashback ? AppColors.success : AppColors.gold,
                        fontSize: 30,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      reward.title,
                      style: AppTextStyles.bodyLarge(
                        color: AppColors.primaryNavy,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  if (reward.code.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    // Copyable code row
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.grey),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            reward.code,
                            style: AppTextStyles.headlineMedium(
                              color: AppColors.primaryNavy,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy_rounded,
                                color: AppColors.gold, size: 20),
                            constraints: const BoxConstraints(),
                            padding: EdgeInsets.zero,
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: reward.code));
                              VTSnackbar.showSuccess(context, 'Voucher code copied to clipboard!');
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          Text(
            'Reward Details',
            style: AppTextStyles.labelLarge(
              color: AppColors.primaryNavy,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          // Expiry date and terms bullet points
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.event_outlined, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isZero
                      ? 'Expired immediately.'
                      : 'Valid till: ${reward.date.day} ${_getMonthName(reward.date.month)} ${reward.date.year}',
                  style: AppTextStyles.bodyMedium(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.info_outline_rounded,
                  size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  reward.description,
                  style: AppTextStyles.bodyMedium(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Action button (Redeem Now or Go back)
          VTButton(
            text: isZero
                ? 'Go Back'
                : reward.type == RewardType.voucher
                    ? 'Redeem Now'
                    : 'OK',
            backgroundColor: AppColors.primaryNavy,
            textColor: AppColors.white,
            onPressed: () {
              Navigator.pop(context);
              if (!isZero && reward.type == RewardType.voucher) {
                VTSnackbar.showInfo(context, 'Redirecting to redeem ${reward.title}...');
              }
            },
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
