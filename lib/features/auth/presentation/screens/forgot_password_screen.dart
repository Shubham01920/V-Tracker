import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_text_field.dart';
import 'package:snap_q/features/auth/domain/validation_helper.dart';
import 'package:snap_q/core/utils/snackbar_helper.dart';
import 'package:snap_q/core/utils/dynamic_snackbar.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            // ── Header: Background image + overlay text ──
            Stack(
              children: [
                Container(
                  height: 280,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage('assets/images/background.png'),
                      fit: BoxFit.cover,
                      alignment: Alignment.centerRight,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 42,
                  left: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: 'V ',
                              style: GoogleFonts.outfit(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: AppColors.gold,
                              ),
                            ),
                            TextSpan(
                              text: 'TRACKER',
                              style: GoogleFonts.outfit(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 2),
                      RichText(
                        text: TextSpan(
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.primaryNavy,
                          ),
                          children: const [
                            TextSpan(
                              text: 'Recover Your Account ',
                            ),
                            TextSpan(
                              text: '\nSecurely',
                              style: TextStyle(
                                color: AppColors.gold,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // ── Forgot Password Card (Aligned Center-Top & Scrollable) ──
            Expanded(
              child: Align(
                alignment: Alignment.topCenter,
                child: SingleChildScrollView(
                  child: Transform.translate(
                    offset: const Offset(0, -14),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 24),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Reset Password',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "Enter your email address below and we'll send you a link to reset your password.",
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                color: Colors.grey.shade500,
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Email field
                            VTTextField(
                              controller: _emailController,
                              hintText: 'Email address',
                              prefixIcon: const Icon(Icons.email_outlined),
                              keyboardType: TextInputType.emailAddress,
                              validator: ValidationHelper.validateEmail,
                            ),
                            const SizedBox(height: 20),

                            // Reset Button
                            VTButton(
                              text: 'Send Reset Link',
                              height: 48,
                              backgroundColor: AppColors.primaryNavy,
                              textColor: Colors.white,
                              onPressed: () {
                                if (_formKey.currentState!.validate()) {
                                  SnackbarHelper.show(
                                    context: context,
                                    message: 'Password reset link sent to your email!',
                                    type: SnackbarType.success,
                                  );
                                  Navigator.pop(context);
                                }
                              },
                            ),
                            const SizedBox(height: 24),

                            // Back to Login Link
                            Center(
                              child: InkWell(
                                onTap: () => Navigator.pop(context),
                                child: RichText(
                                  text: TextSpan(
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      color: Colors.grey.shade500,
                                    ),
                                    children: const [
                                      TextSpan(text: 'Remember password? '),
                                      TextSpan(
                                        text: 'Back to Login',
                                        style: TextStyle(
                                          color: AppColors.primaryNavy,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
