'use strict';
const { Schema, model } = require('mongoose');

/** Payout destination. Full account number and UPI are AES-256-GCM encrypted; only last4/masked are ever returned. */
const bankAccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  holderName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumberEnc: { type: String, required: true },
  accountLast4: { type: String, required: true },
  ifsc: { type: String, required: true },
  branch: String,
  upiEnc: String,
  upiMasked: String,
  status: { type: String, enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'], default: 'PENDING_VERIFICATION' },
  verifiedAt: Date,
  cooldownUntil: Date,
  providerRef: String,
}, { timestamps: true });

module.exports = model('BankAccount', bankAccountSchema);
