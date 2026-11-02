'use strict';
const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { maskPhone, maskEmail } = require('../utils/helpers');
const { randomToken } = require('../utils/crypto');

/** PRF-01 shape. Phones are masked; address fields are returned in full so Edit Profile can pre-fill. */
function presentUser(u) {
  return {
    id: String(u._id),
    memberId: u.memberId,
    fullName: u.fullName,
    email: u.email || null,
    emailMasked: maskEmail(u.email),
    emailVerified: !!u.emailVerified,
    phoneMasked: maskPhone(u.phone),
    phoneLast4: u.phone ? u.phone.slice(-4) : null,
    phoneVerified: !!u.phoneVerified,
    alertPhoneMasked: maskPhone(u.alertPhone),
    alertPhoneVerified: !!u.alertPhoneVerified,
    pendingPhoneVerification: !!u.pendingPhone,
    pendingAlertPhoneVerification: !!u.pendingAlertPhone,
    avatarUrl: u.avatarUrl || null,
    address: u.address || null,
    place: u.place || null,
    city: u.city || u.place || null,
    state: u.state || null,
    pincode: u.pincode || null,
    locality: u.locality || null,
    nearBy: u.nearBy || null,
    referralCode: u.referralCode,
    kycStatus: (u.kyc && u.kyc.status) || 'NOT_SUBMITTED',
    pointsBalance: u.pointsBalance || 0,
    role: u.role,
    createdAt: u.createdAt,
  };
}

async function getMe(user) {
  return presentUser(user);
}

/** PRF-02: saves changed fields; a new mobile or alert number only applies after OTP verification. */
async function updateMe(user, body) {
  const { startOtp } = require('./otp.service');
  const simple = ['fullName', 'address', 'place', 'state', 'pincode', 'locality', 'nearBy', 'city'];
  for (const k of simple) if (body[k] !== undefined) user[k] = body[k];

  if (body.email !== undefined && body.email.toLowerCase() !== user.email) {
    const email = body.email.toLowerCase();
    if (await User.exists({ email, _id: { $ne: user._id } })) throw new ApiError('EMAIL_TAKEN', 'This e-mail is already registered', [{ field: 'email', issue: 'taken' }]);
    user.email = email;
    user.emailVerified = false;
  }

  const verification = {};
  if (body.phone !== undefined && body.phone !== user.phone) {
    if (await User.exists({ phone: body.phone, _id: { $ne: user._id } })) throw new ApiError('PHONE_TAKEN', 'This phone number is already registered', [{ field: 'phone', issue: 'taken' }]);
    user.pendingPhone = body.phone;
  }
  if (body.alertPhone !== undefined && body.alertPhone !== user.alertPhone) user.pendingAlertPhone = body.alertPhone;
  await user.save();

  if (body.phone !== undefined && body.phone !== user.phone) verification.phone = await startOtp(user, 'PHONE_CHANGE', body.phone);
  if (body.alertPhone !== undefined && body.alertPhone !== user.alertPhone) verification.alertPhone = await startOtp(user, 'ALERT_PHONE_CHANGE', body.alertPhone);

  const out = presentUser(user);
  if (Object.keys(verification).length) out.verification = verification;
  return out;
}

async function uploadAvatar(user, file) {
  const ext = file.detectedMime === 'image/png' ? 'png' : 'jpg';
  const dir = path.join(env.UPLOAD_DIR, 'avatars');
  await fs.mkdir(dir, { recursive: true });
  const name = `${user._id}-${randomToken(8)}.${ext}`;
  await fs.writeFile(path.join(dir, name), file.buffer);
  const old = user.avatarUrl && user.avatarUrl.includes('/uploads/avatars/') ? user.avatarUrl.split('/uploads/avatars/')[1] : null;
  user.avatarUrl = `${env.PUBLIC_BASE_URL}/uploads/avatars/${name}`;
  await user.save();
  if (old && !old.includes('/') && !old.includes('..')) fs.unlink(path.join(dir, old)).catch(() => {});
  return { avatarUrl: user.avatarUrl };
}

module.exports = { presentUser, getMe, updateMe, uploadAvatar };
