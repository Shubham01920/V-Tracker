import 'package:flutter/material.dart';
import 'package:snap_q/core/utils/snackbar_helper.dart';
import 'package:snap_q/core/utils/dynamic_snackbar.dart';

class VTSnackbar {
  VTSnackbar._();

  static void showSuccess(BuildContext context, String message) {
    SnackbarHelper.show(
      context: context,
      message: message,
      type: SnackbarType.success,
    );
  }

  static void showError(BuildContext context, String message) {
    SnackbarHelper.show(
      context: context,
      message: message,
      type: SnackbarType.error,
    );
  }

  static void showInfo(BuildContext context, String message) {
    SnackbarHelper.show(
      context: context,
      message: message,
      type: SnackbarType.info,
    );
  }

  static void showWarning(BuildContext context, String message) {
    SnackbarHelper.show(
      context: context,
      message: message,
      type: SnackbarType.warning,
    );
  }
}
