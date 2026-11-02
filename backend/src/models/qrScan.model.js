'use strict';
const { Schema, model } = require('mongoose');

const qrScanSchema = new Schema({
  qrLabelId: { type: Schema.Types.ObjectId, ref: 'QrLabel', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  channel: { type: String, enum: ['WEB', 'APP'], default: 'WEB' },
  ipHash: String,
  at: { type: Date, default: Date.now },
});

qrScanSchema.index({ vehicleId: 1, at: -1 });
qrScanSchema.index({ at: 1 }, { expireAfterSeconds: 90 * 86400 });

module.exports = model('QrScan', qrScanSchema);
