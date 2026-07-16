import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/vt_contianer.dart';

class VTTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String? labelText;
  final String? hintText;
  final bool isObscure;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final int maxLines;
  final bool readOnly;
  final VoidCallback? onTap;
  final bool enabled;

  const VTTextField({
    super.key,
    this.controller,
    this.labelText,
    this.hintText,
    this.isObscure = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.prefixIcon,
    this.suffixIcon,
    this.maxLines = 1,
    this.readOnly = false,
    this.onTap,
    this.enabled = true,
  });

  @override
  State<VTTextField> createState() => _VTTextFieldState();
}

class _VTTextFieldState extends State<VTTextField> {
  String? _errorText;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        VTContianer(
          borderRadius: 16,
          borderColor: _errorText != null ? AppColors.error : AppColors.grey,
          backgroundColor: Colors.transparent,
          child: TextFormField(
            controller: widget.controller,
            obscureText: widget.isObscure,
            keyboardType: widget.keyboardType,
            maxLines: widget.maxLines,
            readOnly: widget.readOnly,
            onTap: widget.onTap,
            enabled: widget.enabled,
            style: AppTextStyles.bodyLarge(),
            validator: (val) {
              final err = widget.validator?.call(val);
              if (mounted && _errorText != err) {
                setState(() {
                  _errorText = err;
                });
              }
              return err;
            },
            decoration: InputDecoration(
              labelText: widget.labelText,
              hintText: widget.hintText,
              hintStyle: AppTextStyles.bodySmall(
                color: Colors.black54,
                fontSize: 14.0,
              ),
              prefixIcon: widget.prefixIcon != null
                  ? IconTheme(
                      data: const IconThemeData(
                        size: 23.0,
                        color: Colors.black54,
                      ),
                      child: widget.prefixIcon!,
                    )
                  : null,
              suffixIcon: widget.suffixIcon != null
                  ? IconTheme(
                      data: const IconThemeData(
                        size: 23.0,
                        color: Colors.black54,
                      ),
                      child: widget.suffixIcon!,
                    )
                  : null,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              errorBorder: InputBorder.none,
              disabledBorder: InputBorder.none,
              errorStyle: const TextStyle(height: 0, fontSize: 0),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
            ),
          ),
        ),
        if (_errorText != null) ...[
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.only(left: 8.0),
            child: Text(
              _errorText!,
              style: GoogleFonts.outfit(
                color: AppColors.error,
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
