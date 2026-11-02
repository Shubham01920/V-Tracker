import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class TeamDistributionModel {
  final String teamName;
  final IconData icon;
  final Color iconColor;
  final String percentage;
  final double progressValue;
  final String amount;
  final int payoutsCount;
  final String category;
  final Color themeColor;
  final String totalEarnings;
  final String avgStep;
  final String creditedAmount;
  final int creditedCount;
  final String pendingAmount;
  final int pendingCount;

  const TeamDistributionModel({
    required this.teamName,
    required this.icon,
    required this.iconColor,
    required this.percentage,
    required this.progressValue,
    required this.amount,
    required this.payoutsCount,
    required this.category,
    required this.themeColor,
    required this.totalEarnings,
    required this.avgStep,
    required this.creditedAmount,
    required this.creditedCount,
    required this.pendingAmount,
    required this.pendingCount,
  });
}

class PayoutsByTeamsScreen extends StatelessWidget {
  const PayoutsByTeamsScreen({super.key});

  final List<TeamDistributionModel> _teamsData = const [
    TeamDistributionModel(
      teamName: 'Team 1',
      icon: Icons.emoji_events_rounded,
      iconColor: Color(0xFFEAB308),
      percentage: '1.3%',
      progressValue: 0.013,
      amount: '₹500',
      payoutsCount: 4,
      category: 'Direct Team',
      themeColor: Color(0xFF1E40AF),
      totalEarnings: '₹500',
      avgStep: '₹125',
      creditedAmount: '₹500',
      creditedCount: 4,
      pendingAmount: '₹0',
      pendingCount: 0,
    ),
    TeamDistributionModel(
      teamName: 'Team 2',
      icon: Icons.workspace_premium_rounded,
      iconColor: Color(0xFF94A3B8),
      percentage: '1.1%',
      progressValue: 0.011,
      amount: '₹400',
      payoutsCount: 4,
      category: 'Second Team',
      themeColor: Color(0xFF15803D),
      totalEarnings: '₹400',
      avgStep: '₹100',
      creditedAmount: '₹400',
      creditedCount: 4,
      pendingAmount: '₹0',
      pendingCount: 0,
    ),
    TeamDistributionModel(
      teamName: 'Team 3',
      icon: Icons.military_tech_rounded,
      iconColor: Color(0xFFB45309),
      percentage: '8.4%',
      progressValue: 0.084,
      amount: '₹3,200',
      payoutsCount: 64,
      category: 'Third Team',
      themeColor: Color(0xFFB45309),
      totalEarnings: '₹3,200',
      avgStep: '₹50',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹3,200',
      pendingCount: 64,
    ),
    TeamDistributionModel(
      teamName: 'Team 4',
      icon: Icons.diamond_outlined,
      iconColor: Color(0xFF2563EB),
      percentage: '15.5%',
      progressValue: 0.155,
      amount: '₹5,880',
      payoutsCount: 147,
      category: 'Premium Team',
      themeColor: Color(0xFF6B21A8),
      totalEarnings: '₹5,880',
      avgStep: '₹40',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹5,880',
      pendingCount: 147,
    ),
    TeamDistributionModel(
      teamName: 'Team 5',
      icon: Icons.stars_rounded,
      iconColor: Color(0xFFDC2626),
      percentage: '7.8%',
      progressValue: 0.078,
      amount: '₹2,940',
      payoutsCount: 98,
      category: 'Premium Team',
      themeColor: Color(0xFFDC2626),
      totalEarnings: '₹2,940',
      avgStep: '₹30',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹2,940',
      pendingCount: 98,
    ),
    TeamDistributionModel(
      teamName: 'Team 6',
      icon: Icons.star_rate_rounded,
      iconColor: Color(0xFF0D9488),
      percentage: '9.2%',
      progressValue: 0.092,
      amount: '₹3,505',
      payoutsCount: 160,
      category: 'Premium Team',
      themeColor: Color(0xFF0D9488),
      totalEarnings: '₹3,505',
      avgStep: '₹22',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹3,505',
      pendingCount: 160,
    ),
    TeamDistributionModel(
      teamName: 'Team 7',
      icon: Icons.auto_awesome_rounded,
      iconColor: Color(0xFF7E22CE),
      percentage: '10.5%',
      progressValue: 0.105,
      amount: '₹3,980',
      payoutsCount: 289,
      category: 'Premium Team',
      themeColor: Color(0xFF7E22CE),
      totalEarnings: '₹3,980',
      avgStep: '₹14',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹3,980',
      pendingCount: 289,
    ),
    TeamDistributionModel(
      teamName: 'Team 8',
      icon: Icons.local_fire_department_rounded,
      iconColor: Color(0xFFEA580C),
      percentage: '8.2%',
      progressValue: 0.082,
      amount: '₹3,100',
      payoutsCount: 310,
      category: 'Premium Team',
      themeColor: Color(0xFFEA580C),
      totalEarnings: '₹3,100',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹3,100',
      pendingCount: 310,
    ),
    TeamDistributionModel(
      teamName: 'Team 9',
      icon: Icons.bolt_rounded,
      iconColor: Color(0xFFDB2777),
      percentage: '8.3%',
      progressValue: 0.083,
      amount: '₹3,130',
      payoutsCount: 313,
      category: 'Premium Team',
      themeColor: Color(0xFFDB2777),
      totalEarnings: '₹3,130',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹3,130',
      pendingCount: 313,
    ),
    TeamDistributionModel(
      teamName: 'Team 10',
      icon: Icons.emoji_events_outlined,
      iconColor: Color(0xFF4F46E5),
      percentage: '6.4%',
      progressValue: 0.064,
      amount: '₹2,440',
      payoutsCount: 244,
      category: 'Premium Team',
      themeColor: Color(0xFF4F46E5),
      totalEarnings: '₹2,440',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹2,440',
      pendingCount: 244,
    ),
    TeamDistributionModel(
      teamName: 'Team 11',
      icon: Icons.diamond_outlined,
      iconColor: Color(0xFF2563EB),
      percentage: '5.1%',
      progressValue: 0.051,
      amount: '₹1,950',
      payoutsCount: 195,
      category: 'Premium Team',
      themeColor: Color(0xFF2563EB),
      totalEarnings: '₹1,950',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹1,950',
      pendingCount: 195,
    ),
    TeamDistributionModel(
      teamName: 'Team 12',
      icon: Icons.diamond_outlined,
      iconColor: Color(0xFF7E22CE),
      percentage: '6.8%',
      progressValue: 0.068,
      amount: '₹2,590',
      payoutsCount: 259,
      category: 'Premium Team',
      themeColor: Color(0xFF7E22CE),
      totalEarnings: '₹2,590',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹2,590',
      pendingCount: 259,
    ),
    TeamDistributionModel(
      teamName: 'Team 13',
      icon: Icons.diamond_outlined,
      iconColor: Color(0xFF0284C7),
      percentage: '5.8%',
      progressValue: 0.058,
      amount: '₹2,190',
      payoutsCount: 219,
      category: 'Premium Team',
      themeColor: Color(0xFF6B21A8),
      totalEarnings: '₹2,190',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹2,190',
      pendingCount: 219,
    ),
    TeamDistributionModel(
      teamName: 'Team 14',
      icon: Icons.diamond_outlined,
      iconColor: Color(0xFF0284C7),
      percentage: '4.3%',
      progressValue: 0.043,
      amount: '₹1,650',
      payoutsCount: 165,
      category: 'Premium Team',
      themeColor: Color(0xFF6B21A8),
      totalEarnings: '₹1,650',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹1,650',
      pendingCount: 165,
    ),
    TeamDistributionModel(
      teamName: 'Team 15',
      icon: Icons.diamond_outlined,
      iconColor: Color(0xFF0284C7),
      percentage: '1.3%',
      progressValue: 0.013,
      amount: '₹480',
      payoutsCount: 48,
      category: 'Premium Team',
      themeColor: Color(0xFF6B21A8),
      totalEarnings: '₹480',
      avgStep: '₹10',
      creditedAmount: '₹0',
      creditedCount: 0,
      pendingAmount: '₹480',
      pendingCount: 48,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Payouts by Teams',
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
              // ── PAGE TITLE & SUBTITLE ──
              Text(
                'Team Analytics',
                style: AppTextStyles.headTitleBold(
                  fontSize: 24,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Detailed breakdown of your referral earnings by step',
                style: AppTextStyles.bodyMedium(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),

              // ── OVERALL PERFORMANCE CARD ──
              _buildOverallPerformanceCard(),

              const SizedBox(height: 20),

              // ── REVENUE DISTRIBUTION CARD ──
              _buildRevenueDistributionCard(),

              const SizedBox(height: 24),

              // ── STEP DETAILS SECTION ──
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: Color(0xFFDCFCE7),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.center_focus_strong_rounded,
                      color: Color(0xFF16A34A),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Step Details',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Team Detail Cards list
              ..._teamsData.map((team) => Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
                    child: _buildTeamStepCard(team),
                  )),

              const SizedBox(height: 12),

              // Footer Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    'Showing data for ${_teamsData.length} active Teams',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1D4ED8),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // 1. OVERALL PERFORMANCE CARD
  Widget _buildOverallPerformanceCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF6B21A8), width: 1.5),
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  color: Color(0xFFF3E8FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.bar_chart_rounded,
                  color: Color(0xFF7E22CE),
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Overall Performance',
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  Text(
                    'Complete earnings breakdown',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  value: '₹900',
                  label: 'Total Earnings',
                  valueColor: const Color(0xFF16A34A),
                ),
              ),
              Container(width: 1, height: 44, color: const Color(0xFFE2E8F0)),
              Expanded(
                child: _buildMetricTile(
                  value: '2519',
                  label: 'Total Payouts',
                  valueColor: const Color(0xFF2563EB),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    value: '₹15',
                    label: 'Avg/Payout',
                    valueColor: const Color(0xFF9333EA),
                  ),
                ),
                Container(width: 1, height: 44, color: const Color(0xFFE2E8F0)),
                Expanded(
                  child: _buildMetricTile(
                    value: '₹37,035',
                    label: 'Pending Amounts',
                    valueColor: const Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String value,
    required String label,
    required Color valueColor,
  }) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  // 2. REVENUE DISTRIBUTION CARD
  Widget _buildRevenueDistributionCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF6B21A8), width: 1.5),
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  color: Color(0xFFEFF6FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.show_chart_rounded,
                  color: Color(0xFF2563EB),
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Revenue Distribution',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ..._teamsData.map((t) => Padding(
                padding: const EdgeInsets.only(bottom: 18.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(t.icon, color: t.iconColor, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          t.teamName,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          t.percentage,
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: t.iconColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: t.progressValue,
                        minHeight: 8,
                        backgroundColor: const Color(0xFFE2E8F0),
                        valueColor: AlwaysStoppedAnimation<Color>(t.iconColor),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          t.amount,
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        Text(
                          '${t.payoutsCount} payouts',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  // 3. STEP DETAIL TEAM CARD
  Widget _buildTeamStepCard(TeamDistributionModel team) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: team.themeColor, width: 1.5),
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: team.themeColor.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(team.icon, color: team.themeColor, size: 22),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    team.teamName,
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: team.themeColor,
                    ),
                  ),
                  Text(
                    team.category,
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: team.themeColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: team.themeColor.withValues(alpha: 0.3), width: 1),
                ),
                child: Text(
                  '${team.payoutsCount} payouts',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: team.themeColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      team.totalEarnings,
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: team.themeColor,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Total Earnings',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(width: 1, height: 40, color: const Color(0xFFE2E8F0)),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      team.avgStep,
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Avg/Step',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        team.creditedAmount,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF16A34A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Credited (${team.creditedCount})',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 32, color: const Color(0xFFE2E8F0)),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        team.pendingAmount,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFEA580C),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Pending (${team.pendingCount})',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
