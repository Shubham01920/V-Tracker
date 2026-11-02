'use strict';
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Access token (short-lived JWT).
 * Claims: sub (user id), role, sid (refresh-token family), tv (token version), at (original auth time, seconds).
 */
function signAccessToken({ userId, role, sid, tokenVersion, authTime }) {
  return jwt.sign(
    { sub: String(userId), role, sid: String(sid), tv: tokenVersion || 0, at: authTime },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_SEC, issuer: 'vtracker-api', audience: 'vtracker-app', algorithm: 'HS256' },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'vtracker-api', audience: 'vtracker-app', algorithms: ['HS256'] });
}

module.exports = { signAccessToken, verifyAccessToken };
