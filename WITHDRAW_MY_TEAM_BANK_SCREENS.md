# Complete Source Code: Withdraw, Bank Details, and My Team Screens

This document contains the complete source code for all **Withdraw**, **Bank Details**, and **My Team (Referral)** screens and widgets.

---

## Table of Contents
1. [Withdraw Screen](#1-withdraw-screen)
2. [Withdraw History Screen](#2-withdraw-history-screen)
3. [Bank Details Screen](#3-bank-details-screen)
4. [Direct Referral Model](#4-direct-referral-model)
5. [Direct Referral Screen](#5-direct-referral-screen)
6. [Direct Referral Stats Card](#6-direct-referral-stats-card)
7. [Direct Referral Table](#7-direct-referral-table)
8. [Your Performance Screen](#8-your-performance-screen)
9. [Team Performance Screen](#9-team-performance-screen)
10. [Payout History Screen](#10-payout-history-screen)
11. [Payouts by Teams Screen](#11-payouts-by-teams-screen)

---

## 1. Withdraw Screen
**File Path**: `lib/features/withdraw/presentation/screens/withdraw_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_text_field.dart';
import 'package:snap_q/features/withdraw/presentation/widgets/destination_account_card.dart';
import 'package:snap_q/features/withdraw/presentation/widgets/quick_amount_chips.dart';
import 'package:snap_q/features/withdraw/presentation/widgets/transfer_mode_selector.dart';
import 'package:snap_q/features/withdraw/presentation/widgets/withdraw_balance_card.dart';

class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({super.key});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _amountController = TextEditingController();

  final double _availableBalance = 12450.00;
  final double _minWithdrawal = 500.00;
  bool _isLoading = false;
  String _selectedMethod = 'BANK';

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _selectQuickAmount(double amount) {
    setState(() {
      _amountController.text = amount.toInt().toString();
    });
  }

  void _processWithdrawal() {
    if (_formKey.currentState!.validate()) {
      final double enterAmount = double.tryParse(_amountController.text.trim()) ?? 0.0;
      if (enterAmount < _minWithdrawal) {
        VTSnackbar.showError(
          context,
          'Minimum withdrawal amount is ₹${_minWithdrawal.toInt()}',
        );
        return;
      }
      if (enterAmount > _availableBalance) {
        VTSnackbar.showError(context, 'Insufficient wallet balance');
        return;
      }

      setState(() {
        _isLoading = true;
      });

      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          VTSnackbar.showSuccess(
            context,
            'Withdrawal request of ₹${enterAmount.toStringAsFixed(2)} submitted successfully!',
          );
          _amountController.clear();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: VTAppBar2(
        title: 'Withdraw Payout',
        showAction: true,
        actionIcon: Icons.history_rounded,
        onActionPressed: () {
          Navigator.pushNamed(context, AppRoutes.withdrawHistory);
        },
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                WithdrawBalanceCard(
                  balance: _availableBalance,
                  minWithdrawal: _minWithdrawal,
                  onHistoryTap: () {
                    Navigator.pushNamed(context, AppRoutes.withdrawHistory);
                  },
                ),
                const SizedBox(height: 16),
                Text(
                  'Destination Account',
                  style: AppTextStyles.labelLarge(
                    fontSize: 14,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 8),
                DestinationAccountCard(
                  bankName: 'HDFC Bank',
                  accountNumber: '•••• 4829',
                  ifscCode: 'HDFC0001234',
                  onChangeTap: () {
                    Navigator.pushNamed(context, AppRoutes.bankDetails);
                  },
                ),
                const SizedBox(height: 16),
                Text(
                  'Enter Withdrawal Amount',
                  style: AppTextStyles.labelLarge(
                    fontSize: 14,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 8),
                CustomTextField(
                  controller: _amountController,
                  hintText: 'Enter amount (e.g. 2000)',
                  prefixIcon: Icons.currency_rupee,
                  suffixIcon: const SizedBox.shrink(),
                  keyboardType: TextInputType.number,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Please enter amount';
                    }
                    final double? numVal = double.tryParse(val.trim());
                    if (numVal == null || numVal <= 0) {
                      return 'Please enter a valid positive amount';
                    }
                    if (numVal < _minWithdrawal) {
                      return 'Minimum amount is ₹${_minWithdrawal.toInt()}';
                    }
                    if (numVal > _availableBalance) {
                      return 'Amount exceeds available balance';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 10),
                QuickAmountChips(
                  items: [
                    const QuickChipItem('₹500', 500),
                    const QuickChipItem('₹1,000', 1000),
                    const QuickChipItem('₹2,500', 2500),
                    const QuickChipItem('₹5,000', 5000),
                    QuickChipItem('MAX', _availableBalance),
                  ],
                  selectedText: _amountController.text.trim(),
                  onSelectAmount: _selectQuickAmount,
                ),
                const SizedBox(height: 16),
                Text(
                  'Transfer Mode',
                  style: AppTextStyles.labelLarge(
                    fontSize: 14,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 8),
                TransferModeSelector(
                  selectedId: _selectedMethod,
                  options: const [
                    TransferModeOption(
                      id: 'BANK',
                      label: 'Direct Bank (IMPS)',
                      subLabel: 'Instant Payout',
                      icon: Icons.account_balance_outlined,
                    ),
                    TransferModeOption(
                      id: 'UPI',
                      label: 'UPI Transfer',
                      subLabel: 'shubham@okhdfc',
                      icon: Icons.qr_code_2_outlined,
                    ),
                  ],
                  onSelect: (method) {
                    setState(() {
                      _selectedMethod = method;
                    });
                  },
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: 'Withdraw Funds',
                  isLoading: _isLoading,
                  onPressed: _processWithdrawal,
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 9. Team Performance Screen
**File Path**: `lib/features/referral/presentation/screens/team_performance_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class StepNodeModel {
  final String step;
  final String name;
  final String userId;
  final String totalDeposit;
  final String joinedDate;
  final String status;
  final int childCount;
  final List<StepNodeModel> children;
  bool isExpanded;

  StepNodeModel({
    required this.step,
    required this.name,
    required this.userId,
    required this.totalDeposit,
    required this.joinedDate,
    required this.status,
    this.childCount = 0,
    this.children = const [],
    this.isExpanded = false,
  });
}

class TeamPerformanceScreen extends StatefulWidget {
  const TeamPerformanceScreen({super.key});

  @override
  State<TeamPerformanceScreen> createState() => _TeamPerformanceScreenState();
}

class _TeamPerformanceScreenState extends State<TeamPerformanceScreen> {
  bool _allCollapsed = false;

  late List<StepNodeModel> _stepTree;

  @override
  void initState() {
    super.initState();
    _stepTree = [
      StepNodeModel(
        step: 'S1',
        name: 'vds group',
        userId: 'S1-0001',
        totalDeposit: '₹2,000',
        joinedDate: 'Aug 19, 2025',
        status: 'ACTIVE',
        childCount: 4,
        isExpanded: true,
        children: [
          StepNodeModel(
            step: 'S2',
            name: 'Khaja Vali M',
            userId: 'S1-3786',
            totalDeposit: '₹1,000',
            joinedDate: 'Aug 29, 2025',
            status: 'ACTIVE',
            childCount: 0,
          ),
          StepNodeModel(
            step: 'S2',
            name: 'Ganesha K',
            userId: 'S1-1999',
            totalDeposit: '₹0',
            joinedDate: 'Aug 19, 2025',
            status: 'ACTIVE',
            childCount: 5,
          ),
          StepNodeModel(
            step: 'S2',
            name: 'vds group',
            userId: 'S1-2010',
            totalDeposit: '₹1,000',
            joinedDate: 'Aug 29, 2025',
            status: 'ACTIVE',
            childCount: 17,
          ),
          StepNodeModel(
            step: 'S2',
            name: 'CHAITRA V',
            userId: 'S1-3639',
            totalDeposit: '₹0',
            joinedDate: 'Aug 29, 2025',
            status: 'ACTIVE',
            childCount: 1,
          ),
        ],
      ),
    ];
  }

  void _toggleCollapseAll() {
    setState(() {
      _allCollapsed = !_allCollapsed;
      _setExpandedRecursive(_stepTree, !_allCollapsed);
    });
  }

  void _setExpandedRecursive(List<StepNodeModel> nodes, bool expanded) {
    for (var node in nodes) {
      node.isExpanded = expanded;
      if (node.children.isNotEmpty) {
        _setExpandedRecursive(node.children, expanded);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Team Performance',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Manage and track your complete referral Steps',
                style: AppTextStyles.bodyMedium(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              _buildStepOverviewCard(),
              const SizedBox(height: 16),
              _buildControlsCard(),
              const SizedBox(height: 16),
              _buildStepStructureCard(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepOverviewCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Step Overview',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'All Levels',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF16A34A),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildOverviewMetric(
                value: '2669',
                label: 'Total Members',
                circleBg: const Color(0xFFEFF6FF),
                valueColor: const Color(0xFF2563EB),
              ),
              _buildOverviewMetric(
                value: '2575',
                label: 'Active Members',
                circleBg: const Color(0xFFF0FDF4),
                valueColor: const Color(0xFF16A34A),
              ),
              _buildOverviewMetric(
                value: '96%',
                label: 'Active Rate',
                circleBg: const Color(0xFFFAF5FF),
                valueColor: const Color(0xFF9333EA),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewMetric({
    required String value,
    required String label,
    required Color circleBg,
    required Color valueColor,
  }) {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: circleBg,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: valueColor,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildControlsCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Controls',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          ElevatedButton(
            onPressed: _toggleCollapseAll,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6B21A8),
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              _allCollapsed ? 'Expand All' : 'Collapse All',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepStructureCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Step Structure',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: _stepTree
                .map((rootNode) => _buildTreeNode(rootNode, depth: 0))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTreeNode(StepNodeModel node, {required int depth}) {
    final bool isLevel1 = depth == 0;
    final Color topBarColor =
        isLevel1 ? const Color(0xFF6B21A8) : const Color(0xFF059669);
    final Color badgeBg =
        isLevel1 ? const Color(0xFF581C87) : const Color(0xFF047857);

    return Container(
      margin: EdgeInsets.only(left: depth * 12.0, bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (depth > 0) ...[
            Container(
              width: 12,
              height: 44,
              margin: const EdgeInsets.only(right: 6),
              decoration: const BoxDecoration(
                border: Border(
                  left: BorderSide(color: Color(0xFFCBD5E1), width: 2),
                  bottom: BorderSide(color: Color(0xFFCBD5E1), width: 2),
                ),
              ),
            ),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isLevel1
                          ? const Color(0xFF6B21A8)
                          : const Color(0xFFA7F3D0),
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: topBarColor,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(12),
                            topRight: Radius.circular(12),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: badgeBg,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                node.step,
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                node.name,
                                style: GoogleFonts.outfit(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (node.childCount > 0) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${node.childCount}',
                                  style: GoogleFonts.outfit(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              InkWell(
                                onTap: () {
                                  setState(() {
                                    node.isExpanded = !node.isExpanded;
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    node.isExpanded ? Icons.remove : Icons.add,
                                    color: Colors.white,
                                    size: 14,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'User ID',
                                      style: GoogleFonts.outfit(
                                        fontSize: 11,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      node.userId,
                                      style: GoogleFonts.outfit(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primaryNavy,
                                      ),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Total Deposit',
                                      style: GoogleFonts.outfit(
                                        fontSize: 11,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      node.totalDeposit,
                                      style: GoogleFonts.outfit(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFF16A34A),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.0),
                              child: Divider(height: 1, color: Color(0xFFE2E8F0)),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Joined: ${node.joinedDate}',
                                  style: GoogleFonts.outfit(
                                    fontSize: 11,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFDCFCE7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    node.status,
                                    style: GoogleFonts.outfit(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF16A34A),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (node.isExpanded && node.children.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  ...node.children
                      .map((child) => _buildTreeNode(child, depth: depth + 1)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```
