'use strict';
const { Schema, model } = require('mongoose');

/** Append-only audit trail of every wallet movement. */
const ledgerEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: {
    type: String,
    required: true,
    enum: ['REWARD_CASHBACK', 'REFERRAL_PAYOUT', 'WITHDRAWAL_HOLD', 'WITHDRAWAL_RELEASE', 'WITHDRAWAL_SETTLED', 'PAYOUT_REVERSAL', 'ADJUSTMENT'],
  },
  amountPaise: { type: Number, required: true },
  availableAfterPaise: Number,
  heldAfterPaise: Number,
  refType: String,
  refId: String,
  note: String,
}, { timestamps: true });

ledgerEntrySchema.index({ refType: 1, refId: 1, kind: 1 }, { unique: true, partialFilterExpression: { refId: { $type: 'string' } } });

module.exports = model('LedgerEntry', ledgerEntrySchema);
