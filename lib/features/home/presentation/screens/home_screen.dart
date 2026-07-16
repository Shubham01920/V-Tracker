import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar.dart';
import 'package:snap_q/core/widgets/vt_drawer.dart';
import 'package:snap_q/core/widgets/vt_search_bar.dart';
import 'package:snap_q/core/routes/app_routes.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      drawer: VTDrawer(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          Navigator.pop(context); // close drawer
          switch (index) {
            case 0:
              setState(() {
                _selectedIndex = index;
              });
              break;
            case 1:
              Navigator.pushNamed(context, AppRoutes.shop);
              break;
            case 2:
              Navigator.pushNamed(context, AppRoutes.myOrders);
              break;
            case 3:
              Navigator.pushNamed(context, AppRoutes.trackOrder);
              break;
            case 4:
              Navigator.pushNamed(context, AppRoutes.referral);
              break;
            case 5:
              Navigator.pushNamed(context, AppRoutes.scratchCard);
              break;
            case 6:
              Navigator.pushNamed(context, AppRoutes.about);
              break;
            case 7:
              Navigator.pushNamed(context, AppRoutes.privacyPolicy);
              break;
            case 8:
              Navigator.pushNamed(context, AppRoutes.termsAndConditions);
              break;
            case 9:
              Navigator.pushNamed(context, AppRoutes.helpAndSupport);
              break;
          }
        },
      ),
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

              // ── Emergency QR Scan Card ──
              Stack(
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
                        // Text and Button Content
                        Expanded(
                          flex: 12,
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  AppStrings.homeEmergencyTitle,
                                  style: AppTextStyles.headlineLarge(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                RichText(
                                  text: TextSpan(
                                    style: AppTextStyles.bodySmall(
                                      color: Colors.white.withValues(alpha: 0.8),
                                      fontSize: 12,
                                    ),
                                    children: const [
                                      TextSpan(text: AppStrings.homePrivateLabel),
                                      TextSpan(
                                        text: '• ',
                                        style: TextStyle(
                                          color: AppColors.gold,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      TextSpan(
                                        text: AppStrings.homeInstantContactLabel,
                                      ),
                                      TextSpan(
                                        text: AppStrings.homeNoAppsRequiredLabel,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 14),
                                InkWell(
                                  onTap: () {},
                                  borderRadius: BorderRadius.circular(12),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 18,
                                      vertical: 10,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.gold,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          AppStrings.scanQrBtn,
                                          style: AppTextStyles.labelLarge(
                                            color: AppColors.primaryNavy,
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        const Icon(
                                          Icons.arrow_forward_rounded,
                                          color: AppColors.primaryNavy,
                                          size: 16,
                                        ),
                                      ],
                                    ),
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
                  right: -15,
                    child: Image.asset(
                      'assets/images/qr_phone_hand.png',
                      fit: BoxFit.contain,
                      height: 180, // Image height can now be changed freely
                    ),
                  ),
                ],
              ),
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
              const SizedBox(height: 24),

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
              const SizedBox(height: 24),

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
              const SizedBox(height: 100),
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
