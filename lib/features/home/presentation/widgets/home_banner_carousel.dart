import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_strings.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';

/// Data class representing each slide in the home banner carousel.
class BannerSlideData {
  final String title;
  final String? privateLabel;
  final String? instantContactLabel;
  final String? noAppsRequiredLabel;
  final String buttonText;
  final String imagePath;
  final VoidCallback? onTap;

  const BannerSlideData({
    required this.title,
    this.privateLabel,
    this.instantContactLabel,
    this.noAppsRequiredLabel,
    required this.buttonText,
    required this.imagePath,
    this.onTap,
  });

  /// Default slide matching the initial emergency QR card design.
  static BannerSlideData defaultEmergencySlide({VoidCallback? onTap}) {
    return BannerSlideData(
      title: AppStrings.homeEmergencyTitle,
      privateLabel: AppStrings.homePrivateLabel,
      instantContactLabel: AppStrings.homeInstantContactLabel,
      noAppsRequiredLabel: AppStrings.homeNoAppsRequiredLabel,
      buttonText: AppStrings.scanQrBtn,
      imagePath: 'assets/images/qr_phone_hand.png',
      onTap: onTap,
    );
  }
}

/// Reusable banner carousel widget with exact original UI styling,
/// responsive constraints, and smooth indicator dots.
class HomeBannerCarousel extends StatefulWidget {
  final List<BannerSlideData>? items;
  final double height;
  final bool autoPlay;

  const HomeBannerCarousel({
    super.key,
    this.items,
    this.height = 230,
    this.autoPlay = true,
  });

  @override
  State<HomeBannerCarousel> createState() => _HomeBannerCarouselState();
}

class _HomeBannerCarouselState extends State<HomeBannerCarousel> {
  int _currentIndex = 0;

  late final List<BannerSlideData> _slideItems;

  @override
  void initState() {
    super.initState();
    // Use provided items or repeat the default emergency card 3 times
    _slideItems = widget.items ??
        List.generate(
          3,
          (_) => BannerSlideData.defaultEmergencySlide(),
        );
  }

  final CarouselSliderController _carouselController = CarouselSliderController();

  @override
  Widget build(BuildContext context) {
    if (_slideItems.isEmpty) return const SizedBox.shrink();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        CarouselSlider.builder(
          carouselController: _carouselController,
          itemCount: _slideItems.length,
          options: CarouselOptions(
            height: widget.height,
            viewportFraction: 1.0,
            enableInfiniteScroll: _slideItems.length > 1,
            autoPlay: widget.autoPlay && _slideItems.length > 1,
            autoPlayInterval: const Duration(seconds: 4),
            autoPlayAnimationDuration: const Duration(milliseconds: 700),
            autoPlayCurve: Curves.easeInOutCubic,
            pageSnapping: true,
            clipBehavior: Clip.hardEdge,
            onPageChanged: (index, reason) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
          itemBuilder: (context, index, realIndex) {
            final item = _slideItems[index];
            return _buildSlideCard(item);
          },
        ),
        if (_slideItems.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_slideItems.length, (index) {
              final isSelected = _currentIndex == index;
              return GestureDetector(
                onTap: () {
                  _carouselController.animateToPage(
                    index,
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeOutCubic,
                  );
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 350),
                  curve: Curves.easeOutCubic,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: isSelected ? 28 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.gold
                        : AppColors.primaryNavy.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  Widget _buildSlideCard(BannerSlideData item) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.centerRight,
      children: [
        // Main container
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.primaryNavy,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(
            children: [
              // Text and Button Content
              Expanded(
                flex: 12,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        item.title,
                        style: AppTextStyles.headlineLarge(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                      const SizedBox(height: 8),
                      RichText(
                        text: TextSpan(
                          style: AppTextStyles.bodySmall(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: 12,
                          ),
                          children: [
                            if (item.privateLabel != null)
                              TextSpan(text: item.privateLabel!),
                            const TextSpan(
                              text: '• ',
                              style: TextStyle(
                                color: AppColors.gold,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (item.instantContactLabel != null)
                              TextSpan(text: item.instantContactLabel!),
                            if (item.noAppsRequiredLabel != null)
                              TextSpan(text: item.noAppsRequiredLabel!),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      InkWell(
                        onTap: item.onTap,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.gold,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                item.buttonText,
                                style: AppTextStyles.labelLarge(
                                  color: AppColors.primaryNavy,
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                color: AppColors.primaryNavy,
                                size: 16,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Spacer to prevent text overlap with the positioned image on the right
              const Expanded(
                flex: 7,
                child: SizedBox(),
              ),
            ],
          ),
        ),
        // Positioned Image that doesn't affect container height
        Positioned(
          right: 0,
          child: Image.asset(
            item.imagePath,
            fit: BoxFit.contain,
            height: 180,
          ),
        ),
      ],
    );
  }
}
