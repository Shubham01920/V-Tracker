import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/vt_search_bar.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/core/constants/routes/app_routes.dart';

// Product data model for the shop items
class Product {
  final String title;
  final String subtitle;
  final String price;
  final double rating;
  final String imagePath;
  final String category;

  const Product({
    required this.title,
    required this.subtitle,
    required this.price,
    required this.rating,
    required this.imagePath,
    required this.category,
  });
}

/// ── SHOP SCREEN ─────────────────────────────────────────────────────────────
/// Displays the main shop view with search capability, horizontal category tabs,
/// and a list of product cards.
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  // Currently active category pill
  String _selectedCategory = AppStrings.shopCategoryAll;

  // List of all products matching the mockup
  final List<Product> _allProducts = const [
    Product(
      title: AppStrings.shopProduct2WheelerTitle,
      subtitle: AppStrings.shopProduct2WheelerSubtitle,
      price: AppStrings.shopProduct2WheelerPrice,
      rating: 4.8,
      imagePath: "assets/images/bike_shop.png",
      category: AppStrings.shopProduct2WheelerCategory,
    ),
    Product(
      title: AppStrings.shopProduct3WheelerTitle,
      subtitle: AppStrings.shopProduct3WheelerSubtitle,
      price: AppStrings.shopProduct3WheelerPrice,
      rating: 4.8,
      imagePath: "assets/images/rickshaw_shop.png",
      category: AppStrings.shopProduct3WheelerCategory,
    ),
    Product(
      title: AppStrings.shopProduct4WheelerTitle,
      subtitle: AppStrings.shopProduct4WheelerSubtitle,
      price: AppStrings.shopProduct4WheelerPrice,
      rating: 4.9,
      imagePath: "assets/images/car_shop.png",
      category: AppStrings.shopProduct4WheelerCategory,
    ),
    Product(
      title: AppStrings.shopProductCommercialTitle,
      subtitle: AppStrings.shopProductCommercialSubtitle,
      price: AppStrings.shopProductCommercialPrice,
      rating: 4.9,
      imagePath: "assets/images/truck_shop.png",
      category: AppStrings.shopProductCommercialCategory,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    // Filter product list according to selected category
    final List<Product> filteredProducts = _selectedCategory == "All"
        ? _allProducts
        : _allProducts.where((p) => p.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: const VTAppBar2(
        title: "Shop",
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),
            // ── PART 1: SEARCH BAR CAPSULE ───────────────────────────────────
            VTSearchBar(
              hintText: AppStrings.searchProductsHint,
              showSuffixButton: false,
              borderRadius: 12,
              onSearch: (value) {
                // TODO: Implement product search logic
              },
            ),
            const SizedBox(height: 16),

            // ── PART 2: CATEGORIES HORIZONTAL PILLS ROW ──────────────────────
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: [
                  _buildCategoryPill(AppStrings.shopCategoryAll),
                  _buildCategoryPill(AppStrings.shopProduct2WheelerCategory),
                  _buildCategoryPill(AppStrings.shopProduct3WheelerCategory),
                  _buildCategoryPill(AppStrings.shopProduct4WheelerCategory),
                  _buildCategoryPill(AppStrings.shopProductCommercialCategory),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── PART 3: PRODUCT LIST ──────────────────────────────────────────
            Expanded(
              child: ListView.builder(
                itemCount: filteredProducts.length,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 24),
                itemBuilder: (context, index) {
                  final product = filteredProducts[index];
                  return _buildProductCard(product);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── HELPER: CATEGORY PILL BUILDER ──────────────────────────────────────────
  Widget _buildCategoryPill(String category) {
    final bool isActive = _selectedCategory == category;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedCategory = category;
        });
      },
      borderRadius: BorderRadius.circular(100),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primaryNavy : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppColors.primaryNavy.withValues(alpha: 0.25),
                    blurRadius: 8,
                    spreadRadius: 0,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Text(
          category,
          style: AppTextStyles.bodyMedium(
            color: isActive ? Colors.white : AppColors.primaryNavy,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  // ── HELPER: PRODUCT CARD BUILDER ───────────────────────────────────────────
  Widget _buildProductCard(Product product) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          AppRoutes.productDetail,
          arguments: product,
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          children: [
            // Left side: Image and Heart container
            Container(
              width: 110,
              height: 154,
              decoration: const BoxDecoration(
                border: Border(
                  right: BorderSide(
                    color: Color(0xFFF1F5F9),
                    width: 1.5,
                  ),
                ),
              ),
              child: Column(
                children: [
                  // Vehicle image with white background
                  Expanded(
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(22),
                        ),
                      ),
                      padding: const EdgeInsets.all(8),
                      child: Center(
                        child: Image.asset(
                          product.imagePath,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
                  // Heart icon button with yellow background
                  Container(
                    height: 48,
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: AppColors.yellow, // yellow background
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(22),
                      ),
                    ),
                    child: IconButton(
                      onPressed: () {},
                      icon: const Icon(
                        Icons.favorite_border_rounded,
                        color: AppColors.primaryNavy,
                        size: 22,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Right side: Info and Buy Button
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.title,
                      style: AppTextStyles.bodyLarge(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product.subtitle,
                      style: AppTextStyles.bodySmall(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Text(
                          product.price,
                          style: AppTextStyles.headlineMedium(
                            color: AppColors.primaryNavy,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          product.rating.toString(),
                          style: AppTextStyles.bodyMedium(
                            color: AppColors.gold,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Icon(
                          Icons.star_rounded,
                          color: AppColors.gold,
                          size: 18,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    VTButton(
                      text: AppStrings.buyNowBtn,
                      onPressed: () {
                        Navigator.pushNamed(
                          context,
                          AppRoutes.productDetail,
                          arguments: product,
                        );
                      },
                      backgroundColor: AppColors.primaryNavy,
                      textColor: Colors.white,
                      height: 48,
                      fontSize: 15,
                      elevation: 6,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}