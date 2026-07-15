import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'About Us',
        showBackButton: true,
        showAction: false,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: AppColors.primaryNavy,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.directions_car_rounded,
                      color: AppColors.gold,
                      size: 48,
                    ),
                  ),
                  const SizedBox(height: 12),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: 'V ',
                          style: AppTextStyles.displayLarge(
                            color: AppColors.gold,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        TextSpan(
                          text: 'TRACKER',
                          style: AppTextStyles.displayLarge(
                            color: AppColors.primaryNavy,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Your Vehicle Voice, When You Are Not Around',
                    style: AppTextStyles.bodyMedium(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Our Mission',
              style: AppTextStyles.headlineLarge(color: AppColors.primaryNavy),
            ),
            const SizedBox(height: 8),
            Text(
              'At V Tracker, we are solving the daily conflicts and privacy risks of vehicle parking. Leaving your phone number on your dashboard exposes you to stalking, scam calls, and harassment. But not leaving a number means your car could be towed, blocked, or damaged without you knowing. \n\nV Tracker provides an smart, encrypted QR-code communication bridge that connects people with vehicle owners instantly and securely, preserving 100% user privacy.',
              style: AppTextStyles.bodyMedium(fontSize: 14),
            ),
            const SizedBox(height: 24),
            Text(
              'Key Features',
              style: AppTextStyles.headlineLarge(color: AppColors.primaryNavy),
            ),
            const SizedBox(height: 12),
            _buildFeatureRow(
              icon: Icons.shield_outlined,
              title: '100% Privacy Protected',
              subtitle: 'We mask both party phone numbers entirely. Scanners and owners call/message without sharing contact details.',
            ),
            _buildFeatureRow(
              icon: Icons.flash_on_outlined,
              title: 'Instant Connection',
              subtitle: 'Scan is processed in milliseconds, routing the notification to the owner immediately.',
            ),
            _buildFeatureRow(
              icon: Icons.qr_code_2_rounded,
              title: 'No App Required',
              subtitle: 'The person scanning your vehicle QR label does not need to install the V Tracker app. It works directly in their mobile browser.',
            ),
            _buildFeatureRow(
              icon: Icons.wb_sunny_outlined,
              title: 'Weatherproof & Durable',
              subtitle: 'Our physical QR labels are made with high-quality vinyl sheets that withstand water, heat, and direct sunlight.',
            ),
            const SizedBox(height: 24),
            Center(
              child: Text(
                'Version 1.0.0 (Build 12)',
                style: AppTextStyles.captionText(),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureRow({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primaryNavy, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
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
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AppTextStyles.bodyMedium(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
