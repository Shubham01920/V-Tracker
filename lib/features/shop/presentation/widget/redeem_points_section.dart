import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/vt_button.dart';

class RedeemPointsSection extends StatelessWidget {
  final bool pointsRedeemed;
  final VoidCallback onRedeemPressed;

  const RedeemPointsSection({
    super.key,
    required this.pointsRedeemed,
    required this.onRedeemPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppStrings.checkoutRedeemPoints,
              style: AppTextStyles.headTitleBold(
                fontSize: 16,
                color: AppColors.primaryNavy,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              AppStrings.checkoutRedeemAvailable,
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        // Points apply button
        VTButton(
          text: pointsRedeemed ? 'Remove' : AppStrings.checkoutApplyBtn,
          onPressed: onRedeemPressed,
          width: 100,
          height: 48,
          backgroundColor: const Color(0xFFF1F5F9),
          textColor: AppColors.primaryNavy,
          fontSize: 15,
          elevation: 6,
        ),
      ],
    );
  }
}
