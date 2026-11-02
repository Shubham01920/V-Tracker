import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_contianer.dart';
import 'package:snap_q/core/widgets/vt_dropdown.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';

class FasttagRechargeScreen extends StatefulWidget {
  final Map<String, dynamic>? arguments;

  const FasttagRechargeScreen({
    super.key,
    this.arguments,
  });

  @override
  State<FasttagRechargeScreen> createState() => _FasttagRechargeScreenState();
}

class _FasttagRechargeScreenState extends State<FasttagRechargeScreen> {
  late final TextEditingController _vehicleController;
  late final TextEditingController _amountController;
  late final TextEditingController _vpaController;

  String _selectedBank = 'ICICI Bank FASTag';
  String _selectedUpiApp = 'Google Pay';
  bool _isCustomVpa = false;
  bool _isLoading = false;

  final List<String> _bankIssuers = [
    'ICICI Bank FASTag',
    'Paytm Payments Bank',
    'SBI FASTag',
    'HDFC Bank FASTag',
    'Axis Bank FASTag',
    'IDFC First Bank FASTag',
    'Airtel Payments Bank',
  ];

  final List<Map<String, String>> _upiApps = [
    {'name': 'Google Pay', 'icon': 'GPay'},
    {'name': 'PhonePe', 'icon': 'PhonePe'},
    {'name': 'Paytm UPI', 'icon': 'Paytm'},
    {'name': 'BHIM UPI', 'icon': 'BHIM'},
    {'name': 'Other UPI ID', 'icon': 'UPI'},
  ];

  @override
  void initState() {
    super.initState();
    final args = widget.arguments ?? {};
    final initialVehicle = args['vehicleNumber'] as String? ?? 'MH12AB1234';
    final initialBank = args['bank'] as String? ?? 'ICICI Bank FASTag';
    final initialPreset = args['presetAmount'] as int?;

    _vehicleController = TextEditingController(text: initialVehicle);
    _amountController = TextEditingController(
      text: initialPreset != null ? initialPreset.toString() : '500',
    );
    _vpaController = TextEditingController();

    if (_bankIssuers.contains(initialBank)) {
      _selectedBank = initialBank;
    }
  }

  @override
  void dispose() {
    _vehicleController.dispose();
    _amountController.dispose();
    _vpaController.dispose();
    super.dispose();
  }

  void _processRecharge() {
    final vehicle = _vehicleController.text.trim();
    final amountText = _amountController.text.trim();

    if (vehicle.isEmpty) {
      VTSnackbar.showError(context, 'Please enter vehicle number');
      return;
    }

    final amount = double.tryParse(amountText);
    if (amount == null || amount < 100) {
      VTSnackbar.showError(context, 'Minimum FASTag recharge amount is ₹100');
      return;
    }

    if (_isCustomVpa && _vpaController.text.trim().isEmpty) {
      VTSnackbar.showError(context, 'Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      VTSnackbar.showSuccess(
        context,
        'FASTag Recharge of ₹${amount.toStringAsFixed(0)} Successful via $_selectedUpiApp!',
      );

      Navigator.pop(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    final enteredAmountText = _amountController.text.trim();
    final displayAmount = double.tryParse(enteredAmountText) ?? 500.0;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'FASTag Recharge',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── ISSUER BANK & VEHICLE DETAILS ──
              Text(
                'FASTag Details',
                style: AppTextStyles.headlineMedium(
                  color: AppColors.primaryNavy,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),

              VTContianer(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    VTDropdown<String>(
                      label: 'Select Tag Issuing Bank',
                      value: _selectedBank,
                      items: _bankIssuers.map((bank) {
                        return VTDropdownItemData<String>(
                          value: bank,
                          label: bank,
                          icon: Icons.account_balance_outlined,
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedBank = val;
                          });
                        }
                      },
                    ),
                    const Divider(height: 24),
                    Text(
                      'Vehicle Registration Number',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _vehicleController,
                      textCapitalization: TextCapitalization.characters,
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ── RECHARGE AMOUNT SECTION ──
              Text(
                'Recharge Amount',
                style: AppTextStyles.headlineMedium(
                  color: AppColors.primaryNavy,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),

              VTContianer(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '₹',
                          style: GoogleFonts.outfit(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _amountController,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.outfit(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryNavy,
                            ),
                            decoration: InputDecoration(
                              hintText: '0',
                              hintStyle: GoogleFonts.outfit(
                                fontSize: 28,
                                color: AppColors.grey,
                              ),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            onChanged: (val) {
                              setState(() {});
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Recommended presets:',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [200, 500, 1000, 2000].map((amt) {
                        final isSelected =
                            _amountController.text == amt.toString();
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3.0),
                            child: ChoiceChip(
                              showCheckmark: false,
                              label: Text('₹$amt'),
                              labelStyle: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? AppColors.white
                                    : AppColors.primaryNavy,
                              ),
                              selected: isSelected,
                              selectedColor: AppColors.primaryNavy,
                              backgroundColor: AppColors.greyLight,
                              onSelected: (selected) {
                                if (selected) {
                                  setState(() {
                                    _amountController.text = amt.toString();
                                  });
                                }
                              },
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // ── PAYMENT METHOD SECTION (RESTRICTED TO UPI) ──
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Payment Method',
                    style: AppTextStyles.headlineMedium(
                      color: AppColors.primaryNavy,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.successBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.verified_user_outlined,
                          size: 14,
                          color: AppColors.successText,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'UPI Instant',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppColors.successText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              Column(
                children: _upiApps.map((app) {
                  final isSelected = _selectedUpiApp == app['name'];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedUpiApp = app['name']!;
                          _isCustomVpa = app['name'] == 'Other UPI ID';
                        });
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primaryNavy
                                : AppColors.borderLight,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primaryNavy.withValues(alpha: 0.1)
                                    : AppColors.greyLight,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  app['icon']![0],
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primaryNavy,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                app['name']!,
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primaryNavy,
                                ),
                              ),
                            ),
                            Icon(
                              isSelected
                                  ? Icons.radio_button_checked
                                  : Icons.radio_button_off,
                              color: isSelected
                                  ? AppColors.primaryNavy
                                  : AppColors.grey,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              if (_isCustomVpa) ...[
                const SizedBox(height: 6),
                VTContianer(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  child: TextField(
                    controller: _vpaController,
                    decoration: InputDecoration(
                      hintText: 'Enter UPI ID (e.g. mobile@upi)',
                      hintStyle: GoogleFonts.outfit(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 28),

              // ── RECHARGE TRIGGER BUTTON USING CustomButton ──
              CustomButton(
                text: 'Pay & Recharge ₹${displayAmount.toStringAsFixed(0)}',
                icon: Icons.shield_outlined,
                isLoading: _isLoading,
                backgroundColor: AppColors.primaryNavy,
                textColor: AppColors.white,
                onPressed: _processRecharge,
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
