import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class OrderItem {
  final String orderId;
  final String date;
  final String productTitle;
  final String category;
  final String price;
  final String status; // e.g. 'Processing', 'Shipped', 'Delivered'
  final int progressStep; // 0: Ordered, 1: Shipped, 2: Delivered

  const OrderItem({
    required this.orderId,
    required this.date,
    required this.productTitle,
    required this.category,
    required this.price,
    required this.status,
    required this.progressStep,
  });
}

class MyOrdersScreen extends StatelessWidget {
  const MyOrdersScreen({super.key});

  static const List<OrderItem> dummyOrders = [
    OrderItem(
      orderId: 'ORD-892304',
      date: '12 July 2026',
      productTitle: '4 Wheeler QR Label',
      category: '4 Wheeler',
      price: '₹999',
      status: 'Shipped',
      progressStep: 1,
    ),
    OrderItem(
      orderId: 'ORD-891901',
      date: '08 July 2026',
      productTitle: '2 Wheeler QR Label',
      category: '2 Wheeler',
      price: '₹499',
      status: 'Delivered',
      progressStep: 2,
    ),
    OrderItem(
      orderId: 'ORD-890456',
      date: '01 July 2026',
      productTitle: 'Commercial Vehicle QR Label',
      category: 'Commercial',
      price: '₹1,299',
      status: 'Delivered',
      progressStep: 2,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'My Orders',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: ListView.builder(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          itemCount: dummyOrders.length,
          itemBuilder: (context, index) {
            final order = dummyOrders[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 16.0),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
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
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          order.orderId,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                        Text(
                          order.date,
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              order.productTitle,
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Category: ${order.category}',
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          order.price,
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Track status row
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: order.status == 'Delivered'
                                ? Colors.green.shade50
                                : order.status == 'Shipped'
                                    ? Colors.blue.shade50
                                    : Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            order.status.toUpperCase(),
                            style: GoogleFonts.outfit(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: order.status == 'Delivered'
                                  ? Colors.green.shade700
                                  : order.status == 'Shipped'
                                      ? Colors.blue.shade700
                                      : Colors.orange.shade700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildTrackingBar(order.progressStep),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildTrackingBar(int currentStep) {
    return Row(
      children: [
        _buildTrackingNode('Ordered', currentStep >= 0),
        _buildTrackingLine(currentStep >= 1),
        _buildTrackingNode('Shipped', currentStep >= 1),
        _buildTrackingLine(currentStep >= 2),
        _buildTrackingNode('Delivered', currentStep >= 2),
      ],
    );
  }

  Widget _buildTrackingNode(String label, bool isDone) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDone ? AppColors.primaryNavy : AppColors.grey,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 8,
            fontWeight: isDone ? FontWeight.bold : FontWeight.normal,
            color: isDone ? AppColors.primaryNavy : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildTrackingLine(bool isActive) {
    return Expanded(
      child: Container(
        height: 2,
        color: isActive ? AppColors.primaryNavy : AppColors.grey,
        margin: const EdgeInsets.only(bottom: 10), // align with nodes
      ),
    );
  }
}
