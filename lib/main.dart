import 'package:flutter/material.dart';
import 'package:snap_q/core/routes/app_pages.dart';
import 'package:snap_q/features/auth/presentation/screens/get_started.dart';


void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'V Tracker',
      debugShowCheckedModeBanner: false,
      home: const GetStarted(),
      onGenerateRoute: AppPages.generateRoute,
    );
  } 
}

