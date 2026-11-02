'use strict';
const { Vehicle, QrLabel, QrScan, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { normalizeReg, REG_REGEX, maskPlate, paginate, pageMeta, addDays } = require('../utils/helpers');
const { randomToken } = require('../utils/crypto');
const rewardService = require('./reward.service');
const { notify } = require('./notification.service');

const presentQr = (l) => (l ? { code: l.code, status: l.status, activatedAt: l.activatedAt || null } : null);

function present(v, label) {
  return {
    id: String(v._id), registrationNumber: v.registrationNumber, type: v.type, model: v.model, color: v.color,
    qr: presentQr(label), createdAt: v.createdAt,
  };
}

async function list(ownerId, query) {
  const p = paginate(query);
  const [items, total] = await Promise.all([
    Vehicle.find({ ownerId }).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit),
    Vehicle.countDocuments({ ownerId }),
  ]);
  const labels = await QrLabel.find({ _id: { $in: items.map((v) => v.qrLabelId).filter(Boolean) } });
  const byId = new Map(labels.map((l) => [String(l._id), l]));
  return { items: items.map((v) => present(v, v.qrLabelId ? byId.get(String(v.qrLabelId)) : null)), meta: pageMeta(p, total) };
}

async function create(ownerId, { registrationNumber, type, model, color }) {
  const reg = normalizeReg(registrationNumber);
  if (!REG_REGEX.test(reg)) throw new ApiError('VALIDATION_FAILED', 'Enter a valid registration number, e.g. KA17SP1234', [{ field: 'registrationNumber', issue: 'format' }]);
  if (await Vehicle.exists({ registrationNumber: reg })) throw new ApiError('VEHICLE_EXISTS', 'This vehicle is already registered on V Tracker', [{ field: 'registrationNumber', issue: 'taken' }]);
  try {
    const v = await Vehicle.create({ ownerId, registrationNumber: reg, type, model: model || '', color: color || '', publicRef: `vr_${randomToken(12)}` });
    return present(v, null);
  } catch (e) {
    if (e.code === 11000) throw new ApiError('VEHICLE_EXISTS', 'This vehicle is already registered on V Tracker');
    throw e;
  }
}

async function getOwned(ownerId, id) {
  const v = await Vehicle.findOne({ _id: id, ownerId });
  if (!v) throw ApiError.notFound('Vehicle');
  return v;
}

async function detail(ownerId, id) {
  const v = await getOwned(ownerId, id);
  const label = v.qrLabelId ? await QrLabel.findById(v.qrLabelId) : null;
  const out = present(v, label);
  if (label) out.qr.scanCount30d = await QrScan.countDocuments({ vehicleId: v._id, at: { $gte: addDays(new Date(), -30) } });
  return out;
}

async function unlinkQr(ownerId, id) {
  const v = await getOwned(ownerId, id);
  if (!v.qrLabelId) throw new ApiError('QR_NOT_LINKED', 'No label is linked to this vehicle');
  await QrLabel.updateOne({ _id: v.qrLabelId }, { status: 'DELIVERED', vehicleId: null, ownerId: null, activatedAt: null });
  v.qrLabelId = null;
  await v.save();
}

/** VEH-05: plate -> safe summary only. Never owner identity, phone, insurance or PUC (PDF gap G3). */
async function lookup(user, reg) {
  const r = normalizeReg(reg);
  if (!r) throw new ApiError('VALIDATION_FAILED', 'Enter a registration number', [{ field: 'reg', issue: 'required' }]);
  const v = await Vehicle.findOne({ registrationNumber: r });
  if (!v) throw new ApiError('NOT_FOUND', 'This vehicle is not protected by V Tracker');
  const label = v.qrLabelId ? await QrLabel.findById(v.qrLabelId) : null;
  const active = !!(label && label.status === 'ACTIVE');
  const isOwn = String(v.ownerId) === String(user._id);
  return {
    vehicleRef: v.publicRef, maskedPlate: maskPlate(v.registrationNumber), type: v.type, hasActiveTag: active, isOwn,
    actions: active && !isOwn ? ['CALL', 'ALERT'] : [],
  };
}

// ---------------------------------------------------------------- QR
/** QR-01: what is this scanned code? */
async function qrStatus(qrUuid, user) {
  const l = await QrLabel.findOne({ qrUuid });
  if (!l) throw new ApiError('QR_NOT_FOUND', 'This is not a V Tracker label');
  if (l.status === 'INACTIVE') return { state: 'INVALID', vehicleType: l.vehicleType, maskedPlate: null, code: l.code };
  if (l.status !== 'ACTIVE' || !l.vehicleId) {
    const canActivate = !!(user && String(l.purchaserId) === String(user._id) && ['SHIPPED', 'DELIVERED'].includes(l.status));
    return { state: 'UNACTIVATED', vehicleType: l.vehicleType, maskedPlate: null, code: l.code, canActivate };
  }
  const v = await Vehicle.findById(l.vehicleId);
  const own = !!(user && String(l.ownerId) === String(user._id));
  const out = { state: own ? 'ACTIVE_OWN' : 'ACTIVE_OTHER', vehicleType: v ? v.type : l.vehicleType, maskedPlate: v ? maskPlate(v.registrationNumber) : null, code: l.code };
  if (own && v) out.vehicleId = String(v._id);
  if (!own && v) { out.vehicleRef = v.publicRef; out.actions = ['CALL', 'ALERT']; }
  return out;
}

/** QR-02: bind a shipped/delivered label bought by this user to one of their vehicles. */
async function activate(user, { qrUuid, vehicleId }) {
  const l = await QrLabel.findOne({ qrUuid });
  if (!l) throw new ApiError('QR_NOT_FOUND', 'This is not a V Tracker label');
  if (l.status === 'ACTIVE') throw new ApiError('QR_ALREADY_ACTIVE', 'This label is already linked to a vehicle');
  if (l.status === 'INACTIVE') throw new ApiError('QR_NOT_ELIGIBLE', 'This label has been disabled');
  if (String(l.purchaserId) !== String(user._id)) throw new ApiError('QR_NOT_ELIGIBLE', 'Only the buyer of this label can activate it');
  if (!['SHIPPED', 'DELIVERED'].includes(l.status)) throw new ApiError('QR_NOT_ELIGIBLE', 'This label has not been shipped yet');
  const v = await getOwned(user._id, vehicleId);
  if (v.qrLabelId) throw new ApiError('VEHICLE_HAS_QR', 'This vehicle already has an active label. Unlink it first.');
  if (l.vehicleType !== 'ANY' && l.vehicleType !== v.type) {
    throw new ApiError('QR_NOT_ELIGIBLE', `This label is for ${l.vehicleType.replace('_', ' ').toLowerCase()} vehicles`);
  }
  const updated = await QrLabel.findOneAndUpdate(
    { _id: l._id, status: { $in: ['SHIPPED', 'DELIVERED'] } },
    { status: 'ACTIVE', vehicleId: v._id, ownerId: user._id, activatedAt: new Date(), everActivated: true },
    { returnDocument: 'after' },
  );
  if (!updated) throw new ApiError('QR_ALREADY_ACTIVE', 'This label is already linked to a vehicle');
  v.qrLabelId = updated._id;
  await v.save();

  let rewardId = null;
  if (!l.everActivated) {
    const r = await rewardService.issueCard(user._id, 'activationCard', 'ACTIVATION', updated._id);
    rewardId = r ? String(r._id) : null;
  }
  await User.updateOne({ _id: user._id }, { isActiveMember: true });
  await notify(user._id, { type: 'SYSTEM', title: 'Label activated', body: `${v.registrationNumber} is now protected`, deepLink: `vtracker://vehicles/${v._id}` });
  return { vehicleId: String(v._id), qrStatus: updated.status, qrCode: updated.code, rewardId };
}

module.exports = { list, create, detail, unlinkQr, lookup, qrStatus, activate, getOwned, present };
