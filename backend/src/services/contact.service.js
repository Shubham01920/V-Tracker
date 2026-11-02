'use strict';
/**
 * Masked contact between a bystander (web page or app user) and a vehicle owner (PDF §2.3, §4.5.5, §4.5.6, §4.7.4).
 * The bystander's number is only passed to the telephony bridge; the database keeps a one-way hash.
 */
const { Vehicle, QrLabel, QrScan, ContactEvent, CallerBlock, AbuseReport, User } = require('../models');
const business = require('../config/business');
const ApiError = require('../utils/ApiError');
const { sha256 } = require('../utils/crypto');
const { maskPlate, paginate, pageMeta } = require('../utils/helpers');
const telephony = require('./providers/telephony.provider');
const { sendSms } = require('./providers/messaging.provider');
const { verifyCaptcha } = require('./providers/misc.provider');
const { notify } = require('./notification.service');
const webhook = require('./webhook.service');

const REASON_LABELS = {
  BLOCKING_ROAD: 'Vehicle is blocking the road',
  LIGHTS_ON: 'Lights are left on',
  DOORS_OPEN: 'Doors or windows are open',
  TOWING: 'Vehicle is being towed',
  EMERGENCY: 'Emergency - need help',
  OTHER: 'Someone is trying to reach you',
};

const phoneHash = (phone) => sha256(`phone:${String(phone).replace(/\D/g, '').slice(-10)}`);

function ownerReachablePhone(owner) {
  if (!owner || owner.status !== 'ACTIVE' || owner.deletedAt) return null;
  if (owner.alertPhone && owner.alertPhoneVerified) return owner.alertPhone;
  if (owner.phone && owner.phoneVerified) return owner.phone;
  return null;
}

async function guard(vehicle, callerHash) {
  if (await CallerBlock.exists({ ownerId: vehicle.ownerId, callerHash })) {
    throw new ApiError('CONTACT_BLOCKED', 'The owner is not accepting contact from you');
  }
  const since = new Date(Date.now() - 3600 * 1000);
  const [byCaller, byVehicle] = await Promise.all([
    ContactEvent.countDocuments({ vehicleId: vehicle._id, callerHash, at: { $gte: since } }),
    ContactEvent.countDocuments({ vehicleId: vehicle._id, at: { $gte: since } }),
  ]);
  if (byCaller >= business.contactLimits.perCallerPerVehiclePerHour || byVehicle >= business.contactLimits.perVehiclePerHour) {
    const e = new ApiError('RATE_LIMITED', 'Too many attempts for this vehicle. Please try again later.');
    e.retryAfter = 3600;
    throw e;
  }
}

async function startCall({ vehicle, label, callerPhone, callerUserId, channel, reason = 'OTHER' }) {
  const owner = await User.findById(vehicle.ownerId);
  const ownerPhone = ownerReachablePhone(owner);
  if (!ownerPhone) throw new ApiError('OWNER_UNAVAILABLE', 'The owner cannot be reached right now. Try sending an alert.');
  const callerHash = phoneHash(callerPhone);
  await guard(vehicle, callerHash);

  const ev = await ContactEvent.create({
    ownerId: vehicle.ownerId, vehicleId: vehicle._id, qrLabelId: label ? label._id : vehicle.qrLabelId, kind: 'CALL', reason, channel, callerHash, callerUserId,
  });
  let bridge;
  try {
    bridge = await telephony.createBridge({ callerPhone, ownerPhone, reference: String(ev._id) });
  } catch (e) {
    await ContactEvent.updateOne({ _id: ev._id }, { outcome: 'FAILED' });
    throw new ApiError('PROVIDER_UNAVAILABLE', 'Calling is temporarily unavailable. Please send an alert instead.');
  }
  await ContactEvent.updateOne({ _id: ev._id }, { sessionId: bridge.sessionId });
  await notify(vehicle.ownerId, {
    type: 'CONTACT_CALL', title: `Incoming V Tracker call - ${vehicle.registrationNumber}`, body: REASON_LABELS[reason],
    deepLink: `vtracker://calls/${ev._id}`, data: { contactId: String(ev._id), vehicleId: String(vehicle._id) },
  });
  return { sessionId: bridge.sessionId, status: bridge.status, virtualNumber: bridge.virtualNumber, contactId: String(ev._id) };
}

async function sendAlert({ vehicle, label, callerHash, callerUserId, channel, reason, note }) {
  await guard(vehicle, callerHash);
  const owner = await User.findById(vehicle.ownerId);
  if (!owner || owner.status !== 'ACTIVE') throw new ApiError('OWNER_UNAVAILABLE', 'The owner cannot be reached right now');
  const ev = await ContactEvent.create({
    ownerId: vehicle.ownerId, vehicleId: vehicle._id, qrLabelId: label ? label._id : vehicle.qrLabelId, kind: 'ALERT', outcome: 'DELIVERED', reason, note, channel, callerHash, callerUserId,
  });
  const title = `${REASON_LABELS[reason]} - ${vehicle.registrationNumber}`;
  await notify(vehicle.ownerId, { type: 'CONTACT_ALERT', title, body: note || 'Tap to view details', deepLink: `vtracker://calls/${ev._id}`, data: { contactId: String(ev._id), reason } });
  const phone = ownerReachablePhone(owner);
  if (phone) await sendSms(phone, `V Tracker alert for ${vehicle.registrationNumber}: ${REASON_LABELS[reason]}${note ? ` - "${note}"` : ''}`, { kind: 'CONTACT_ALERT' });
  return { alertId: String(ev._id) };
}

// ---------------------------------------------------------------- app (CON-01 / CON-02)
async function vehicleByRef(vehicleRef) {
  const v = await Vehicle.findOne({ publicRef: vehicleRef });
  if (!v) throw ApiError.notFound('Vehicle');
  const label = v.qrLabelId ? await QrLabel.findById(v.qrLabelId) : null;
  if (!label || label.status !== 'ACTIVE') throw new ApiError('OWNER_UNAVAILABLE', 'This vehicle has no active V Tracker label');
  return { v, label };
}

async function appCall(user, { vehicleRef, reason }) {
  const { v, label } = await vehicleByRef(vehicleRef);
  if (String(v.ownerId) === String(user._id)) throw new ApiError('CANNOT_CONTACT_SELF', 'This is your own vehicle');
  if (!user.phoneVerified) throw new ApiError('PHONE_NOT_VERIFIED', 'Verify your phone number before calling');
  return startCall({ vehicle: v, label, callerPhone: user.phone, callerUserId: user._id, channel: 'APP', reason });
}

async function appAlert(user, { vehicleRef, reason, note }) {
  const { v, label } = await vehicleByRef(vehicleRef);
  if (String(v.ownerId) === String(user._id)) throw new ApiError('CANNOT_CONTACT_SELF', 'This is your own vehicle');
  return sendAlert({ vehicle: v, label, callerHash: user.phone ? phoneHash(user.phone) : sha256(`user:${user._id}`), callerUserId: user._id, channel: 'APP', reason, note });
}

// ---------------------------------------------------------------- public web page (PUB-01..04)
async function labelForPublic(qrUuid) {
  const l = await QrLabel.findOne({ qrUuid });
  if (!l) throw new ApiError('QR_NOT_FOUND', 'This is not a V Tracker label');
  if (l.status === 'INACTIVE') throw new ApiError('QR_INACTIVE', 'This label is no longer active');
  return l;
}

async function activeLabelVehicle(qrUuid) {
  const l = await labelForPublic(qrUuid);
  if (l.status !== 'ACTIVE' || !l.vehicleId) throw new ApiError('QR_INACTIVE', 'This label has not been activated yet');
  const v = await Vehicle.findById(l.vehicleId);
  if (!v) throw new ApiError('QR_INACTIVE', 'This label has not been activated yet');
  return { l, v };
}

async function publicScan(qrUuid, ip) {
  const l = await labelForPublic(qrUuid);
  const v = l.vehicleId ? await Vehicle.findById(l.vehicleId) : null;
  const active = l.status === 'ACTIVE' && !!v;
  await QrScan.create({ qrLabelId: l._id, vehicleId: v ? v._id : undefined, channel: 'WEB', ipHash: sha256(`ip:${ip}`) });
  return {
    maskedPlate: v ? maskPlate(v.registrationNumber) : null,
    vehicleType: v ? v.type : l.vehicleType,
    active,
    actions: active ? ['CALL', 'ALERT', 'REPORT'] : ['REPORT'],
    reasons: Object.entries(REASON_LABELS).map(([code, label]) => ({ code, label })),
    message: active ? 'This vehicle is protected by V Tracker. Your number stays private.' : 'This label has not been activated yet.',
  };
}

async function publicCall(qrUuid, { callerPhone, captchaToken, reason }, ip) {
  if (!(await verifyCaptcha(captchaToken, ip))) throw new ApiError('CAPTCHA_FAILED', 'Please complete the CAPTCHA');
  const { l, v } = await activeLabelVehicle(qrUuid);
  return startCall({ vehicle: v, label: l, callerPhone, channel: 'WEB', reason: reason || 'OTHER' });
}

async function publicAlert(qrUuid, { reason, note, callerPhone, captchaToken }, ip) {
  if (!(await verifyCaptcha(captchaToken, ip))) throw new ApiError('CAPTCHA_FAILED', 'Please complete the CAPTCHA');
  const { l, v } = await activeLabelVehicle(qrUuid);
  const callerHash = callerPhone ? phoneHash(callerPhone) : sha256(`ip:${ip}`);
  return sendAlert({ vehicle: v, label: l, callerHash, channel: 'WEB', reason, note });
}

async function publicReport(qrUuid, { kind, note }, ip) {
  const l = await QrLabel.findOne({ qrUuid });
  if (!l) throw new ApiError('QR_NOT_FOUND', 'This is not a V Tracker label');
  const r = await AbuseReport.create({ qrLabelId: l._id, vehicleId: l.vehicleId || undefined, kind, note, ipHash: sha256(`ip:${ip}`) });
  if (l.ownerId && kind === 'LABEL_DAMAGED') {
    await notify(l.ownerId, { type: 'SYSTEM', title: 'Your label may be damaged', body: 'Someone reported that your V Tracker label is hard to scan.', deepLink: 'vtracker://vehicles' });
  }
  return { reportId: String(r._id) };
}

// ---------------------------------------------------------------- call history (CAL-01 / CAL-02)
async function presentEvent(e, vehicles) {
  const v = vehicles.get(String(e.vehicleId));
  return {
    id: String(e._id), kind: e.kind, outcome: e.outcome, reason: e.reason, reasonLabel: REASON_LABELS[e.reason], note: e.note || null,
    channel: e.channel, durationSec: e.durationSec || 0, at: e.at,
    vehicle: v ? { id: String(v._id), registrationNumber: v.registrationNumber, type: v.type, model: v.model } : null,
  };
}

async function history(ownerId, { type = 'ALL', ...query }) {
  const p = paginate(query);
  const q = { ownerId };
  if (type === 'MISSED') q.outcome = 'MISSED';
  if (type === 'EMERGENCY') q.reason = 'EMERGENCY';
  const [items, total] = await Promise.all([
    ContactEvent.find(q).sort({ at: -1 }).skip(p.skip).limit(p.limit),
    ContactEvent.countDocuments(q),
  ]);
  const vs = await Vehicle.find({ _id: { $in: items.map((i) => i.vehicleId) } });
  const map = new Map(vs.map((v) => [String(v._id), v]));
  return { items: await Promise.all(items.map((e) => presentEvent(e, map))), meta: pageMeta(p, total) };
}

async function historyItem(ownerId, id) {
  const e = await ContactEvent.findOne({ _id: id, ownerId });
  if (!e) throw ApiError.notFound('Call');
  const v = await Vehicle.findById(e.vehicleId);
  const out = await presentEvent(e, new Map(v ? [[String(v._id), v]] : []));
  const blocked = await CallerBlock.exists({ ownerId, callerHash: e.callerHash });
  out.isBlocked = !!blocked;
  out.canBlock = !blocked;
  return out;
}

async function blockCaller(ownerId, id) {
  const e = await ContactEvent.findOne({ _id: id, ownerId });
  if (!e) throw ApiError.notFound('Call');
  await CallerBlock.updateOne({ ownerId, callerHash: e.callerHash }, { $setOnInsert: { ownerId, callerHash: e.callerHash, sourceContactId: e._id } }, { upsert: true });
  return { blocked: true };
}

// ---------------------------------------------------------------- telephony webhook (CAL-03)
async function telephonyWebhook(payload) {
  return webhook.once('telephony', payload, async (p) => {
    const ev = await ContactEvent.findOne({ sessionId: p.sessionId });
    if (!ev) return { ignored: true };
    const map = { 'call.answered': 'ANSWERED', 'call.completed': 'ANSWERED', 'call.missed': 'MISSED', 'call.failed': 'FAILED' };
    const outcome = map[p.event];
    const update = { outcome, providerRef: p.providerRef };
    if (p.durationSec !== undefined) update.durationSec = p.durationSec;
    await ContactEvent.updateOne({ _id: ev._id }, update);
    if (outcome === 'MISSED' && ev.outcome !== 'MISSED') {
      const v = await Vehicle.findById(ev.vehicleId);
      await notify(ev.ownerId, { type: 'CONTACT_CALL', title: `Missed V Tracker call - ${v ? v.registrationNumber : ''}`, body: 'Someone tried to reach you about your vehicle', deepLink: `vtracker://calls/${ev._id}` });
    }
    return { contactId: String(ev._id), outcome };
  });
}

module.exports = {
  appCall, appAlert, publicScan, publicCall, publicAlert, publicReport, history, historyItem, blockCaller, telephonyWebhook, REASON_LABELS, phoneHash,
};
