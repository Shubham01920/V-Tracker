import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/referral/data/models/direct_referral_model.dart';

class DirectReferralTable extends StatelessWidget {
  final List<DirectReferralModel> referrals;

  const DirectReferralTable({
    super.key,
    required this.referrals,
  });

  Color _getAvatarBgColor(String name) {
    final List<Color> colors = [
      AppColors.navyLight,
      AppColors.blueAccent,
      AppColors.emeraldDark,
      AppColors.purpleAccent,
      AppColors.orangeAccent,
      AppColors.slate800,
    ];
    final int hash = name.codeUnits.fold(0, (prev, elem) => prev + elem);
    return colors[hash % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    if (referrals.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 44,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 12),
            Text(
              'No direct referrals found',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.primaryNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Try adjusting your search criteria',
              style: GoogleFonts.outfit(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    const double colSnWidth = 60;
    const double colNameWidth = 260;
    const double colUserIdWidth = 115;
    const double colJoinedWidth = 115;
    const double colActiveTeamWidth = 115;
    const double colStatusWidth = 105;

    const double tableWidth = colSnWidth +
        colNameWidth +
        colUserIdWidth +
        colJoinedWidth +
        colActiveTeamWidth +
        colStatusWidth;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Container(
        width: tableWidth + 3.0,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryNavy.withValues(alpha: 0.03),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10.5),
          child: Column(
            children: [
              // ── HEADER ROW ──
              Container(
                height: 48,
                decoration: const BoxDecoration(
                  color: AppColors.greyLight,
                  border: Border(
                    bottom: BorderSide(
                      color: Color(0xFFCBD5E1),
                      width: 1,
                    ),
                  ),
                ),
              child: Row(
                children: [
                  _buildHeaderCell('SN', colSnWidth),
                  _buildHeaderCell('NAME', colNameWidth),
                  _buildHeaderCell('USER ID', colUserIdWidth),
                  _buildHeaderCell('JOINED', colJoinedWidth),
                  _buildHeaderCell('ACTIVE TEAM', colActiveTeamWidth),
                  _buildHeaderCell('STATUS', colStatusWidth, isLast: true),
                ],
              ),
            ),

            // ── DATA ROWS ──
            ...List.generate(referrals.length, (index) {
              final item = referrals[index];
              final bool isLastRow = index == referrals.length - 1;
              final String initial = item.name.isNotEmpty
                  ? item.name.trim()[0].toUpperCase()
                  : 'U';
              final Color avatarBg = _getAvatarBgColor(item.name);

              return Container(
                decoration: BoxDecoration(
                  color: index.isEven
                      ? AppColors.white
                      : AppColors.bg.withValues(alpha: 0.5),
                  border: isLastRow
                      ? null
                      : const Border(
                          bottom: BorderSide(
                            color: Color(0xFFCBD5E1),
                            width: 1,
                          ),
                        ),
                ),
                child: IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // SN
                      _buildTableCell(
                        width: colSnWidth,
                        child: Center(
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: AppColors.info.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${item.sn}',
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.info,
                              ),
                            ),
                          ),
                        ),
                      ),

                      // NAME & AVATAR
                      _buildTableCell(
                        width: colNameWidth,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: avatarBg,
                                child: Text(
                                  initial,
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      item.name,
                                      style: GoogleFonts.outfit(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primaryNavy,
                                      ),
                                    ),
                                    const SizedBox(height: 1),
                                    Text(
                                      item.email,
                                      style: GoogleFonts.outfit(
                                        fontSize: 11,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // USER ID (Interactive Copy)
                      _buildTableCell(
                        width: colUserIdWidth,
                        child: Center(
                          child: InkWell(
                            onTap: () {
                              Clipboard.setData(ClipboardData(text: item.userId));
                              VTSnackbar.showSuccess(
                                context,
                                'Copied ID: ${item.userId}',
                              );
                            },
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.bg,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppColors.borderLight),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    item.userId,
                                    style: GoogleFonts.sourceCodePro(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.slate500,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(
                                    Icons.copy_rounded,
                                    size: 11,
                                    color: AppColors.textSecondary.withValues(alpha: 0.7),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),

                      // JOINED
                      _buildTableCell(
                        width: colJoinedWidth,
                        child: Center(
                          child: Text(
                            item.joinedDate,
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              color: AppColors.primaryNavy,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),

                      // ACTIVE TEAM
                      _buildTableCell(
                        width: colActiveTeamWidth,
                        child: Center(
                          child: Text(
                            '${item.activeTeam}',
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              color: AppColors.primaryNavy,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      // STATUS BADGE
                      _buildTableCell(
                        width: colStatusWidth,
                        isLast: true,
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: item.status == 'ACTIVE'
                                  ? AppColors.successBg
                                  : AppColors.greyLight,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: item.status == 'ACTIVE'
                                    ? AppColors.successBorder
                                    : AppColors.borderLight,
                              ),
                            ),
                            child: Text(
                              item.status,
                              style: GoogleFonts.outfit(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: item.status == 'ACTIVE'
                                    ? AppColors.successText
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildHeaderCell(String title, double width, {bool isLast = false}) {
    return Container(
      width: width,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                right: BorderSide(
                  color: Color(0xFFCBD5E1),
                  width: 1,
                ),
              ),
      ),
      child: Text(
        title,
        style: GoogleFonts.outfit(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: AppColors.primaryNavy,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildTableCell({
    required double width,
    required Widget child,
    bool isLast = false,
  }) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                right: BorderSide(
                  color: Color(0xFFCBD5E1),
                  width: 1,
                ),
              ),
      ),
      child: child,
    );
  }
}
