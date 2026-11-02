'use strict';
const env = require('./env');

// Mobile apps do not send an Origin header, so they always pass.
// Browsers (public scan web page, admin) must be listed in CORS_ORIGINS in production.
module.exports = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (!env.isProd && env.CORS_ORIGINS.length === 0) return cb(null, true);
    if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization', 'Content-Type', 'Accept-Language', 'X-Request-Id', 'X-App-Version',
    'X-Platform', 'X-Device-Id', 'Idempotency-Key', 'X-Signature', 'X-Timestamp',
  ],
  exposedHeaders: ['X-Request-Id', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'],
  maxAge: 600,
};
