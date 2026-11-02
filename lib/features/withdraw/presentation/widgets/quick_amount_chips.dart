import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';

class QuickChipItem {
  final String label;
  final double amount;

  const QuickChipItem(this.label, this.amount);
}

class QuickAmountChips extends StatelessWidget {
  final List<QuickChipItem> items;
  final String selectedText;
  final ValueChanged<double> onSelectAmount;

  const QuickAmountChips({
    super.key,
    required this.items,
    required this.selectedText,
    required this.onSelectAmount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: items.map((item) {
        final bool isSelected = selectedText == item.amount.toInt().toString() ||
            (selectedText == item.amount.toString() && item.label == 'MAX');

        return Expanded(
          child: Padding(
            padding: const EdgeInsets.only(right: 6.0),
            child: GestureDetector(
              onTap: () => onSelectAmount(item.amount),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryNavy : AppColors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primaryNavy
                        : AppColors.grey.withValues(alpha: 0.6),
                    width: 1,
                  ),
                ),
                child: Text(
                  item.label,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    color: isSelected ? AppColors.white : AppColors.primaryNavy,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
