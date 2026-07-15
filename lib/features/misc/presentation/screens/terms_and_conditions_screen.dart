import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class TermsAndConditionsScreen extends StatelessWidget {
  const TermsAndConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Terms & Conditions',
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
              'Terms of Service',
              style: AppTextStyles.headlineLarge(color: AppColors.primaryNavy),
            ),
            const SizedBox(height: 8),
            Text(
              'Last Updated: July 2026',
              style: AppTextStyles.bodySmall(),
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '1. Product Description and Intent',
              content: 'V Tracker provides QR code labels and a communication routing platform designed to let people contact vehicle owners in case of emergencies or parking issues. By using V Tracker, you agree to place the QR label visibly on your vehicle and respond to genuine emergency contacts in a civil manner.',
            ),
            _buildSection(
              title: '2. User Registration & Responsibilities',
              content: 'To use the services, you must register a valid phone number and email. You are fully responsible for maintaining the accuracy of your contact details. If your phone number changes, you must update it immediately to prevent emergency notifications from failing or routing to the wrong individual.',
            ),
            _buildSection(
              title: '3. QR Label Care & Fair Use',
              content: 'V Tracker QR labels are durable and weatherproof, but normal wear and tear can occur. You must not tamper with, clone, modify, or replicate the QR labels for unauthorized vehicles. Illegal tracking or harassment using V Tracker QR codes will result in immediate permanent suspension of your account.',
            ),
            _buildSection(
              title: '4. Limitation of Liability',
              content: 'V Tracker acts solely as an anonymous communication routing mechanism. We are not responsible for any disputes, damage, or accidents involving your vehicle, nor do we guarantee that scanners will contact you in every emergency situation. Use of the system is at your own risk.',
            ),
            _buildSection(
              title: '5. Service Termination',
              content: 'We reserve the right to terminate or suspend access to our platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms and Conditions.',
            ),
            _buildSection(
              title: '6. Governing Law',
              content: 'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.',
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
