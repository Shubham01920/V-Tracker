import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';

class VehicleItem {
  final String model;
  final String plateNumber;
  final String type; // e.g. Car, Bike, Truck
  final bool hasQrConnected;
  final String qrCodeId;

  const VehicleItem({
    required this.model,
    required this.plateNumber,
    required this.type,
    required this.hasQrConnected,
    required this.qrCodeId,
  });
}

class MyVehiclesScreen extends StatelessWidget {
  const MyVehiclesScreen({super.key});

  static const List<VehicleItem> dummyVehicles = [
    VehicleItem(
      model: 'Hyundai Creta (White)',
      plateNumber: 'TS 09 EG 4321',
      type: 'Car',
      hasQrConnected: true,
      qrCodeId: 'QR-CAR-90382',
    ),
    VehicleItem(
      model: 'Royal Enfield Classic 350 (Black)',
      plateNumber: 'MH 12 PQ 5678',
      type: 'Bike',
      hasQrConnected: true,
      qrCodeId: 'QR-BIKE-12048',
    ),
    VehicleItem(
      model: 'Honda Activa 6G (Grey)',
      plateNumber: 'DL 3C AB 9876',
      type: 'Scooter',
      hasQrConnected: false,
      qrCodeId: '',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'My Vehicles',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                itemCount: dummyVehicles.length,
                itemBuilder: (context, index) {
                  final vehicle = dummyVehicles[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16.0),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.grey.withValues(alpha: 0.5),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryNavy.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    Icon(
                                      vehicle.type == 'Car'
                                          ? Icons.directions_car_filled_outlined
                                          : vehicle.type == 'Scooter'
                                              ? Icons.moped_outlined
                                              : Icons.two_wheeler_outlined,
                                      size: 24,
                                      color: AppColors.primaryNavy,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        vehicle.model,
                                        style: GoogleFonts.outfit(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primaryNavy,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: vehicle.hasQrConnected
                                      ? Colors.green.shade50
                                      : Colors.amber.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  vehicle.hasQrConnected ? 'QR ACTIVE' : 'NO QR LINKED',
                                  style: GoogleFonts.outfit(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: vehicle.hasQrConnected
                                        ? Colors.green.shade700
                                        : Colors.amber.shade700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: AppColors.grey.withValues(alpha: 0.3),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  vehicle.plateNumber,
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                    color: AppColors.primaryNavy,
                                  ),
                                ),
                              ),
                              if (vehicle.hasQrConnected)
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.qr_code_2_rounded,
                                      size: 16,
                                      color: AppColors.textSecondary,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      vehicle.qrCodeId,
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Divider(height: 1, color: Color(0xFFE2E8F0)),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton(
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: () {
                                  VTSnackbar.showInfo(
                                    context,
                                    vehicle.hasQrConnected
                                        ? 'Managing QR ${vehicle.qrCodeId}...'
                                        : 'Opening QR linker...',
                                  );
                                },
                                child: Text(
                                  vehicle.hasQrConnected ? 'Manage QR' : 'Link QR Label',
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primaryNavy,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: VTButton(
                text: 'Add New Vehicle',
                onPressed: () {
                  VTSnackbar.showInfo(context, 'Add vehicle coming soon');
                },
                backgroundColor: AppColors.primaryNavy,
                textColor: AppColors.white,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
