import 'package:flutter/material.dart';

class VehicleSearchScreen extends StatelessWidget {
  const VehicleSearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Vehicle'),
      ),
      body: const Center(
        child: Text('Vehicle Search Screen'),
      ),
    );
  }
}
