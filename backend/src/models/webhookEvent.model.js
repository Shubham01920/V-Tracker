'use strict';
const { Schema, model } = require('mongoose');

/** Every inbound webhook is stored once (dedupe by provider + eventId) for audit and replay safety. */
const webhookEventSchema = new Schema({
  provider: { type: String, required: true },
  eventId: { type: String, required: true },
  event: String,
  payload: Schema.Types.Mixed,
  processedAt: Date,
  error: String,
}, { timestamps: true });

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 });

module.exports = model('WebhookEvent', webhookEventSchema);
