'use strict';
/**
 * Business rules in one place (PDF §3.7, §3.8, §0 item 7).
 * Values marked PLACEHOLDER have no source in the app and need a business decision
 * (and, for referral payouts, legal review — PDF §0 item 8) before production.
 */
const env = require('./env');

module.exports = {
  currency: 'INR',

  // Checkout
  deliveryFeePaise: 6000, // ₹60 flat (from Checkout screen)
  defaultTaxRatePercent: 18, // GST; per product override in Product.taxRatePercent
  nonServiceablePincodes: [], // e.g. ['999999']
  // 250 pts = ₹25 (Checkout screen). Earning rule is a PLACEHOLDER: 1 point per ₹10 of a paid order total.
  points: { minRedeem: 250, redeemBlock: 250, valuePerBlockPaise: 2500, earnPerPaise: 1000 },
  cartMaxQtyPerLine: 10,
  maxAddressesPerUser: 10,

  // Wallet / withdrawals (PDF §3.7: minimum ₹500)
  minWithdrawPaise: 50000,
  maxWithdrawPaise: 5000000, // PLACEHOLDER ₹50,000 per request

  // FASTag (PDF §3.7: minimum ₹100)
  fastagMinRechargePaise: 10000,
  fastagMaxRechargePaise: 1000000, // PLACEHOLDER ₹10,000

  // Contact abuse controls
  contactLimits: {
    perCallerPerVehiclePerHour: 3,
    perVehiclePerHour: 20,
  },

  // Scratch cards: the SERVER picks the amount at scratch time (PDF gap G5)
  rewards: {
    referralCard: { title: 'Referral Reward', subtitle: 'A friend joined with your code', minPaise: 1000, maxPaise: 10000, expiresDays: 90 },
    activationCard: { title: 'Activation Reward', subtitle: 'Thanks for activating your label', minPaise: 500, maxPaise: 5000, expiresDays: 60 },
    signupCard: { title: 'Welcome Reward', subtitle: 'Joined using a referral code', minPaise: 500, maxPaise: 2500, expiresDays: 30 },
  },

  // Referral payouts — PLACEHOLDER table. Disabled unless REFERRAL_PAYOUTS_ENABLED=true.
  referral: {
    enabled: env.REFERRAL_PAYOUTS_ENABLED,
    maxLevels: 15,
    // bonus paid to the ancestor at each level when a downline member's order becomes PAID
    levels: Array.from({ length: 15 }, (_, i) => ({
      level: i + 1,
      bonusPaise: i === 0 ? 5000 : 1000, // ₹50 for level 1, ₹10 for levels 2-15
      requiredDirectReferrals: i === 0 ? 0 : Math.min(i + 1, 10),
    })),
  },

  bankCooldownHours: env.BANK_COOLDOWN_HOURS,
};
