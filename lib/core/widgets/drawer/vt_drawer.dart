import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/core/widgets/drawer/drawer_banner_card_widget.dart';
import 'package:snap_q/core/widgets/drawer/drawer_expandable_tile_widget.dart';
import 'package:snap_q/core/widgets/drawer/drawer_header_widget.dart';
import 'package:snap_q/core/widgets/drawer/drawer_tile_widget.dart';

class VTDrawer extends StatefulWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;

  static int activeSelectedIndex = 0;
  static String? activeSubTitle;

  const VTDrawer({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  });

  @override
  State<VTDrawer> createState() => _VTDrawerState();
}

class _VTDrawerState extends State<VTDrawer> {
  @override
  void initState() {
    super.initState();
    if (widget.selectedIndex == 0) {
      VTDrawer.activeSelectedIndex = 0;
      VTDrawer.activeSubTitle = null;
    }
  }

  @override
  void didUpdateWidget(covariant VTDrawer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selectedIndex == 0) {
      VTDrawer.activeSelectedIndex = 0;
      VTDrawer.activeSubTitle = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.bg,
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // ── Drawer Header ──
            const DrawerHeaderWidget(),

            // ── Dashboard / Home (1st) ──
            DrawerTileWidget(
              icon: Icons.dashboard_outlined,
              label: AppStrings.drawerHome,
              isSelected: (VTDrawer.activeSelectedIndex == 0 && VTDrawer.activeSubTitle == null),
              onTap: () {
                setState(() {
                  VTDrawer.activeSelectedIndex = 0;
                  VTDrawer.activeSubTitle = null;
                });
                widget.onDestinationSelected(0);
              },
            ),

            // ── My Profile (2nd - Expandable) ──
            _buildExpandableTile(
              icon: Icons.person_outline,
              label: AppStrings.drawerMyProfile,
              subItems: [
                AppStrings.drawerProfileSub,
                AppStrings.drawerBankDetails,
              ],
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == AppStrings.drawerBankDetails) {
                  Navigator.pushNamed(context, AppRoutes.bankDetails);
                } else {
                  Navigator.pushNamed(context, AppRoutes.editProfile);
                }
              },
            ),

            // ── My Team (3rd - Expandable) ──
            _buildExpandableTile(
              icon: Icons.people_outline,
              label: AppStrings.drawerMyTeam,
              subItems: [
                AppStrings.drawerDirectReferral,
                AppStrings.drawerYourPerformance,
                AppStrings.drawerTeamPerformance,
                AppStrings.drawerPayoutHistory,
                AppStrings.drawerPayoutsByTeams,
              ],
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == AppStrings.drawerDirectReferral) {
                  Navigator.pushNamed(context, AppRoutes.directReferral);
                } else if (subItem == AppStrings.drawerYourPerformance) {
                  Navigator.pushNamed(context, AppRoutes.yourPerformance);
                } else if (subItem == AppStrings.drawerTeamPerformance) {
                  Navigator.pushNamed(context, AppRoutes.teamPerformance);
                } else if (subItem == AppStrings.drawerPayoutHistory) {
                  Navigator.pushNamed(context, AppRoutes.payoutHistory);
                } else if (subItem == AppStrings.drawerPayoutsByTeams) {
                  Navigator.pushNamed(context, AppRoutes.payoutsByTeams);
                }
              },
            ),

            // ── Orders (4th - Expandable) ──
            _buildExpandableTile(
              icon: Icons.shopping_bag_outlined,
              label: AppStrings.drawerOrders,
              subItems: [
                AppStrings.drawerShopNow,
                AppStrings.drawerMyOrders,
                AppStrings.drawerTrackOrder,
              ],
              subItemIndexMap: const {
                AppStrings.drawerShopNow: 1,
                AppStrings.drawerMyOrders: 2,
                AppStrings.drawerTrackOrder: 3,
              },
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == AppStrings.drawerShopNow) {
                  widget.onDestinationSelected(1);
                } else if (subItem == AppStrings.drawerMyOrders) {
                  widget.onDestinationSelected(2);
                } else if (subItem == AppStrings.drawerTrackOrder) {
                  widget.onDestinationSelected(3);
                }
              },
            ),

            // ── Rewards (5th - Expandable) ──
            _buildExpandableTile(
              icon: Icons.card_giftcard_outlined,
              label: AppStrings.drawerRewards,
              subItems: [
                AppStrings.drawerReferAndEarn,
                AppStrings.drawerCashbackRewards,
              ],
              subItemIndexMap: const {
                AppStrings.drawerReferAndEarn: 4,
                AppStrings.drawerCashbackRewards: 5,
              },
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == AppStrings.drawerReferAndEarn) {
                  Navigator.pushNamed(context, AppRoutes.referral);
                } else if (subItem == AppStrings.drawerCashbackRewards) {
                  Navigator.pushNamed(context, AppRoutes.scratchCard);
                }
              },
            ),

            // ── Withdraw (6th - Expandable) ──
            _buildExpandableTile(
              icon: Icons.account_balance_wallet_outlined,
              label: AppStrings.drawerWithdraw,
              subItems: [
                AppStrings.drawerWithdraw,
                AppStrings.drawerWithdrawHistory,
              ],
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == AppStrings.drawerWithdrawHistory) {
                  Navigator.pushNamed(context, AppRoutes.withdrawHistory);
                } else {
                  Navigator.pushNamed(context, AppRoutes.withdraw);
                }
              },
            ),

            // ── Help & Support (7th - Expandable) ──
            _buildExpandableTile(
              icon: Icons.contact_support_outlined,
              label: AppStrings.drawerHelpAndSupport,
              subItems: [
                AppStrings.drawerAboutUs,
                AppStrings.drawerPrivacyPolicy,
                AppStrings.drawerTermsAndConditions,
              ],
              subItemIndexMap: const {
                AppStrings.drawerAboutUs: 6,
                AppStrings.drawerPrivacyPolicy: 7,
                AppStrings.drawerTermsAndConditions: 8,
              },
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == AppStrings.drawerAboutUs) {
                  Navigator.pushNamed(context, AppRoutes.about);
                } else if (subItem == AppStrings.drawerPrivacyPolicy) {
                  Navigator.pushNamed(context, AppRoutes.privacyPolicy);
                } else if (subItem == AppStrings.drawerTermsAndConditions) {
                  Navigator.pushNamed(context, AppRoutes.termsAndConditions);
                }
              },
            ),

            // ── More (8th - Expandable) ──
            _buildExpandableTile(
              icon: Icons.grid_view_rounded,
              label: 'More',
              subItems: const [
                'More Overview',
                'Bulk Purchase',
                'Business Login',
                'Wallet',
                'Contact Us',
              ],
              onSubItemTap: (subItem) {
                Navigator.pop(context);
                if (subItem == 'Wallet') {
                  Navigator.pushNamed(context, AppRoutes.withdraw);
                } else if (subItem == 'Contact Us') {
                  Navigator.pushNamed(context, AppRoutes.helpAndSupport);
                } else {
                  Navigator.pushNamed(context, AppRoutes.more);
                }
              },
            ),

            // ── Logout ──
            DrawerTileWidget(
              icon: Icons.logout_rounded,
              label: AppStrings.drawerLogout,
              isSelected: false,
              customColor: Colors.red,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  AppRoutes.login,
                  (route) => false,
                );
              },
            ),

            // ── Refer & Earn Banner Card & App Version Footer ──
            DrawerBannerCardWidget(
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, AppRoutes.referral);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExpandableTile({
    required IconData icon,
    required String label,
    required List<String> subItems,
    Map<String, int>? subItemIndexMap,
    required ValueChanged<String> onSubItemTap,
  }) {
    final bool isParentSelected = VTDrawer.activeSubTitle == label ||
        VTDrawer.activeSubTitle == 'sub_$label' ||
        subItems.map((s) => 'sub_$s').contains(VTDrawer.activeSubTitle) ||
        (VTDrawer.activeSubTitle == null &&
            subItemIndexMap != null &&
            subItemIndexMap.values.contains(VTDrawer.activeSelectedIndex));

    final bool isParentExpanded = isParentSelected ||
        subItems.contains(VTDrawer.activeSubTitle) ||
        subItems.map((s) => 'sub_$s').contains(VTDrawer.activeSubTitle);

    return DrawerExpandableTileWidget(
      icon: icon,
      label: label,
      subItems: subItems,
      subItemIndexMap: subItemIndexMap,
      isParentSelected: isParentSelected,
      isParentExpanded: isParentExpanded,
      activeSubTitle: VTDrawer.activeSubTitle,
      activeSelectedIndex: VTDrawer.activeSelectedIndex,
      onExpansionChanged: (isExpanded) {
        if (isExpanded) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              setState(() {
                VTDrawer.activeSubTitle = label;
                if (subItemIndexMap != null && subItemIndexMap.isNotEmpty) {
                  VTDrawer.activeSelectedIndex = subItemIndexMap.values.first;
                } else {
                  VTDrawer.activeSelectedIndex = -1;
                }
              });
            }
          });
        }
      },
      onSubItemTap: (subTitle) {
        final int? subIndex = subItemIndexMap?[subTitle];
        setState(() {
          VTDrawer.activeSubTitle = 'sub_$subTitle';
          if (subIndex != null) {
            VTDrawer.activeSelectedIndex = subIndex;
          } else {
            VTDrawer.activeSelectedIndex = -1;
          }
        });
        onSubItemTap(subTitle);
      },
    );
  }
}
