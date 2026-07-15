import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_text_field.dart';

class TrackOrderScreen extends StatefulWidget {
  const TrackOrderScreen({super.key});

  @override
  State<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends State<TrackOrderScreen> {
  final TextEditingController _orderIdController = TextEditingController(text: 'ORD-892304');
  bool _hasSearched = false;
  bool _isLoading = false;

  // Mock tracking stages for ORD-892304
  final List<Map<String, dynamic>> _trackingStages = [
    {
      'title': 'Ordered Placed',
      'subtitle': 'Your order has been placed successfully.',
      'time': '10 July 2026, 09:30 AM',
      'status': 'completed',
    },
    {
      'title': 'Processed',
      'subtitle': 'Seller has processed your order.',
      'time': '11 July 2026, 11:15 AM',
      'status': 'completed',
    },
    {
      'title': 'Shipped',
      'subtitle': 'Your package has been handed over to Blue Dart courier.',
      'time': '12 July 2026, 03:45 PM',
      'status': 'completed',
    },
    {
      'title': 'In Transit',
      'subtitle': 'Arrived at sorting facility (Mumbai Main Hub).',
      'time': '13 July 2026, 10:20 AM',
      'status': 'active',
    },
    {
      'title': 'Out for Delivery',
      'subtitle': 'Package will be delivered to your address soon.',
      'time': '',
      'status': 'pending',
    },
    {
      'title': 'Delivered',
      'subtitle': 'Expected delivery by 15 July 2026.',
      'time': '',
      'status': 'pending',
    },
  ];

  void _onTrackPressed() {
    final query = _orderIdController.text.trim();
    if (query.isEmpty) {
      VTSnackbar.showError(context, 'Please enter a valid Order ID');
      return;
    }

    setState(() {
      _isLoading = true;
      _hasSearched = false;
    });

    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasSearched = true;
        });
      }
    });
  }

  @override
  void dispose() {
    _orderIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Track Order',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── TOP TRACKING SEARCH CARD ──
            Container(
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.grey.withValues(alpha: 0.5),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryNavy.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Track your Package',
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Enter the Order ID or AWB number to check the live status of your order shipment.',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _orderIdController,
                    hintText: 'Enter Order ID (e.g. ORD-892304)',
                    suffixIcon: const Icon(
                      Icons.search_rounded,
                      color: AppColors.primaryNavy,
                      size: 22,
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    text: 'Track Order',
                    isLoading: _isLoading,
                    onPressed: _onTrackPressed,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_hasSearched) ...[
              // ── ORDER SUMMARY CARD ──
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.grey.withValues(alpha: 0.5),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Estimated Delivery',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        Text(
                          'Order ID: ${_orderIdController.text.trim()}',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '15 July 2026',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Courier Partner',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Blue Dart Express',
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryNavy,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Tracking Number',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Text(
                                    'BD-7839210',
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryNavy,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  GestureDetector(
                                    onTap: () {
                                      Clipboard.setData(
                                        const ClipboardData(text: 'BD-7839210'),
                                      );
                                      VTSnackbar.showSuccess(
                                        context,
                                        'Tracking number copied!',
                                      );
                                    },
                                    child: const Icon(
                                      Icons.copy_rounded,
                                      size: 16,
                                      color: AppColors.gold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── LIVE TRACKING STEPS TIMELINE ──
              Text(
                'Live Tracking Status',
                style: AppTextStyles.labelLarge(
                  color: AppColors.primaryNavy,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              // Vertical Stepper
              Container(
                padding: const EdgeInsets.only(left: 8.0, right: 16.0),
                child: ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _trackingStages.length,
                  itemBuilder: (context, index) {
                    final stage = _trackingStages[index];
                    final String status = stage['status'];
                    final bool isLast = index == _trackingStages.length - 1;

                    Color circleColor;
                    Widget? innerWidget;

                    if (status == 'completed') {
                      circleColor = AppColors.success;
                      innerWidget = const Icon(
                        Icons.check,
                        color: AppColors.white,
                        size: 10,
                      );
                    } else if (status == 'active') {
                      circleColor = AppColors.gold;
                      innerWidget = Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.white,
                        ),
                      );
                    } else {
                      circleColor = AppColors.grey;
                    }

                    return IntrinsicHeight(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Left indicator line & dot
                          Column(
                            children: [
                              Container(
                                width: 18,
                                height: 18,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: circleColor,
                                ),
                                child: Center(child: innerWidget),
                              ),
                              if (!isLast)
                                Expanded(
                                  child: Container(
                                    width: 2,
                                    color: status == 'completed'
                                        ? AppColors.success
                                        : AppColors.grey.withValues(alpha: 0.5),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(width: 16),
                          // Content details
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 24.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        stage['title'],
                                        style: GoogleFonts.outfit(
                                          fontSize: 15,
                                          fontWeight: status == 'pending'
                                              ? FontWeight.w500
                                              : FontWeight.bold,
                                          color: status == 'pending'
                                              ? AppColors.textSecondary
                                              : AppColors.primaryNavy,
                                        ),
                                      ),
                                      if (stage['time'].toString().isNotEmpty)
                                        Text(
                                          stage['time'],
                                          style: GoogleFonts.outfit(
                                            fontSize: 11,
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    stage['subtitle'],
                                    style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
