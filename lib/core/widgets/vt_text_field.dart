import 'package:flutter/material.dart';
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
  // ignore: unused_field
  String? _errorText;

  @override
  Widget build(BuildContext context) {
    return VTContianer(
      borderRadius: 16,

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

        decoration: InputDecoration(
          labelText: widget.labelText,
          hintText: widget.hintText,
          hintStyle: AppTextStyles.bodySmall(
            color: Colors.black54,
            fontSize: 14.0, // default hint font size
          ),
          prefixIcon: widget.prefixIcon != null
              ? IconTheme(
                  data: const IconThemeData(
                    size: 23.0, // default prefix icon size
                    color: Colors.black54,
                  ),
                  child: widget.prefixIcon!,
                )
              : null,
          suffixIcon: widget.suffixIcon != null
              ? IconTheme(
                  data: const IconThemeData(
                    size: 23.0, // default suffix icon size
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
          // Hide default error text as we render it customly
          errorStyle: const TextStyle(height: 0, fontSize: 0),
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 10,
          ),
        ),
      ),
    );
  }
}
