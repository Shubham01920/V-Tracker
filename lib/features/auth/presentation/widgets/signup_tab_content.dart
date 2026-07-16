import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_text_field.dart';
import 'package:snap_q/features/auth/presentation/widgets/auth_shared_widgets.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/features/auth/domain/validation_helper.dart';

class SignupTabContent extends StatefulWidget {
  const SignupTabContent({super.key});

  @override
  State<SignupTabContent> createState() => _SignupTabContentState();
}

class _SignupTabContentState extends State<SignupTabContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 9, 16, 10),
      child: Form(
        key: _formKey,
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

            VTTextField(
              controller: _nameController,
              hintText: 'Full Name',
              prefixIcon: const Icon(Icons.person_outline),
              validator: ValidationHelper.validateName,
            ),
            const SizedBox(height: 10),

            VTTextField(
              controller: _emailController,
              hintText: 'Email address',
              prefixIcon: const Icon(Icons.email_outlined),
              keyboardType: TextInputType.emailAddress,
              validator: ValidationHelper.validateEmail,
            ),
            const SizedBox(height: 10),

            VTTextField(
              controller: _phoneController,
              hintText: 'Phone Number',
              prefixIcon: const Icon(Icons.phone_outlined),
              keyboardType: TextInputType.phone,
              validator: ValidationHelper.validatePhone,
            ),
            const SizedBox(height: 10),

            VTTextField(
              controller: _passwordController,
              hintText: 'Password',
              prefixIcon: const Icon(Icons.lock_outline),
              isObscure: _obscurePassword,
              validator: ValidationHelper.validatePassword,
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
                if (_formKey.currentState!.validate()) {
                  Navigator.pushReplacementNamed(
                    context,
                    AppRoutes.navigation,
                  );
                }
              },
            ),
            const SizedBox(height: 12),

            buildOrDivider(),
            const SizedBox(height: 12),

            // Social button
            buildCompactSocialButton(
              imagePath: 'assets/images/google.png',
              label: 'Continue with Google',
            ),
            const SizedBox(height: 16),

            buildSecureCard(),
          ],
        ),
      ),
    );
  }
}
