import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/core/widgets/drawer/vt_drawer.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: VTDrawer(
        selectedIndex: 0,
        onDestinationSelected: (index) {},
      ),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        titleSpacing: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(
              Icons.menu_rounded,
              color: AppColors.primaryNavy,
              size: 26,
            ),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'V ',
              style: AppTextStyles.headTitleBold(
                fontWeight: FontWeight.w900,
                fontSize: 22,
                color: AppColors.gold,
              ),
            ),
            Text(
              'TRACKER',
              style: AppTextStyles.headTitleBold(
                fontWeight: FontWeight.w900,
                fontSize: 22,
                color: AppColors.primaryNavy,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(
                  Icons.notifications_outlined,
                  size: 26,
                  color: AppColors.primaryNavy,
                ),
                Positioned(
                  right: 1,
                  top: 1,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.cart),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            icon: const Icon(
              Icons.shopping_cart_outlined,
              size: 26,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.grey.shade300,
                width: 1,
              ),
            ),
            child: InkWell(
              onTap: () => Navigator.pushNamed(context, AppRoutes.editProfile),
              child: const CircleAvatar(
                radius: 16,
                backgroundImage: NetworkImage(
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 8),
              // ── Screen Title ──
              Center(
                child: Text(
                  'More',
                  style: AppTextStyles.headTitleBold(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryNavy,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── 3D Banner Illustration ──
              Center(
                child: Image.asset(
                  'assets/images/more_banner.png',
                  height: 220,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 36),

              // ── Menu List Items ──
              _buildMoreItem(
                iconPath: 'assets/images/icon_bulk_purchase.png',
                title: 'Bulk Purchase',
                onTap: () {
                  Navigator.pushNamed(context, AppRoutes.shop);
                },
              ),
              const SizedBox(height: 20),

              _buildMoreItem(
                iconPath: 'assets/images/icon_business_login.png',
                title: 'Business Login',
                onTap: () {
                  Navigator.pushNamed(context, AppRoutes.login);
                },
              ),
              const SizedBox(height: 20),

              _buildMoreItem(
                iconPath: 'assets/images/icon_wallet.png',
                title: 'Wallet',
                onTap: () {
                  Navigator.pushNamed(context, AppRoutes.withdraw);
                },
              ),
              const SizedBox(height: 20),

              _buildMoreItem(
                iconPath: 'assets/images/icon_contact_us.png',
                title: 'Contact Us',
                onTap: () {
                  Navigator.pushNamed(context, AppRoutes.helpAndSupport);
                },
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMoreItem({
    required String iconPath,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        child: Row(
          children: [
            Image.asset(
              iconPath,
              width: 36,
              height: 36,
              fit: BoxFit.contain,
            ),
            const SizedBox(width: 20),
            Text(
              title,
              style: AppTextStyles.labelLarge(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.primaryNavy,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
