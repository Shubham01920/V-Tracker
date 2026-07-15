import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/vt_button.dart';

class CouponSection extends StatelessWidget {
  final TextEditingController controller;
  final bool couponApplied;
  final VoidCallback onApplyPressed;

  const CouponSection({
    super.key,
    required this.controller,
    required this.couponApplied,
    required this.onApplyPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppStrings.checkoutApplyCoupon,
          style: AppTextStyles.headTitleBold(
            fontSize: 16,
            color: AppColors.primaryNavy,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // Coupon input text field
            Expanded(
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.grey.withValues(alpha: 0.5),
                    width: 1,
                  ),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                ),
                child: TextFormField(
                  controller: controller,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    color: AppColors.primaryNavy,
                    fontWeight: FontWeight.w500,
                  ),
                  decoration: InputDecoration(
                    hintText: AppStrings.checkoutCouponHint,
                    hintStyle: GoogleFonts.outfit(
                      fontSize: 14,
                      color: AppColors.textSecondary.withValues(
                        alpha: 0.7,
                      ),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.only(top: 10, bottom: 14),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Coupon apply button
            VTButton(
              text: couponApplied ? 'Remove' : AppStrings.checkoutApplyBtn,
              onPressed: onApplyPressed,
              width: 100,
              height: 48,
              backgroundColor: const Color(0xFFF1F5F9),
              textColor: AppColors.primaryNavy,
              fontSize: 15,
              elevation: 6,
            ),
          ],
        ),
      ],
    );
  }
}
