'use strict';
const { Schema, model } = require('mongoose');

const wishlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = model('Wishlist', wishlistSchema);
