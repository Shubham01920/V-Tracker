import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_spacing.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_contianer.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';

class VehicleDetails {
  final String vehicleNumber;
  final String ownerName;
  final String vehicleModel;
  final String phone;
  final String registrationDate;
  final String fuelType;
  final String insuranceValid;
  final String pucStatus;
  final String registeredAt;

  const VehicleDetails({
    required this.vehicleNumber,
    required this.ownerName,
    required this.vehicleModel,
    required this.phone,
    required this.registrationDate,
    required this.fuelType,
    required this.insuranceValid,
    required this.pucStatus,
    required this.registeredAt,
  });
}

class VehicleSearchScreen extends StatelessWidget {
  final String searchQuery;

  const VehicleSearchScreen({
    super.key,
    required this.searchQuery,
  });

  // Comprehensive mock vehicle dataset
  static const List<VehicleDetails> _dummyVehicles = [
    VehicleDetails(
      vehicleNumber: 'MH12AB1234',
      ownerName: 'Sandeep Bhai',
      vehicleModel: 'Royal Enfield Classic 350',
      phone: '9158523541',
      registrationDate: '24 Apr 2022',
      fuelType: 'Petrol',
      insuranceValid: '18 May 2027',
      pucStatus: 'Passed',
      registeredAt: 'Pune RTO, MH',
    ),
    VehicleDetails(
      vehicleNumber: 'TS09EX9999',
      ownerName: 'Vinayak Rao',
      vehicleModel: 'Hyundai Creta (White)',
      phone: '9848022338',
      registrationDate: '12 Jan 2024',
      fuelType: 'Diesel',
      insuranceValid: '02 Feb 2029',
      pucStatus: 'Passed',
      registeredAt: 'Khairatabad RTO, TS',
    ),
    VehicleDetails(
      vehicleNumber: 'DL3CAF5678',
      ownerName: 'Miss Kalash',
      vehicleModel: 'Activa 6G (Matte Black)',
      phone: '9911223344',
      registrationDate: '09 Sep 2021',
      fuelType: 'Petrol',
      insuranceValid: '11 Oct 2026',
      pucStatus: 'Passed',
      registeredAt: 'Central Delhi RTO, DL',
    ),
  ];

  VehicleDetails _lookupVehicle(String query) {
    final cleanQuery = query.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '').toUpperCase();
    
    for (final vehicle in _dummyVehicles) {
      final cleanNum = vehicle.vehicleNumber.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '').toUpperCase();
      if (cleanNum == cleanQuery) {
        return vehicle;
      }
    }

    // Dynamic fallback so testing with arbitrary plates works seamlessly
    return VehicleDetails(
      vehicleNumber: query.isEmpty ? 'MH12XX5555' : query.toUpperCase(),
      ownerName: 'Rahul Verma',
      vehicleModel: 'Tata Nexon (Grey)',
      phone: '9876543210',
      registrationDate: '05 Aug 2023',
      fuelType: 'Petrol',
      insuranceValid: '10 Aug 2028',
      pucStatus: 'Passed',
      registeredAt: 'Noida RTO, UP',
    );
  }

  String _maskPhone(String phone) {
    if (phone.length < 6) return phone;
    return '+91 ${phone.substring(0, 2)}*** **${phone.substring(phone.length - 3)}';
  }

  @override
  Widget build(BuildContext context) {
    final vehicle = _lookupVehicle(searchQuery);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Vehicle Identity',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.m, vertical: AppSpacing.s),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              
              // ── LICENSE PLATE CONTAINER ──
              _buildModernLicensePlate(vehicle.vehicleNumber),
              
              const SizedBox(height: 24),
              
              // ── PRIMARY OWNER INFORMATION CARD ──
              _buildOwnerProfileCard(context, vehicle),
              
              const SizedBox(height: 20),
              
              // ── VEHICLE DETAILED SPECS GRID ──
              _buildSpecsGrid(vehicle),
              
              const SizedBox(height: 32),
              
              // ── MODERN ACTION CTAS ──
              Row(
                children: [
                  Expanded(
                    child: VTButton(
                      text: 'Connect Call',
                      icon: Icons.phone_in_talk_rounded,
                      onPressed: () => _simulateCall(context, vehicle),
                      backgroundColor: AppColors.primaryNavy,
                      textColor: Colors.white,
                      height: 54,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: VTButton(
                      text: 'Send Alert',
                      icon: Icons.notifications_active_rounded,
                      onPressed: () => _simulateAlert(context, vehicle),
                      backgroundColor: AppColors.gold,
                      textColor: AppColors.primaryNavy,
                      height: 54,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModernLicensePlate(String number) {
    return Container(
      height: 70,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade400, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10.5),
        child: Row(
          children: [
            // Left Blue Strip (Indicates IND)
            Container(
              width: 32,
              color: const Color(0xFF0F2C59),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Stylized Ashok Chakra Emblem Representation
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.amber, width: 1.2),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'IND',
                    style: GoogleFonts.outfit(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            // Metal Divider Accent
            Container(width: 1.5, color: Colors.grey.shade300),
            // License Plate Number Text
            Expanded(
              child: Center(
                child: Text(
                  number,
                  style: GoogleFonts.outfit(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 3,
                    color: AppColors.primaryNavy,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOwnerProfileCard(BuildContext context, VehicleDetails vehicle) {
    final String initial = vehicle.ownerName.isNotEmpty ? vehicle.ownerName[0] : 'O';

    return VTContianer(
      backgroundColor: Colors.white,
      borderColor: Colors.transparent,
      borderWidth: 0,
      borderRadius: 20,
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar
              Container(
                width: 54,
                height: 54,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primaryNavy, AppColors.navyLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Name and Number details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vehicle.ownerName,
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _maskPhone(vehicle.phone),
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              // Verified Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_user_rounded, size: 12, color: Color(0xFF059669)),
                    const SizedBox(width: 4),
                    Text(
                      'VERIFIED',
                      style: GoogleFonts.outfit(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF059669),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 30, color: Color(0xFFF1F5F9)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildShortMeta(
                label: 'REG. LOCATION',
                value: vehicle.registeredAt,
                icon: Icons.location_on_outlined,
              ),
              _buildShortMeta(
                label: 'VEHICLE MODEL',
                value: vehicle.vehicleModel,
                icon: Icons.directions_car_filled_outlined,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShortMeta({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Expanded(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.outfit(
                    fontSize: 9,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryNavy,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecsGrid(VehicleDetails vehicle) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _buildSpecCard(
          icon: Icons.calendar_today_rounded,
          label: 'Registration Date',
          value: vehicle.registrationDate,
          accentColor: const Color(0xFF3B82F6),
        ),
        _buildSpecCard(
          icon: Icons.local_gas_station_rounded,
          label: 'Fuel Type',
          value: vehicle.fuelType,
          accentColor: const Color(0xFF10B981),
        ),
        _buildSpecCard(
          icon: Icons.security_rounded,
          label: 'Insurance Validity',
          value: vehicle.insuranceValid,
          accentColor: const Color(0xFFF59E0B),
        ),
        _buildSpecCard(
          icon: Icons.eco_rounded,
          label: 'Emission Status',
          value: 'PUC: ${vehicle.pucStatus}',
          accentColor: const Color(0xFF8B5CF6),
        ),
      ],
    );
  }

  Widget _buildSpecCard({
    required IconData icon,
    required String label,
    required String value,
    required Color accentColor,
  }) {
    return VTContianer(
      backgroundColor: Colors.white,
      borderColor: Colors.transparent,
      borderWidth: 0,
      borderRadius: 16,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 16, color: accentColor),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
        ],
      ),
    );
  }

  void _simulateCall(BuildContext context, VehicleDetails vehicle) {
    VTSnackbar.showInfo(
      context,
      'Connecting call via privacy dialer...',
    );
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          contentPadding: const EdgeInsets.symmetric(horizontal: 24),
          actionsPadding: const EdgeInsets.fromLTRB(24, 16, 24, 20),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.phone_in_talk_rounded,
                  color: AppColors.primaryNavy,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Privacy Call',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: AppColors.primaryNavy,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Connecting your line to:',
                style: GoogleFonts.outfit(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '${vehicle.ownerName} (${vehicle.vehicleNumber})',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Proxy number: +91 91580 99999',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield_rounded, color: Color(0xFF059669), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Your caller identity is hidden securely.',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: const Color(0xFF047857),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            VTButton(
              text: 'Disconnect Call',
              onPressed: () => Navigator.pop(context),
              backgroundColor: AppColors.error,
              textColor: Colors.white,
              height: 48,
              fontSize: 15,
              elevation: 0,
            ),
          ],
        );
      },
    );
  }

  void _simulateAlert(BuildContext context, VehicleDetails vehicle) {
    VTSnackbar.showSuccess(
      context,
      'Instant alert notification pushed to ${vehicle.ownerName} successfully!',
    );
  }
}
