import 'package:flutter/material.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/features/auth/presentation/screens/get_started.dart';
import 'package:snap_q/features/auth/presentation/screens/login_screen.dart';
import 'package:snap_q/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:snap_q/features/home/presentation/screens/home_screen.dart';
import 'package:snap_q/features/vehicle_search/presentation/screens/vehicle_search_screen.dart';
import 'package:snap_q/features/shop/presentation/screens/shop_screen.dart';
import 'package:snap_q/features/shop/presentation/widgets/product_detail_screen.dart';
import 'package:snap_q/features/shop/presentation/widgets/checkout_screen.dart';
import 'package:snap_q/features/shop/presentation/screens/cart_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/scratch_card_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/referral_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/direct_referral_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/your_performance_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/team_performance_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/payout_history_screen.dart';
import 'package:snap_q/features/referral/presentation/screens/payouts_by_teams_screen.dart';
import 'package:snap_q/features/qr/presentation/screens/qr_tab_screen.dart';
import 'package:snap_q/features/qr/presentation/screens/qr_scanner_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/profile_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/my_vehicles_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/my_orders_screen.dart';
import 'package:snap_q/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:snap_q/features/navigation/presentation/screens/navigation_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/about_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/privacy_policy_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/terms_and_conditions_screen.dart';
import 'package:snap_q/features/misc/presentation/screens/help_and_support_screen.dart';
import 'package:snap_q/features/calls/presentation/screens/call_history_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/address_book_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/edit_profile_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/track_order_screen.dart';
import 'package:snap_q/features/profile/presentation/screens/bank_details_screen.dart';
import 'package:snap_q/features/withdraw/presentation/screens/withdraw_screen.dart';
import 'package:snap_q/features/withdraw/presentation/screens/withdraw_history_screen.dart';
import 'package:snap_q/features/fasttag/presentation/screens/fasttag_check_screen.dart';
import 'package:snap_q/features/fasttag/presentation/screens/fasttag_recharge_screen.dart';
import 'package:snap_q/features/fasttag/presentation/screens/verified_documents_screen.dart';
import 'package:snap_q/features/more/presentation/screens/more_screen.dart';

class AppPages {
  static Route<dynamic>? generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.getStarted:
        return MaterialPageRoute(settings: settings, builder: (_) => const GetStarted());
      case AppRoutes.login:
        return MaterialPageRoute(settings: settings, builder: (_) => const LoginScreen());
      case AppRoutes.forgotPassword:
        return MaterialPageRoute(settings: settings, builder: (_) => const ForgotPasswordScreen());
      case AppRoutes.home:
        return MaterialPageRoute(settings: settings, builder: (_) => const HomeScreen());
      case AppRoutes.vehicleSearch:
        final vehicleNumber = settings.arguments as String? ?? '';
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => VehicleSearchScreen(searchQuery: vehicleNumber),
        );
      case AppRoutes.shop:
        return MaterialPageRoute(settings: settings, builder: (_) => const ShopScreen());
      case AppRoutes.productDetail:
        final product = settings.arguments as Product;
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => ProductDetailScreen(product: product),
        );
      case AppRoutes.checkout:
        final product = settings.arguments as Product?;
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => CheckoutScreen(product: product),
        );
      case AppRoutes.cart:
        return MaterialPageRoute(settings: settings, builder: (_) => const CartScreen());
      case AppRoutes.scratchCard:
        return MaterialPageRoute(settings: settings, builder: (_) => const ScratchCardScreen());
      case AppRoutes.referral:
        return MaterialPageRoute(settings: settings, builder: (_) => const ReferralScreen());
      case AppRoutes.qrTab:
        return MaterialPageRoute(settings: settings, builder: (_) => const QrTabScreen());
      case AppRoutes.qrScanner:
        return MaterialPageRoute(settings: settings, builder: (_) => const QrScannerScreen());
      case AppRoutes.profile:
        return MaterialPageRoute(settings: settings, builder: (_) => const ProfileScreen());
      case AppRoutes.myVehicles:
        return MaterialPageRoute(settings: settings, builder: (_) => const MyVehiclesScreen());
      case AppRoutes.myOrders:
        return MaterialPageRoute(settings: settings, builder: (_) => const MyOrdersScreen());
      case AppRoutes.notifications:
        return MaterialPageRoute(settings: settings, builder: (_) => const NotificationsScreen());
      case AppRoutes.navigation:
        return MaterialPageRoute(settings: settings, builder: (_) => const NavigationScreen());
      case AppRoutes.about:
        return MaterialPageRoute(settings: settings, builder: (_) => const AboutScreen());
      case AppRoutes.callHistory:
        return MaterialPageRoute(settings: settings, builder: (_) => const CallHistoryScreen());
      case AppRoutes.privacyPolicy:
        return MaterialPageRoute(settings: settings, builder: (_) => const PrivacyPolicyScreen());
      case AppRoutes.termsAndConditions:
        return MaterialPageRoute(settings: settings, builder: (_) => const TermsAndConditionsScreen());
      case AppRoutes.helpAndSupport:
        return MaterialPageRoute(settings: settings, builder: (_) => const HelpAndSupportScreen());
      case AppRoutes.addressBook:
        final args = settings.arguments as Map<String, dynamic>?;
        final bool isSelectMode = args?['isSelectMode'] ?? false;
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => AddressBookScreen(isSelectMode: isSelectMode),
        );
      case AppRoutes.editProfile:
        return MaterialPageRoute(settings: settings, builder: (_) => const EditProfileScreen());
      case AppRoutes.trackOrder:
        return MaterialPageRoute(settings: settings, builder: (_) => const TrackOrderScreen());
      case AppRoutes.bankDetails:
        return MaterialPageRoute(settings: settings, builder: (_) => const BankDetailsScreen());
      case AppRoutes.withdraw:
        return MaterialPageRoute(settings: settings, builder: (_) => const WithdrawScreen());
      case AppRoutes.withdrawHistory:
        return MaterialPageRoute(settings: settings, builder: (_) => const WithdrawHistoryScreen());
      case AppRoutes.directReferral:
        return MaterialPageRoute(settings: settings, builder: (_) => const DirectReferralScreen());
      case AppRoutes.yourPerformance:
        return MaterialPageRoute(settings: settings, builder: (_) => const YourPerformanceScreen());
      case AppRoutes.teamPerformance:
        return MaterialPageRoute(settings: settings, builder: (_) => const TeamPerformanceScreen());
      case AppRoutes.payoutHistory:
        return MaterialPageRoute(settings: settings, builder: (_) => const PayoutHistoryScreen());
      case AppRoutes.payoutsByTeams:
        return MaterialPageRoute(settings: settings, builder: (_) => const PayoutsByTeamsScreen());
      case AppRoutes.fasttagCheck:
        return MaterialPageRoute(settings: settings, builder: (_) => const FasttagCheckScreen());
      case AppRoutes.fasttagRecharge:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => FasttagRechargeScreen(arguments: args),
        );
      case AppRoutes.verifiedDocuments:
        return MaterialPageRoute(settings: settings, builder: (_) => const VerifiedDocumentsScreen());
      case AppRoutes.more:
        return MaterialPageRoute(settings: settings, builder: (_) => const MoreScreen());
      default:
        return null;
    }
  }
}

