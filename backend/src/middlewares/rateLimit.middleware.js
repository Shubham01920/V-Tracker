'use strict';
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/** Rate limits per API class (PDF §6.8). Keys: user id when signed in, else IP. */
function make({ windowMs, limit, name }) {
  if (!env.RATE_LIMIT_ENABLED) return (req, res, next) => next();
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => (req.user ? `u:${req.user.id}` : `ip:${ipKeyGenerator(req.ip || '0.0.0.0')}`) + `:${name}`,
    handler: (req, res, next, options) => {
      const err = new ApiError('RATE_LIMITED', 'Too many requests. Please try again later.');
      err.retryAfter = Math.ceil(options.windowMs / 1000);
      next(err);
    },
  });
}

module.exports = {
  globalLimiter: make({ windowMs: 60 * 1000, limit: 300, name: 'global' }),
  authLimiter: make({ windowMs: 15 * 60 * 1000, limit: 30, name: 'auth' }),
  otpLimiter: make({ windowMs: 15 * 60 * 1000, limit: 10, name: 'otp' }),
  publicLimiter: make({ windowMs: 60 * 1000, limit: 30, name: 'public' }),
  publicActionLimiter: make({ windowMs: 60 * 60 * 1000, limit: 10, name: 'public-action' }),
  contactLimiter: make({ windowMs: 60 * 60 * 1000, limit: 20, name: 'contact' }),
  moneyLimiter: make({ windowMs: 60 * 60 * 1000, limit: 20, name: 'money' }),
  make,
};
