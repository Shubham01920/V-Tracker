'use strict';
const { WebhookEvent } = require('../models');
const logger = require('../utils/logger');

/**
 * Process a provider event exactly once (dedupe by provider + eventId).
 * Returns { duplicate: true } for a replayed event so the provider still gets HTTP 200.
 */
async function once(provider, payload, handler) {
  try {
    await WebhookEvent.create({ provider, eventId: String(payload.eventId), event: payload.event, payload });
  } catch (e) {
    if (e.code === 11000) {
      const prev = await WebhookEvent.findOne({ provider, eventId: String(payload.eventId) });
      if (prev && prev.processedAt) return { received: true, duplicate: true };
      // previous attempt failed half-way: process again
    } else throw e;
  }
  try {
    const result = await handler(payload);
    await WebhookEvent.updateOne({ provider, eventId: String(payload.eventId) }, { processedAt: new Date(), error: null });
    return { received: true, duplicate: false, ...(result || {}) };
  } catch (e) {
    await WebhookEvent.updateOne({ provider, eventId: String(payload.eventId) }, { error: e.message });
    logger.error(`webhook ${provider} failed`, { eventId: payload.eventId, err: e.message });
    throw e;
  }
}

module.exports = { once };
