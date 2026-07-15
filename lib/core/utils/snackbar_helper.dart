import 'package:flutter/material.dart';
import 'dynamic_snackbar.dart';

class SnackbarHelper {
  static OverlayEntry? _currentOverlay;

  static void show({
    required BuildContext context,
    required String message,
    required SnackbarType type,
    Duration duration = const Duration(seconds: 4),
    VoidCallback? action,
  }) {
    final overlayState = Overlay.of(context);

    // Build the new overlay entry
    late final OverlayEntry entry;
    entry = OverlayEntry(
      builder: (context) {
        return DynamicSnackbarWidget(
          message: message,
          type: type,
          duration: duration,
          actions: action,
          onDismissed: () {
            // Only remove if this entry is still the current active one
            if (_currentOverlay == entry) {
              entry.remove();
              _currentOverlay = null;
            }
          },
        );
      },
    );

    // Dismiss any previously showing alert immediately
    if (_currentOverlay != null) {
      _currentOverlay!.remove();
    }

    _currentOverlay = entry;
    overlayState.insert(entry);
  }

  static void dismiss() {
    if (_currentOverlay != null) {
      _currentOverlay!.remove();
      _currentOverlay = null;
    }
  }
}
