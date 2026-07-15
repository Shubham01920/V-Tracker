import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/constants/app_spacing.dart';
import 'package:snap_q/core/constants/app_text_styles.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_text_field.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _emailController;
  late final TextEditingController _alertNumberController;
  late final TextEditingController _addressController;
  late final TextEditingController _placeController;
  late final TextEditingController _stateController;
  late final TextEditingController _pincodeController;
  late final TextEditingController _localityController;
  late final TextEditingController _nearByController;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _alertNumberController = TextEditingController();
    _addressController = TextEditingController();
    _placeController = TextEditingController();
    _stateController = TextEditingController();
    _pincodeController = TextEditingController();
    _localityController = TextEditingController();
    _nearByController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _alertNumberController.dispose();
    _addressController.dispose();
    _placeController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _localityController.dispose();
    _nearByController.dispose();
    super.dispose();
  }

  void _saveProfile() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // Simulate a API/database save delay
      Future.delayed(const Duration(milliseconds: 1500), () {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          VTSnackbar.showSuccess(context, 'Profile updated successfully!');
          Navigator.pop(context);
        }
      });
    }
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: AppColors.grey,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text(
                'Change Profile Photo',
                style: AppTextStyles.labelLarge(
                  fontSize: 18,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildPickerOption(
                    icon: Icons.camera_alt_outlined,
                    label: 'Camera',
                    onTap: () {
                      Navigator.pop(context);
                      VTSnackbar.showInfo(context, 'Opening camera... (mock)');
                    },
                  ),
                  _buildPickerOption(
                    icon: Icons.photo_library_outlined,
                    label: 'Gallery',
                    onTap: () {
                      Navigator.pop(context);
                      VTSnackbar.showInfo(context, 'Opening gallery... (mock)');
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPickerOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AppColors.bg,
            child: Icon(icon, color: AppColors.primaryNavy, size: 26),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryNavy,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Edit Profile',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── PROFILE PICTURE WITH CAMERA EDIT BADGE ──
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.grey.withValues(alpha: 0.5),
                          width: 2,
                        ),
                        image: const DecorationImage(
                          image: NetworkImage(
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _showImagePickerOptions,
                        child: Container(
                          padding: const EdgeInsets.all(8.0),
                          decoration: BoxDecoration(
                            color: AppColors.navyLight,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.white,
                              width: 2,
                            ),
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            color: AppColors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // ── INPUT TEXT FIELDS ──
              _buildFieldHeader('Full name'),
              CustomTextField(
                controller: _nameController,
                hintText: 'Enter full name',
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              AppSpacing.heightM,

              // Mobile Number & Alert number in Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldHeader('Mobile Number'),
                        CustomTextField(
                          controller: _phoneController,
                          hintText: 'Enter mobile number',
                          keyboardType: TextInputType.phone,
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Please enter phone';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldHeader('Alert number'),
                        CustomTextField(
                          controller: _alertNumberController,
                          hintText: 'Enter you number',
                          keyboardType: TextInputType.phone,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              AppSpacing.heightM,

              _buildFieldHeader('Email Address'),
              CustomTextField(
                controller: _emailController,
                hintText: 'Enter your ...',
                keyboardType: TextInputType.emailAddress,
                validator: (val) {
                  if (val != null && val.trim().isNotEmpty) {
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(val)) {
                      return 'Invalid email';
                    }
                  }
                  return null;
                },
              ),
              AppSpacing.heightM,

              _buildFieldHeader('Address'),
              CustomTextField(
                controller: _addressController,
                hintText: 'Enter Your address',
                maxLines: 3,
              ),
              AppSpacing.heightM,

              // Place & State in Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldHeader('Place'),
                        CustomTextField(
                          controller: _placeController,
                          hintText: 'Enter Your ...',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldHeader('State'),
                        CustomTextField(
                          controller: _stateController,
                          hintText: 'Enter your ...',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              AppSpacing.heightM,

              // Pincode & Locality in Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldHeader('Pincode'),
                        CustomTextField(
                          controller: _pincodeController,
                          hintText: 'Enter pinc...',
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldHeader('Locality'),
                        CustomTextField(
                          controller: _localityController,
                          hintText: 'Enter locali...',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              AppSpacing.heightM,

              _buildFieldHeader('Near By'),
              CustomTextField(
                controller: _nearByController,
                hintText: 'Enter nearby landmark',
              ),
              const SizedBox(height: 48),

              // ── SAVE CHANGES / SUBMIT BUTTON ──
              CustomButton(
                
                text: 'Submit',
                isLoading: _isLoading,
                onPressed: _saveProfile,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldHeader(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
      child: Text(
        label,
        style: AppTextStyles.labelLarge(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryNavy,
        ),
      ),
    );
  }
}
