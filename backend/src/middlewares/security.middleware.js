'use strict';
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/** Strip Mongo operator keys ($gt, a.b) from body/params to block NoSQL injection. */
function clean(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 10) return obj;
  for (const k of Object.keys(obj)) {
    if (k.startsWith('$') || k.includes('.')) delete obj[k];
    else clean(obj[k], depth + 1);
  }
  return obj;
}

function sanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') clean(req.body);
  if (req.params) clean(req.params);
  next();
}

/** MAINTENANCE_MODE=true -> everything except health/config/webhooks answers 503. */
function maintenance(req, res, next) {
  if (!env.MAINTENANCE_MODE) return next();
  if (/^\/(health|v1\/config|v1\/webhooks)/.test(req.path)) return next();
  next(new ApiError('MAINTENANCE', 'V Tracker is under maintenance. Please try again shortly.'));
}

module.exports = { sanitize, maintenance };
