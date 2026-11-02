'use strict';
const { Schema, model } = require('mongoose');
const { CONTACT_KIND, CONTACT_OUTCOME, ALERT_REASONS } = require('../constants/enums');

/** One contact attempt (call or alert) towards a vehicle owner. The caller's number is never stored in clear. */
const contactEventSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  qrLabelId: { type: Schema.Types.ObjectId, ref: 'QrLabel' },
  kind: { type: String, enum: CONTACT_KIND, required: true },
  outcome: { type: String, enum: CONTACT_OUTCOME, default: 'PENDING' },
  reason: { type: String, enum: ALERT_REASONS, default: 'OTHER' },
  note: { type: String, maxlength: 280 },
  channel: { type: String, enum: ['WEB', 'APP'], required: true },
  callerHash: { type: String, required: true }, // sha256 of phone / user id; used for blocking and limits
  callerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, index: true, sparse: true },
  providerRef: String,
  durationSec: { type: Number, default: 0 },
  at: { type: Date, default: Date.now },
}, { timestamps: true });

contactEventSchema.index({ ownerId: 1, at: -1 });
contactEventSchema.index({ vehicleId: 1, callerHash: 1, at: -1 });

module.exports = model('ContactEvent', contactEventSchema);
