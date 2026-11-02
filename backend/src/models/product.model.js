'use strict';
const { Schema, model } = require('mongoose');
const { PRODUCT_CATEGORIES } = require('../constants/enums');

const productSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
  pricePaise: { type: Number, required: true, min: 0 }, // exclusive of tax
  mrpPaise: { type: Number, min: 0 },
  taxRatePercent: { type: Number, default: 18, min: 0, max: 28 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  imageUrl: String,
  gallery: [String],
  features: [String],
  stock: { type: Number, default: 0, min: 0 },
  // label generation when the order is paid
  labelsIncluded: { type: Number, default: 1, min: 0 },
  labelVehicleType: { type: String, default: 'ANY' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ title: 'text', subtitle: 'text' });

module.exports = model('Product', productSchema);
