'use strict';
const { Schema, model } = require('mongoose');

const couponRedemptionSchema = new Schema({
  couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  discountPaise: Number,
}, { timestamps: true });

couponRedemptionSchema.index({ couponId: 1, userId: 1 });

module.exports = model('CouponRedemption', couponRedemptionSchema);
