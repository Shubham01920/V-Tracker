import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class DrawerExpandableTileWidget extends StatelessWidget {
  final IconData icon;
  final String label;
  final List<String> subItems;
  final Map<String, int>? subItemIndexMap;
  final bool isParentSelected;
  final bool isParentExpanded;
  final String? activeSubTitle;
  final int activeSelectedIndex;
  final ValueChanged<bool> onExpansionChanged;
  final ValueChanged<String> onSubItemTap;

  const DrawerExpandableTileWidget({
    super.key,
    required this.icon,
    required this.label,
    required this.subItems,
    this.subItemIndexMap,
    required this.isParentSelected,
    required this.isParentExpanded,
    required this.activeSubTitle,
    required this.activeSelectedIndex,
    required this.onExpansionChanged,
    required this.onSubItemTap,
  });

  @override
  Widget build(BuildContext context) {
    final Color headerColor =
        isParentSelected ? AppColors.white : AppColors.primaryNavy;

    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Material(
          color: isParentSelected ? AppColors.gold : Colors.transparent,
          borderRadius: BorderRadius.circular(28),
          clipBehavior: Clip.antiAlias,
          child: ExpansionTile(
            key: PageStorageKey<String>(label),
            initiallyExpanded: isParentExpanded,
            onExpansionChanged: onExpansionChanged,
            shape: const Border(),
            collapsedShape: const Border(),
            iconColor: headerColor,
            collapsedIconColor: headerColor,
            tilePadding: const EdgeInsets.symmetric(horizontal: 16),
            leading: Icon(
              icon,
              color: headerColor,
            ),
            title: Text(
              label,
              style: AppTextStyles.labelMedium(
                color: headerColor,
                fontWeight: isParentSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
            children: subItems.map((subTitle) {
              final int? subIndex = subItemIndexMap?[subTitle];
              final bool isSubSelected = (activeSubTitle != null &&
                      activeSubTitle == 'sub_$subTitle') ||
                  (activeSubTitle == null &&
                      subIndex != null &&
                      subIndex == activeSelectedIndex);

              return Padding(
                padding: const EdgeInsets.only(left: 20, right: 12, top: 2, bottom: 2),
                child: Material(
                  color: isSubSelected ? AppColors.goldLightBg : Colors.transparent,
                  borderRadius: BorderRadius.circular(28),
                  clipBehavior: Clip.antiAlias,
                  child: ListTile(
                    dense: true,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                    leading: Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isSubSelected
                            ? AppColors.primaryNavy
                            : AppColors.primaryNavy.withValues(alpha: 0.4),
                      ),
                    ),
                    title: Text(
                      subTitle,
                      style: AppTextStyles.labelMedium(
                        color: AppColors.primaryNavy,
                        fontWeight:
                            isSubSelected ? FontWeight.w600 : FontWeight.w500,
                      ),
                    ),
                    onTap: () => onSubItemTap(subTitle),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
