'use strict';
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { hmac, safeEqual } = require('../utils/crypto');

/**
 * Inbound webhook signature check (PDF §6.3):
 *   X-Signature = hex HMAC-SHA256( `${X-Timestamp}.${rawBody}`, secret )
 *   X-Timestamp = unix seconds; requests older than WEBHOOK_TOLERANCE_SEC are rejected (replay protection).
 */
function signPayload(secret, timestamp, rawBody) {
  return hmac(secret, `${timestamp}.${rawBody}`);
}

const SECRETS = {
  payment: () => env.WEBHOOK_SECRET_PAYMENT,
  courier: () => env.WEBHOOK_SECRET_COURIER,
  payout: () => env.WEBHOOK_SECRET_PAYOUT,
  fastag: () => env.WEBHOOK_SECRET_FASTAG,
  telephony: () => env.WEBHOOK_SECRET_TELEPHONY,
};

function verifyWebhook(provider) {
  return (req, res, next) => {
    const secret = SECRETS[provider]();
    const sig = req.get('X-Signature');
    const ts = parseInt(req.get('X-Timestamp'), 10);
    const raw = req.rawBody ? req.rawBody.toString('utf8') : '';
    if (!sig || !ts || !raw) return next(new ApiError('SIGNATURE_INVALID', 'Missing signature, timestamp or body'));
    if (Math.abs(Math.floor(Date.now() / 1000) - ts) > env.WEBHOOK_TOLERANCE_SEC) return next(new ApiError('SIGNATURE_INVALID', 'Stale webhook timestamp'));
    if (!safeEqual(signPayload(secret, ts, raw), sig)) return next(new ApiError('SIGNATURE_INVALID', 'Signature mismatch'));
    next();
  };
}

module.exports = { verifyWebhook, signPayload, SECRETS };
