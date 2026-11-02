'use strict';
const { Schema, model } = require('mongoose');
const { ADDRESS_LABELS } = require('../constants/enums');

const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true }, // couriers need a recipient phone (PDF §3.5)
  label: { type: String, enum: ADDRESS_LABELS, default: 'HOME' },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true, default: '' },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('Address', addressSchema);
