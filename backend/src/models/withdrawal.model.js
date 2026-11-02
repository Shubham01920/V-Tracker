'use strict';
const { Schema, model } = require('mongoose');
const { WITHDRAW_STATUS, WITHDRAW_MODE } = require('../constants/enums');

const withdrawalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  txnId: { type: String, required: true, unique: true },
  amountPaise: { type: Number, required: true, min: 1 },
  mode: { type: String, enum: WITHDRAW_MODE, required: true },
  status: { type: String, enum: WITHDRAW_STATUS, default: 'PENDING' },
  bank: { bankName: String, accountLast4: String, ifsc: String, upiMasked: String },
  providerRef: { type: String },
  utr: String,
  failureReason: String,
  completedAt: Date,
}, { timestamps: true });

withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ providerRef: 1 }, { unique: true, partialFilterExpression: { providerRef: { $type: 'string' } } });

module.exports = model('Withdrawal', withdrawalSchema);
