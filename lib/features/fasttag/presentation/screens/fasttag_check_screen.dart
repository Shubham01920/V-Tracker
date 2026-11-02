import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_contianer.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';

class FasttagCheckScreen extends StatefulWidget {
  const FasttagCheckScreen({super.key});

  @override
  State<FasttagCheckScreen> createState() => _FasttagCheckScreenState();
}

class _FasttagCheckScreenState extends State<FasttagCheckScreen> {
  final TextEditingController _vehicleController =
      TextEditingController(text: 'MH12AB1234');

  String _selectedVehicle = 'MH12AB1234';
  double _currentBalance = 450.00;
  String _tagStatus = 'Active';
  String _issuerBank = 'ICICI Bank FASTag';
  String _tagId = 'NETC-8849-2049-1102';

  final List<Map<String, String>> _mockVehicles = [
    {
      'vehicleNumber': 'MH12AB1234',
      'ownerName': 'Sandeep Bhai',
      'bank': 'ICICI Bank FASTag',
      'balance': '450.00',
      'status': 'Active',
      'tagId': 'NETC-8849-2049-1102',
    },
    {
      'vehicleNumber': 'TS09EX9999',
      'ownerName': 'Vinayak Rao',
      'bank': 'Paytm Payments Bank',
      'balance': '85.00',
      'status': 'Low Balance',
      'tagId': 'NETC-3310-9921-4401',
    },
    {
      'vehicleNumber': 'DL3CAF5678',
      'ownerName': 'Miss Kalash',
      'bank': 'HDFC Bank FASTag',
      'balance': '1250.00',
      'status': 'Active',
      'tagId': 'NETC-7712-4012-9983',
    },
  ];

  final List<Map<String, dynamic>> _tollHistory = [
    {
      'plaza': 'Kherki Daula Toll Plaza',
      'location': 'NH-48, Gurugram',
      'amount': '₹115.00',
      'date': 'Today, 11:24 AM',
      'status': 'Deducted',
    },
    {
      'plaza': 'Rajiv Chowk Expressway',
      'location': 'Delhi-Gurgaon Expy',
      'amount': '₹65.00',
      'date': 'Yesterday, 04:15 PM',
      'status': 'Deducted',
    },
    {
      'plaza': 'Eastern Peripheral Toll',
      'location': 'Kundli-Palwal',
      'amount': '₹180.00',
      'date': '02 Aug 2026, 08:30 AM',
      'status': 'Deducted',
    },
    {
      'plaza': 'FASTag Auto-Recharge',
      'location': 'UPI Payment',
      'amount': '+ ₹500.00',
      'date': '28 Jul 2026, 02:10 PM',
      'status': 'Credited',
    },
  ];

  void _onSearchVehicle() {
    final query = _vehicleController.text.trim().toUpperCase();
    if (query.isEmpty) {
      VTSnackbar.showError(context, 'Please enter a valid vehicle number');
      return;
    }

    final match = _mockVehicles.firstWhere(
      (v) =>
          v['vehicleNumber']!.replaceAll(' ', '').toUpperCase() ==
          query.replaceAll(' ', ''),
      orElse: () => {
        'vehicleNumber': query,
        'ownerName': 'Registered Owner',
        'bank': 'SBI FASTag',
        'balance': '320.00',
        'status': 'Active',
        'tagId': 'NETC-5512-9018-${query.hashCode.toString().substring(0, 4)}',
      },
    );

    setState(() {
      _selectedVehicle = match['vehicleNumber']!;
      _issuerBank = match['bank']!;
      _currentBalance = double.tryParse(match['balance']!) ?? 300.0;
      _tagStatus = match['status']!;
      _tagId = match['tagId']!;
    });

    VTSnackbar.showSuccess(context, 'FASTag details updated for $_selectedVehicle');
  }

  @override
  void dispose() {
    _vehicleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLowBalance = _tagStatus == 'Low Balance';

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'FASTag Balance',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── VEHICLE SEARCH ROW ──
              VTContianer(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Icon(
                      Icons.directions_car_outlined,
                      color: AppColors.primaryNavy,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _vehicleController,
                        textCapitalization: TextCapitalization.characters,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryNavy,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Enter Vehicle Number (e.g. MH12AB1234)',
                          hintStyle: GoogleFonts.outfit(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: _onSearchVehicle,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryNavy,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Check',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // ── QUICK VEHICLE SELECTION CHIPS ──
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _mockVehicles.map((v) {
                    final isSelected = v['vehicleNumber'] == _selectedVehicle;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        showCheckmark: false,
                        label: Text(
                          v['vehicleNumber']!,
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? AppColors.white
                                : AppColors.primaryNavy,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: AppColors.primaryNavy,
                        backgroundColor: AppColors.white,
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.primaryNavy
                              : AppColors.borderLight,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            _vehicleController.text = v['vehicleNumber']!;
                            _onSearchVehicle();
                          }
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // ── FASTag BALANCE DIGITAL CARD ──
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      AppColors.primaryNavy,
                      AppColors.navyLight,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryNavy.withValues(alpha: 0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Row: Issuer Bank & Status Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.nfc_outlined,
                              color: AppColors.gold,
                              size: 24,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _issuerBank,
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.white.withValues(alpha: 0.9),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isLowBalance
                                ? AppColors.warning.withValues(alpha: 0.2)
                                : AppColors.successText.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isLowBalance
                                  ? AppColors.warning
                                  : AppColors.successText,
                            ),
                          ),
                          child: Text(
                            _tagStatus.toUpperCase(),
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isLowBalance
                                  ? AppColors.yellow
                                  : AppColors.greenAccent,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Balance Amount Display
                    Text(
                      'Available Balance',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: AppColors.white.withValues(alpha: 0.7),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '₹${_currentBalance.toStringAsFixed(2)}',
                      style: GoogleFonts.outfit(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gold,
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Divider line
                    Divider(color: AppColors.white.withValues(alpha: 0.15)),

                    const SizedBox(height: 12),

                    // Footer Row: Tag ID & Vehicle Number
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Vehicle No.',
                              style: GoogleFonts.outfit(
                                fontSize: 10,
                                color: AppColors.white.withValues(alpha: 0.6),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _selectedVehicle,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.white,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'NETC FASTag ID',
                              style: GoogleFonts.outfit(
                                fontSize: 10,
                                color: AppColors.white.withValues(alpha: 0.6),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _tagId,
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.white.withValues(alpha: 0.9),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ── RECHARGE ACTION BUTTON (USING CustomButton) ──
              CustomButton(
                text: 'Recharge FASTag Now',
                icon: Icons.bolt,
                backgroundColor: AppColors.gold,
                textColor: AppColors.primaryNavy,
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    AppRoutes.fasttagRecharge,
                    arguments: {
                      'vehicleNumber': _selectedVehicle,
                      'bank': _issuerBank,
                      'currentBalance': _currentBalance,
                    },
                  );
                },
              ),

              const SizedBox(height: 24),

              // ── QUICK RECHARGE AMOUNTS ──
              Text(
                'Quick Top-Up Presets',
                style: AppTextStyles.headlineMedium(
                  color: AppColors.primaryNavy,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [200, 500, 1000, 2000].map((amt) {
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: InkWell(
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            AppRoutes.fasttagRecharge,
                            arguments: {
                              'vehicleNumber': _selectedVehicle,
                              'bank': _issuerBank,
                              'presetAmount': amt,
                            },
                          );
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Center(
                            child: Text(
                              '+ ₹$amt',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 28),

              // ── TOLL TRANSACTIONS FEED ──
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Toll Passages',
                    style: AppTextStyles.headlineMedium(
                      color: AppColors.primaryNavy,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'NPCI Linked',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Column(
                children: _tollHistory.map((tx) {
                  final isCredited = tx['status'] == 'Credited';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: isCredited
                                ? AppColors.successBg
                                : AppColors.greyLight,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isCredited
                                ? Icons.add_card_outlined
                                : Icons.toll_outlined,
                            color: isCredited
                                ? AppColors.successText
                                : AppColors.primaryNavy,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                tx['plaza']!,
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryNavy,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${tx['location']} • ${tx['date']}',
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          tx['amount']!,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isCredited
                                ? AppColors.successText
                                : AppColors.primaryNavy,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
