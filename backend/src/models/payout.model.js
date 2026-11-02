'use strict';
const { Schema, model } = require('mongoose');
const { PAYOUT_STATUS } = require('../constants/enums');

/**
 * Referral bonus record. One status definition for every payout screen (PDF §3.6, §4.9.6):
 *   PENDING  = earned, not yet in the wallet
 *   CREDITED = moved into the wallet (withdrawable)
 *   REVERSED = cancelled (e.g. refunded order)
 */
const payoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // beneficiary
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  level: { type: Number, required: true, min: 1, max: 15 },
  title: String,
  amountPaise: { type: Number, required: true, min: 0 },
  status: { type: String, enum: PAYOUT_STATUS, default: 'PENDING' },
  creditedAt: Date,
  reversedAt: Date,
}, { timestamps: true });

payoutSchema.index({ userId: 1, status: 1, createdAt: -1 });
payoutSchema.index({ userId: 1, level: 1 });
payoutSchema.index({ orderId: 1, userId: 1, level: 1 }, { unique: true, partialFilterExpression: { orderId: { $type: 'objectId' } } });

module.exports = model('Payout', payoutSchema);
