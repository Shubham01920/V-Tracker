import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';

Widget buildOrDivider() {
  return Row(
    children: [
      Expanded(child: Divider(color: Colors.grey.shade200)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Text(
          'or continue with',
          style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey.shade400),
        ),
      ),
      Expanded(child: Divider(color: Colors.grey.shade200)),
    ],
  );
}

Widget buildCompactSocialButton({
  required IconData icon,
  required Color iconColor,
  required String label,
}) {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.symmetric(vertical: 13),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: Colors.grey.shade200),
    ),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryNavy,
          ),
        ),
      ],
    ),
  );
}

Widget buildSecureCard() {
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    decoration: BoxDecoration(
      color: const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0xFFE2E8F0)),
    ),
    child: Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: const BoxDecoration(
            color: Color(0xFFFEF3C7),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.shield_outlined,
            color: AppColors.primaryNavy,
            size: 20,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your data is secure with us.',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'We never share your information with anyone. Your privacy is our priority.',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  color: const Color(0xFF64748B),
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

Widget buildTermsText() {
  return Center(
    child: RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade500),
        children: const [
          TextSpan(text: 'By continuing, you agree to our\n'),
          TextSpan(
            text: 'Terms of Service',
            style: TextStyle(
              color: AppColors.primaryNavy,
              fontWeight: FontWeight.bold,
            ),
          ),
          TextSpan(text: ' and '),
          TextSpan(
            text: 'Privacy Policy',
            style: TextStyle(
              color: AppColors.primaryNavy,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    ),
  );
}
