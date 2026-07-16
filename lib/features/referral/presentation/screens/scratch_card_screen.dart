import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/features/referral/data/models/reward_model.dart';
import 'package:snap_q/features/referral/presentation/widgets/scratch_card_widget.dart';
import 'package:snap_q/features/referral/presentation/widgets/scratch_card_modal_content.dart';
import 'package:snap_q/features/referral/presentation/widgets/voucher_detail_sheet_content.dart';

class ScratchCardScreen extends StatefulWidget {
  const ScratchCardScreen({super.key});

  @override
  State<ScratchCardScreen> createState() => _ScratchCardScreenState();
}

class _ScratchCardScreenState extends State<ScratchCardScreen> {
  // Initialize mock rewards list
  late List<RewardModel> _rewards;

  @override
  void initState() {
    super.initState();
    _rewards = [
      RewardModel(
        id: '1',
        title: 'Earn up to ₹1,000 in cash',
        subtitle: 'Rewarded for paying using Snap Q',
        amount: 45.0,
        status: RewardStatus.unscratched,
        type: RewardType.cashback,
        description: 'Cashback will be credited directly to your primary bank account within 24 hours.',
        code: '',
        date: DateTime.now(),
      ),
      // RewardModel(
      //   id: '2',
      //   title: 'Voucher from Meesho',
      //   subtitle: 'Rewarded for completing 3 shop orders',
      //   amount: 75.0,
      //   status: RewardStatus.unscratched,
      //   type: RewardType.voucher,
      //   description: 'Get flat ₹75 off on a minimum spend of ₹150. Valid on all products on Meesho app.',
      //   code: 'MEESHO75',
      //   date: DateTime.now().add(const Duration(days: 10)),
      // ),
      RewardModel(
        id: '3',
        title: 'Earn up to ₹500 in cash',
        subtitle: 'Rewarded for referring a friend',
        amount: 15.0,
        status: RewardStatus.unscratched,
        type: RewardType.cashback,
        description: 'Cashback will be credited directly to your primary bank account within 24 hours.',
        code: '',
        date: DateTime.now(),
      ),
      // RewardModel(
      //   id: '4',
      //   title: 'Free Lenskart Gold',
      //   subtitle: 'Rewarded for high value scan',
      //   amount: 800.0,
      //   status: RewardStatus.unscratched,
      //   type: RewardType.voucher,
      //   description: 'Get free 1-year Lenskart Gold membership worth ₹800. Code can be applied on checkout.',
      //   code: 'LENSKARTGOLD',
      //   date: DateTime.now().add(const Duration(days: 30)),
      // ),
      RewardModel(
        id: '5',
        title: 'Cashback Reward',
        subtitle: 'Rewarded for QR Activation',
        amount: 0.0,
        status: RewardStatus.scratched,
        type: RewardType.cashback,
        description: 'Better luck next time! Keep scanning to unlock more scratch cards.',
        code: '',
        date: DateTime.now().subtract(const Duration(days: 2)),
      ),
      // RewardModel(
      //   id: '6',
      //   title: 'Meesho Voucher',
      //   subtitle: 'Rewarded for order checkout',
      //   amount: 20.0,
      //   status: RewardStatus.scratched,
      //   type: RewardType.voucher,
      //   description: 'Flat ₹20 off on your next Meesho order of any value.',
      //   code: 'MEESHO20',
      //   date: DateTime.now().subtract(const Duration(days: 5)),
      // ),
    ];
  }

  // Calculate total rewards earned from scratched items
  double get _totalRewards {
    return _rewards
        .where((r) => r.status == RewardStatus.scratched)
        .fold(0.0, (sum, r) => sum + r.amount);
  }

  // Handle successful scratch of a card
  void _onCardScratched(String cardId) {
    setState(() {
      final index = _rewards.indexWhere((r) => r.id == cardId);
      if (index != -1) {
        _rewards[index] = _rewards[index].copyWith(status: RewardStatus.scratched);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Unscratched active cards
    final unscratchedRewards =
        _rewards.where((r) => r.status == RewardStatus.unscratched).toList();

    // Scratched past cards
    final scratchedRewards =
        _rewards.where((r) => r.status == RewardStatus.scratched).toList();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.bg,
        appBar: const VTAppBar2(
          title: 'Rewards',
          showAction: false,
          showBackButton: true,
          backgroundColor: AppColors.bg,
        ),
        body: Column(
          children: [
            // ── TOTAL REWARDS HEADER CARD ──
            _buildTotalRewardsHeader(),

            // ── TAB BAR ──
            Container(
              color: AppColors.white,
              child: TabBar(
                indicatorColor: AppColors.gold,
                indicatorWeight: 3.0,
                labelColor: AppColors.primaryNavy,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: AppTextStyles.labelLarge(fontWeight: FontWeight.bold),
                unselectedLabelStyle:
                    AppTextStyles.labelLarge(fontWeight: FontWeight.normal),
                tabs: const [
                  Tab(text: 'My Rewards'),
                  Tab(text: 'History'),
                ],
              ),
            ),

            // ── TAB VIEW CONTENT ──
            Expanded(
              child: TabBarView(
                children: [
                  // Tab 1: Unscratched Rewards Grid
                  _buildRewardsTab(unscratchedRewards),

                  // Tab 2: Scratched Rewards History Grid
                  _buildHistoryTab(scratchedRewards),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTotalRewardsHeader() {
    return Container(
      margin: const EdgeInsets.all(16.0),
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryNavy, AppColors.navyLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryNavy.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background subtle design patterns
          Positioned(
            right: -20,
            top: -20,
            child: CircleAvatar(
              radius: 80,
              backgroundColor: AppColors.white.withValues(alpha: 0.03),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 28.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Cashback',
                      style: AppTextStyles.bodyMedium(
                        color: AppColors.textSecondary.withValues(alpha: 0.8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '₹${_totalRewards.toStringAsFixed(0)}',
                      style: AppTextStyles.displayLarge(
                        color: AppColors.gold,
                        fontSize: 38,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Directly credited to bank account',
                      style: AppTextStyles.captionText(
                        color: AppColors.white.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
                // Premium Gift Card Box Icon Stack
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        color: AppColors.white.withValues(alpha: 0.08),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const Icon(
                      Icons.card_giftcard_rounded,
                      size: 40,
                      color: AppColors.gold,
                    ),
                    const Positioned(
                      top: 12,
                      right: 12,
                      child: Icon(
                        Icons.star_rounded,
                        size: 14,
                        color: AppColors.yellow,
                      ),
                    ),
                    const Positioned(
                      bottom: 12,
                      left: 12,
                      child: Icon(
                        Icons.star_rounded,
                        size: 10,
                        color: AppColors.yellow,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── TAB 1: UNSCRATCHED CARDS ──
  Widget _buildRewardsTab(List<RewardModel> activeRewards) {
    if (activeRewards.isEmpty) {
      return _buildEmptyState(
        icon: Icons.redeem_outlined,
        title: 'No Active Rewards',
        subtitle: 'Complete orders or scan QRs to earn new scratch cards!',
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16.0,
        mainAxisSpacing: 16.0,
        childAspectRatio: 1.0,
      ),
      itemCount: activeRewards.length,
      itemBuilder: (context, index) {
        final reward = activeRewards[index];
        return GestureDetector(
          onTap: () => _openScratchCardModal(reward),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.primaryNavy,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Card preview cover image
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      'assets/UI/card_1.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                // "New" badge in corner
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'New',
                      style: AppTextStyles.captionText(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── TAB 2: HISTORY (SCRATCHED) ──
  Widget _buildHistoryTab(List<RewardModel> scratchedRewards) {
    if (scratchedRewards.isEmpty) {
      return _buildEmptyState(
        icon: Icons.history_rounded,
        title: 'No History Yet',
        subtitle: 'Once you scratch cards, your claimed rewards will show up here.',
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16.0,
        mainAxisSpacing: 16.0,
        childAspectRatio: 1.0,
      ),
      itemCount: scratchedRewards.length,
      itemBuilder: (context, index) {
        final reward = scratchedRewards[index];
        final isCashback = reward.type == RewardType.cashback;
        final isBetterLuck = reward.amount == 0;

        return GestureDetector(
          onTap: () => _openVoucherDetailBottomSheet(reward),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.grey.withValues(alpha: 0.5), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon badge based on type
                  if (isBetterLuck) ...[
                    const Icon(Icons.sentiment_dissatisfied_rounded,
                        size: 38, color: AppColors.textSecondary)
                  ] else if (isCashback) ...[
                    const CircleAvatar(
                      backgroundColor: AppColors.greenLightBg,
                      radius: 20,
                      child: Icon(Icons.account_balance_wallet_outlined,
                          color: AppColors.success, size: 22),
                    )
                  ] else ...[
                    const CircleAvatar(
                      backgroundColor: AppColors.goldLightBg,
                      radius: 20,
                      child: Icon(Icons.confirmation_number_outlined,
                          color: AppColors.gold, size: 22),
                    )
                  ],
                  const SizedBox(height: 10),
                  Text(
                    isBetterLuck
                        ? 'Better Luck'
                        : isCashback
                            ? '₹${reward.amount.toStringAsFixed(0)}'
                            : reward.title.replaceAll('Voucher from ', ''),
                    textAlign: TextAlign.center,
                    style: AppTextStyles.labelLarge(
                      color: AppColors.primaryNavy,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isBetterLuck
                        ? 'Next time!'
                        : isCashback
                            ? 'Cashback Won'
                            : 'Voucher Code: ${reward.code}',
                    style: AppTextStyles.captionText(
                      color: AppColors.textSecondary,
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
      },
    );
  }

  // ── MODAL DIALOG SCRATCH AREA ──
  void _openScratchCardModal(RewardModel reward) {
    bool isScratchedLocal = false;

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Scratch Card',
      barrierColor: Colors.black.withValues(alpha: 0.85),
      transitionDuration: const Duration(milliseconds: 250),
      pageBuilder: (context, anim1, anim2) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Scaffold(
              backgroundColor: Colors.transparent,
              body: Stack(
                children: [
                  // 1. Centered Scratch Card
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Card container (280 x 280)
                        Container(
                          width: 280,
                          height: 280,
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: ScratchCardWidget(
                            imagePath: 'assets/UI/card_1.png',
                            onScratchCompleted: () {
                              _onCardScratched(reward.id);
                              setModalState(() {
                                isScratchedLocal = true;
                              });
                              // Auto-open detailed sheet after 1.2 seconds
                              Future.delayed(const Duration(milliseconds: 1200), () {
                                if (context.mounted && Navigator.canPop(context)) {
                                  Navigator.pop(context); // Close scratch dialog
                                  _openVoucherDetailBottomSheet(reward);
                                }
                              });
                            },
                            child: ScratchCardModalContent(reward: reward),
                          ),
                        ),
                        const SizedBox(height: 100), // Spacing for bottom sheet
                      ],
                    ),
                  ),

                  // 2. Top Close Button
                  Positioned(
                    top: 40,
                    left: 16,
                    child: IconButton(
                      icon: const Icon(Icons.close_rounded, color: AppColors.white, size: 28),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),

                  // 3. Persistent Bottom Preview Sheet (Google Pay Style)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: AppColors.slate800, // Premium Slate Gray
                        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 36,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Colors.white24,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          Text(
                            isScratchedLocal
                                ? (reward.amount > 0 ? 'Congratulations!' : 'Better luck next time!')
                                : reward.title,
                            textAlign: TextAlign.center,
                            style: AppTextStyles.headTitleBold(
                              color: AppColors.white,
                              fontSize: 20,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            isScratchedLocal
                                ? (reward.amount > 0 ? 'Reward unlocked successfully.' : 'Keep scanning to win.')
                                : reward.subtitle,
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodyMedium(
                              color: Colors.white60,
                            ),
                          ),
                          const SizedBox(height: 8),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ── HISTORY VOUCHER DETAIL BOTTOM SHEET ──
  void _openVoucherDetailBottomSheet(RewardModel reward) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return VoucherDetailSheetContent(reward: reward);
      },
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: AppColors.textSecondary.withValues(alpha: 0.4)),
            const SizedBox(height: 16),
            Text(
              title,
              style: AppTextStyles.labelLarge(
                color: AppColors.primaryNavy,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

