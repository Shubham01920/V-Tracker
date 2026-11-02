'use strict';
const { Schema, model } = require('mongoose');

/** Lines are keyed by productId (not title, fixing PDF §3.5 CartItem bug). Prices are never stored here. */
const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    _id: false,
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1, max: 10 },
    addedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = model('Cart', cartSchema);
