import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';

class WithdrawItem {
  final String id;
  final String txnId;
  final double amount;
  final String date;
  final String time;
  final String status; // 'COMPLETED', 'PENDING', 'FAILED'
  final String bankName;
  final String accountNumber;

  const WithdrawItem({
    required this.id,
    required this.txnId,
    required this.amount,
    required this.date,
    required this.time,
    required this.status,
    required this.bankName,
    required this.accountNumber,
  });
}

class WithdrawHistoryScreen extends StatefulWidget {
  const WithdrawHistoryScreen({super.key});

  @override
  State<WithdrawHistoryScreen> createState() => _WithdrawHistoryScreenState();
}

class _WithdrawHistoryScreenState extends State<WithdrawHistoryScreen> {
  String _selectedFilter = 'All';

  final List<WithdrawItem> _historyItems = const [
    WithdrawItem(
      id: '1',
      txnId: 'TXN9842103981',
      amount: 2500.00,
      date: '28 Jul 2026',
      time: '04:15 PM',
      status: 'COMPLETED',
      bankName: 'HDFC Bank',
      accountNumber: '•••• 4829',
    ),
    WithdrawItem(
      id: '2',
      txnId: 'TXN9842103975',
      amount: 1200.00,
      date: '29 Jul 2026',
      time: '11:30 AM',
      status: 'PENDING',
      bankName: 'HDFC Bank',
      accountNumber: '•••• 4829',
    ),
    WithdrawItem(
      id: '3',
      txnId: 'TXN9842103890',
      amount: 5000.00,
      date: '20 Jul 2026',
      time: '02:45 PM',
      status: 'COMPLETED',
      bankName: 'HDFC Bank',
      accountNumber: '•••• 4829',
    ),
    WithdrawItem(
      id: '4',
      txnId: 'TXN9842103712',
      amount: 1500.00,
      date: '12 Jul 2026',
      time: '10:10 AM',
      status: 'FAILED',
      bankName: 'HDFC Bank',
      accountNumber: '•••• 4829',
    ),
    WithdrawItem(
      id: '5',
      txnId: 'TXN9842103601',
      amount: 3200.00,
      date: '05 Jul 2026',
      time: '06:20 PM',
      status: 'COMPLETED',
      bankName: 'HDFC Bank',
      accountNumber: '•••• 4829',
    ),
  ];

  List<WithdrawItem> get _filteredList {
    if (_selectedFilter == 'All') return _historyItems;
    return _historyItems
        .where((item) => item.status == _selectedFilter.toUpperCase())
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final double totalWithdrawn = _historyItems
        .where((item) => item.status == 'COMPLETED')
        .fold(0.0, (sum, item) => sum + item.amount);

    final double totalPending = _historyItems
        .where((item) => item.status == 'PENDING')
        .fold(0.0, (sum, item) => sum + item.amount);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Withdraw History',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── SUMMARY CARDS ROW ──
            Row(
              children: [
                Expanded(
                  child: _buildSummaryCard(
                    title: 'Total Paid Out',
                    amount: '₹${totalWithdrawn.toStringAsFixed(0)}',
                    icon: Icons.check_circle_outline,
                    color: AppColors.successText,
                    bgColor: AppColors.successBg,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildSummaryCard(
                    title: 'Pending Payout',
                    amount: '₹${totalPending.toStringAsFixed(0)}',
                    icon: Icons.pending_actions_outlined,
                    color: AppColors.warning,
                    bgColor: AppColors.goldLightBg,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── FILTER TABS ──
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterTab('All'),
                  const SizedBox(width: 8),
                  _buildFilterTab('Completed'),
                  const SizedBox(width: 8),
                  _buildFilterTab('Pending'),
                  const SizedBox(width: 8),
                  _buildFilterTab('Failed'),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ── HISTORY LIST ──
            Text(
              'Payout Transactions (${_filteredList.length})',
              style: AppTextStyles.labelLarge(
                fontSize: 16,
                color: AppColors.primaryNavy,
              ),
            ),

            const SizedBox(height: 12),

            if (_filteredList.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40.0),
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.history_toggle_off_outlined,
                        size: 48,
                        color: AppColors.textSecondary.withValues(alpha: 0.5),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'No withdrawal records found',
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredList.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = _filteredList[index];
                  return _buildHistoryCard(item);
                },
              ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard({
    required String title,
    required String amount,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.grey.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: bgColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            amount,
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.primaryNavy,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String filterName) {
    final bool isSelected = _selectedFilter == filterName;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = filterName;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryNavy : AppColors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primaryNavy
                : AppColors.grey.withValues(alpha: 0.6),
            width: 1,
          ),
        ),
        child: Text(
          filterName,
          style: GoogleFonts.outfit(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? AppColors.white : AppColors.primaryNavy,
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryCard(WithdrawItem item) {
    Color statusColor;
    Color statusBg;
    IconData statusIcon;

    switch (item.status) {
      case 'COMPLETED':
        statusColor = AppColors.successText;
        statusBg = AppColors.successBg;
        statusIcon = Icons.check_circle_outlined;
        break;
      case 'PENDING':
        statusColor = AppColors.warning;
        statusBg = AppColors.goldLightBg;
        statusIcon = Icons.access_time_rounded;
        break;
      default:
        statusColor = AppColors.error;
        statusBg = AppColors.error.withValues(alpha: 0.1);
        statusIcon = Icons.cancel_outlined;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.grey.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: statusBg,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      statusIcon,
                      color: statusColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '₹${item.amount.toStringAsFixed(2)}',
                        style: GoogleFonts.outfit(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${item.bankName} ${item.accountNumber}',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  item.status,
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: AppColors.grey.withValues(alpha: 0.4), height: 1),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                item.txnId,
                style: GoogleFonts.sourceCodePro(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                '${item.date}, ${item.time}',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
