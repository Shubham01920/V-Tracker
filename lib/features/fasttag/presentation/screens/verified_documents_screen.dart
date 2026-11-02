import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:snap_q/core/constants/app_colors.dart';
import 'package:snap_q/core/widgets/app_bar/vt_app_bar_2.dart';
import 'package:snap_q/core/widgets/vt_dropdown.dart';
import 'package:snap_q/core/widgets/vt_snackbar.dart';
import 'package:snap_q/features/profile/presentation/widgets/custom_button.dart';

class VerifiedDocumentItem {
  final String title;
  final String documentNumber;
  final String status;
  final String expiryDate;
  final IconData icon;
  final String? attachedFile;

  const VerifiedDocumentItem({
    required this.title,
    required this.documentNumber,
    required this.status,
    required this.expiryDate,
    required this.icon,
    this.attachedFile,
  });
}

class VerifiedDocumentsScreen extends StatefulWidget {
  const VerifiedDocumentsScreen({super.key});

  @override
  State<VerifiedDocumentsScreen> createState() => _VerifiedDocumentsScreenState();
}

class _VerifiedDocumentsScreenState extends State<VerifiedDocumentsScreen> {
  final List<VerifiedDocumentItem> _documents = [
    const VerifiedDocumentItem(
      title: 'Vehicle Registration (RC)',
      documentNumber: 'MH12AB1234',
      status: 'Verified',
      expiryDate: '24 Apr 2037',
      icon: Icons.directions_car_outlined,
      attachedFile: 'rc_mh12ab1234.pdf',
    ),
    const VerifiedDocumentItem(
      title: 'FASTag Tag Certificate',
      documentNumber: 'NETC-8849-2049-1102',
      status: 'Verified',
      expiryDate: 'Active',
      icon: Icons.nfc_outlined,
      attachedFile: 'fasttag_cert.pdf',
    ),
    const VerifiedDocumentItem(
      title: 'Motor Insurance Policy',
      documentNumber: 'POL-99210-4820-2024',
      status: 'Expiring Soon',
      expiryDate: '18 May 2027',
      icon: Icons.shield_outlined,
      attachedFile: 'insurance_policy.pdf',
    ),
    const VerifiedDocumentItem(
      title: 'Pollution Certificate (PUC)',
      documentNumber: 'PUC-MH12-990231',
      status: 'Verified',
      expiryDate: '15 Nov 2026',
      icon: Icons.eco_outlined,
      attachedFile: 'puc_certificate.pdf',
    ),
    const VerifiedDocumentItem(
      title: 'Driving License (DL)',
      documentNumber: 'DL-1420110029304',
      status: 'Verified',
      expiryDate: '09 Sep 2035',
      icon: Icons.badge_outlined,
      attachedFile: 'dl_sandeep.pdf',
    ),
  ];

  void _showDocumentSheet(VerifiedDocumentItem doc) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.primaryNavy.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primaryNavy.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(doc.icon, color: AppColors.primaryNavy, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          doc.title,
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Verified Document Record',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bg,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    _buildRow('Document Number', doc.documentNumber),
                    const Divider(height: 16),
                    _buildRow('Verification Status', doc.status),
                    const Divider(height: 16),
                    _buildRow('Expiry Date', doc.expiryDate),
                    if (doc.attachedFile != null) ...[
                      const Divider(height: 16),
                      _buildRow('Attached File', doc.attachedFile!),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: doc.status == 'Pending Verification'
                    ? 'View Submitted Copy'
                    : 'Download Document',
                icon: Icons.download_outlined,
                backgroundColor: AppColors.primaryNavy,
                textColor: AppColors.white,
                onPressed: () {
                  Navigator.pop(context);
                  VTSnackbar.showSuccess(
                    context,
                    '${doc.title} downloaded successfully.',
                  );
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  void _openUploadDocumentSheet() {
    final docTypeController = TextEditingController(text: 'Vehicle Registration (RC)');
    final docNumberController = TextEditingController();
    final expiryController = TextEditingController();
    String selectedDocType = 'Vehicle Registration (RC)';
    String? attachedFileName;

    final docTypes = [
      'Vehicle Registration (RC)',
      'FASTag Tag Certificate',
      'Motor Insurance Policy',
      'Pollution Certificate (PUC)',
      'Driving License (DL)',
      'Other National ID',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                decoration: const BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.grey,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Text(
                      'Upload & Submit Document',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Document will be submitted to Admin for verification.',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 20),

                    VTDropdown<String>(
                      label: 'Document Type',
                      value: selectedDocType,
                      items: docTypes.map((t) {
                        IconData docIcon = Icons.description_outlined;
                        if (t.contains('RC') || t.contains('Vehicle')) {
                          docIcon = Icons.directions_car_outlined;
                        } else if (t.contains('FASTag')) {
                          docIcon = Icons.nfc_outlined;
                        } else if (t.contains('Insurance')) {
                          docIcon = Icons.shield_outlined;
                        } else if (t.contains('PUC') || t.contains('Pollution')) {
                          docIcon = Icons.eco_outlined;
                        } else if (t.contains('DL') || t.contains('License')) {
                          docIcon = Icons.badge_outlined;
                        }

                        return VTDropdownItemData<String>(
                          value: t,
                          label: t,
                          icon: docIcon,
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setModalState(() {
                            selectedDocType = val;
                            docTypeController.text = val;
                          });
                        }
                      },
                    ),

                    const SizedBox(height: 16),

                    // Document Number Input
                    Text(
                      'Document Number',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: docNumberController,
                      textCapitalization: TextCapitalization.characters,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Enter Registration or Document No.',
                        hintStyle: GoogleFonts.outfit(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                        filled: true,
                        fillColor: AppColors.bg,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.borderLight),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.borderLight),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.primaryNavy, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Expiry Date Input
                    Text(
                      'Expiry Date',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: expiryController,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryNavy,
                      ),
                      decoration: InputDecoration(
                        hintText: 'e.g. 24 Apr 2030 or Active',
                        hintStyle: GoogleFonts.outfit(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                        filled: true,
                        fillColor: AppColors.bg,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.borderLight),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.borderLight),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.primaryNavy, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // File Attachment Simulation
                    GestureDetector(
                      onTap: () {
                        setModalState(() {
                          attachedFileName =
                              'doc_${DateTime.now().millisecondsSinceEpoch}.jpg';
                        });
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                        decoration: BoxDecoration(
                          color: AppColors.primaryNavy.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.primaryNavy.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              attachedFileName != null
                                  ? Icons.check_circle_rounded
                                  : Icons.cloud_upload_outlined,
                              color: attachedFileName != null
                                  ? AppColors.successText
                                  : AppColors.primaryNavy,
                              size: 22,
                            ),
                            const SizedBox(width: 10),
                            Text(
                              attachedFileName ?? 'Attach Photo or PDF Document',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Submit Action using CustomButton
                    CustomButton(
                      text: 'Submit for Admin Verification',
                      icon: Icons.send_outlined,
                      backgroundColor: AppColors.primaryNavy,
                      textColor: AppColors.white,
                      onPressed: () {
                        final numText = docNumberController.text.trim();
                        if (numText.isEmpty) {
                          VTSnackbar.showError(
                              context, 'Please enter a valid document number');
                          return;
                        }

                        IconData icon = Icons.description_outlined;
                        if (selectedDocType.contains('RC') ||
                            selectedDocType.contains('Vehicle')) {
                          icon = Icons.directions_car_outlined;
                        } else if (selectedDocType.contains('FASTag')) {
                          icon = Icons.nfc_outlined;
                        } else if (selectedDocType.contains('Insurance')) {
                          icon = Icons.shield_outlined;
                        } else if (selectedDocType.contains('PUC') ||
                            selectedDocType.contains('Pollution')) {
                          icon = Icons.eco_outlined;
                        } else if (selectedDocType.contains('DL') ||
                            selectedDocType.contains('License')) {
                          icon = Icons.badge_outlined;
                        }

                        setState(() {
                          _documents.insert(
                            0,
                            VerifiedDocumentItem(
                              title: selectedDocType,
                              documentNumber: numText.toUpperCase(),
                              status: 'Pending Verification',
                              expiryDate: expiryController.text.trim().isEmpty
                                  ? 'Under Review'
                                  : expiryController.text.trim(),
                              icon: icon,
                              attachedFile: attachedFileName ?? 'doc_upload.pdf',
                            ),
                          );
                        });

                        Navigator.pop(context);
                        VTSnackbar.showSuccess(
                          context,
                          '$selectedDocType submitted! Pending Admin verification.',
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  static Widget _buildRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            val,
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
        ],
      ),
    );
  }

  void _downloadAllDocuments(BuildContext context) {
    VTSnackbar.showSuccess(
      context,
      'Downloading all verified documents to your device...',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const VTAppBar2(
        title: 'Verified Documents',
        showAction: false,
        showBackButton: true,
        backgroundColor: AppColors.bg,
      ),
      body: Column(
        children: [
          // ── UPLOAD DOCUMENT ACTION HEADER ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Your Document Vault',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryNavy,
                  ),
                ),
                InkWell(
                  onTap: _openUploadDocumentSheet,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryNavy,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.add,
                          color: AppColors.white,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Upload New',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── DOCUMENTS LIST ──
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _documents.length,
              itemBuilder: (context, index) {
                final doc = _documents[index];
                final isPending = doc.status == 'Pending Verification';
                final isExpiring = doc.status == 'Expiring Soon';

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primaryNavy.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        doc.icon,
                        color: AppColors.primaryNavy,
                        size: 22,
                      ),
                    ),
                    title: Text(
                      doc.title,
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    subtitle: Text(
                      '${doc.documentNumber} • ${doc.expiryDate}',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isPending
                            ? AppColors.goldLightBg
                            : isExpiring
                                ? AppColors.goldLightBg
                                : AppColors.successBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        doc.status,
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isPending
                              ? AppColors.warning
                              : isExpiring
                                  ? AppColors.warning
                                  : AppColors.successText,
                        ),
                      ),
                    ),
                    onTap: () => _showDocumentSheet(doc),
                  ),
                );
              },
            ),
          ),

          // ── DOWNLOAD ALL DOCUMENTS BUTTON ──
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: CustomButton(
              text: 'Download All Verified Documents',
              icon: Icons.download_for_offline_outlined,
              backgroundColor: AppColors.primaryNavy,
              textColor: AppColors.white,
              onPressed: () => _downloadAllDocuments(context),
            ),
          ),
        ],
      ),
    );
  }
}
