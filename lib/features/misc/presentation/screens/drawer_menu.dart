import 'package:flutter/material.dart';

class DrawerMenu extends StatelessWidget {
  const DrawerMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return const Drawer(
      child: Center(
        child: Text('Drawer Menu'),
      ),
    );
  }
}
