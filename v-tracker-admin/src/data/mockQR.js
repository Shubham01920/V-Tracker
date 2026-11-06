export const mockBatches = [
  {
    id: '#BATCH-9921',
    createdDate: 'Oct 24, 2023, 14:20',
    vehicleType: 'Commercial Sedan',
    quantity: '1,000',
    pricePerUnit: '₹199',
    totalPrice: '₹1,99,000',
    status: 'Printed',
    statusColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: '#BATCH-9918',
    createdDate: 'Oct 22, 2023, 09:15',
    vehicleType: 'Transit Van',
    quantity: '250',
    pricePerUnit: '₹299',
    totalPrice: '₹74,750',
    status: 'Assigned',
    statusColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: '#BATCH-9899',
    createdDate: 'Oct 18, 2023, 11:45',
    vehicleType: 'Heavy Duty Truck',
    quantity: '50',
    pricePerUnit: '₹499',
    totalPrice: '₹24,950',
    status: 'Printed',
    statusColor: 'bg-emerald-100 text-emerald-700'
  }
];

export const mockTags = [
  {
    id: 'QR-001249-X',
    batchId: '#9921',
    category: 'Commercial',
    status: 'Active',
    statusColor: 'bg-emerald-100 text-emerald-700',
    statusDot: 'bg-emerald-500',
    linkedVehicle: 'Ford F-150 (#882)',
    ownerId: 'USR-7738',
    vehicleIcon: 'directions_car',
    isRevoked: false
  },
  {
    id: 'QR-001250-X',
    batchId: '#9921',
    category: 'Commercial',
    status: 'Shipped',
    statusColor: 'bg-blue-100 text-blue-700',
    statusDot: 'bg-blue-500',
    linkedVehicle: '—',
    ownerId: '—',
    vehicleIcon: null,
    isRevoked: false
  },
  {
    id: 'QR-000842-R',
    batchId: '#9877',
    category: '2 Wheeler',
    status: 'Revoked',
    statusColor: 'bg-red-100 text-red-700',
    statusDot: null,
    linkedVehicle: 'Suspended Asset',
    ownerId: 'USR-1092',
    vehicleIcon: null,
    isRevoked: true
  },
  {
    id: 'QR-001251-X',
    batchId: '#9921',
    category: 'Commercial',
    status: 'Active',
    statusColor: 'bg-emerald-100 text-emerald-700',
    statusDot: 'bg-emerald-500',
    linkedVehicle: 'Sprinter Van (#412)',
    ownerId: 'USR-8891',
    vehicleIcon: 'local_shipping',
    isRevoked: false
  },
  {
    id: 'QR-001252-X',
    batchId: '#9921',
    category: 'Commercial',
    status: 'Unprinted',
    statusColor: 'bg-gray-100 text-gray-700',
    statusDot: 'bg-gray-500',
    linkedVehicle: '—',
    ownerId: '—',
    vehicleIcon: null,
    isRevoked: false
  },
  {
    id: 'QR-001253-X',
    batchId: '#9921',
    category: 'Commercial',
    status: 'Damaged',
    statusColor: 'bg-orange-100 text-orange-700',
    statusDot: 'bg-orange-500',
    linkedVehicle: '—',
    ownerId: '—',
    vehicleIcon: null,
    isRevoked: true
  },
  {
    id: 'QR-001254-X',
    batchId: '#9921',
    category: 'Commercial',
    status: 'Printed',
    statusColor: 'bg-teal-100 text-teal-700',
    statusDot: 'bg-teal-500',
    linkedVehicle: '—',
    ownerId: '—',
    vehicleIcon: null,
    isRevoked: false
  },
  { id: 'QR-001255-X', batchId: '#9921', category: 'Commercial', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', statusDot: 'bg-emerald-500', linkedVehicle: 'Volvo FH16 (#29)', ownerId: 'USR-3442', vehicleIcon: 'local_shipping', isRevoked: false },
  { id: 'QR-001256-X', batchId: '#9921', category: 'Commercial', status: 'Shipped', statusColor: 'bg-blue-100 text-blue-700', statusDot: 'bg-blue-500', linkedVehicle: '—', ownerId: '—', vehicleIcon: null, isRevoked: false },
  { id: 'QR-001257-X', batchId: '#9921', category: 'Commercial', status: 'Unprinted', statusColor: 'bg-gray-100 text-gray-700', statusDot: 'bg-gray-500', linkedVehicle: '—', ownerId: '—', vehicleIcon: null, isRevoked: false },
  { id: 'QR-001258-X', batchId: '#9921', category: 'Commercial', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', statusDot: 'bg-emerald-500', linkedVehicle: 'Mercedes Actros (#12)', ownerId: 'USR-1122', vehicleIcon: 'local_shipping', isRevoked: false },
  { id: 'QR-001259-X', batchId: '#9921', category: 'Commercial', status: 'Damaged', statusColor: 'bg-orange-100 text-orange-700', statusDot: 'bg-orange-500', linkedVehicle: '—', ownerId: '—', vehicleIcon: null, isRevoked: true },
  { id: 'QR-001260-X', batchId: '#9921', category: 'Commercial', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', statusDot: 'bg-emerald-500', linkedVehicle: 'Scania R500 (#44)', ownerId: 'USR-9988', vehicleIcon: 'local_shipping', isRevoked: false },
  { id: 'QR-001261-X', batchId: '#9921', category: 'Commercial', status: 'Printed', statusColor: 'bg-teal-100 text-teal-700', statusDot: 'bg-teal-500', linkedVehicle: '—', ownerId: '—', vehicleIcon: null, isRevoked: false },
  { id: 'QR-001262-X', batchId: '#9921', category: 'Commercial', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', statusDot: 'bg-emerald-500', linkedVehicle: 'MAN TGX (#55)', ownerId: 'USR-5544', vehicleIcon: 'local_shipping', isRevoked: false }
];
