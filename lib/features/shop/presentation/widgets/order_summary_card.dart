import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/features/shop/data/cart_manager.dart';

class OrderSummaryCard extends StatelessWidget {
  final String? productTitle;
  final String? productPrice;
  final List<CartItem>? cartItems;
  final int deliveryCharges;

  const OrderSummaryCard({
    super.key,
    this.productTitle,
    this.productPrice,
    this.cartItems,
    required this.deliveryCharges,
  });

  @override
  Widget build(BuildContext context) {
    final bool isCartCheckout = cartItems != null;

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
        
        if (isCartCheckout)
          ...cartItems!.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '${item.product.title} (x${item.quantity})',
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                    ),
                    Text(
                      '₹${((double.tryParse(item.product.price.replaceAll(RegExp(r'[^\d.]'), '')) ?? 0.0) * item.quantity).toStringAsFixed(0)}',
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                  ],
                ),
              ))
        else if (productTitle != null && productPrice != null)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                productTitle!,
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryNavy,
                ),
              ),
              Text(
                productPrice!,
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

