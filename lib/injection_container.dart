import 'package:flutter/material.dart';
import 'package:snap_q/core/utils/dynamic_snackbar.dart';
import 'package:snap_q/core/utils/snackbar_helper.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            SnackbarHelper.show(
              context: context,
              message: "Hellow",
              type: SnackbarType.info,
            );
          },
          child: Text("Press"),
        ),
      ),
    );
  }
}
