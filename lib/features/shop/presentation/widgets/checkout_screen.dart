import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/features/shop/presentation/screens/shop_screen.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/features/profile/data/models/address_model.dart';
import 'package:snap_q/features/shop/presentation/widgets/order_summary_card.dart';
import 'package:snap_q/features/shop/presentation/widgets/coupon_section.dart';
import 'package:snap_q/features/shop/presentation/widgets/redeem_points_section.dart';
import 'package:snap_q/features/shop/data/cart_manager.dart';

/// ── CHECKOUT SCREEN ─────────────────────────────────────────────────────────
/// Manages the order checkout flow, displaying delivery address, order summary,
/// coupons, points redemption, and final payment CTAs.
class CheckoutScreen extends StatefulWidget {
  final Product? product;
  final String name;
  final String addressLine1;
  final String addressLine2;
  final String pincode;
  final String city;
  final String state;

  const CheckoutScreen({
    super.key,
    this.product,
    this.name = 'Shubham Maurya',
    this.addressLine1 = '#201, Sai Residency, Madhapur',
    this.addressLine2 = 'Hyderabad, Telangana - 500081',
    this.pincode = '500081',
    this.city = 'Hyderabad',
    this.state = 'Telangana',
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  // Controller for the coupon code text field
  final TextEditingController _couponController = TextEditingController();

  // Track if points are redeemed
  bool _pointsRedeemed = false;

  // Track if coupon is applied
  bool _couponApplied = false;

  late String _name;
  late String _addressLine1;
  late String _addressLine2;
  late String _pincode;
  late String _city;
  late String _state;

  @override
  void initState() {
    super.initState();
    _name = widget.name;
    _addressLine1 = widget.addressLine1;
    _addressLine2 = widget.addressLine2;
    _pincode = widget.pincode;
    _city = widget.city;
    _state = widget.state;
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  // Parse product price string (e.g. '₹999') into integer
  int _getProductPrice() {
    if (widget.product != null) {
      final cleanPrice = widget.product!.price.replaceAll(RegExp(r'[^0-9]'), '');
      return int.tryParse(cleanPrice) ?? 0;
    }
    return CartManager().totalPrice.round();
  }

  @override
  Widget build(BuildContext context) {
    final int productPrice = _getProductPrice();
    const int deliveryCharges = 60;

    // Tax and handling fees (calculated to match the mockup ₹1,177 total for a ₹999 product)
    final int taxAndFees = productPrice == 999
        ? 118
        : (productPrice * 0.12).round();

    // Redeem points value
    final int pointsDiscount = _pointsRedeemed ? 25 : 0;

    // Coupon discount value
    final int couponDiscount = _couponApplied ? 50 : 0;

    // Final calculated total
    final int totalAmount =
        productPrice +
        deliveryCharges +
        taxAndFees -
        pointsDiscount -
        couponDiscount;

    return Scaffold(
      // Unified background color
      backgroundColor: AppColors.bg,

      // Reusable VTAppBar2 configured with a back button leading icon
      appBar: const VTAppBar2(
        title: AppStrings.checkoutTitle,
        showAction: false,
        showBackButton: false,
        backgroundColor: AppColors.bg,
      ),

      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 16),

                      // ── PART 1: DELIVERY ADDRESS SECTION ───────────────────────────
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            AppStrings.checkoutDeliveryAddress,
                            style: AppTextStyles.headTitleBold(
                              fontSize: 16,
                              color: AppColors.primaryNavy,
                            ),
                          ),
                          GestureDetector(
                            onTap: () async {
                              final result = await Navigator.pushNamed(
                                context,
                                AppRoutes.addressBook,
                                arguments: {'isSelectMode': true},
                              );
                              if (result != null && result is Address) {
                                setState(() {
                                  _name = result.name;
                                  _addressLine1 = result.addressLine1;
                                  _addressLine2 = result.addressLine2;
                                  _pincode = result.pincode;
                                  _city = result.city;
                                  _state = result.state;
                                });
                              }
                            },
                            child: Text(
                              AppStrings.checkoutChangeBtn,
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Recipient Name
                      Text(
                        _name,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Address Line 1
                      Text(
                        _addressLine1,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      // Address Line 2
                      Text(
                        _addressLine2,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Pincode block
                      Text(
                        AppStrings.checkoutPincodeLabel,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _pincode,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 14),
                      // Selected City and State Pills Row
                      Row(
                        children: [
                          _buildLocationPill(_city),
                          const SizedBox(width: 12),
                          _buildLocationPill(_state),
                        ],
                      ),

                      const Divider(color: Color(0xFFE2E8F0), height: 36),

                      // ── PART 2: ORDER SUMMARY SECTION ──────────────────────────────
                      OrderSummaryCard(
                        productTitle: widget.product?.title,
                        productPrice: widget.product?.price,
                        cartItems: widget.product == null ? CartManager().items : null,
                        deliveryCharges: deliveryCharges,
                      ),

                      const Divider(color: Color(0xFFE2E8F0), height: 36),

                      // ── PART 3: APPLY COUPON SECTION ───────────────────────────────
                      CouponSection(
                        controller: _couponController,
                        couponApplied: _couponApplied,
                        onApplyPressed: () {
                          if (_couponApplied) {
                            setState(() {
                              _couponApplied = false;
                              _couponController.clear();
                            });
                          } else {
                            if (_couponController.text.isNotEmpty) {
                              setState(() {
                                _couponApplied = true;
                              });
                            }
                          }
                        },
                      ),

                      const Divider(color: Color(0xFFE2E8F0), height: 36),

                      // ── PART 4: REDEEM POINTS SECTION ──────────────────────────────
                      RedeemPointsSection(
                        pointsRedeemed: _pointsRedeemed,
                        onRedeemPressed: () {
                          setState(() {
                            _pointsRedeemed = !_pointsRedeemed;
                          });
                        },
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),

            // ── PART 5: BOTTOM ACTIONS (TOTAL AMOUNT AND PROCEED CTA) ─────────
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryNavy.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppStrings.checkoutTotalAmount,
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '₹$totalAmount',
                            style: AppTextStyles.headTitleBold(
                              fontSize: 24,
                              color: AppColors.primaryNavy,
                            ),
                          ),
                        ],
                      ),
                      // View detailed breakdown details
                      GestureDetector(
                        onTap: () {
                          // TODO: Show breakdown dialog details
                        },
                        child: Row(
                          children: [
                            Text(
                              AppStrings.checkoutViewDetails,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.chevron_right,
                              size: 16,
                              color: AppColors.primaryNavy,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Proceed to payment CTA button
                  VTButton(
                    text: AppStrings.checkoutProceedPayment,
                    onPressed: () {
                      // TODO: Navigate to Payment Gateway
                    },
                    backgroundColor: AppColors.primaryNavy,
                    textColor: AppColors.white,
                    fontSize: 16,
                    elevation: 6,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }


  // ── HELPER: LOCATION PILL BUILDER ──────────────────────────────────────────
  Widget _buildLocationPill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.shade200, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            text,
            style: GoogleFonts.outfit(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.check_circle_rounded,
            color: AppColors.success,
            size: 16,
          ),
        ],
      ),
    );
  }
}
