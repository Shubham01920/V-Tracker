import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/features/auth/presentation/widgets/auth_shared_widgets.dart';
import 'package:snap_q/features/auth/presentation/widgets/login_tab_content.dart';
import 'package:snap_q/features/auth/presentation/widgets/signup_tab_content.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
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
                    height: 260,
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
                    bottom: 28,
                    left: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppStrings.welcomeMessage,
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                        const SizedBox(height: 2),
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: 'V ',
                                style: GoogleFonts.outfit(
                                  fontSize: 34,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.gold,
                                ),
                              ),
                              TextSpan(
                                text: 'TRACKER',
                                style: GoogleFonts.outfit(
                                  fontSize: 34,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primaryNavy,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        RichText(
                          text: TextSpan(
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: AppColors.primaryNavy,
                            ),
                            children: const [
                              TextSpan(
                                text: 'Your Vehicle Voice,\nWhen You Are ',
                              ),
                              TextSpan(
                                text: 'Not Around',
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

              // ── Card with TabBar + TabBarView ──
              Expanded(
                child: Transform.translate(
                  offset: const Offset(0, -14),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 24),
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
                    child: Column(
                      children: [
                        // TabBar
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: AppColors.greyLight,
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: TabBar(
                              indicator: BoxDecoration(
                                color: AppColors.primaryNavy,
                                borderRadius: BorderRadius.circular(100),
                              ),
                              indicatorSize: TabBarIndicatorSize.tab,
                              dividerColor: Colors.transparent,
                              labelColor: Colors.white,
                              unselectedLabelColor: Colors.grey.shade500,
                              labelStyle: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                              unselectedLabelStyle: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                              labelPadding: EdgeInsets.zero,
                              tabs: const [
                                Tab(height: 38, text: 'Login'),
                                Tab(height: 38, text: 'Signup'),
                              ],
                            ),
                          ),
                        ),

                        // TabBarView
                        const Expanded(
                          child: TabBarView(
                            children: [
                              LoginTabContent(),
                              SignupTabContent(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 4),
              buildTermsText(),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
