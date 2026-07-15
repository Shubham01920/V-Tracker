import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class OrderSummaryCard extends StatelessWidget {
  final String productTitle;
  final String productPrice;
  final int deliveryCharges;

  const OrderSummaryCard({
    super.key,
    required this.productTitle,
    required this.productPrice,
    required this.deliveryCharges,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppStrings.checkoutOrderSummary,
          style: AppTextStyles.headTitleBold(
            fontSize: 16,
            color: AppColors.primaryNavy,
          ),
        ),
        const SizedBox(height: 16),
        // Product Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              productTitle,
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.primaryNavy,
              ),
            ),
            Text(
              productPrice,
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.primaryNavy,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        // Delivery Charges Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppStrings.checkoutDeliveryCharges,
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              '₹$deliveryCharges',
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
