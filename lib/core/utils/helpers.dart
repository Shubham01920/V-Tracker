class Helpers {
  Helpers._();

  /// Format a double into Indian Rupee format  (e.g. ₹1,250.00)
  static String formatRupee(double amount) {
    final parts = amount.toStringAsFixed(2).split('.');
    final integerPart = parts[0];
    final decimalPart = parts[1];

    if (integerPart.length <= 3) {
      return '₹$integerPart.$decimalPart';
    }

    final lastThree = integerPart.substring(integerPart.length - 3);
    var remaining = integerPart.substring(0, integerPart.length - 3);

    final chunks = <String>[];
    while (remaining.length > 2) {
      chunks.insert(0, remaining.substring(remaining.length - 2));
      remaining = remaining.substring(0, remaining.length - 2);
    }
    if (remaining.isNotEmpty) {
      chunks.insert(0, remaining);
    }

    return '₹${chunks.join(",")},$lastThree.$decimalPart';
  }

  /// Calculate GST amount
  static double calculateGst(double amount, double gstPercentage) {
    return amount * (gstPercentage / 100);
  }

  /// Calculate total price including GST
  static double calculateTotalWithGst(double amount, double gstPercentage) {
    return amount + calculateGst(amount, gstPercentage);
  }
}
