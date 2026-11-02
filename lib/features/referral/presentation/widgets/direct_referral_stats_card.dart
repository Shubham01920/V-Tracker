import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';

class DirectReferralStatsCard extends StatelessWidget {
  final int totalMembers;
  final int activeMembers;
  final double activeRate;

  const DirectReferralStatsCard({
    super.key,
    required this.totalMembers,
    required this.activeMembers,
    required this.activeRate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryNavy.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildMetricTile(
                title: 'Total Members',
                value: '$totalMembers',
                valueColor: AppColors.primaryNavy,
              ),
              _buildMetricTile(
                title: 'Active Members',
                value: '$activeMembers',
                valueColor: AppColors.successText,
              ),
              _buildMetricTile(
                title: 'Active Rate',
                value: '${activeRate.toStringAsFixed(0)}%',
                valueColor: AppColors.info,
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Active Rate Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: activeRate / 100,
              minHeight: 6,
              backgroundColor: AppColors.greyLight,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.successText),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required Color valueColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
