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
                // Reusable Balance Card Component
                WithdrawBalanceCard(
                  balance: _availableBalance,
                  minWithdrawal: _minWithdrawal,
                  onHistoryTap: () {
                    Navigator.pushNamed(context, AppRoutes.withdrawHistory);
                  },
                ),

                const SizedBox(height: 16),

                // Reusable Destination Account Component
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

                // Reusable CustomTextField Component
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

                // Reusable Quick Amount Chips Component
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

                // Reusable Transfer Mode Component
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

                // Reusable Action Button Component
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
