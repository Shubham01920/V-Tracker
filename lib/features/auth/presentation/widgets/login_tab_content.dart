import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_text_field.dart';
import 'package:snap_q/features/auth/presentation/widgets/auth_shared_widgets.dart';

import 'package:snap_q/core/constants/routes/app_routes.dart';

class LoginTabContent extends StatefulWidget {
  const LoginTabContent({super.key});

  @override
  State<LoginTabContent> createState() => _LoginTabContentState();
}

class _LoginTabContentState extends State<LoginTabContent> {
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 9, 16, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Heading
          Text(
            AppStrings.loginHeading,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            AppStrings.loginSubheading,
            style: GoogleFonts.outfit(
              fontSize: 13,
              color: Colors.grey.shade500,
            ),
          ),
          const SizedBox(height: 12),

          // Email
          const VTTextField(
            hintText: 'Email address',
            prefixIcon: Icon(Icons.email_outlined),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 10),

          // Password
          VTTextField(
            hintText: 'Password',
            prefixIcon: const Icon(Icons.lock_outline),
            isObscure: _obscurePassword,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
          const SizedBox(height: 6),

          // Forgot Password
          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: () {
              },
              child: Text(
                'Forgot Password?',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryNavy,
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Login Button
          VTButton(
            text: 'Login',
            height: 48,
            backgroundColor: AppColors.primaryNavy,
            textColor: Colors.white,
            onPressed: () {
              Navigator.pushReplacementNamed(
                context,
                AppRoutes.navigation,
              );
            },
          ),
          const SizedBox(height: 12),

          // Divider
          buildOrDivider(),
          const SizedBox(height: 12),

          // Social button
          buildCompactSocialButton(
            icon: Icons.g_mobiledata,
            iconColor: Colors.red,
            label: 'Google',
          ),

          // Spacer pushes secure card to bottom of white card
          const Spacer(),

          // Secure card
          buildSecureCard(),
        ],
      ),
    );
  }
}
