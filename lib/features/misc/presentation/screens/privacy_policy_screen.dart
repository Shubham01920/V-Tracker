import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Privacy Policy',
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
              'Your Privacy is Our Priority',
              style: AppTextStyles.headlineLarge(color: AppColors.primaryNavy),
            ),
            const SizedBox(height: 8),
            Text(
              'Last Updated: July 2026',
              style: AppTextStyles.bodySmall(),
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '1. Private Communication Bridge',
              content: 'V Tracker uses an automated calling and messaging routing system. When a scanner scans your vehicle’s QR code, they are presented with options to call or message you. Both the caller’s number and your number are entirely masked and hidden. No personal phone numbers are exchanged at any point.',
            ),
            _buildSection(
              title: '2. Information We Collect',
              content: 'We only collect essential information required to set up your account and deliver your QR code labels. This includes:\n• Full Name\n• Contact Number (for account setup and OTP validation)\n• Email Address\n• Shipping Address (for delivery of QR code labels)',
            ),
            _buildSection(
              title: '3. QR Scanning Privacy',
              content: 'Scanners do not need to download the V Tracker app or register an account to contact you. We do not track or store any personal data of the scanner, ensuring a frictionless and completely secure experience for both parties.',
            ),
            _buildSection(
              title: '4. Data Security',
              content: 'Your account data is encrypted and securely stored. We never sell, rent, or lease your personal information to third parties. We utilize industry-standard protocols to protect against unauthorized access.',
            ),
            _buildSection(
              title: '5. Contact Privacy Team',
              content: 'If you have any questions or concerns regarding our privacy practices, please contact us at privacy@vtracker.com.',
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required String content}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.labelLarge(
              color: AppColors.primaryNavy,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: AppTextStyles.bodyMedium(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
