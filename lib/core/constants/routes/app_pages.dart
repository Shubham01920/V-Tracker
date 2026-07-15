import 'package:flutter/cupertino.dart';
import 'package:snap_q/core/constants/routes/app_routes.dart';
import 'package:snap_q/features/auth/presentation/screens/get_started.dart';
import 'package:snap_q/features/auth/presentation/screens/login_screen.dart';
import 'package:snap_q/features/home/presentation/screens/home_screen.dart';
import 'package:snap_q/features/vehicle_search/presentation/screens/vehicle_search_screen.dart';
import 'package:snap_q/features/shop/presentation/shop_screen.dart';
import 'package:snap_q/features/shop/presentation/widget/product_detail_screen.dart';
import 'package:snap_q/features/shop/presentation/widget/checkout_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/scratch_card_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/referral_screen.dart';
import 'package:snap_q/features/qr/presentation/screens/qr_tab_screen.dart';
import 'package:snap_q/features/qr/presentation/screens/qr_scanner_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/profile_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/my_vehicles_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/my_orders_screen.dart';
import 'package:snap_q/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:snap_q/features/navigation/presentation/navigation_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/feedback_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/community_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/about_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/privacy_policy_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/terms_and_conditions_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/help_and_support_screen.dart';
import 'package:snap_q/features/calls/presentation/screens/call_history_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/address_book_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/edit_profile_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/track_order_screen.dart';

class AppPages {
  static Map<String, WidgetBuilder> routes = {
    AppRoutes.getStarted: (_) => const GetStarted(),
    AppRoutes.login: (_) => const LoginScreen(),
    AppRoutes.home: (_) => const HomeScreen(),
    AppRoutes.vehicleSearch: (_) => const VehicleSearchScreen(),
    AppRoutes.shop: (_) => const ShopScreen(),
    AppRoutes.productDetail: (context) {
      final product = ModalRoute.of(context)!.settings.arguments as Product;
      return ProductDetailScreen(product: product);
    },
    AppRoutes.checkout: (context) {
      final product = ModalRoute.of(context)!.settings.arguments as Product;
      return CheckoutScreen(product: product);
    },
    AppRoutes.scratchCard: (_) => const ScratchCardScreen(),
    AppRoutes.referral: (_) => const ReferralScreen(),
    AppRoutes.qrTab: (_) => const QrTabScreen(),
    AppRoutes.qrScanner: (_) => const QrScannerScreen(),
    AppRoutes.profile: (_) => const ProfileScreen(),
    AppRoutes.myVehicles: (_) => const MyVehiclesScreen(),
    AppRoutes.myOrders: (_) => const MyOrdersScreen(),
    AppRoutes.notifications: (_) => const NotificationsScreen(),
    AppRoutes.navigation: (_) => const NavigationScreen(),
    AppRoutes.feedback: (_) => const FeedbackScreen(),
    AppRoutes.community: (_) => const CommunityScreen(),
    AppRoutes.about: (_) => const AboutScreen(),
    AppRoutes.callHistory: (_) => const CallHistoryScreen(),
    AppRoutes.privacyPolicy: (_) => const PrivacyPolicyScreen(),
    AppRoutes.termsAndConditions: (_) => const TermsAndConditionsScreen(),
    AppRoutes.helpAndSupport: (_) => const HelpAndSupportScreen(),
    AppRoutes.addressBook: (context) {
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
      final bool isSelectMode = args?['isSelectMode'] ?? false;
      return AddressBookScreen(isSelectMode: isSelectMode);
    },
    AppRoutes.editProfile: (_) => const EditProfileScreen(),
    AppRoutes.trackOrder: (_) => const TrackOrderScreen(),
  };
}
