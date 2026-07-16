import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/routes/app_routes.dart';

class GetStarted extends StatelessWidget {
  const GetStarted({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Image.asset(
            'assets/images/dem.png',
            fit: BoxFit.cover,
            height: 825.45,
            width: double.infinity,
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 60,
            child: InkWell(
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.login);
              },
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: 25),
                width: double.infinity,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.gold,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      blurRadius: 30,
                      spreadRadius: 0,
                      offset: Offset(0, 15),
                      color: AppColors.primaryNavy.withValues(alpha: 0.5),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    "Get Started",
                    style: AppTextStyles.labelLarge(color: AppColors.white),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
