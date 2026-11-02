'use strict';
const { Schema, model } = require('mongoose');
const { VEHICLE_TYPES } = require('../constants/enums');

const vehicleSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  registrationNumber: { type: String, required: true }, // normalised: no spaces, upper case
  type: { type: String, enum: VEHICLE_TYPES, required: true },
  model: { type: String, trim: true, default: '' },
  color: { type: String, trim: true, default: '' },
  publicRef: { type: String, required: true, unique: true }, // opaque id given to callers, never the Mongo id
  qrLabelId: { type: Schema.Types.ObjectId, ref: 'QrLabel', default: null },
}, { timestamps: true });

vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

module.exports = model('Vehicle', vehicleSchema);
