'use strict';
/** FASTag balance, toll history and recharge (FST-*). Lookups are restricted to the owner's own vehicles. */
const business = require('../config/business');
const { Vehicle, FastagIssuer, FastagRecharge } = require('../models');
const ApiError = require('../utils/ApiError');
const { normalizeReg, paginate, pageMeta, rupees } = require('../utils/helpers');
const provider = require('./providers/fastag.provider');
const payment = require('./providers/payment.provider');
const { notify } = require('./notification.service');
const webhook = require('./webhook.service');

async function issuers() {
  const rows = await FastagIssuer.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  return rows.map((r) => ({ code: r.code, name: r.name }));
}

async function ownedVehicle(user, vehicle) {
  const reg = normalizeReg(vehicle);
  const v = await Vehicle.findOne({ registrationNumber: reg, ownerId: user._id });
  if (!v) throw new ApiError('VEHICLE_NOT_OWNED', 'Add this vehicle to My Vehicles to check its FASTag');
  return v;
}

async function lookup(user, vehicle) {
  const v = await ownedVehicle(user, vehicle);
  let r;
  try {
    r = await provider.lookup(v.registrationNumber, v.type);
  } catch {
    throw new ApiError('PROVIDER_UNAVAILABLE', 'FASTag service is temporarily unavailable');
  }
  if (!r) throw new ApiError('FASTAG_NOT_FOUND', 'No FASTag is linked to this vehicle');
  return { vehicle: v.registrationNumber, vehicleId: String(v._id), issuer: r.issuer, issuerCode: r.issuerCode, tagId: r.tagId, status: r.status, balancePaise: r.balancePaise, currency: business.currency };
}

async function transactions(user, vehicle, query) {
  const v = await ownedVehicle(user, vehicle);
  const p = paginate(query);
  const { items, total } = await provider.transactions(v.registrationNumber, p);
  return {
    items: items.map((t) => ({ id: String(t._id), plaza: t.plaza, location: t.location, amountPaise: t.amountPaise, at: t.at, kind: t.kind })),
    meta: pageMeta(p, total),
  };
}

async function createRecharge(user, { vehicle, issuerCode, amountPaise, upiHandle }) {
  if (amountPaise < business.fastagMinRechargePaise) throw new ApiError('BELOW_MINIMUM', `Minimum recharge is ${rupees(business.fastagMinRechargePaise)}`, [{ field: 'amountPaise', issue: 'min' }]);
  if (amountPaise > business.fastagMaxRechargePaise) throw new ApiError('ABOVE_MAXIMUM', `Maximum recharge is ${rupees(business.fastagMaxRechargePaise)}`, [{ field: 'amountPaise', issue: 'max' }]);
  const v = await ownedVehicle(user, vehicle);
  if (!(await FastagIssuer.exists({ code: issuerCode, isActive: true }))) throw new ApiError('VALIDATION_FAILED', 'Unknown issuer bank', [{ field: 'issuerCode', issue: 'invalid' }]);
  const tag = await provider.lookup(v.registrationNumber, v.type);
  if (!tag) throw new ApiError('FASTAG_NOT_FOUND', 'No FASTag is linked to this vehicle');
  if (tag.issuerCode && tag.issuerCode !== issuerCode) {
    throw new ApiError('VALIDATION_FAILED', `This FASTag is issued by ${tag.issuer.replace(/ FASTag$/, '')}. Choose that bank.`, [{ field: 'issuerCode', issue: 'issuer_mismatch', expected: tag.issuerCode }]);
  }
  const gw = await payment.createOrder({ amountPaise, receipt: `FT-${v.registrationNumber}` });
  const r = await FastagRecharge.create({
    userId: user._id, vehicleId: v._id, vehicleNumber: v.registrationNumber, issuerCode, amountPaise, upiHandle,
    payment: { gateway: gw.gateway, gatewayOrderId: gw.gatewayOrderId, expiresAt: gw.expiresAt },
  });
  return {
    id: String(r._id), status: r.status, amountPaise,
    payment: { gateway: gw.gateway, keyId: gw.keyId, gatewayOrderId: gw.gatewayOrderId, amountPaise: gw.amountPaise, currency: gw.currency, method: 'UPI', upiHandle: upiHandle || null, expiresAt: gw.expiresAt },
  };
}

async function getRecharge(user, id) {
  const r = await FastagRecharge.findOne({ _id: id, userId: user._id });
  if (!r) throw ApiError.notFound('Recharge');
  return { id: String(r._id), status: r.status, vehicle: r.vehicleNumber, issuerCode: r.issuerCode, amountPaise: r.amountPaise, failureReason: r.failureReason || null, createdAt: r.createdAt, creditedAt: r.creditedAt || null };
}

/** Called by the payment webhook when the gatewayOrderId belongs to a recharge. */
async function onPaymentEvent(p) {
  const r = await FastagRecharge.findOne({ 'payment.gatewayOrderId': p.gatewayOrderId });
  if (!r) return { ignored: true };
  if (p.event === 'payment.captured') {
    if (p.amountPaise !== undefined && p.amountPaise !== r.amountPaise) throw new ApiError('VALIDATION_FAILED', 'Captured amount does not match recharge');
    const paid = await FastagRecharge.findOneAndUpdate({ _id: r._id, status: 'PENDING_PAYMENT' }, { status: 'PAID', 'payment.gatewayPaymentId': p.gatewayPaymentId }, { returnDocument: 'after' });
    if (paid) {
      const res = await provider.createRecharge({ vehicleNumber: r.vehicleNumber, issuerCode: r.issuerCode, amountPaise: r.amountPaise, reference: String(r._id) });
      await FastagRecharge.updateOne({ _id: r._id }, { providerRef: res.providerRef });
    }
  } else if (p.event === 'payment.failed') {
    await FastagRecharge.updateOne({ _id: r._id, status: 'PENDING_PAYMENT' }, { status: 'FAILED', failureReason: p.reason || 'Payment failed' });
  }
  const fresh = await FastagRecharge.findById(r._id);
  return { rechargeId: String(r._id), status: fresh.status };
}

/** FST-06: aggregator confirms (or fails) the credit to the tag. */
async function fastagWebhook(payload) {
  return webhook.once('fastag', payload, async (p) => {
    const r = await FastagRecharge.findOne({ providerRef: p.providerRef });
    if (!r) return { ignored: true };
    if (p.event === 'recharge.credited') {
      const done = await FastagRecharge.findOneAndUpdate({ _id: r._id, status: 'PAID' }, { status: 'CREDITED', creditedAt: new Date() }, { returnDocument: 'after' });
      if (done) {
        await provider.applyMockCredit({ vehicleNumber: r.vehicleNumber, amountPaise: r.amountPaise, refId: String(r._id) });
        await notify(r.userId, { type: 'FASTAG', title: 'FASTag recharged', body: `${rupees(r.amountPaise)} added to ${r.vehicleNumber}`, deepLink: `vtracker://fastag/${r.vehicleNumber}` });
      }
    } else if (p.event === 'recharge.failed') {
      const f = await FastagRecharge.findOneAndUpdate({ _id: r._id, status: 'PAID' }, { status: 'FAILED', failureReason: p.reason || 'Issuer bank rejected the recharge' }, { returnDocument: 'after' });
      if (f) await notify(r.userId, { type: 'FASTAG', title: 'FASTag recharge failed', body: `${rupees(r.amountPaise)} will be refunded to your payment method.`, deepLink: `vtracker://fastag/${r.vehicleNumber}` });
    }
    const fresh = await FastagRecharge.findById(r._id);
    return { rechargeId: String(r._id), status: fresh.status };
  });
}

module.exports = { issuers, lookup, transactions, createRecharge, getRecharge, onPaymentEvent, fastagWebhook };
