'use strict';
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

function readBearer(req) {
  const h = req.get('Authorization') || '';
  const [scheme, token] = h.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

async function resolveUser(token) {
  let claims;
  try {
    claims = verifyAccessToken(token);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) throw new ApiError('TOKEN_EXPIRED', 'Access token expired');
    throw new ApiError('TOKEN_INVALID', 'Access token is invalid');
  }
  const user = await User.findById(claims.sub);
  if (!user || user.deletedAt) throw new ApiError('TOKEN_INVALID', 'Account not found');
  if ((user.tokenVersion || 0) !== (claims.tv || 0)) throw new ApiError('TOKEN_INVALID', 'Session was revoked');
  if (user.status === 'DISABLED') throw new ApiError('ACCOUNT_DISABLED', 'Account is disabled');
  return { user, claims };
}

/** Bearer token required. */
async function authenticate(req, res, next) {
  try {
    const token = readBearer(req);
    if (!token) throw new ApiError('UNAUTHORIZED', 'Missing bearer token');
    const { user, claims } = await resolveUser(token);
    req.user = user;
    req.auth = claims;
    next();
  } catch (e) { next(e); }
}

/** Bearer token optional: attaches req.user when a valid token is present, ignores missing tokens. */
async function optionalAuth(req, res, next) {
  try {
    const token = readBearer(req);
    if (!token) return next();
    const { user, claims } = await resolveUser(token);
    req.user = user;
    req.auth = claims;
    next();
  } catch (e) { next(e); }
}

/**
 * Fresh authentication for money/bank actions (PDF §6.3).
 * Passes when the session's original login is within REAUTH_WINDOW_SEC,
 * or when the body carries the correct currentPassword.
 */
async function requireRecentAuth(req, res, next) {
  try {
    const now = Math.floor(Date.now() / 1000);
    if (req.auth && req.auth.at && now - req.auth.at <= env.REAUTH_WINDOW_SEC) return next();
    const pwd = req.body && req.body.currentPassword;
    if (pwd && req.user.passwordHash && (await bcrypt.compare(String(pwd), req.user.passwordHash))) return next();
    throw new ApiError('REAUTH_REQUIRED', 'Please confirm your password to continue', [{ field: 'currentPassword', issue: 'required' }]);
  } catch (e) { next(e); }
}

module.exports = { authenticate, optionalAuth, requireRecentAuth };
