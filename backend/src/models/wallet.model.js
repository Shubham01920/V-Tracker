'use strict';
const { Schema, model } = require('mongoose');

/** One wallet per user. All changes go through services/ledger.service.js with atomic $inc. */
const walletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  availablePaise: { type: Number, default: 0, min: 0 },
  heldPaise: { type: Number, default: 0, min: 0 },
  lifetimeCreditedPaise: { type: Number, default: 0 },
  lifetimeWithdrawnPaise: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Wallet', walletSchema);
