export const mockUsers = [
  { 
    id: 'USR-8821', name: 'Alex Thompson', initial: 'AT', color: 'bg-blue-100 text-blue-700', 
    phone: '+91 78969 70130', email: 'alex.t@example.com', vehicles: 3, referrals: 12, status: 'Active',
    joinDate: 'Oct 24, 2023', userClass: 'Elite Fleet', rechargePlan: 'Annual Plus', totalOrders: 24, walletBalance: '₹1,450',
    linkedVehicles: [
      { name: 'Tesla Model 3', vin: '...8821992', qrOverride: false },
      { name: 'Rivian R1T', vin: '...0102334', qrOverride: false },
      { name: 'Ford F-150 Lightning', vin: '...9923485', qrOverride: true },
    ],
    rechargeHistory: [
      { date: 'Dec 24, 2024', plan: 'Annual Plus', amount: '₹1,999', status: 'Success', invoiceId: 'INV-10928' },
      { date: 'Dec 24, 2023', plan: 'Annual Plus', amount: '₹1,999', status: 'Success', invoiceId: 'INV-08832' },
    ],
    orderHistory: [
      { date: 'Aug 15, 2025', product: 'V-Tracker Pro Tag', status: 'Delivered', trackingId: 'TRK-98321' },
      { date: 'Mar 10, 2024', product: 'NFC Keychain set', status: 'Delivered', trackingId: 'TRK-55421' },
    ],
    walletLedger: [
      { date: 'Sep 01, 2025', desc: 'Referral Bonus (L1)', type: 'Credit', amount: '+₹150' },
      { date: 'Aug 15, 2025', desc: 'Hardware Purchase', type: 'Debit', amount: '-₹500' },
      { date: 'Aug 01, 2025', desc: 'Referral Bonus (L2)', type: 'Credit', amount: '+₹50' },
    ],
    auditLogs: [
      { date: 'Nov 12, 2025', action: 'Viewed Personal Info', admin: 'Super Admin' },
      { date: 'Oct 05, 2025', action: 'Updated Email', admin: 'Support Team' },
    ],
    referralTree: [
      { level: 'Level 1 (Direct)', count: 4, earnings: '₹600', users: [{name: 'Raj Kumar', id: 'USR-2911', phone: '+91 98221 11234'}, {name: 'Sneha Patil', id: 'USR-3412', phone: '+91 88123 44123'}, {name: 'Amit Singh', id: 'USR-9912', phone: '+91 77213 99122'}, {name: 'Priya Desai', id: 'USR-1123', phone: '+91 91234 55123'}] },
      { level: 'Level 2', count: 6, earnings: '₹300', users: [{name: 'Vikram Mehta', id: 'USR-5512', phone: '+91 81234 11234'}, {name: 'Neha Sharma', id: 'USR-7712', phone: '+91 99123 33123'}, {name: 'Rohan Das', id: 'USR-2213', phone: '+91 71234 88123'}] },
      { level: 'Level 3', count: 2, earnings: '₹50', users: [{name: 'Karan Patel', id: 'USR-4412', phone: '+91 82234 99123'}, {name: 'Simran Kaur', id: 'USR-6612', phone: '+91 93234 44123'}] },
    ]
  }
];
