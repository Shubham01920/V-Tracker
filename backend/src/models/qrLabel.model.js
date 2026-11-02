'use strict';
const { Schema, model } = require('mongoose');
const { QR_STATUS } = require('../constants/enums');

/** A physical label. Generated when an order is PAID; bound to a vehicle by QR-02. */
const qrLabelSchema = new Schema({
  qrUuid: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // human readable, e.g. QR-CAR-90382
  vehicleType: { type: String, required: true }, // TWO_WHEELER ... or ANY (package labels)
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
  purchaserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  status: { type: String, enum: QR_STATUS, default: 'GENERATED' },
  activatedAt: Date,
  everActivated: { type: Boolean, default: false },
  disabledReason: String,
}, { timestamps: true });

module.exports = model('QrLabel', qrLabelSchema);
