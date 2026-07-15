import 'package:flutter/material.dart';

// ── CUSTOM CLIPPER FOR TICKET STUB EFFECT ──
class TicketClipper extends CustomClipper<Path> {
  final double punchRadius;

  const TicketClipper({this.punchRadius = 12.0});

  @override
  Path getClip(Size size) {
    final path = Path();
    
    // Top left corner
    path.moveTo(0, 0);
    path.lineTo(0, size.height * 0.5 - punchRadius);
    
    // Left punch (arc indentation inward)
    path.arcToPoint(
      Offset(0, size.height * 0.5 + punchRadius),
      radius: Radius.circular(punchRadius),
      clockwise: true,
    );
    
    // Bottom left corner
    path.lineTo(0, size.height);
    path.lineTo(size.width, size.height);
    
    // Right punch (arc indentation inward)
    path.lineTo(size.width, size.height * 0.5 + punchRadius);
    path.arcToPoint(
      Offset(size.width, size.height * 0.5 - punchRadius),
      radius: Radius.circular(punchRadius),
      clockwise: true,
    );
    
    // Top right corner
    path.lineTo(size.width, 0);
    path.close();
    
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
