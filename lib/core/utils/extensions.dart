import 'package:flutter/material.dart';

extension BuildContextExt on BuildContext {
  // Theme helpers
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => theme.textTheme;
  ColorScheme get colorScheme => theme.colorScheme;

  // MediaQuery helpers
  Size get screenSize => MediaQuery.sizeOf(this);
  double get screenWidth => screenSize.width;
  double get screenHeight => screenSize.height;

  // Padding helpers
  EdgeInsets get mediaQueryPadding => MediaQuery.paddingOf(this);
  double get viewInsetsBottom => MediaQuery.viewInsetsOf(this).bottom;

  // Navigator helpers
  void pop<T extends Object?>([T? result]) => Navigator.of(this).pop(result);

  Future<T?> pushNamed<T extends Object?>(String routeName, {Object? arguments}) =>
      Navigator.of(this).pushNamed<T>(routeName, arguments: arguments);

  Future<T?> pushReplacementNamed<T extends Object?, TO extends Object?>(
    String routeName, {
    TO? result,
    Object? arguments,
  }) =>
      Navigator.of(this).pushReplacementNamed<T, TO>(
        routeName,
        result: result,
        arguments: arguments,
      );
}
