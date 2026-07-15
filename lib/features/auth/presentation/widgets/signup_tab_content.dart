import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_text_field.dart';
import 'package:snap_q/features/auth/presentation/widgets/auth_shared_widgets.dart';

import 'package:snap_q/core/constants/routes/app_routes.dart';

class SignupTabContent extends StatefulWidget {
  const SignupTabContent({super.key});

  @override
  State<SignupTabContent> createState() => _SignupTabContentState();
}

class _SignupTabContentState extends State<SignupTabContent> {
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 9, 16, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.signupHeading,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            AppStrings.signupSubheading,
            style: GoogleFonts.outfit(
              fontSize: 13,
              color: Colors.grey.shade500,
            ),
          ),
          const SizedBox(height: 12),

          const VTTextField(
            hintText: 'Full Name',
            prefixIcon: Icon(Icons.person_outline),
          ),
          const SizedBox(height: 10),

          const VTTextField(
            hintText: 'Email address',
            prefixIcon: Icon(Icons.email_outlined),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 10),

          const VTTextField(
            hintText: 'Phone Number',
            prefixIcon: Icon(Icons.phone_outlined),
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 10),

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
          const SizedBox(height: 16),

          VTButton(
            text: 'Signup',
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

          buildOrDivider(),
          const SizedBox(height: 12),

          // Social button
          buildCompactSocialButton(
            icon: Icons.g_mobiledata,
            iconColor: Colors.red,
            label: 'Google',
          ),
          const SizedBox(height: 16),

          buildSecureCard(),
        ],
      ),
    );
  }
}
