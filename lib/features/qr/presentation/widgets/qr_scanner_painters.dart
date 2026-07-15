import 'package:flutter/material.dart';

// ── OVERLAY WITH TRANSPARENT CUT-OUT ────────────────────
class ScannerOverlay extends StatelessWidget {
  final double frameSize;
  const ScannerOverlay({super.key, required this.frameSize});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: LayoutBuilder(
        builder: (context, constraints) {
          return CustomPaint(
            size: Size(constraints.maxWidth, constraints.maxHeight),
            painter: OverlayPainter(frameSize: frameSize),
          );
        },
      ),
    );
  }
}

class OverlayPainter extends CustomPainter {
  final double frameSize;
  OverlayPainter({required this.frameSize});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withValues(alpha: 0.6);

    // Full-screen rect
    final fullRect = Rect.fromLTWH(0, 0, size.width, size.height);

    // Transparent cut-out in the centre
    final cutoutRect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: frameSize,
      height: frameSize,
    );

    // Draw the overlay with a hole
    final path = Path()
      ..addRect(fullRect)
      ..addRRect(
        RRect.fromRectAndRadius(cutoutRect, const Radius.circular(12)),
      );
    path.fillType = PathFillType.evenOdd;

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant OverlayPainter oldDelegate) =>
      oldDelegate.frameSize != frameSize;
}

// ── GOLD CORNER BRACKET PAINTER ─────────────────────────
class CornerBracketPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double cornerLength;
  final double cornerRadius;

  CornerBracketPainter({
    required this.color,
    required this.strokeWidth,
    required this.cornerLength,
    required this.cornerRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final w = size.width;
    final h = size.height;
    final cl = cornerLength;
    final cr = cornerRadius;

    // Top-left
    canvas.drawPath(
      Path()
        ..moveTo(0, cl)
        ..lineTo(0, cr)
        ..arcToPoint(Offset(cr, 0), radius: Radius.circular(cr))
        ..lineTo(cl, 0),
      paint,
    );

    // Top-right
    canvas.drawPath(
      Path()
        ..moveTo(w - cl, 0)
        ..lineTo(w - cr, 0)
        ..arcToPoint(Offset(w, cr), radius: Radius.circular(cr))
        ..lineTo(w, cl),
      paint,
    );

    // Bottom-left
    canvas.drawPath(
      Path()
        ..moveTo(0, h - cl)
        ..lineTo(0, h - cr)
        ..arcToPoint(Offset(cr, h), radius: Radius.circular(cr), clockwise: false)
        ..lineTo(cl, h),
      paint,
    );

    // Bottom-right
    canvas.drawPath(
      Path()
        ..moveTo(w - cl, h)
        ..lineTo(w - cr, h)
        ..arcToPoint(Offset(w, h - cr), radius: Radius.circular(cr), clockwise: false)
        ..lineTo(w, h - cl),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CornerBracketPainter oldDelegate) => false;
}

// ── SCANNING LINE PAINTER ───────────────────────────────
class ScanLinePainter extends CustomPainter {
  final double progress;
  final Color color;

  ScanLinePainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final y = size.height * progress;
    final paint = Paint()
      ..shader = LinearGradient(
        colors: [
          color.withValues(alpha: 0.0),
          color.withValues(alpha: 0.6),
          color.withValues(alpha: 0.0),
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(Rect.fromLTWH(0, y - 1, size.width, 2));

    canvas.drawLine(
      Offset(8, y),
      Offset(size.width - 8, y),
      paint..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(covariant ScanLinePainter oldDelegate) =>
      oldDelegate.progress != progress;
}
