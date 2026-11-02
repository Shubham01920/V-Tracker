import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar.dart';
import 'package:snap_q/core/widgets/vt_search_bar.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/features/home/presentation/widgets/home_banner_carousel.dart';
import 'package:snap_q/features/home/presentation/widgets/home_overview_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar(),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Location Selector Row ──
              Row(
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    color: AppColors.primaryNavy,
                    size: 18,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    AppStrings.homeLocation,
                    style: AppTextStyles.bodyMedium(
                      color: AppColors.primaryNavy,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Emergency QR Scan Carousel ──
              const HomeBannerCarousel(),
              const SizedBox(height: 20),

              // ── Search Vehicle Card ──
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppStrings.homeSearchVehicleTitle,
                      style: AppTextStyles.headlineMedium(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      AppStrings.homeSearchVehicleSubtitle,
                      style: AppTextStyles.bodyMedium(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 16),
                    VTSearchBar(
                      hintText: AppStrings.enterVehicleNumberHint,
                      onSearch: (value) {
                        if (value.trim().isNotEmpty) {
                          Navigator.pushNamed(
                            context,
                            AppRoutes.vehicleSearch,
                            arguments: value.trim(),
                          );
                        }
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
               const HomeOverviewSection(),
              const SizedBox(height: 20),

              // ── Quick Actions Section ──
              Text(
                AppStrings.homeQuickActionsTitle,
                style: AppTextStyles.headlineMedium(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 12),
              // Row 1
              Row(
                children: [
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.qr_code_scanner_rounded,
                      color: AppColors.primaryNavy,
                      size: 24,
                    ),
                    label: AppStrings.quickActionScanQr,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.qrScanner);
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.shopping_bag_outlined,
                      color: AppColors.primaryNavy,
                      size: 24,
                    ),
                    label: AppStrings.quickActionMyOrders,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.myOrders);
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.people_outline_rounded,
                      color: AppColors.gold,
                      size: 24,
                    ),
                    label: AppStrings.quickActionReferral,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.referral);
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionCard(
                    icon: _buildRewardsIcon(),
                    label: AppStrings.quickActionRewards,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.scratchCard);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Row 2
              Row(
                children: [
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.toll_outlined,
                      color: AppColors.info,
                      size: 24,
                    ),
                    label: AppStrings.quickActionFasttag,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.fasttagCheck);
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.verified_outlined,
                      color: AppColors.successText,
                      size: 24,
                    ),
                    label: AppStrings.quickActionVerifiedDocs,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.verifiedDocuments);
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.account_balance_outlined,
                      color: AppColors.primaryNavy,
                      size: 24,
                    ),
                    label: AppStrings.quickActionBankDetails,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.bankDetails);
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionCard(
                    icon: const Icon(
                      Icons.account_balance_wallet_outlined,
                      color: AppColors.gold,
                      size: 24,
                    ),
                    label: AppStrings.quickActionWithdraw,
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.withdraw);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 20),

            

              InkWell(
                onTap: () => Navigator.pushNamed(context, AppRoutes.referral),
                child: Stack(
                  alignment: Alignment.centerRight,
                  children: [
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.primaryNavy,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Row(
                        children: [
                          // Text details and invite link
                          Expanded(
                            flex: 12,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    AppStrings.referAndEarnTitle,
                                    style: AppTextStyles.headlineLarge(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    AppStrings.referAndEarnSubtitle,
                                    style: AppTextStyles.bodySmall(
                                      color: Colors.white.withValues(alpha: 0.8),
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  InkWell(
                                    onTap: () {},
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          AppStrings.inviteNowBtn,
                                          style: AppTextStyles.bodyMedium(
                                            color: AppColors.gold,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        const Icon(
                                          Icons.arrow_forward_rounded,
                                          color: AppColors.gold,
                                          size: 14,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          // Spacer to prevent text overlap with the positioned image on the right
                          const Expanded(
                            flex: 7,
                            child: SizedBox(),
                          ),
                        ],
                      ),
                    ),
                    // Positioned Image that doesn't affect container height
                    Positioned(
                      right: 16,
                      child: Image.asset(
                        'assets/images/gift_box.png',
                        fit: BoxFit.contain,
                        height: 110, // Image height can now be changed freely
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Helper Method to Build A Quick Action Card ──
  Widget _buildQuickActionCard({
    required Widget icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 2),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.greyLight, width: 1.5),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              icon,
              const SizedBox(height: 6),
              Text(
                label,
                style: AppTextStyles.bodySmall(
                  color: AppColors.primaryNavy,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Helper Method to Build the Multicolored Rewards Icon ──
  Widget _buildRewardsIcon() {
    return SizedBox(
      width: 24,
      height: 24,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 0,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Colors.blue,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            left: 0,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Colors.orange,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            right: 0,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Colors.purple,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            top: 4,
            left: 4,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: 4,
            right: 4,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Colors.amber,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
