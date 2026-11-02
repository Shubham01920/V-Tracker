import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class PayoutRecordModel {
  final String amount;
  final String step;
  final String title;
  final String status;
  final String fromName;
  final String userId;
  final String date;

  const PayoutRecordModel({
    required this.amount,
    required this.step,
    required this.title,
    required this.status,
    required this.fromName,
    required this.userId,
    required this.date,
  });
}

class PayoutHistoryScreen extends StatelessWidget {
  const PayoutHistoryScreen({super.key});

  final List<PayoutRecordModel> _records = const [
    PayoutRecordModel(
      amount: '₹10',
      step: 'S11',
      title: 'Team 11 Referral Bonus',
      status: 'Pending',
      fromName: 'girish patil',
      userId: 'S1-4538',
      date: '30-Jul-2026',
    ),
    PayoutRecordModel(
      amount: '₹10',
      step: 'S10',
      title: 'Team 10 Referral Bonus',
      status: 'Pending',
      fromName: 'SHANKARPPA TEGUR',
      userId: 'S1-2959',
      date: '30-Jul-2026',
    ),
    PayoutRecordModel(
      amount: '₹10',
      step: 'S11',
      title: 'Team 11 Referral Bonus',
      status: 'Pending',
      fromName: 'Shankar Koujknoor',
      userId: 'S1-6944',
      date: '30-Jul-2026',
    ),
    PayoutRecordModel(
      amount: '₹10',
      step: 'S13',
      title: 'Team 13 Referral Bonus',
      status: 'Pending',
      fromName: 'Omkar G Hosur',
      userId: 'S1-2668',
      date: '30-Jul-2026',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Payout History',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── SUBTITLE ──
              Text(
                'Your referral bonus earnings history',
                style: AppTextStyles.bodyMedium(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),

              // ── PAYOUT SUMMARY CARD ──
              _buildPayoutSummaryCard(),

              const SizedBox(height: 20),

              // ── PAYOUT RECORD CARDS ──
              ..._records.map((record) => Padding(
                    padding: const EdgeInsets.only(bottom: 14.0),
                    child: _buildPayoutRecordCard(record),
                  )),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  // 1. PAYOUT SUMMARY CARD
  Widget _buildPayoutSummaryCard() {
    final List<Map<String, dynamic>> teamBreakdowns = [
      {'count': '1', 'name': 'Team 5', 'bg': const Color(0xFFFFE4E6), 'color': const Color(0xFFE11D48)},
      {'count': '1', 'name': 'Team 8', 'bg': const Color(0xFFFEF9C3), 'color': const Color(0xFFCA8A04)},
      {'count': '1', 'name': 'Team 9', 'bg': const Color(0xFFCCFBF1), 'color': const Color(0xFF0D9488)},
      {'count': '1', 'name': 'Team 10', 'bg': const Color(0xFFF1F5F9), 'color': const Color(0xFF475569)},
      {'count': '4', 'name': 'Team 11', 'bg': const Color(0xFFDBEAFE), 'color': const Color(0xFF2563EB)},
      {'count': '2', 'name': 'Team 13', 'bg': const Color(0xFFF3E8FF), 'color': const Color(0xFF7E22CE)},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryNavy.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payout Summary',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 16),

          // 2x2 Metric Grid with dividers
          Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: _buildSummaryMetric(
                      value: '₹37,815',
                      label: 'Total Earned',
                      valueColor: const Color(0xFF16A34A),
                    ),
                  ),
                  Container(width: 1, height: 48, color: const Color(0xFFE2E8F0)),
                  Expanded(
                    child: _buildSummaryMetric(
                      value: '2,509',
                      label: 'Total Payouts',
                      valueColor: const Color(0xFF2563EB),
                    ),
                  ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12.0),
                child: Divider(height: 1, color: Color(0xFFE2E8F0)),
              ),
              Row(
                children: [
                  Expanded(
                    child: _buildSummaryMetric(
                      value: '₹120',
                      label: 'Pending Amounts',
                      valueColor: const Color(0xFFD97706),
                    ),
                  ),
                  Container(width: 1, height: 48, color: const Color(0xFFE2E8F0)),
                  Expanded(
                    child: _buildSummaryMetric(
                      value: '10',
                      label: 'Pending Payouts',
                      valueColor: const Color(0xFFD97706),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 20),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 16),

          // Teams Breakdown Sub-section
          Text(
            'Teams Breakdown',
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 12),

          Wrap(
            spacing: 16,
            runSpacing: 14,
            children: teamBreakdowns.map((t) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: t['bg'] as Color,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      t['count'] as String,
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: t['color'] as Color,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    t['name'] as String,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryMetric({
    required String value,
    required String label,
    required Color valueColor,
  }) {
    return Column(
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
          label,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  // 2. PAYOUT RECORD CARD
  Widget _buildPayoutRecordCard(PayoutRecordModel record) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
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
          // Top Row: Amount & Step Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                record.amount,
                style: GoogleFonts.outfit(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDBEAFE),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  record.step,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E40AF),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Title & Status Badge
          Row(
            children: [
              Text(
                record.title,
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFDE68A), width: 1),
                ),
                child: Text(
                  record.status,
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFFB45309),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Detail Key-Value Rows
          _buildDetailRow(label: 'FROM:', valueWidget: Text(
            record.fromName,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          )),
          const SizedBox(height: 8),
          _buildDetailRow(
            label: 'USER ID:',
            valueWidget: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                record.userId,
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryNavy,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          _buildDetailRow(
            label: 'DATE:',
            valueWidget: Text(
              record.date,
              style: GoogleFonts.outfit(
                fontSize: 13,
                color: AppColors.primaryNavy,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow({
    required String label,
    required Widget valueWidget,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
            letterSpacing: 0.5,
          ),
        ),
        valueWidget,
      ],
    );
  }
}
