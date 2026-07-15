import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class VTSearchBar extends StatefulWidget {
  final String hintText;
  final TextEditingController? controller;
  final ValueChanged<String>? onSearch;
  final ValueChanged<String>? onChanged;
  final double height;
  final IconData icon;
  final bool showSuffixButton;
  final double borderRadius;

  const VTSearchBar({
    super.key,
    this.hintText = AppStrings.enterVehicleNumberHint,
    this.controller,
    this.onSearch,
    this.onChanged,
    this.height = 52.0,
    this.icon = Icons.search_rounded,
    this.showSuffixButton = true,
    this.borderRadius = 12.0,
  });

  @override
  State<VTSearchBar> createState() => _VTSearchBarState();
}

class _VTSearchBarState extends State<VTSearchBar> {
  late final TextEditingController _controller;
  bool _isLocalController = false;

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      _controller = widget.controller!;
    } else {
      _controller = TextEditingController();
      _isLocalController = true;
    }
  }

  @override
  void dispose() {
    if (_isLocalController) {
      _controller.dispose();
    }
    super.dispose();
  }

  void _handleSearch() {
    if (widget.onSearch != null) {
      widget.onSearch!(_controller.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.showSuffixButton) {
      return Row(
        children: [
          // Input Field
          Expanded(
            child: Container(
              height: widget.height,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(widget.borderRadius),
                border: Border.all(
                  color: Colors.grey.shade200,
                  width: 1.5,
                ),
              ),
              child: Center(
                child: TextField(
                  controller: _controller,
                  onChanged: widget.onChanged,
                  onSubmitted: (_) => _handleSearch(),
                  decoration: InputDecoration(
                    hintText: widget.hintText,
                    hintStyle: AppTextStyles.bodyMedium(
                      color: AppColors.textSecondary.withValues(alpha: 0.7),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                  style: AppTextStyles.bodyLarge(
                    color: AppColors.primaryNavy,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Search Button
          Container(
            height: widget.height,
            width: widget.height,
            decoration: BoxDecoration(
              color: AppColors.primaryNavy,
              borderRadius: BorderRadius.circular(widget.borderRadius),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryNavy.withValues(alpha: 0.15),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: IconButton(
              onPressed: _handleSearch,
              icon: Icon(
                widget.icon,
                color: Colors.white,
                size: widget.height * 0.46,
              ),
            ),
          ),
        ],
      );
    } else {
      // Unified pill/bar layout
      return Container(
        height: widget.height,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(widget.borderRadius),
          border: Border.all(
            color: const Color(0xFFE2E8F0),
            width: 1.0,
          ),
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
            Icon(
              widget.icon,
              color: AppColors.textSecondary,
              size: widget.height * 0.42,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _controller,
                onChanged: widget.onChanged,
                onSubmitted: (_) => _handleSearch(),
                decoration: InputDecoration(
                  hintText: widget.hintText,
                  hintStyle: AppTextStyles.bodyMedium(
                    color: AppColors.textSecondary.withValues(alpha: 0.7),
                  ),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
                style: AppTextStyles.bodyLarge(
                  color: AppColors.primaryNavy,
                ),
              ),
            ),
          ],
        ),
      );
    }
  }
}
