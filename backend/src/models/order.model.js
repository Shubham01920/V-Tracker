'use strict';
const { Schema, model } = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS, SHIPMENT_STAGES } = require('../constants/enums');

const lineSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  category: String,
  imageUrl: String,
  unitPricePaise: Number,
  qty: Number,
  lineTotalPaise: Number,
  taxRatePercent: Number,
  taxPaise: Number,
  labelsIncluded: Number,
  labelVehicleType: String,
}, { _id: false });

const stageSchema = new Schema({
  code: { type: String, enum: SHIPMENT_STAGES },
  title: String,
  detail: String,
  location: String,
  at: Date,
}, { _id: false });

const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lines: [lineSchema],
  addressSnapshot: {
    name: String, phone: String, label: String, line1: String, line2: String, pincode: String, city: String, state: String,
  },
  subtotalPaise: Number,
  deliveryPaise: Number,
  taxPaise: Number,
  discountPaise: { type: Number, default: 0 },
  pointsAppliedPaise: { type: Number, default: 0 },
  pointsUsed: { type: Number, default: 0 },
  totalPaise: Number,
  currency: { type: String, default: 'INR' },
  couponCode: String,
  couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  status: { type: String, enum: ORDER_STATUS, default: 'PENDING_PAYMENT', index: true },
  payment: {
    gateway: String,
    gatewayOrderId: { type: String },
    gatewayPaymentId: String,
    status: { type: String, enum: PAYMENT_STATUS, default: 'CREATED' },
    expiresAt: Date,
    capturedAt: Date,
    failureReason: String,
  },
  shipment: {
    courier: String,
    awb: { type: String },
    eta: Date,
    stages: [stageSchema],
  },
  timeline: [{ _id: false, status: String, note: String, at: { type: Date, default: Date.now } }],
  paidAt: Date,
  deliveredAt: Date,
  stockReserved: { type: Boolean, default: true },
  idempotencyKey: String,
}, { timestamps: true });

orderSchema.index({ 'payment.gatewayOrderId': 1 }, { unique: true, partialFilterExpression: { 'payment.gatewayOrderId': { $type: 'string' } } });
orderSchema.index({ 'shipment.awb': 1 }, { unique: true, partialFilterExpression: { 'shipment.awb': { $type: 'string' } } });
orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = model('Order', orderSchema);
