import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_spacing.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/routes/app_routes.dart';

/// ── PROFILE & SETTINGS SCREEN ──────────────────────────────────────────────
/// Displays the user's profile picture, contact details, edit options,
/// and a list (of navigable app settings / menu items matching the mockup).
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Page background color unified with the rest of the application
      backgroundColor: AppColors.bg,
      
      // Top Navigation Bar (with Page Title)
      appBar: const VTAppBar2(
        title: AppStrings.myProfileTitle,
        showAction: false,
        backgroundColor: AppColors.bg,
      ),
      
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppSpacing.heightM,
            
            // ── SECTION 1: PROFILE HEADER (ROW) ───────────────────────────────
            // Contains the left-aligned Circular Avatar and right-aligned user details
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Row(
                children: [
                  // Circle Profile Avatar (with soft gray border)
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.grey.withValues(alpha: 0.5),
                        width: 1,
                      ),
                      image: const DecorationImage(
                        image: NetworkImage(
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                  
                  // User Details (Column) (Name, Phone, Email, Edit Action)
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Display Name
                        Text(
                          AppStrings.profileName,
                          style: AppTextStyles.headTitleBold(
                            fontSize: 20,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                        const SizedBox(height: 4),
                        // Contact Phone Number
                        Text(
                          AppStrings.profilePhone,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        // Email Address
                        Text(
                          AppStrings.profileEmail,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        // 'Edit Profile' Clickable Action (Text) Link
                        GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, AppRoutes.editProfile);
                          },
                          child: Text(
                            AppStrings.editProfileBtn,
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryNavy,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // ── SECTION 2: SETTINGS MENU (LIST) ───────────────────────────────
            // List (of various profile options, each styled with an outline icon and chevron)
            _buildMenuItem(
              icon: Icons.directions_car_outlined,
              title: AppStrings.menuMyVehicles,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.myVehicles);
              },
            ),
            _buildMenuItem(
              icon: Icons.toll_outlined,
              title: 'FASTag Balance & Recharge',
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.fasttagCheck);
              },
            ),
            _buildMenuItem(
              icon: Icons.verified_user_outlined,
              title: 'Verified Documents',
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.verifiedDocuments);
              },
            ),
            _buildMenuItem(
              icon: Icons.shopping_bag_outlined,
              title: AppStrings.menuMyOrders,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.myOrders);
              },
            ),
            _buildMenuItem(
              icon: Icons.person_pin_circle_outlined,
              title: AppStrings.menuAddressBook,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.addressBook);
              },
            ),
            _buildMenuItem(
              icon: Icons.account_balance_outlined,
              title: AppStrings.drawerBankDetails,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.bankDetails);
              },
            ),
            // _buildMenuItem(
            //   icon: Icons.credit_card_outlined,
            //   title: AppStrings.menuPaymentMethods,
            //   onTap: () {},
            // ),
            _buildMenuItem(
              icon: Icons.share_outlined,
              title: AppStrings.menuReferralEarnings,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.referral);
              },
            ),
            _buildMenuItem(
              icon: Icons.star_outline,
              title: AppStrings.menuRewards,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.scratchCard);
              },
            ),
            _buildMenuItem(
              icon: Icons.help_outline,
              title: AppStrings.menuHelpSupport,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.helpAndSupport);
              },
            ),
            _buildMenuItem(
              icon: Icons.info_outline,
              title: AppStrings.drawerAboutUs,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.about);
              },
            ),
            _buildMenuItem(
              icon: Icons.lock_outline,
              title: AppStrings.drawerPrivacyPolicy,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.privacyPolicy);
              },
            ),
            _buildMenuItem(
              icon: Icons.gavel_outlined,
              title: AppStrings.drawerTermsAndConditions,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.termsAndConditions);
              },
            ),
            // _buildMenuItem(
            //   icon: Icons.settings_outlined,
            //   title: AppStrings.menuSettings,
            //   onTap: () {},
            // ),
            
            const SizedBox(height: 16),
            
            // ── SECTION 3: LOGOUT (BUTTON) ───────────────────────────────────
            // Specialized destructive action button without a trailing chevron
            _buildMenuItem(
              icon: Icons.logout,
              title: AppStrings.menuLogout,
              onTap: () {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  AppRoutes.login,
                  (route) => false,
                );
              },
              isDestructive: true,
            ),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  // ── HELPER: BUILD MENU ITEM (ROW) ──────────────────────────────────────────
  // Generates a clickable list option (row with custom styling for standard & destructive actions)
  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isDestructive = false, // If true, applies red theme for destructive options
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 14.0),
        child: Row(
          children: [
            // Left icon (themed in Red for destructive action, else Navy)
            Icon(
              icon,
              size: 24,
              color: isDestructive ? AppColors.error : AppColors.primaryNavy,
            ),
            const SizedBox(width: 20),
            // Title label (semi-bold style)
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDestructive ? AppColors.error : AppColors.primaryNavy,
                ),
              ),
            ),
            // Trailing Chevron pointing right (rendered only for standard options)
            if (!isDestructive)
              const Icon(
                Icons.chevron_right,
                size: 20,
                color: AppColors.primaryNavy,
              ),
          ],
        ),
      ),
    );
  }
}
