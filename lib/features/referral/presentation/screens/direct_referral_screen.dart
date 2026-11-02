import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/features/referral/data/models/direct_referral_model.dart';
import 'package:snap_q/features/referral/presentation/widgets/direct_referral_stats_card.dart';
import 'package:snap_q/features/referral/presentation/widgets/direct_referral_table.dart';

class DirectReferralScreen extends StatelessWidget {
  const DirectReferralScreen({super.key});

  final List<DirectReferralModel> _allReferrals = const [
    DirectReferralModel(
      sn: 1,
      name: 'Pavan s h',
      email: 'pavandhanu75@gmail.com',
      userId: 'S1-6547',
      joinedDate: '27/12/2025',
      totalTeam: 0,
      activeTeam: 0,
      status: 'ACTIVE',
    ),
    DirectReferralModel(
      sn: 2,
      name: 'YOGESHA MH',
      email: 'yogeshmh949@gmail.com',
      userId: 'S1-6221',
      joinedDate: '26/1/2026',
      totalTeam: 0,
      activeTeam: 0,
      status: 'ACTIVE',
    ),
    DirectReferralModel(
      sn: 3,
      name: 'AVINASHA PATIL',
      email: 'avinashapatil973@gmail.com',
      userId: 'S1-3207',
      joinedDate: '27/12/2025',
      totalTeam: 0,
      activeTeam: 0,
      status: 'ACTIVE',
    ),
    DirectReferralModel(
      sn: 4,
      name: 'Nethravathi',
      email: 'nethraspurti561@gmail.com',
      userId: 'S1-4557',
      joinedDate: '27/12/2025',
      totalTeam: 1,
      activeTeam: 1,
      status: 'ACTIVE',
    ),
    DirectReferralModel(
      sn: 5,
      name: 'Raju H P',
      email: 'rajuhp1986@gmail.com',
      userId: 'S1-4242',
      joinedDate: '1/2/2026',
      totalTeam: 0,
      activeTeam: 0,
      status: 'ACTIVE',
    ),
    DirectReferralModel(
      sn: 6,
      name: 'Manjappa H E',
      email: 'hemanjunath96@gmail.com',
      userId: 'S1-8075',
      joinedDate: '7/2/2026',
      totalTeam: 0,
      activeTeam: 0,
      status: 'ACTIVE',
    ),
    DirectReferralModel(
      sn: 7,
      name: 'Mallikarjun N K',
      email: 'mallikarjunnkmalli787@gmail.com',
      userId: 'S1-7478',
      joinedDate: '10/1/2026',
      totalTeam: 5,
      activeTeam: 5,
      status: 'ACTIVE',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final int totalCount = _allReferrals.length;
    final int activeCount =
        _allReferrals.where((r) => r.status == 'ACTIVE').length;
    final double activeRate =
        totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Direct Refer',
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
                'Manage and view your direct team members',
                style: AppTextStyles.bodyMedium(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),

              // ── REUSABLE STATS CARD WIDGET ──
              DirectReferralStatsCard(
                totalMembers: totalCount,
                activeMembers: activeCount,
                activeRate: activeRate,
              ),

              const SizedBox(height: 16),

              // ── REUSABLE DATA TABLE WIDGET ──
              DirectReferralTable(referrals: _allReferrals),

              const SizedBox(height: 12),

              // ── FOOTER PAGINATION INFO ──
              Center(
                child: Text(
                  'Showing ${_allReferrals.length} of $totalCount members',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.textSecondary.withValues(alpha: 0.8),
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
}
