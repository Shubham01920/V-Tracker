import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

enum CallType { emergency, missed }

class CallHistoryCard extends StatelessWidget {
  final CallType type;
  final String vehicleDetails;
  final String dateTime;
  final VoidCallback? onTap;

  const CallHistoryCard({
    super.key,
    required this.type,
    required this.vehicleDetails,
    required this.dateTime,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isEmergency = type == CallType.emergency;
    
    // Background and color styling matching the design
    final Color statusColor = isEmergency ? AppColors.success : AppColors.error;
    final Color circularBgColor = statusColor.withValues(alpha: 0.1);
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          // border: Border.all(
          //   color: const Color(0xFFF1F5F9), // subtle light grey border
          //   width: 1,
          // ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Left Status Icon (Circle Container)
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: circularBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isEmergency ? Icons.phone_in_talk_rounded : Icons.phone_callback_rounded,
                color: statusColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 14),
            
            // Middle Column with texts
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isEmergency ? 'Emergency Call' : 'Missed Call',
                    style: AppTextStyles.bodyLarge(
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    vehicleDetails,
                    style: AppTextStyles.bodyMedium(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dateTime,
                    style: AppTextStyles.bodySmall(
                      color: AppColors.textSecondary.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
            
            // Right Status/Action Icon
            Icon(
              isEmergency ? Icons.phone : Icons.call_missed_outgoing_rounded,
              color: statusColor,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}
