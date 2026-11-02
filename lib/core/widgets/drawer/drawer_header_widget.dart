import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

class DrawerHeaderWidget extends StatelessWidget {
  const DrawerHeaderWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(
            left: 20,
            top: 16,
            right: 20,
            bottom: 10,
          ),
          child: Row(
            children: [
              const CircleAvatar(
                radius: 45,
                child: Icon(Icons.person, size: 45),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.drawerUserName,
                    style: AppTextStyles.headlineMedium(),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppStrings.drawerUserPhone,
                    style: AppTextStyles.bodyMedium(),
                  ),
                ],
              ),
            ],
          ),
        ),
        const Divider(indent: 20, endIndent: 20),
        const SizedBox(height: 10),
      ],
    );
  }
}
