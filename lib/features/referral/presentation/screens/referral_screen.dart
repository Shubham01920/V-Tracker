import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/features/referral/presentation/widgets/referral_widgets.dart';

class ReferralScreen extends StatelessWidget {
  const ReferralScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const String referralCode = 'SNAPQ99X';

    return const Scaffold(
      backgroundColor: AppColors.bg,
      appBar: VTAppBar2(
        title: 'Refer & Earn',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── PROMO BANNER ──
                    ReferralPromoBanner(),

                    SizedBox(height: 20),

                    // ── EARNINGS SUMMARY CARD ──
                    ReferralEarningsSummary(),

                    SizedBox(height: 20),

                    // ── REFERRAL CODE CARD ──
                    ReferralCodeCard(referralCode: referralCode),

                    SizedBox(height: 24),

                    // ── HOW IT WORKS SECTION ──
                    ReferralHowItWorks(),
                  ],
                ),
              ),
            ),

            // ── BOTTOM SHARE CTA BUTTON ──
            ReferralBottomCta(referralCode: referralCode),
          ],
        ),
      ),
    );
  }
}
