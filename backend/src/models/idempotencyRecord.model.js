'use strict';
const { Schema, model } = require('mongoose');

const idempotencyRecordSchema = new Schema({
  scope: { type: String, required: true }, // user id
  key: { type: String, required: true },
  fingerprint: { type: String, required: true },
  state: { type: String, enum: ['IN_PROGRESS', 'DONE'], default: 'IN_PROGRESS' },
  statusCode: Number,
  response: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

idempotencyRecordSchema.index({ scope: 1, key: 1 }, { unique: true });
idempotencyRecordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 3600 });

module.exports = model('IdempotencyRecord', idempotencyRecordSchema);
