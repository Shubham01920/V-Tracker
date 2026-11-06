export const mockGenerationPlan = [
  { level: 1, percentage: 10, totalPayouts: 154000 },
  { level: 2, percentage: 5, totalPayouts: 85000 },
  { level: 3, percentage: 4, totalPayouts: 62000 },
  { level: 4, percentage: 3, totalPayouts: 45000 },
  { level: 5, percentage: 2, totalPayouts: 32000 },
  { level: 6, percentage: 1, totalPayouts: 15000 },
  { level: 7, percentage: 1, totalPayouts: 12000 },
  { level: 8, percentage: 1, totalPayouts: 10500 },
  { level: 9, percentage: 1, totalPayouts: 9000 },
  { level: 10, percentage: 1, totalPayouts: 8500 },
];

export const mockRewardPoolConfig = {
  activeCardLimits: {
    perReferral: 3,
    perRecharge: 1,
  },
  tiers: [
    { id: 'tier_1', type: 'Cashback', details: '₹10 - ₹50', probability: 40, status: 'Active' },
    { id: 'tier_2', type: 'Cashback', details: '₹50 - ₹500', probability: 5, status: 'Active' },
    { id: 'tier_3', type: 'Discount Coupon', details: '20% off next recharge', probability: 25, status: 'Active' },
    { id: 'tier_4', type: 'Free Extension', details: '30 Days Free', probability: 5, status: 'Active' },
    { id: 'tier_5', type: 'Better Luck Next Time', details: 'No Reward', probability: 25, status: 'Active' },
  ]
};

export const mockLeaderboard = [
  { id: 'usr_981', name: 'Rahul Sharma', networkSize: 1250, totalIncome: 145000 },
  { id: 'usr_234', name: 'Priya Patel', networkSize: 890, totalIncome: 98000 },
  { id: 'usr_556', name: 'Amit Kumar', networkSize: 720, totalIncome: 85500 },
  { id: 'usr_112', name: 'Neha Singh', networkSize: 450, totalIncome: 62000 },
  { id: 'usr_889', name: 'Vikram Reddy', networkSize: 310, totalIncome: 41000 },
];

export const mockPayoutHistory = [
  { id: 'po_001', userId: 'usr_445', userName: 'Anil Desai', genLevel: 1, referralUser: 'Sunita Rao', rechargePlan: '365 Days', amount: 1599, incomePercent: 10, payoutAmount: 159.9, status: 'Pending', date: '2026-07-28' },
  { id: 'po_002', userId: 'usr_981', userName: 'Rahul Sharma', genLevel: 2, referralUser: 'Karan Singh', rechargePlan: '180 Days', amount: 899, incomePercent: 5, payoutAmount: 44.95, status: 'Approved', date: '2026-07-28' },
  { id: 'po_003', userId: 'usr_234', userName: 'Priya Patel', genLevel: 5, referralUser: 'Deepak Verma', rechargePlan: '90 Days', amount: 499, incomePercent: 2, payoutAmount: 9.98, status: 'Paid', date: '2026-07-27' },
  { id: 'po_004', userId: 'usr_776', userName: 'John Doe', genLevel: 1, referralUser: 'Jane Doe', rechargePlan: '365 Days', amount: 1599, incomePercent: 10, payoutAmount: 159.9, status: 'Rejected', date: '2026-07-26' },
];

export const mockFraudAlerts = [
  { id: 'fa_1', userId: 'usr_991', userName: 'Fake User 1', reason: 'Same IP rapid signups (12 in 1 hr)', severity: 'High', date: '2026-07-29' },
  { id: 'fa_2', userId: 'usr_442', userName: 'Suspicious Chain', reason: 'Circular referral chain detected (A->B->C->A)', severity: 'Critical', date: '2026-07-28' },
  { id: 'fa_3', userId: 'usr_115', userName: 'Dormant Abuser', reason: 'Dormant accounts used for chain padding', severity: 'Medium', date: '2026-07-25' },
];

// A recursive structure for the tree visualization up to 10 levels
const generateDeepTree = (level = 1, maxLevel = 10) => {
  if (level > maxLevel) return [];
  
  // Generate 2 children for level 1, and 1 child for the rest to show depth without blowing up the DOM
  const numChildren = level === 1 ? 2 : (level < maxLevel ? 1 : 0);
  
  const children = [];
  for (let i = 0; i < numChildren; i++) {
    children.push({
      id: `usr_gen${level}_${Math.floor(Math.random() * 10000)}`,
      name: `Referral User (Gen ${level})`,
      level: level,
      children: generateDeepTree(level + 1, maxLevel)
    });
  }
  return children;
};

export const mockNetworkTree = {
  id: 'usr_981',
  name: 'Rahul Sharma (Root)',
  level: 0,
  children: generateDeepTree(1, 10)
};
