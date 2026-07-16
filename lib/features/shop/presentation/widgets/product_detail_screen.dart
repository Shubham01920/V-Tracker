import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/routes/app_routes.dart';
import 'package:snap_q/features/shop/presentation/screens/shop_screen.dart';
import 'package:snap_q/features/shop/data/cart_manager.dart';

/// ── PRODUCT DETAILS SCREEN ──────────────────────────────────────────────────
/// Displays comprehensive details about a selected product, including an image
/// carousel slider, reviews, product price, features list, quantity controls,
/// and a direct buy CTA button.
class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({
    super.key,
    required this.product,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  // Current quantity selected by the user
  int _quantity = 1;
  
  // Toggles the wishlist favorite status
  bool _isWishlisted = false;
  
  // Track currently active slide in the image carousel (starts on mockup)
  int _currentPage = 1;
  
  // Page controller for the sliding image view
  late final PageController _pageController;

  // List of paths for the product images displayed in the carousel
  late final List<String> _carouselImages;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentPage);
    
    // Set up 6 carousel images using both the specific vehicle shop asset and the generic detail sticker
    _carouselImages = [
      widget.product.imagePath,
      'assets/images/qr_sticker_detail.png',
      'assets/images/qr_phone_hand.png',
      widget.product.imagePath,
      'assets/images/qr_sticker_detail.png',
      'assets/images/get_started.png',
    ];
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Core features list displayed as checklist items
    final List<String> features = const [
      AppStrings.featureInstantContact,
      AppStrings.featurePrivacyProtected,
      AppStrings.featureNoAppRequired,
      AppStrings.featureWorksAnywhere,
      AppStrings.featureDurableWeatherproof,
    ];

    return Scaffold(
      // Unified background color matching the rest of the application
      backgroundColor: AppColors.bg,
      
      // Top Navigation Bar (with custom back button and wishlist heart toggle)
      appBar: VTAppBar2(
        title: '',
        showBackButton: true,
        showAction: true,
        actionIcon: _isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
        actionIconColor: _isWishlisted ? AppColors.error : AppColors.primaryNavy,
        onActionPressed: () {
          setState(() {
            _isWishlisted = !_isWishlisted;
          });
        },
        backgroundColor: AppColors.bg,
      ),
      
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              
              // ── PART 1: PRODUCT IMAGE CAROUSEL (SLIDER) ──────────────────────
              // Container with 3D drop shadow elevation holding the PageView image builder
              Container(
                height: 280,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B), // Premium dark background for the QR mockup
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryNavy.withValues(alpha: 0.15),
                      blurRadius: 15,
                      spreadRadius: 1,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: PageView.builder(
                    controller: _pageController,
                    itemCount: _carouselImages.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      final imagePath = _carouselImages[index];
                      // Scale sticker mockup full screen, fit vehicle graphics inside
                      final isStickerMockup = imagePath.contains('qr_sticker_detail') || imagePath.contains('qr_phone_hand');
                      return Image.asset(
                        imagePath,
                        fit: isStickerMockup ? BoxFit.cover : BoxFit.contain,
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 12),
              
              // ── PART 2: CAPSULE DOT INDICATOR (ROW) ─────────────────────────
              // Row of dot indicators where the active index animates into a capsule width
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_carouselImages.length, (index) {
                  final isActive = _currentPage == index;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: isActive ? 20.0 : 7.0,
                    height: 7.0,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100),
                      color: isActive
                          ? AppColors.primaryNavy
                          : AppColors.primaryNavy.withValues(alpha: 0.2),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 20),
              
              // ── PART 3: PRODUCT METADATA (TITLES, RATING, PRICE) ────────────
              // Displays selected product title
              Text(
                widget.product.title,
                style: AppTextStyles.headTitleBold(
                  fontSize: 24,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 4),
              // Displays selected product subtitle
              Text(
                widget.product.subtitle,
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 10),
              // Star Rating score block (Gold star with total reviews count)
              Row(
                children: [
                  const Icon(
                    Icons.star_rounded,
                    color: AppColors.gold,
                    size: 20,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    widget.product.rating.toString(),
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(1.2K reviews)',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Main Product Price Label
              Text(
                widget.product.price,
                style: AppTextStyles.headTitleBold(
                  fontSize: 28,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 18),
              
              // ── PART 4: PRODUCT FEATURES (CHECKLIST) ─────────────────────────
              // Maps out the core details using standard checkmark icons
              Column(
                children: features.map((feature) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.check_rounded,
                          color: AppColors.primaryNavy,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            feature,
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                              color: AppColors.primaryNavy,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              
              // ── PART 5: QUANTITY SELECTOR (PILL CONTAINER) ──────────────────
              // Capsule container with a 3D drop shadow holding the stateful minus/plus buttons
              Container(
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(
                    color: AppColors.grey.withValues(alpha: 0.5),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryNavy.withValues(alpha: 0.06),
                      blurRadius: 6,
                      spreadRadius: 0,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Decrement quantity button (with light background inner container)
                    InkWell(
                      onTap: () {
                        if (_quantity > 1) {
                          setState(() {
                            _quantity--;
                          });
                        }
                      },
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.grey.shade200,
                            width: 1,
                          ),
                        ),
                        child: const Icon(
                          Icons.remove_rounded,
                          size: 16,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                    ),
                    const SizedBox(width: 18),
                    // Current Quantity Number
                    Text(
                      _quantity.toString(),
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(width: 18),
                    // Increment quantity button (with light background inner container)
                    InkWell(
                      onTap: () {
                        setState(() {
                          _quantity++;
                        });
                      },
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.grey.shade200,
                            width: 1,
                          ),
                        ),
                        child: const Icon(
                          Icons.add_rounded,
                          size: 16,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              // ── PART 6: BUY NOW PRIMARY CTA (BUTTON) ────────────────────────
              // Reusable primary action button with gold fill and custom padding sizes
              VTButton(
                text: AppStrings.buyNowBtn,
                onPressed: () {
                  CartManager().addProduct(widget.product);
                  Navigator.pushNamed(
                    context,
                    AppRoutes.cart,
                  );
                },
                backgroundColor: AppColors.gold,
                textColor: AppColors.primaryNavy,
                fontSize: 17,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
