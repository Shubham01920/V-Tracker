import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class YourPerformanceScreen extends StatelessWidget {
  const YourPerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Your Performance',
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
                'Your complete referral Teams overview',
                style: AppTextStyles.bodyMedium(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),

              // ── USER PROFILE CARD ──
              _buildUserProfileCard(),

              const SizedBox(height: 20),

              // ── OVERVIEW SECTION ──
              _buildSectionTitle('Overview'),
              const SizedBox(height: 8),
              _buildOverviewGrid(),

              const SizedBox(height: 20),

              // ── YOUR EARNINGS SECTION ──
              _buildSectionTitle('Your Earnings'),
              const SizedBox(height: 8),
              _buildYourEarningsCard(),

              const SizedBox(height: 20),

              // ── REFERRAL TEAM EARNINGS SECTION ──
              _buildSectionTitle('Referral Team Earnings'),
              const SizedBox(height: 8),
              _buildReferralTeamEarningsCard(),

              const SizedBox(height: 20),

              // ── EARNINGS BY TEAM SECTION ──
              _buildEarningsByTeamCard(),

              const SizedBox(height: 20),

              // ── ACTIVITY RATE SECTION ──
              _buildSectionTitle('Activity Rate'),
              const SizedBox(height: 8),
              _buildActivityRateCard(),

              const SizedBox(height: 20),

              // ── TEAM REQUIREMENTS SECTION ──
              _buildSectionTitle('Team Requirements'),
              const SizedBox(height: 8),
              _buildTeamRequirementsCard(),

              const SizedBox(height: 20),

              // ── PAYOUT STATUS SECTION ──
              _buildSectionTitle('Payout Status'),
              const SizedBox(height: 8),
              _buildPayoutStatusCard(),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: AppColors.primaryNavy,
      ),
    );
  }

  // 1. USER PROFILE CARD
  Widget _buildUserProfileCard() {
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
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: const Color(0xFFF3E8FF),
                child: Text(
                  'B',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF7E22CE),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Basavarajappa K',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'ID: S1-7757 • Code: 1386',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Email: basavarajappak345@gmail.com',
            style: GoogleFonts.outfit(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // 2. OVERVIEW 2x2 GRID
  Widget _buildOverviewGrid() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildOverviewTile(
                icon: Icons.people_rounded,
                iconBg: const Color(0xFFDBEAFE),
                iconColor: const Color(0xFF2563EB),
                value: '163',
                title: 'Total Referrals',
                subtitle: 'Across all Teams',
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: _buildOverviewTile(
                icon: Icons.link_rounded,
                iconBg: const Color(0xFFDCFCE7),
                iconColor: const Color(0xFF16A34A),
                value: '23',
                title: 'Direct Referrals',
                subtitle: 'Team 1 only',
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: _buildOverviewTile(
                icon: Icons.flash_on_rounded,
                iconBg: const Color(0xFFFEF3C7),
                iconColor: const Color(0xFFD97706),
                value: '23',
                title: 'Active Referrals',
                subtitle: 'Currently active',
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: _buildOverviewTile(
                icon: Icons.savings_outlined,
                iconBg: const Color(0xFFF3E8FF),
                iconColor: const Color(0xFF9333EA),
                value: '₹125',
                title: 'Avg Earnings',
                subtitle: 'Per referral',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOverviewTile({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String value,
    required String title,
    required String subtitle,
  }) {
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
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconBg,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(height: 14),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: GoogleFonts.outfit(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // 3. YOUR EARNINGS CARD
  Widget _buildYourEarningsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        children: [
          // Personal Earnings Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Personal Earnings',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF92400E),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '₹1,26,970',
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF78350F),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Total lifetime earnings',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: const Color(0xFFB45309),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Available Balance Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFDCFCE7), Color(0xFFBBF7D0)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Available Balance',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF166534),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '₹100',
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF14532D),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Ready for withdrawal',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: const Color(0xFF15803D),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 4. REFERRAL TEAM EARNINGS CARD
  Widget _buildReferralTeamEarningsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFE0F2FE), Color(0xFFBAE6FD)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Total Teams Earnings',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF075985),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '₹20,420',
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF0369A1),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Generated by your Teams',
              style: GoogleFonts.outfit(
                fontSize: 12,
                color: const Color(0xFF0284C7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 5. EARNINGS BY TEAM CARD
  Widget _buildEarningsByTeamCard() {
    final List<Map<String, dynamic>> teamEarnings = [
      {'tag': 'T1', 'tagBg': const Color(0xFFDBEAFE), 'tagColor': const Color(0xFF1E40AF), 'name': 'Team 1', 'amount': '₹11,650'},
      {'tag': 'T2', 'tagBg': const Color(0xFFDCFCE7), 'tagColor': const Color(0xFF15803D), 'name': 'Team 2', 'amount': '₹4,700'},
      {'tag': 'T3', 'tagBg': const Color(0xFFF3E8FF), 'tagColor': const Color(0xFF7E22CE), 'name': 'Team 3', 'amount': '₹2,650'},
      {'tag': 'T4', 'tagBg': const Color(0xFFFEF3C7), 'tagColor': const Color(0xFFB45309), 'name': 'Team 4', 'amount': '₹1,040'},
      {'tag': 'T5', 'tagBg': const Color(0xFFFCE7F3), 'tagColor': const Color(0xFFBE185D), 'name': 'Team 5', 'amount': '₹360'},
      {'tag': 'T6', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF475569), 'name': 'Team 6', 'amount': '₹20'},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Earnings by Team',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 16),
          ...teamEarnings.map((t) => Padding(
                padding: const EdgeInsets.only(bottom: 14.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: t['tagBg'] as Color,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        t['tag'] as String,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: t['tagColor'] as Color,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      t['name'] as String,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      t['amount'] as String,
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  // 6. ACTIVITY RATE CARD
  Widget _buildActivityRateCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Team Activity',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                '14%',
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: const LinearProgressIndicator(
              value: 0.14,
              minHeight: 8,
              backgroundColor: Color(0xFFE2E8F0),
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF16A34A)),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '23 of 163 referrals are active',
            style: GoogleFonts.outfit(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // 7. TEAM REQUIREMENTS CARD
  Widget _buildTeamRequirementsCard() {
    final List<Map<String, dynamic>> teamReqs = [
      {'tag': 'T1', 'tagBg': const Color(0xFFDBEAFE), 'tagColor': const Color(0xFF1E40AF), 'name': 'Team 1', 'isEligible': true, 'need': 0},
      {'tag': 'T2', 'tagBg': const Color(0xFFDCFCE7), 'tagColor': const Color(0xFF15803D), 'name': 'Team 2', 'isEligible': true, 'need': 2},
      {'tag': 'T3', 'tagBg': const Color(0xFFF3E8FF), 'tagColor': const Color(0xFF7E22CE), 'name': 'Team 3', 'isEligible': true, 'need': 4},
      {'tag': 'T4', 'tagBg': const Color(0xFFFEF3C7), 'tagColor': const Color(0xFFB45309), 'name': 'Team 4', 'isEligible': true, 'need': 6},
      {'tag': 'T5', 'tagBg': const Color(0xFFFCE7F3), 'tagColor': const Color(0xFFBE185D), 'name': 'Team 5', 'isEligible': true, 'need': 8},
      {'tag': 'T6', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF475569), 'name': 'Team 6', 'isEligible': true, 'need': 10},
      {'tag': 'T7', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF475569), 'name': 'Team 7', 'isEligible': true, 'need': 12},
      {'tag': 'T8', 'tagBg': const Color(0xFFFEF3C7), 'tagColor': const Color(0xFFB45309), 'name': 'Team 8', 'isEligible': true, 'need': 14},
      {'tag': 'T9', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF475569), 'name': 'Team 9', 'isEligible': true, 'need': 16},
      {'tag': 'T10', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF475569), 'name': 'Team 10', 'isEligible': true, 'need': 18},
      {'tag': 'T11', 'tagBg': const Color(0xFFDBEAFE), 'tagColor': const Color(0xFF1E40AF), 'name': 'Team 11', 'isEligible': true, 'need': 20},
      {'tag': 'T12', 'tagBg': const Color(0xFFDCFCE7), 'tagColor': const Color(0xFF15803D), 'name': 'Team 12', 'isEligible': true, 'need': 22},
      {'tag': 'T13', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF94A3B8), 'name': 'Team 13', 'isEligible': false, 'need': 24},
      {'tag': 'T14', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF94A3B8), 'name': 'Team 14', 'isEligible': false, 'need': 26},
      {'tag': 'T15', 'tagBg': const Color(0xFFF1F5F9), 'tagColor': const Color(0xFF94A3B8), 'name': 'Team 15', 'isEligible': false, 'need': 28},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        children: teamReqs.map((t) {
          final bool isEligible = t['isEligible'] as bool;
          return Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: t['tagBg'] as Color,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    t['tag'] as String,
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: t['tagColor'] as Color,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  t['name'] as String,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const Spacer(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isEligible ? Icons.check_rounded : Icons.close_rounded,
                          size: 14,
                          color: isEligible
                              ? const Color(0xFF16A34A)
                              : const Color(0xFFDC2626),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          isEligible ? 'Eligible' : 'Locked',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: isEligible
                                ? const Color(0xFF16A34A)
                                : const Color(0xFFDC2626),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Need ${t['need']} referrals',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // 8. PAYOUT STATUS CARD
  Widget _buildPayoutStatusCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFBBF7D0), width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF16A34A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Colors.white,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Team 2+ Payouts Enabled',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF15803D),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'You can receive earnings from all Teams',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: const Color(0xFF166534),
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
