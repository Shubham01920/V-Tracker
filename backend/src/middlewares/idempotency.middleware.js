'use strict';
const ApiError = require('../utils/ApiError');
const { sha256 } = require('../utils/crypto');
const IdempotencyRecord = require('../models/idempotencyRecord.model');

const KEY_RE = /^[A-Za-z0-9-]{8,128}$/;

/**
 * Idempotency-Key for money / order creation (PDF §6.2).
 * - Same key + same request within 24 h -> the first response is replayed (header Idempotent-Replayed: true).
 * - Same key + different body/path -> IDEMPOTENCY_KEY_REUSED.
 * - Same key while the first call is still running -> IDEMPOTENCY_IN_PROGRESS.
 * Only 2xx and 4xx business results are stored; 5xx releases the key so the client can retry.
 */
module.exports = function idempotency(req, res, next) {
  (async () => {
    const key = req.get('Idempotency-Key');
    if (!key) throw new ApiError('IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required for this request');
    if (!KEY_RE.test(key)) throw new ApiError('VALIDATION_FAILED', 'Idempotency-Key must be 8-128 chars [A-Za-z0-9-]', [{ field: 'Idempotency-Key', issue: 'format' }]);

    const scope = req.user ? String(req.user._id) : `ip:${req.ip}`;
    const fingerprint = sha256(`${req.method} ${req.originalUrl.split('?')[0]} ${JSON.stringify(req.body || {})}`);

    let record;
    try {
      record = await IdempotencyRecord.create({ scope, key, fingerprint, state: 'IN_PROGRESS' });
    } catch (e) {
      if (e.code !== 11000) throw e;
      const existing = await IdempotencyRecord.findOne({ scope, key });
      if (!existing) throw new ApiError('IDEMPOTENCY_IN_PROGRESS', 'Request with this key is being processed');
      if (existing.fingerprint !== fingerprint) throw new ApiError('IDEMPOTENCY_KEY_REUSED', 'Idempotency-Key was already used for a different request');
      if (existing.state === 'IN_PROGRESS') throw new ApiError('IDEMPOTENCY_IN_PROGRESS', 'Request with this key is being processed');
      res.set('Idempotent-Replayed', 'true');
      return res.status(existing.statusCode).json({ ...existing.response, requestId: req.id });
    }

    const origJson = res.json.bind(res);
    // Store the result BEFORE the response leaves, so an immediate retry always sees it as DONE.
    res.json = (body) => {
      const status = res.statusCode;
      const { requestId, ...stored } = body || {};
      const save = status >= 500
        ? IdempotencyRecord.deleteOne({ _id: record._id })
        : IdempotencyRecord.updateOne({ _id: record._id }, { state: 'DONE', statusCode: status, response: stored });
      save.then(() => origJson(body), () => origJson(body));
      return res;
    };
    next();
  })().catch(next);
};
