import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/features/calls/presentation/widgets/call_history_card.dart';

enum CallFilter { all, emergency, missed }

class CallLogItem {
  final CallType type;
  final String vehicleDetails;
  final String dateTime;

  const CallLogItem({
    required this.type,
    required this.vehicleDetails,
    required this.dateTime,
  });
}

class CallHistoryScreen extends StatefulWidget {
  const CallHistoryScreen({super.key});

  @override
  State<CallHistoryScreen> createState() => _CallHistoryScreenState();
}

class _CallHistoryScreenState extends State<CallHistoryScreen> {
  // Currently active filter
  CallFilter _selectedFilter = CallFilter.all;

  // Mock call logs matching the design exactly
  final List<CallLogItem> _allLogs = const [
    CallLogItem(
      type: CallType.emergency,
      vehicleDetails: '4 Wheeler - KA17SP1234',
      dateTime: 'Today, 10:30 AM',
    ),
    CallLogItem(
      type: CallType.emergency,
      vehicleDetails: '2 Wheeler - TS09GH5678',
      dateTime: 'Today, 09:15 AM',
    ),
    CallLogItem(
      type: CallType.missed,
      vehicleDetails: '4 Wheeler - MH12AB3456',
      dateTime: 'Yesterday, 08:45 PM',
    ),
    CallLogItem(
      type: CallType.emergency,
      vehicleDetails: '3 Wheeler - TS08JK1234',
      dateTime: 'Yesterday, 06:20 PM',
    ),
    CallLogItem(
      type: CallType.emergency,
      vehicleDetails: '4 Wheeler - AP09KL6789',
      dateTime: '21 May 2024, 04:10 PM',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    // Filter the logs list based on active tab
    final List<CallLogItem> filteredLogs = _allLogs.where((log) {
      if (_selectedFilter == CallFilter.all) return true;
      if (_selectedFilter == CallFilter.emergency) {
        return log.type == CallType.emergency;
      }
      return log.type == CallType.missed;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Call History',
        showAction: false,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
              
              // ── Filter Pills / Chips ──
              Row(
                children: [
                  _buildFilterPill(
                    label: 'All',
                    filter: CallFilter.all,
                  ),
                  const SizedBox(width: 12),
                  _buildFilterPill(
                    label: 'Emergency',
                    filter: CallFilter.emergency,
                  ),
                  const SizedBox(width: 12),
                  _buildFilterPill(
                    label: 'Missed',
                    filter: CallFilter.missed,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // ── List of Call History Items ──
              Expanded(
                child: filteredLogs.isEmpty
                    ? Center(
                        child: Text(
                          'No calls found',
                          style: AppTextStyles.bodyMedium(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      )
                      : ListView.separated(
                          itemCount: filteredLogs.length,
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.only(bottom: 100),
                          itemBuilder: (context, index) {
                            final log = filteredLogs[index];
                            return CallHistoryCard(
                              type: log.type,
                              vehicleDetails: log.vehicleDetails,
                              dateTime: log.dateTime,
                              onTap: () {
                                // Call item tapped handler
                              },
                            );
                          },
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 12),
                        ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
    );
  }

  // Helper widget to construct the capsule filter chips
  Widget _buildFilterPill({
    required String label,
    required CallFilter filter,
  }) {
    final bool isSelected = _selectedFilter == filter;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = filter;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryNavy : AppColors.greyLight,
          borderRadius: BorderRadius.circular(100),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primaryNavy.withValues(alpha: 0.25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ]
              : null,
        ),
        child: Text(
          label,
          style: AppTextStyles.bodyMedium(
            color: isSelected ? AppColors.white : AppColors.primaryNavy,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
