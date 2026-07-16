import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class HelpAndSupportScreen extends StatelessWidget {
  const HelpAndSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Help & Support',
        showBackButton: true,
        showAction: false,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Frequently Asked Questions',
              style: AppTextStyles.headlineLarge(color: AppColors.primaryNavy),
            ),
            const SizedBox(height: 16),
            _buildFAQTile(
              question: 'How does V Tracker work?',
              answer: 'Once you stick our QR label on your vehicle, anyone who scans it with their phone camera can call or message you through our web interface. Our server routes the call privately, so you get contacted instantly without exposing your phone number.',
            ),
            _buildFAQTile(
              question: 'Is my phone number visible to the scanner?',
              answer: 'No. V Tracker never shares your phone number or email address with the scanner. The call or SMS is bridged anonymously through our secure server.',
            ),
            _buildFAQTile(
              question: 'Do scanners need to install the V Tracker app?',
              answer: 'No. Anyone can scan the QR label using their default phone camera or any standard scanner app. It opens a secure webpage in their mobile browser, allowing them to contact you immediately.',
            ),
            _buildFAQTile(
              question: 'What if someone spams or abuses the scan option?',
              answer: 'We have built-in rate limiting and cooldown periods for scanning and calling. If someone repeatedly scans your vehicle without reason, their access to call/message you will be temporarily blocked. You can also report abuse inside the app.',
            ),
            _buildFAQTile(
              question: 'How do I link a new QR label to my vehicle?',
              answer: 'Go to the Scan tab in the bottom bar, scan your newly purchased QR label, and click on "Link Vehicle". Enter your vehicle number and confirm. It will instantly show up under "My Vehicles".',
            ),
            const SizedBox(height: 32),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primaryNavy,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Still Need Help?',
                    style: AppTextStyles.headlineMedium(color: AppColors.white, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Our dedicated support team is available 24/7 to assist you with QR linking, delivery issues, or account security.',
                    style: AppTextStyles.bodyMedium(color: AppColors.white.withValues(alpha: 0.8)),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.email_outlined, color: AppColors.gold, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'support@vtracker.com',
                        style: AppTextStyles.labelLarge(color: AppColors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.phone_in_talk_outlined, color: AppColors.gold, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        '+91 9158 523 541',
                        style: AppTextStyles.labelLarge(color: AppColors.white),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQTile({required String question, required String answer}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.greyLight, width: 1.5),
      ),
      child: ExpansionTile(
        title: Text(
          question,
          style: AppTextStyles.labelLarge(
            color: AppColors.primaryNavy,
            fontWeight: FontWeight.bold,
          ),
        ),
        iconColor: AppColors.gold,
        collapsedIconColor: AppColors.primaryNavy,
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedAlignment: Alignment.topLeft,
        shape: const RoundedRectangleBorder(
          side: BorderSide(color: Colors.transparent),
        ),
        collapsedShape: const RoundedRectangleBorder(
          side: BorderSide(color: Colors.transparent),
        ),
        children: [
          Text(
            answer,
            style: AppTextStyles.bodyMedium(color: AppColors.textSecondary, fontSize: 14),
          ),
        ],
      ),
    );
  }
}
