import 'dart:io';
import 'package:flutter/material.dart';
import 'package:snap_q/core/routes/app_pages.dart';
import 'package:snap_q/features/auth/presentation/screens/get_started.dart';
import 'package:snap_q/features/home/presentation/screens/home_screen.dart';
import 'package:snap_q/features/navigation/presentation/screens/navigation_screen.dart';
import 'package:snap_q/features/withdraw/presentation/widgets/demo.dart';

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

void main() {
  HttpOverrides.global = MyHttpOverrides();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'V Tracker',
      debugShowCheckedModeBanner: false,
      home: const NavigationScreen(),
      onGenerateRoute: AppPages.generateRoute,
    );
  }
}
