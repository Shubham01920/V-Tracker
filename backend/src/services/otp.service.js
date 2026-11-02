'use strict';
const env = require('../config/env');
const { OtpChallenge } = require('../models');
const ApiError = require('../utils/ApiError');
const { sha256, randomDigits, uuid } = require('../utils/crypto');
const { sendSms } = require('./providers/messaging.provider');

const otpHash = (code, phone) => sha256(`${code}:${phone}`);

/**
 * Create (or re-send) an OTP challenge (PDF §4.3.5): 6 digits, 5 minute expiry, 5 attempts,
 * resend allowed after OTP_RESEND_AFTER_SEC. In non-production the code is also returned as devCode.
 */
async function startOtp(user, purpose, phone) {
  const recent = await OtpChallenge.findOne({ userId: user._id, purpose, consumedAt: null, invalidatedAt: null }).sort({ createdAt: -1 });
  if (recent && recent.phone === phone && Date.now() - recent.lastSentAt.getTime() < env.OTP_RESEND_AFTER_SEC * 1000) {
    const wait = Math.ceil(env.OTP_RESEND_AFTER_SEC - (Date.now() - recent.lastSentAt.getTime()) / 1000);
    const err = new ApiError('RATE_LIMITED', `Please wait ${wait}s before requesting a new code`, [{ field: 'phone', issue: 'resend_wait', retryAfterSec: wait }]);
    err.retryAfter = wait;
    throw err;
  }
  await OtpChallenge.updateMany({ userId: user._id, purpose, consumedAt: null, invalidatedAt: null }, { invalidatedAt: new Date() });
  const code = randomDigits(6);
  const challenge = await OtpChallenge.create({
    challengeId: uuid(), userId: user._id, purpose, phone, codeHash: otpHash(code, phone),
    expiresAt: new Date(Date.now() + env.OTP_TTL_SEC * 1000), lastSentAt: new Date(),
  });
  await sendSms(phone, `${code} is your V Tracker verification code. It expires in ${Math.round(env.OTP_TTL_SEC / 60)} minutes.`, { kind: 'OTP', code });
  const out = { challengeId: challenge.challengeId, resendAfterSec: env.OTP_RESEND_AFTER_SEC, expiresInSec: env.OTP_TTL_SEC, phoneMasked: `******${phone.slice(-4)}` };
  if (env.EXPOSE_DEV_SECRETS) out.devCode = code;
  return out;
}

module.exports = { startOtp, otpHash };
