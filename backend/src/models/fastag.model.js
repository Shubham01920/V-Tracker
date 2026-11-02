'use strict';
const { Schema, model } = require('mongoose');
const { FASTAG_RECHARGE_STATUS } = require('../constants/enums');

const fastagIssuerSchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
});

/**
 * FastagAccount / FastagTransaction are the MOCK aggregator's data store.
 * With a real aggregator these come from the provider API (services/providers/fastag.provider.js).
 */
const fastagAccountSchema = new Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  issuerCode: String,
  issuerName: String,
  tagId: String,
  status: { type: String, enum: ['ACTIVE', 'BLACKLISTED', 'INACTIVE'], default: 'ACTIVE' },
  balancePaise: { type: Number, default: 0 },
}, { timestamps: true });

const fastagTransactionSchema = new Schema({
  vehicleNumber: { type: String, required: true, index: true },
  kind: { type: String, enum: ['TOLL', 'RECHARGE'], required: true },
  plaza: String,
  location: String,
  amountPaise: { type: Number, required: true },
  at: { type: Date, default: Date.now },
  refId: String,
});
fastagTransactionSchema.index({ vehicleNumber: 1, at: -1 });

const fastagRechargeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  vehicleNumber: { type: String, required: true },
  issuerCode: { type: String, required: true },
  amountPaise: { type: Number, required: true },
  upiHandle: String,
  status: { type: String, enum: FASTAG_RECHARGE_STATUS, default: 'PENDING_PAYMENT' },
  payment: { gateway: String, gatewayOrderId: String, gatewayPaymentId: String, expiresAt: Date },
  providerRef: String,
  failureReason: String,
  creditedAt: Date,
}, { timestamps: true });
fastagRechargeSchema.index({ 'payment.gatewayOrderId': 1 }, { unique: true, partialFilterExpression: { 'payment.gatewayOrderId': { $type: 'string' } } });
fastagRechargeSchema.index({ providerRef: 1 }, { unique: true, partialFilterExpression: { providerRef: { $type: 'string' } } });

module.exports = {
  FastagIssuer: model('FastagIssuer', fastagIssuerSchema),
  FastagAccount: model('FastagAccount', fastagAccountSchema),
  FastagTransaction: model('FastagTransaction', fastagTransactionSchema),
  FastagRecharge: model('FastagRecharge', fastagRechargeSchema),
};
