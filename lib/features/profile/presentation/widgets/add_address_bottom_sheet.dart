import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/vt_button.dart';
import 'package:snap_q/features/profile/data/models/address_model.dart';

class AddAddressBottomSheet extends StatefulWidget {
  final Address? addressToEdit;
  final Function(Address) onAddressAdded;
  final Function(Address) onAddressUpdated;

  const AddAddressBottomSheet({
    super.key,
    this.addressToEdit,
    required this.onAddressAdded,
    required this.onAddressUpdated,
  });

  @override
  State<AddAddressBottomSheet> createState() => _AddAddressBottomSheetState();
}

class _AddAddressBottomSheetState extends State<AddAddressBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _line1Controller = TextEditingController();
  final _line2Controller = TextEditingController();
  final _pincodeController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  
  String _selectedLabel = 'Home';
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    if (widget.addressToEdit != null) {
      final addr = widget.addressToEdit!;
      _nameController.text = addr.name;
      _line1Controller.text = addr.addressLine1;
      _line2Controller.text = addr.addressLine2;
      _pincodeController.text = addr.pincode;
      _cityController.text = addr.city;
      _stateController.text = addr.state;
      _selectedLabel = addr.label;
      _isDefault = addr.isDefault;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _line1Controller.dispose();
    _line2Controller.dispose();
    _pincodeController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final newAddress = Address(
        id: widget.addressToEdit?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        name: _nameController.text.trim(),
        label: _selectedLabel,
        addressLine1: _line1Controller.text.trim(),
        addressLine2: _line2Controller.text.trim(),
        pincode: _pincodeController.text.trim(),
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        isDefault: _isDefault,
      );
      
      if (widget.addressToEdit != null) {
        widget.onAddressUpdated(newAddress);
      } else {
        widget.onAddressAdded(newAddress);
      }
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.addressToEdit != null;
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                isEditing ? 'Edit Address' : 'Add New Address',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 16),
              
              // Address Type Selector (Chips)
              Text(
                'Address Type',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: ['Home', 'Office', 'Other'].map((label) {
                  final isSelected = _selectedLabel == label;
                  return Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: ChoiceChip(
                      label: Text(label),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedLabel = label;
                          });
                        }
                      },
                      selectedColor: AppColors.primaryNavy.withValues(alpha: 0.1),
                      checkmarkColor: AppColors.primaryNavy,
                      labelStyle: GoogleFonts.outfit(
                        color: isSelected ? AppColors.primaryNavy : AppColors.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              _buildField(
                controller: _nameController,
                labelText: 'Full Name',
                hintText: 'e.g. Shubham Maurya',
                validator: (val) => val == null || val.isEmpty ? 'Please enter name' : null,
              ),
              const SizedBox(height: 12),
              _buildField(
                controller: _line1Controller,
                labelText: 'Address Line 1',
                hintText: 'Flat/House No, Building, Area',
                validator: (val) => val == null || val.isEmpty ? 'Please enter address' : null,
              ),
              const SizedBox(height: 12),
              _buildField(
                controller: _line2Controller,
                labelText: 'Address Line 2 (Optional)',
                hintText: 'Landmark, Road, Sector',
              ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: _buildField(
                      controller: _pincodeController,
                      labelText: 'Pincode',
                      hintText: 'e.g. 500081',
                      keyboardType: TextInputType.number,
                      validator: (val) => val == null || val.length != 6 ? 'Enter 6-digit pin' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildField(
                      controller: _cityController,
                      labelText: 'City',
                      hintText: 'e.g. Hyderabad',
                      validator: (val) => val == null || val.isEmpty ? 'Enter city' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildField(
                controller: _stateController,
                labelText: 'State',
                hintText: 'e.g. Telangana',
                validator: (val) => val == null || val.isEmpty ? 'Enter state' : null,
              ),
              const SizedBox(height: 12),
              
              // Set Default Switch
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Set as default address',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  Switch(
                    value: _isDefault,
                    onChanged: (val) {
                      setState(() {
                        _isDefault = val;
                      });
                    },
                    activeThumbColor: AppColors.primaryNavy,
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              VTButton(
                text: isEditing ? 'Update Address' : 'Save Address',
                onPressed: _submitForm,
                backgroundColor: AppColors.gold,
                textColor: AppColors.white,
                fontSize: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String labelText,
    String? hintText,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      style: GoogleFonts.outfit(
        fontSize: 14,
        color: AppColors.primaryNavy,
        fontWeight: FontWeight.w500,
      ),
      decoration: InputDecoration(
        labelText: labelText,
        labelStyle: GoogleFonts.outfit(
          fontSize: 14,
          color: AppColors.textSecondary,
        ),
        hintText: hintText,
        hintStyle: GoogleFonts.outfit(
          fontSize: 13,
          color: AppColors.textSecondary.withValues(alpha: 0.6),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: AppColors.grey.withValues(alpha: 0.5),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: AppColors.grey.withValues(alpha: 0.5),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(
            color: AppColors.primaryNavy,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }
}
