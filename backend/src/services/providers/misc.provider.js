'use strict';
/** Courier, CAPTCHA and Google identity adapters. */
const env = require('../../config/env');
const outbox = require('./outbox');
const { randomDigits } = require('../../utils/crypto');
const { addDays } = require('../../utils/helpers');
const ApiError = require('../../utils/ApiError');

// ---------- Courier ----------
async function createShipment({ orderNumber }) {
  const driver = process.env.COURIER_PROVIDER || 'mock';
  if (driver !== 'mock') throw new Error(`Courier provider "${driver}" not implemented`);
  const shipment = { courier: 'Blue Dart Express', awb: `BD${randomDigits(9)}`, eta: addDays(new Date(), 4) };
  outbox.push('shipments', { orderNumber, ...shipment });
  return shipment;
}

// ---------- CAPTCHA ----------
async function verifyCaptcha(token, ip) {
  if (!token) return false;
  if (env.CAPTCHA_PROVIDER === 'mock') return token !== 'fail';
  const url = env.CAPTCHA_PROVIDER === 'turnstile'
    ? 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    : 'https://api.hcaptcha.com/siteverify';
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.CAPTCHA_SECRET, response: token, remoteip: ip || '' }),
    });
    const j = await r.json();
    return !!j.success;
  } catch {
    return false;
  }
}

// ---------- Google sign-in ----------
/**
 * Verifies a Google ID token and returns { sub, email, emailVerified, name, picture }.
 * Non-production mock: idToken "mock:<sub>:<email>:<name>".
 */
async function verifyGoogleIdToken(idToken) {
  if (env.GOOGLE_AUTH_MOCK && String(idToken).startsWith('mock:')) {
    const [, sub, email, ...name] = String(idToken).split(':');
    if (!sub || !email) throw new ApiError('TOKEN_INVALID', 'Google token is invalid');
    return { sub, email: email.toLowerCase(), emailVerified: true, name: name.join(':') || email.split('@')[0], picture: null };
  }
  let j;
  try {
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!r.ok) throw new Error('bad');
    j = await r.json();
  } catch {
    throw new ApiError('TOKEN_INVALID', 'Google token is invalid');
  }
  if (!env.GOOGLE_CLIENT_IDS.includes(j.aud)) throw new ApiError('TOKEN_INVALID', 'Google token audience mismatch');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(j.iss)) throw new ApiError('TOKEN_INVALID', 'Google token issuer mismatch');
  return { sub: j.sub, email: String(j.email || '').toLowerCase(), emailVerified: j.email_verified === 'true' || j.email_verified === true, name: j.name, picture: j.picture };
}

module.exports = { createShipment, verifyCaptcha, verifyGoogleIdToken };
