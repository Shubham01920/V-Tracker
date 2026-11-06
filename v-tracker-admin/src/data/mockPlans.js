export const packageConfig = {
  basePrice: 5999,
  gstPercentage: 18,
  bundledItems: [
    'GPS V-Tracker device',
    '2 QR Codes',
    '6 Months Free Recharge'
  ]
};

export const premiumPlans = [
  { id: 'plan_1', duration: '30 Days', price: 199, activeSubscribers: 1250, status: 'Active' },
  { id: 'plan_2', duration: '90 Days', price: 499, activeSubscribers: 3420, status: 'Active' },
  { id: 'plan_3', duration: '150 Days', price: 699, activeSubscribers: 890, status: 'Active' },
  { id: 'plan_4', duration: '180 Days', price: 899, activeSubscribers: 4500, status: 'Active' },
  { id: 'plan_5', duration: '210 Days', price: 999, activeSubscribers: 150, status: 'Hidden' },
  { id: 'plan_6', duration: '365 Days', price: 1599, activeSubscribers: 6800, status: 'Active' },
];

export const revenueData = [
  { name: '30 Days', revenue: 199 * 1250 },
  { name: '90 Days', revenue: 499 * 3420 },
  { name: '150 Days', revenue: 699 * 890 },
  { name: '180 Days', revenue: 899 * 4500 },
  { name: '210 Days', revenue: 999 * 150 },
  { name: '365 Days', revenue: 1599 * 6800 },
];
