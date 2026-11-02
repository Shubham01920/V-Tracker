'use strict';
/** Single import point for all models. */
const fastag = require('./fastag.model');
const docs = require('./document.model');
const content = require('./content.model');

module.exports = {
  User: require('./user.model'),
  RefreshToken: require('./refreshToken.model'),
  OtpChallenge: require('./otpChallenge.model'),
  PasswordReset: require('./passwordReset.model'),
  Device: require('./device.model'),
  Address: require('./address.model'),
  Vehicle: require('./vehicle.model'),
  QrLabel: require('./qrLabel.model'),
  QrScan: require('./qrScan.model'),
  ContactEvent: require('./contactEvent.model'),
  CallerBlock: require('./callerBlock.model'),
  AbuseReport: require('./abuseReport.model'),
  Notification: require('./notification.model'),
  Product: require('./product.model'),
  Wishlist: require('./wishlist.model'),
  Cart: require('./cart.model'),
  Coupon: require('./coupon.model'),
  CouponRedemption: require('./couponRedemption.model'),
  Order: require('./order.model'),
  Counter: require('./counter.model'),
  Reward: require('./reward.model'),
  Payout: require('./payout.model'),
  Wallet: require('./wallet.model'),
  LedgerEntry: require('./ledgerEntry.model'),
  BankAccount: require('./bankAccount.model'),
  Withdrawal: require('./withdrawal.model'),
  IdempotencyRecord: require('./idempotencyRecord.model'),
  WebhookEvent: require('./webhookEvent.model'),
  ...fastag,
  ...docs,
  ...content,
};
