import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/core/widgets/drawer/vt_drawer.dart';
import 'package:snap_q/features/calls/presentation/screens/call_history_screen.dart';
import 'package:snap_q/features/home/presentation/screens/home_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/profile_screen.dart';
import 'package:snap_q/features/qr/presentation/screens/qr_tab_screen.dart';
import 'package:snap_q/features/shop/presentation/screens/shop_screen.dart';

// ── MAIN NAVIGATION SCREEN ─────────────────────────────
class NavigationScreen extends StatefulWidget {
  const NavigationScreen({super.key});

  @override
  State<NavigationScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<NavigationScreen> {
  // selectedIndex - currently active tab key track karne ke liye
  int _selectedIndex = 0;
  
  // PageController - screens ke smooth transition scrolling ke liye
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _selectedIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  // Active screens list - matching image tabs
  final List<Widget> _screens = [
    const HomeScreen(),
    const QrTabScreen(),
    const ShopScreen(),
    const CallHistoryScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: AppColors.bg,
      extendBody: true,
      drawer: VTDrawer(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          Navigator.pop(context);
          switch (index) {
            case 0:
              setState(() {
                _selectedIndex = index;
              });
              if (_pageController.hasClients) {
                _pageController.jumpToPage(0);
              }
              break;
            case 1:
              Navigator.pushNamed(context, AppRoutes.shop);
              break;
            case 2:
              Navigator.pushNamed(context, AppRoutes.myOrders);
              break;
            case 3:
              Navigator.pushNamed(context, AppRoutes.trackOrder);
              break;
            case 4:
              Navigator.pushNamed(context, AppRoutes.referral);
              break;
            case 5:
              Navigator.pushNamed(context, AppRoutes.scratchCard);
              break;
            case 6:
              Navigator.pushNamed(context, AppRoutes.about);
              break;
            case 7:
              Navigator.pushNamed(context, AppRoutes.privacyPolicy);
              break;
            case 8:
              Navigator.pushNamed(context, AppRoutes.termsAndConditions);
              break;
            case 9:
              Navigator.pushNamed(context, AppRoutes.helpAndSupport);
              break;
          }
        },
      ),
      
      // PageView - isse horizontal swiping aur smooth animated switching page level pe milti hai
      body: SafeArea(
        bottom: false,
        child: PageView(
          controller: _pageController,
          onPageChanged: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          children: _screens,
        ),
      ),

      // Custom Floating Capsule Bottom Navigation Bar using google_nav_bar package
      bottomNavigationBar: SafeArea(
        child: Container(
          margin: const EdgeInsets.only(left: 14, right: 14, bottom: 18, top: 10),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.navBar,
            borderRadius: BorderRadius.circular(100), // Capsule curved corners
            boxShadow: [
              BoxShadow(
                color:  AppColors.navBar.withValues(alpha: 0.3),
                blurRadius: 15,
                offset: const Offset(0, 6), // Drop shadow below the bar
              ),
            ],
          ),
          child: GNav(
            rippleColor: AppColors.white.withValues(alpha: 0.15),
            hoverColor: AppColors.white.withValues(alpha: 0.05),
            gap: 8,
            activeColor: AppColors.gold, // Active tab icon & text color
            iconSize: 24,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            duration: const Duration(milliseconds: 300),
            tabBackgroundColor: AppColors.white, // Active tab background (white pill)
            color: AppColors.white, // Unselected icons color
            tabBorderRadius: 100, // Fully rounded pill for selected state
            selectedIndex: _selectedIndex,
            onTabChange: (index) {
              setState(() {
                _selectedIndex = index;
              });
              _pageController.animateToPage(
                index,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              );
            },
            tabs: [
              GButton(
                icon: _selectedIndex == 0 ? Icons.home_rounded : Icons.home_outlined,
                text: 'Home',
              ),
              GButton(
                icon: _selectedIndex == 1 ? Icons.qr_code_rounded : Icons.qr_code_scanner,
                text: 'Scan',
              ),
              GButton(
                icon: _selectedIndex == 2 ? Icons.shopping_bag_rounded : Icons.shopping_bag_outlined,
                text: 'Shop',
              ),
              GButton(
                icon: _selectedIndex == 3 ? Icons.phone_rounded : Icons.phone_outlined,
                text: 'Calls',
              ),
              GButton(
                icon: _selectedIndex == 4 ? Icons.person_rounded : Icons.person_outline,
                text: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

