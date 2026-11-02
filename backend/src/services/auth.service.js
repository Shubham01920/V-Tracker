'use strict';
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { User, RefreshToken, OtpChallenge, PasswordReset, Device } = require('../models');
const { nextSeq } = require('../models/counter.model');
const ApiError = require('../utils/ApiError');
const { signAccessToken } = require('../utils/generateToken');
const { sha256, randomToken, randomUpper, uuid, safeEqual } = require('../utils/crypto');
const { addDays, addMinutes } = require('../utils/helpers');
const { startOtp, otpHash } = require('./otp.service');
const { verifyGoogleIdToken } = require('./providers/misc.provider');
const emailService = require('./email.service');
const rewardService = require('./reward.service');
const { notify } = require('./notification.service');
const { presentUser } = require('./user.service');

const nowSec = () => Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------- helpers
async function uniqueReferralCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = `VT${randomUpper(6)}`;
    if (!(await User.exists({ referralCode: code }))) return code;
  }
  throw new Error('Could not allocate referral code');
}

async function resolveReferrer(referralCode) {
  if (!referralCode) return null;
  const ref = await User.findOne({ referralCode: String(referralCode).trim().toUpperCase(), deletedAt: null, status: 'ACTIVE' });
  if (!ref) throw new ApiError('REFERRAL_INVALID', 'Referral code is not valid', [{ field: 'referralCode', issue: 'invalid', message: 'Clear the field to sign up without a code' }]);
  return ref;
}

const ancestorsFor = (referrer) => (referrer ? [referrer._id, ...(referrer.ancestors || [])].slice(0, 15) : []);

/** Creates a refresh token family (new login) and returns the token pair. */
async function issueSession(user, { deviceId, ip, authTime = nowSec(), familyId = uuid() } = {}) {
  const refreshToken = randomToken(48);
  await RefreshToken.create({
    userId: user._id, tokenHash: sha256(refreshToken), familyId, deviceId, authTime, createdIp: ip,
    expiresAt: addDays(new Date(), env.REFRESH_TOKEN_EXPIRES_DAYS),
  });
  const accessToken = signAccessToken({ userId: user._id, role: user.role, sid: familyId, tokenVersion: user.tokenVersion, authTime });
  return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_EXPIRES_SEC, tokenType: 'Bearer' };
}

async function onPhoneVerifiedFirstTime(user) {
  if (user.referredBy) {
    await rewardService.issueCard(user.referredBy, 'referralCard', 'REFERRAL', user._id);
    await rewardService.issueCard(user._id, 'signupCard', 'SIGNUP', user._id);
    await notify(user.referredBy, { type: 'SYSTEM', title: 'New team member', body: `${user.fullName} joined with your referral code`, deepLink: 'vtracker://referral/direct' });
  }
  if (user.email) emailService.sendWelcome(user.email, user.fullName).catch(() => {});
}

// ---------------------------------------------------------------- AUTH-01
async function register({ fullName, email, phone, password, referralCode }) {
  email = email.toLowerCase();
  const byPhone = await User.findOne({ phone });
  if (byPhone && byPhone.phoneVerified) throw new ApiError('PHONE_TAKEN', 'This phone number is already registered', [{ field: 'phone', issue: 'taken' }]);
  const byEmail = await User.findOne({ email });
  if (byEmail && (!byPhone || String(byEmail._id) !== String(byPhone._id))) {
    if (byEmail.phoneVerified || byEmail.googleSub) throw new ApiError('EMAIL_TAKEN', 'This e-mail is already registered', [{ field: 'email', issue: 'taken' }]);
  }
  const referrer = await resolveReferrer(referralCode);
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  let user = byPhone;
  if (user) {
    // repeat signup for an unverified phone: refresh details and re-send the OTP (rate-limited in startOtp)
    if (byEmail && String(byEmail._id) !== String(user._id)) await User.deleteOne({ _id: byEmail._id, phoneVerified: false });
    user.fullName = fullName;
    user.email = email;
    user.passwordHash = passwordHash;
    if (referrer && String(referrer._id) !== String(user._id)) { user.referredBy = referrer._id; user.ancestors = ancestorsFor(referrer); }
    await user.save();
  } else {
    if (byEmail) await User.deleteOne({ _id: byEmail._id, phoneVerified: false });
    user = await User.create({
      fullName, email, phone, passwordHash,
      memberId: `VT${await nextSeq('member', 100000)}`,
      referralCode: await uniqueReferralCode(),
      referredBy: referrer ? referrer._id : null,
      ancestors: ancestorsFor(referrer),
    });
  }
  const verification = await startOtp(user, 'REGISTER', phone);
  return { userId: String(user._id), verification };
}

// ---------------------------------------------------------------- AUTH-02
async function verifyOtp({ challengeId, code }, ctx) {
  const ch = await OtpChallenge.findOne({ challengeId });
  if (!ch || ch.consumedAt || ch.invalidatedAt) throw new ApiError('OTP_INVALID', 'This code is no longer valid. Request a new one.');
  if (ch.expiresAt < new Date()) throw new ApiError('OTP_EXPIRED', 'The code has expired. Request a new one.');
  if (ch.attempts >= env.OTP_MAX_ATTEMPTS) throw new ApiError('OTP_ATTEMPTS_EXCEEDED', 'Too many wrong attempts. Request a new code.');

  if (!safeEqual(ch.codeHash, otpHash(code, ch.phone))) {
    const updated = await OtpChallenge.findOneAndUpdate({ _id: ch._id }, { $inc: { attempts: 1 } }, { returnDocument: 'after' });
    if (updated.attempts >= env.OTP_MAX_ATTEMPTS) {
      await OtpChallenge.updateOne({ _id: ch._id }, { invalidatedAt: new Date() });
      throw new ApiError('OTP_ATTEMPTS_EXCEEDED', 'Too many wrong attempts. Request a new code.');
    }
    throw new ApiError('OTP_INVALID', 'Incorrect code', [{ field: 'code', issue: 'invalid', attemptsLeft: env.OTP_MAX_ATTEMPTS - updated.attempts }]);
  }
  const consumed = await OtpChallenge.findOneAndUpdate({ _id: ch._id, consumedAt: null }, { consumedAt: new Date() });
  if (!consumed) throw new ApiError('OTP_INVALID', 'This code was already used');

  const user = await User.findById(ch.userId);
  if (!user) throw new ApiError('OTP_INVALID', 'Account not found');

  if (ch.purpose === 'REGISTER') {
    const first = !user.phoneVerified;
    user.phoneVerified = true;
    user.phone = ch.phone;
    if (!user.alertPhone) { user.alertPhone = ch.phone; user.alertPhoneVerified = true; }
    await user.save();
    if (first) await onPhoneVerifiedFirstTime(user);
  } else if (ch.purpose === 'PHONE_CHANGE') {
    if (await User.exists({ phone: ch.phone, _id: { $ne: user._id } })) throw new ApiError('PHONE_TAKEN', 'This phone number is already registered');
    const wasAlertSame = user.alertPhone === user.phone;
    user.phone = ch.phone;
    user.phoneVerified = true;
    user.pendingPhone = undefined;
    if (wasAlertSame) { user.alertPhone = ch.phone; user.alertPhoneVerified = true; }
    await user.save();
  } else if (ch.purpose === 'ALERT_PHONE_CHANGE') {
    user.alertPhone = ch.phone;
    user.alertPhoneVerified = true;
    user.pendingAlertPhone = undefined;
    await user.save();
  }
  const tokens = await issueSession(user, ctx);
  return { ...tokens, user: presentUser(user), purpose: ch.purpose };
}

// ---------------------------------------------------------------- AUTH-03
async function login({ email, password, deviceId }, ctx) {
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  const invalid = () => new ApiError('INVALID_CREDENTIALS', 'E-mail or password is incorrect');
  if (!user) {
    await bcrypt.compare(password, '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.9eQ3gk2bDHIrDN3sT1d8KkVz3s6a'); // equal timing
    throw invalid();
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError('ACCOUNT_LOCKED', `Too many failed attempts. Try again in ${mins} minute(s).`);
  }
  const ok = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    const fails = (user.failedLoginCount || 0) + 1;
    const update = { failedLoginCount: fails };
    if (fails >= env.LOGIN_MAX_FAILURES) { update.lockUntil = addMinutes(new Date(), env.LOGIN_LOCK_MIN); update.failedLoginCount = 0; }
    await User.updateOne({ _id: user._id }, update);
    if (update.lockUntil) throw new ApiError('ACCOUNT_LOCKED', `Too many failed attempts. Try again in ${env.LOGIN_LOCK_MIN} minutes.`);
    throw invalid();
  }
  if (user.status === 'DISABLED') throw new ApiError('ACCOUNT_DISABLED', 'Account is disabled');
  if (!user.phoneVerified) {
    let verification = null;
    try { verification = await startOtp(user, 'REGISTER', user.phone); } catch { /* resend wait */ }
    throw new ApiError('PHONE_NOT_VERIFIED', 'Verify your phone number to continue', verification ? [{ field: 'phone', issue: 'not_verified', verification }] : undefined);
  }
  await User.updateOne({ _id: user._id }, { failedLoginCount: 0, lockUntil: null, lastLoginAt: new Date() });
  const tokens = await issueSession(user, { ...ctx, deviceId });
  return { ...tokens, user: presentUser(user) };
}

// ---------------------------------------------------------------- AUTH-04
async function google({ idToken, deviceId, phone, referralCode }, ctx) {
  const g = await verifyGoogleIdToken(idToken);
  let user = await User.findOne({ googleSub: g.sub });
  if (!user && g.email && g.emailVerified) {
    user = await User.findOne({ email: g.email });
    if (user) { user.googleSub = g.sub; user.emailVerified = true; await user.save(); }
  }
  if (user) {
    if (user.status === 'DISABLED') throw new ApiError('ACCOUNT_DISABLED', 'Account is disabled');
    await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
    const tokens = await issueSession(user, { ...ctx, deviceId });
    return { ...tokens, user: presentUser(user), isNewUser: false };
  }
  if (!phone) throw new ApiError('PHONE_REQUIRED', 'Enter your mobile number to finish signing up', [{ field: 'phone', issue: 'required' }]);
  if (await User.exists({ phone, phoneVerified: true })) throw new ApiError('PHONE_TAKEN', 'This phone number is already registered', [{ field: 'phone', issue: 'taken' }]);
  await User.deleteMany({ phone, phoneVerified: false });
  const referrer = await resolveReferrer(referralCode);
  user = await User.create({
    fullName: g.name || g.email.split('@')[0], email: g.email, emailVerified: true, googleSub: g.sub, phone, avatarUrl: g.picture || undefined,
    memberId: `VT${await nextSeq('member', 100000)}`, referralCode: await uniqueReferralCode(),
    referredBy: referrer ? referrer._id : null, ancestors: ancestorsFor(referrer), lastLoginAt: new Date(),
  });
  const verification = await startOtp(user, 'REGISTER', phone);
  const tokens = await issueSession(user, { ...ctx, deviceId });
  return { ...tokens, user: presentUser(user), isNewUser: true, verification };
}

// ---------------------------------------------------------------- AUTH-05
async function refresh({ refreshToken }, ctx) {
  const tokenHash = sha256(refreshToken);
  const rt = await RefreshToken.findOne({ tokenHash });
  if (!rt || rt.expiresAt < new Date()) throw new ApiError('REFRESH_INVALID', 'Session expired. Please log in again.');
  if (rt.revokedAt) {
    if (rt.revokedReason === 'ROTATED') {
      // an old token was replayed: assume theft, kill the whole family (PDF §6.3)
      await RefreshToken.updateMany({ familyId: rt.familyId, revokedAt: null }, { revokedAt: new Date(), revokedReason: 'REUSE_DETECTED' });
      throw new ApiError('REFRESH_REUSED', 'Session was used on another device. Please log in again.');
    }
    throw new ApiError('REFRESH_INVALID', 'Session expired. Please log in again.');
  }
  const user = await User.findById(rt.userId);
  if (!user || user.status === 'DISABLED' || user.deletedAt) throw new ApiError('REFRESH_INVALID', 'Session expired. Please log in again.');

  const next = randomToken(48);
  const rotated = await RefreshToken.findOneAndUpdate(
    { _id: rt._id, revokedAt: null },
    { revokedAt: new Date(), revokedReason: 'ROTATED', replacedByHash: sha256(next) },
  );
  if (!rotated) throw new ApiError('REFRESH_REUSED', 'Session was used on another device. Please log in again.');
  await RefreshToken.create({
    userId: user._id, tokenHash: sha256(next), familyId: rt.familyId, deviceId: rt.deviceId, authTime: rt.authTime,
    createdIp: ctx.ip, expiresAt: addDays(new Date(), env.REFRESH_TOKEN_EXPIRES_DAYS),
  });
  const accessToken = signAccessToken({ userId: user._id, role: user.role, sid: rt.familyId, tokenVersion: user.tokenVersion, authTime: rt.authTime });
  return { accessToken, refreshToken: next, expiresIn: env.JWT_ACCESS_EXPIRES_SEC, tokenType: 'Bearer' };
}

// ---------------------------------------------------------------- AUTH-06
async function forgotPassword({ email }) {
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  // same response whether or not the e-mail exists (PDF §4.3.6)
  if (!user || user.status === 'DISABLED') return {};
  const token = randomToken(32);
  await PasswordReset.updateMany({ userId: user._id, usedAt: null }, { usedAt: new Date() });
  await PasswordReset.create({ userId: user._id, tokenHash: sha256(token), expiresAt: addMinutes(new Date(), env.RESET_TOKEN_EXPIRES_MIN) });
  await emailService.sendPasswordReset(user.email, user.fullName, token);
  return env.EXPOSE_DEV_SECRETS ? { devResetToken: token } : {};
}

// ---------------------------------------------------------------- AUTH-07
const STRONG = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

async function resetPassword({ token, newPassword }) {
  if (!STRONG(newPassword)) throw new ApiError('WEAK_PASSWORD', 'Password must be at least 8 characters and contain a letter and a number', [{ field: 'newPassword', issue: 'weak' }]);
  const pr = await PasswordReset.findOne({ tokenHash: sha256(token) });
  if (!pr || pr.usedAt) throw new ApiError('TOKEN_INVALID', 'Reset link is invalid or was already used', undefined, 400);
  if (pr.expiresAt < new Date()) throw new ApiError('TOKEN_EXPIRED', 'Reset link has expired', undefined, 410);
  const claimed = await PasswordReset.findOneAndUpdate({ _id: pr._id, usedAt: null }, { usedAt: new Date() });
  if (!claimed) throw new ApiError('TOKEN_INVALID', 'Reset link was already used', undefined, 400);
  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  // revoke every session: bump tokenVersion (kills access tokens) and revoke refresh tokens
  await User.updateOne({ _id: pr.userId }, { passwordHash, $inc: { tokenVersion: 1 }, failedLoginCount: 0, lockUntil: null });
  await RefreshToken.updateMany({ userId: pr.userId, revokedAt: null }, { revokedAt: new Date(), revokedReason: 'PASSWORD_RESET' });
}

// ---------------------------------------------------------------- AUTH-08
async function logout(user, { refreshToken }, auth) {
  const rt = await RefreshToken.findOne({ tokenHash: sha256(refreshToken), userId: user._id });
  const familyId = rt ? rt.familyId : auth.sid;
  await RefreshToken.updateMany({ familyId, userId: user._id, revokedAt: null }, { revokedAt: new Date(), revokedReason: 'LOGOUT' });
  if (rt && rt.deviceId) await Device.deleteMany({ userId: user._id, deviceId: rt.deviceId });
}

module.exports = { register, verifyOtp, login, google, refresh, forgotPassword, resetPassword, logout, startOtp, issueSession, otpHash };
