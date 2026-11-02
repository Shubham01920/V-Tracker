'use strict';
const { Schema, model } = require('mongoose');
const { REWARD_STATUS, REWARD_TYPES, REWARD_SOURCES } = require('../constants/enums');

/** Scratch card. Face value is decided by the server at scratch time and never sent before. */
const rewardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subtitle: String,
  type: { type: String, enum: REWARD_TYPES, default: 'CASHBACK' },
  source: { type: String, enum: REWARD_SOURCES, required: true },
  sourceRef: String, // unique per source to avoid duplicates (e.g. referee user id, qr label id)
  status: { type: String, enum: REWARD_STATUS, default: 'UNSCRATCHED' },
  minPaise: { type: Number, default: 0 },
  maxPaise: { type: Number, default: 0 },
  expiresAt: Date,
  result: {
    amountPaise: Number,
    code: String,
    description: String,
  },
  scratchedAt: Date,
}, { timestamps: true });

rewardSchema.index({ userId: 1, status: 1, createdAt: -1 });
rewardSchema.index({ source: 1, sourceRef: 1, userId: 1 }, { unique: true, partialFilterExpression: { sourceRef: { $type: 'string' } } });

module.exports = model('Reward', rewardSchema);
