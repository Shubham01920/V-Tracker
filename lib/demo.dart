import 'package:flutter/material.dart';
import 'package:scratcher/scratcher.dart';
import 'package:snap_q/core/constants/app_colors.dart';

class DemoCard extends StatefulWidget {
  const DemoCard({super.key});

  @override
  State<DemoCard> createState() => _DemoCardState();
}

class _DemoCardState extends State<DemoCard> {
  final List<String> _messages = [
    "Hello",
    "Kemcho",
    "Hamcha Launda",
    "Aur bandi",
    "Sandeep Bhai ka"
  ];

  final List<String> _subNames = [
    "Spoo",
    "Miss Kalash",
    "Vinayak",
    "Kesi hai?",
    "Kya hal chal hai?"
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Scratch Card"), centerTitle: true),
      body: GridView.builder(
        padding: EdgeInsets.all(20),
        itemCount: 8,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 14,
          crossAxisSpacing: 14,
        ),
        itemBuilder: (context, index) {
          final message = _messages[index % _messages.length];
          final subName = _subNames[index % _subNames.length];
          
          return Container(
            decoration: BoxDecoration(
              color: AppColors.info,
              borderRadius: BorderRadius.circular(20),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Scratcher(
                // color: Colors.deepPurpleAccent,
                brushSize: 50,
                threshold: 50,
                image: Image.asset("assets/UI/card_1.png"),
                
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            message,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            subName,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
