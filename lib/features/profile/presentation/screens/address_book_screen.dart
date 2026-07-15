import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/features/profile/data/models/address_model.dart';
import 'package:snap_q/features/profile/presentation/widgets/add_address_bottom_sheet.dart';

class AddressBookScreen extends StatefulWidget {
  final bool isSelectMode;

  const AddressBookScreen({
    super.key,
    this.isSelectMode = false,
  });

  // Dummy Initial Address Data
  static const List<Address> dummyAddresses = [
    Address(
      id: '1',
      name: 'Shubham Maurya',
      label: 'Home',
      addressLine1: '#201, Sai Residency, Madhapur',
      addressLine2: 'Hyderabad, Telangana',
      pincode: '500081',
      city: 'Hyderabad',
      state: 'Telangana',
      isDefault: true,
    ),
    Address(
      id: '2',
      name: 'Shubham Maurya',
      label: 'Office',
      addressLine1: 'Building 3, Mindspace Tech Park, Hitec City',
      addressLine2: 'Hyderabad, Telangana',
      pincode: '500081',
      city: 'Hyderabad',
      state: 'Telangana',
    ),
    Address(
      id: '3',
      name: 'Shubham Maurya',
      label: 'Parents Home',
      addressLine1: 'Flat 402, Shanti Vihar, Sector 4',
      addressLine2: 'Dwarka, New Delhi',
      pincode: '110075',
      city: 'Delhi',
      state: 'Delhi',
    ),
  ];

  @override
  State<AddressBookScreen> createState() => _AddressBookScreenState();
}

class _AddressBookScreenState extends State<AddressBookScreen> {
  late List<Address> _addresses;

  @override
  void initState() {
    super.initState();
    _addresses = List.from(AddressBookScreen.dummyAddresses);
  }

  void _addNewAddress(Address address) {
    setState(() {
      // If new address is marked as default, unmark others
      if (address.isDefault) {
        _addresses = _addresses.map((a) {
          return Address(
            id: a.id,
            name: a.name,
            label: a.label,
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2,
            pincode: a.pincode,
            city: a.city,
            state: a.state,
            isDefault: false,
          );
        }).toList();
      }
      _addresses.add(address);
    });
  }

  void _updateAddress(Address address) {
    setState(() {
      if (address.isDefault) {
        _addresses = _addresses.map((a) {
          return Address(
            id: a.id,
            name: a.name,
            label: a.label,
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2,
            pincode: a.pincode,
            city: a.city,
            state: a.state,
            isDefault: a.id == address.id,
          );
        }).toList();
      } else {
        _addresses = _addresses.map((a) {
          return a.id == address.id ? address : a;
        }).toList();
      }
    });
  }

  void _deleteAddress(Address address) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Delete Address',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryNavy,
          ),
        ),
        content: Text(
          'Are you sure you want to delete this address?',
          style: GoogleFonts.outfit(
            color: AppColors.textSecondary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: GoogleFonts.outfit(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _addresses.removeWhere((a) => a.id == address.id);
                // Auto-set next address as default if deleted address was default
                if (address.isDefault && _addresses.isNotEmpty) {
                  final first = _addresses.first;
                  _addresses[0] = Address(
                    id: first.id,
                    name: first.name,
                    label: first.label,
                    addressLine1: first.addressLine1,
                    addressLine2: first.addressLine2,
                    pincode: first.pincode,
                    city: first.city,
                    state: first.state,
                    isDefault: true,
                  );
                }
              });
            },
            child: Text(
              'Delete',
              style: GoogleFonts.outfit(
                color: AppColors.error,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddEditAddressSheet({Address? addressToEdit}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return AddAddressBottomSheet(
          addressToEdit: addressToEdit,
          onAddressAdded: _addNewAddress,
          onAddressUpdated: _updateAddress,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: VTAppBar2(
        title: widget.isSelectMode ? 'Select Address' : 'Address Book',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: _addresses.isEmpty
                  ? Center(
                      child: Text(
                        'No addresses saved yet.',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    )
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                      itemCount: _addresses.length,
                      itemBuilder: (context, index) {
                        final address = _addresses[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12.0),
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: address.isDefault
                                  ? Colors.green.shade200
                                  : AppColors.white,
                              width: 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryNavy.withValues(alpha: 0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: InkWell(
                            onTap: () {
                              if (widget.isSelectMode) {
                                Navigator.pop(context, address);
                              }
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.only(left: 14, right: 14 ,bottom: 9, top: 5),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            address.label == 'Home'
                                                ? Icons.home_outlined
                                                : address.label == 'Office'
                                                    ? Icons.work_outline
                                                    : Icons.location_on_outlined,
                                            size: 20,
                                            color: AppColors.primaryNavy,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            address.label,
                                            style: GoogleFonts.outfit(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.primaryNavy,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          if (address.isDefault) ...[
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 10,
                                                vertical: 4,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.green.shade50,
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                'DEFAULT',
                                                style: GoogleFonts.outfit(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.green.shade700,
                                                ),
                                              ),
                                            ),
                                          ],
                                          if (!widget.isSelectMode)
                                            PopupMenuButton<String>(
                                              color: AppColors.primaryNavy,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(16),
                                              ),
                                              padding: EdgeInsets.zero,
                                              child: const Padding(
                                                padding: EdgeInsets.symmetric(vertical: 4.0, horizontal: 4.0),
                                                child: Icon(
                                                  Icons.more_vert,
                                                  size: 20,
                                                  color: AppColors.primaryNavy,
                                                ),
                                              ),
                                              onSelected: (value) {
                                                if (value == 'edit') {
                                                  _showAddEditAddressSheet(addressToEdit: address);
                                                } else if (value == 'delete') {
                                                  _deleteAddress(address);
                                                }
                                              },
                                              itemBuilder: (BuildContext context) => [
                                                PopupMenuItem<String>(
                                                  value: 'edit',
                                                  height: 36,
                                                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                                  child: Row(
                                                    children: [
                                                      const Icon(Icons.edit_outlined, size: 16, color: AppColors.white),
                                                      const SizedBox(width: 8),
                                                      Text(
                                                        'Edit',
                                                        style: GoogleFonts.outfit(
                                                          fontSize: 14,
                                                          color: AppColors.white,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                const PopupMenuItem<String>(
                                                  enabled: false,
                                                  height: 1,
                                                  padding: EdgeInsets.zero,
                                                  child: Divider(
                                                    color: Colors.white24,
                                                    height: 1,
                                                    thickness: 1,
                                                  ),
                                                ),
                                                PopupMenuItem<String>(
                                                  value: 'delete',
                                                  height: 36,
                                                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                                  child: Row(
                                                    children: [
                                                      const Icon(Icons.delete_outline, size: 16, color: AppColors.darkRed),
                                                      const SizedBox(width: 8),
                                                      Text(
                                                        'Delete',
                                                        style: GoogleFonts.outfit(
                                                          fontSize: 14,
                                                          color: AppColors.darkRed,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Text(
                                    address.name,
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primaryNavy,
                                    ),
                                  ),
                                  Text(
                                    address.addressLine1,
                                    style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                  if (address.addressLine2.isNotEmpty)
                                    Text(
                                      address.addressLine2,
                                      style: GoogleFonts.outfit(
                                        fontSize: 13,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      RichText(
                                        text: TextSpan(
                                          children: [
                                            TextSpan(
                                              text: 'Pincode: ',
                                              style: GoogleFonts.outfit(
                                                fontSize: 12,
                                                color: AppColors.textSecondary,
                                              ),
                                            ),
                                            TextSpan(
                                              text: address.pincode,
                                              style: GoogleFonts.outfit(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.primaryNavy,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (widget.isSelectMode)
                                        Text(
                                          'Tap to select',
                                          style: GoogleFonts.outfit(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.primaryNavy.withValues(alpha: 0.7),
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: VTButton(
                text: 'Add New Address',
                onPressed: () => _showAddEditAddressSheet(),
                backgroundColor: AppColors.gold,
                textColor: AppColors.white,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
