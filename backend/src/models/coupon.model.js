'use strict';
const { Schema, model } = require('mongoose');

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type: { type: String, enum: ['FLAT', 'PERCENT'], required: true },
  value: { type: Number, required: true, min: 0 }, // paise for FLAT, percent for PERCENT
  maxDiscountPaise: { type: Number, default: null },
  minSubtotalPaise: { type: Number, default: 0 },
  validFrom: { type: Date, default: () => new Date(0) },
  validTo: { type: Date, default: null },
  usageLimit: { type: Number, default: null }, // across all users
  perUserLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = model('Coupon', couponSchema);
