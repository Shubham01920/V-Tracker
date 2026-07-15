import 'package:flutter/material.dart';
import 'package:scratcher/scratcher.dart';

class ScratchCardWidget extends StatelessWidget {
  final Widget child;
  final String imagePath;
  final VoidCallback? onScratchCompleted;
  final double threshold;
  final double brushSize;

  const ScratchCardWidget({
    super.key,
    required this.child,
    this.imagePath = 'assets/UI/card_1.png',
    this.onScratchCompleted,
    this.threshold = 45.0, // Scratcher threshold is 0 to 100 percentage
    this.brushSize = 50.0,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Scratcher(
        brushSize: brushSize,
        threshold: threshold,
        image: Image.asset(
          imagePath,
          fit: BoxFit.cover,
        ),
        onThreshold: onScratchCompleted,
        child: child,
      ),
    );
  }
}
