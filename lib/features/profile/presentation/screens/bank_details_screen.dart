import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/bank_card_preview.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_text_field.dart';

class BankDetailsScreen extends StatefulWidget {
  const BankDetailsScreen({super.key});

  @override
  State<BankDetailsScreen> createState() => _BankDetailsScreenState();
}

class _BankDetailsScreenState extends State<BankDetailsScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _accountHolderController;
  late final TextEditingController _bankNameController;
  late final TextEditingController _accountNumberController;
  late final TextEditingController _confirmAccountNumberController;
  late final TextEditingController _ifscController;
  late final TextEditingController _branchController;
  late final TextEditingController _upiController;

  bool _isLoading = false;
  bool _isSaved = false;

  @override
  void initState() {
    super.initState();
    _accountHolderController = TextEditingController(text: 'Shubham Maurya');
    _bankNameController = TextEditingController(text: 'HDFC Bank');
    _accountNumberController = TextEditingController(text: '50100482930192');
    _confirmAccountNumberController = TextEditingController(text: '50100482930192');
    _ifscController = TextEditingController(text: 'HDFC0001234');
    _branchController = TextEditingController(text: 'Madhapur, Hyderabad');
    _upiController = TextEditingController(text: 'shubham@okhdfcbank');
  }

  @override
  void dispose() {
    _accountHolderController.dispose();
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _confirmAccountNumberController.dispose();
    _ifscController.dispose();
    _branchController.dispose();
    _upiController.dispose();
    super.dispose();
  }

  void _saveBankDetails() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _isSaved = true;
          });
          VTSnackbar.showSuccess(context, 'Bank details updated successfully!');
        }
      });
    }
  }

  Widget _buildFieldHeader(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0, left: 2.0),
      child: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.primaryNavy,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final String displayAccount = _accountNumberController.text.length > 4
        ? '•••• •••• •••• ${_accountNumberController.text.substring(_accountNumberController.text.length - 4)}'
        : '•••• •••• •••• 0000';

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Bank Details',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── FIXED DIGITAL BANK CARD PREVIEW ──
            Padding(
              padding: const EdgeInsets.fromLTRB(24.0, 12.0, 24.0, 8.0),
              child: BankCardPreview(
                bankName: _bankNameController.text,
                displayAccount: displayAccount,
                accountHolder: _accountHolderController.text,
                ifscCode: _ifscController.text,
                isSaved: _isSaved,
              ),
            ),

            // ── SCROLLABLE PAYOUT ACCOUNT DETAILS FORM ──
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Payout Account Details',
                        style: AppTextStyles.labelLarge(
                          fontSize: 18,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Enter your bank details to receive referral earnings & rewards directly.',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Account Holder Name
                      _buildFieldHeader('Account Holder Name'),
                      CustomTextField(
                        controller: _accountHolderController,
                        hintText: 'Enter account holder name',
                        prefixIcon: Icons.person_outline,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Please enter account holder name';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Bank Name
                      _buildFieldHeader('Bank Name'),
                      CustomTextField(
                        controller: _bankNameController,
                        hintText: 'Enter bank name (e.g. HDFC, SBI, ICICI)',
                        prefixIcon: Icons.account_balance_outlined,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Please enter bank name';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Account Number
                      _buildFieldHeader('Account Number'),
                      CustomTextField(
                        controller: _accountNumberController,
                        hintText: 'Enter account number',
                        prefixIcon: Icons.numbers_outlined,
                        keyboardType: TextInputType.number,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Please enter account number';
                          }
                          if (val.trim().length < 8) {
                            return 'Please enter a valid account number';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Confirm Account Number
                      _buildFieldHeader('Confirm Account Number'),
                      CustomTextField(
                        controller: _confirmAccountNumberController,
                        hintText: 'Re-enter account number',
                        prefixIcon: Icons.lock_outline,
                        keyboardType: TextInputType.number,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Please confirm account number';
                          }
                          if (val.trim() != _accountNumberController.text.trim()) {
                            return 'Account numbers do not match';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // IFSC Code
                      _buildFieldHeader('IFSC Code'),
                      CustomTextField(
                        controller: _ifscController,
                        hintText: 'Enter 11-digit IFSC code',
                        prefixIcon: Icons.code_outlined,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Please enter IFSC code';
                          }
                          if (val.trim().length != 11) {
                            return 'IFSC code must be 11 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Branch Name
                      _buildFieldHeader('Branch Name'),
                      CustomTextField(
                        controller: _branchController,
                        hintText: 'Enter bank branch name',
                        prefixIcon: Icons.location_on_outlined,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Please enter branch name';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // UPI ID (Optional)
                      _buildFieldHeader('UPI ID (Optional)'),
                      CustomTextField(
                        controller: _upiController,
                        hintText: 'e.g. username@upi',
                        prefixIcon: Icons.payment_outlined,
                      ),

                      const SizedBox(height: 24),

                      // Save Action Button
                      CustomButton(
                        text: 'Save Bank Details',
                        isLoading: _isLoading,
                        onPressed: _saveBankDetails,
                      ),

                      const SizedBox(height: 24),
                    ],
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
