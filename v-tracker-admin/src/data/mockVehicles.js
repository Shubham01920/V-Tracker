export const mockVehicles = [
  {
    id: 'VEH-001',
    regNumber: 'TS09XX1234',
    ownerName: 'Rahul Sharma',
    vehicleType: '4 Wheeler',
    linkedQR: 'QR-001249-X',
    activePlan: 'Premium Annual',
    registrationDate: '12 Jan 2023',
    docStatus: 'Verified',
    docStatusColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'VEH-002',
    regNumber: 'MH02AB5678',
    ownerName: 'Priya Patel',
    vehicleType: '2 Wheeler',
    linkedQR: 'QR-000842-R',
    activePlan: 'Basic Monthly',
    registrationDate: '05 Mar 2023',
    docStatus: 'Pending',
    docStatusColor: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'VEH-003',
    regNumber: 'DL01CD9012',
    ownerName: 'Amit Singh',
    vehicleType: 'Commercial',
    linkedQR: 'QR-001250-X',
    activePlan: 'Fleet Pro',
    registrationDate: '22 Nov 2022',
    docStatus: 'Rejected',
    docStatusColor: 'bg-red-100 text-red-700'
  },
  {
    id: 'VEH-004',
    regNumber: 'KA03EF3456',
    ownerName: 'Sneha Reddy',
    vehicleType: '3 Wheeler',
    linkedQR: 'QR-001251-X',
    activePlan: 'Standard Annual',
    registrationDate: '18 Aug 2023',
    docStatus: 'Verified',
    docStatusColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'VEH-005',
    regNumber: 'GJ05GH7890',
    ownerName: 'Vikram Desai',
    vehicleType: 'Commercial',
    linkedQR: 'QR-001252-X',
    activePlan: 'Fleet Pro',
    registrationDate: '09 Sep 2022',
    docStatus: 'Verified',
    docStatusColor: 'bg-emerald-100 text-emerald-700'
  }
];

export const mockVehicleDocuments = {
  'VEH-001': [
    { id: 'DOC-101', type: 'Registration Certificate (RC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '12 Jan 2038', fileUrl: '/dummy-rc.jpg' },
    { id: 'DOC-102', type: 'Insurance Certificate', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '11 Jan 2024', fileUrl: '/dummy-ins.jpg' },
    { id: 'DOC-103', type: 'Pollution Under Control (PUC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '12 Jul 2024', fileUrl: '/dummy-puc.jpg' }
  ],
  'VEH-002': [
    { id: 'DOC-201', type: 'Registration Certificate (RC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '05 Mar 2038', fileUrl: '/dummy-rc.jpg' },
    { id: 'DOC-202', type: 'Insurance Certificate', status: 'Pending', statusColor: 'bg-orange-100 text-orange-700', expiryDate: '04 Mar 2024', fileUrl: '/dummy-ins.jpg' },
    { id: 'DOC-203', type: 'Pollution Under Control (PUC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '05 Sep 2023', fileUrl: '/dummy-puc.jpg' }
  ],
  'VEH-003': [
    { id: 'DOC-301', type: 'Registration Certificate (RC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '22 Nov 2037', fileUrl: '/dummy-rc.jpg' },
    { id: 'DOC-302', type: 'Insurance Certificate', status: 'Rejected', statusColor: 'bg-red-100 text-red-700', expiryDate: '21 Nov 2023', fileUrl: '/dummy-ins.jpg', rejectionReason: 'Image is too blurry. Please re-upload.' },
    { id: 'DOC-303', type: 'Pollution Under Control (PUC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '22 May 2024', fileUrl: '/dummy-puc.jpg' },
    { id: 'DOC-304', type: 'Fitness Certificate', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '22 Nov 2024', fileUrl: '/dummy-fit.jpg' },
    { id: 'DOC-305', type: 'Permit', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '22 Nov 2027', fileUrl: '/dummy-permit.jpg' }
  ],
  'VEH-004': [
    { id: 'DOC-401', type: 'Registration Certificate (RC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '18 Aug 2038', fileUrl: '/dummy-rc.jpg' },
    { id: 'DOC-402', type: 'Insurance Certificate', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '17 Aug 2024', fileUrl: '/dummy-ins.jpg' }
  ],
  'VEH-005': [
    { id: 'DOC-501', type: 'Registration Certificate (RC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '09 Sep 2037', fileUrl: '/dummy-rc.jpg' },
    { id: 'DOC-502', type: 'Insurance Certificate', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '08 Sep 2023', fileUrl: '/dummy-ins.jpg' },
    { id: 'DOC-503', type: 'Pollution Under Control (PUC)', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', expiryDate: '09 Mar 2023', fileUrl: '/dummy-puc.jpg' }
  ]
};
