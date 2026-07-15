class Address {
  final String id;
  final String name;
  final String label; // e.g., 'Home', 'Office', 'Other'
  final String addressLine1;
  final String addressLine2;
  final String pincode;
  final String city;
  final String state;
  final bool isDefault;

  const Address({
    required this.id,
    required this.name,
    required this.label,
    required this.addressLine1,
    required this.addressLine2,
    required this.pincode,
    required this.city,
    required this.state,
    this.isDefault = false,
  });
}
