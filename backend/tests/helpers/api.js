'use strict';
/** Shared test helpers: an HTTP client for the app and factories that drive real API flows. */
require('./setup');
const request = require('supertest');
const crypto = require('crypto');
const app = require('../../src/app');
const { signPayload, SECRETS } = require('../../src/middlewares/webhookSignature.middleware');
const payment = require('../../src/services/providers/payment.provider');
const ledger = require('../../src/services/ledger.service');
const { Product } = require('../../src/models');

const api = () => request(app);
const bearer = (t) => ({ Authorization: `Bearer ${t.accessToken || t}` });
const idem = () => ({ 'Idempotency-Key': crypto.randomUUID() });

let seq = Math.floor(Math.random() * 1e6);
const uniquePhone = () => `9${String(100000000 + (seq += 7919) % 899999999).padStart(9, '0')}`;
const uniqueEmail = (p = 'user') => `${p}.${Date.now().toString(36)}${(seq += 13)}@example.com`;
const PASSWORD = 'Secret@123';

/** Register + verify OTP through the API. Returns tokens and the user record. */
async function createUser(o = {}) {
  const body = { fullName: o.fullName || 'Test Owner', email: o.email || uniqueEmail(), phone: o.phone || uniquePhone(), password: o.password || PASSWORD };
  if (o.referralCode) body.referralCode = o.referralCode;
  const reg = await api().post('/v1/auth/register').send(body);
  if (reg.status !== 201) throw new Error(`register failed ${reg.status} ${JSON.stringify(reg.body)}`);
  const v = await api().post('/v1/auth/verify-otp').send({ challengeId: reg.body.data.verification.challengeId, code: reg.body.data.verification.devCode });
  if (v.status !== 200) throw new Error(`verify failed ${v.status} ${JSON.stringify(v.body)}`);
  return { ...v.body.data, email: body.email, phone: body.phone, password: body.password, userId: v.body.data.user.id };
}

function signed(provider, body) {
  const raw = JSON.stringify(body);
  const ts = Math.floor(Date.now() / 1000);
  return { raw, headers: { 'Content-Type': 'application/json', 'X-Timestamp': String(ts), 'X-Signature': signPayload(SECRETS[provider](), ts, raw) } };
}

function webhook(provider, body) {
  const s = signed(provider, { eventId: `evt_${crypto.randomUUID()}`, ...body });
  return api().post(`/v1/webhooks/${provider}`).set(s.headers).send(s.raw);
}

async function productBySlug(slug) {
  return Product.findOne({ slug });
}

async function addAddress(u, o = {}) {
  const r = await api().post('/v1/addresses').set(bearer(u)).send({
    name: 'Test Owner', phone: '9876543210', label: 'HOME', line1: '12, 4th Cross, Koramangala', line2: 'Near Forum Mall', pincode: '560034', city: 'Bengaluru', state: 'Karnataka', ...o,
  });
  if (r.status !== 201) throw new Error(`address failed ${JSON.stringify(r.body)}`);
  return r.body.data;
}

/** Full purchase: cart -> order -> signed payment webhook. Returns the order id + gateway order. */
async function placePaidOrder(u, { slug = 'four-wheeler-qr-label', qty = 1, deliver = true } = {}) {
  const p = await productBySlug(slug);
  await api().put(`/v1/cart/items/${p._id}`).set(bearer(u)).send({ qty }).expect(200);
  const addr = await addAddress(u);
  const sum = await api().get('/v1/checkout/summary').query({ addressId: addr.id }).set(bearer(u)).expect(200);
  const ord = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: addr.id, expectedTotalPaise: sum.body.data.totalPaise });
  if (ord.status !== 201) throw new Error(`order failed ${JSON.stringify(ord.body)}`);
  const { gatewayOrderId } = ord.body.data.payment;
  const co = payment.simulateCheckout(gatewayOrderId);
  await api().post('/v1/payments/confirm').set(bearer(u)).send({ orderId: ord.body.data.orderId, gatewayPaymentId: co.gatewayPaymentId, signature: co.signature }).expect(200);
  const wh = await webhook('payment', { event: 'payment.captured', gatewayOrderId, gatewayPaymentId: co.gatewayPaymentId, amountPaise: ord.body.data.totalPaise });
  if (wh.status !== 200) throw new Error(`payment webhook failed ${JSON.stringify(wh.body)}`);
  const detail = await api().get(`/v1/orders/${ord.body.data.orderId}`).set(bearer(u)).expect(200);
  if (deliver) {
    await webhook('courier', { awb: detail.body.data.shipment.awb, status: 'SHIPPED', detail: 'Picked up' }).expect(200);
    await webhook('courier', { awb: detail.body.data.shipment.awb, status: 'DELIVERED', detail: 'Delivered to customer' }).expect(200);
  }
  const fresh = await api().get(`/v1/orders/${ord.body.data.orderId}`).set(bearer(u)).expect(200);
  return { orderId: ord.body.data.orderId, order: fresh.body.data, gatewayOrderId, addressId: addr.id };
}

const REGS = { TWO_WHEELER: 'KA17EA', THREE_WHEELER: 'KA01AB', FOUR_WHEELER: 'KA17SP', COMMERCIAL: 'KA51C' };
const uniqueReg = (type = 'FOUR_WHEELER') => `${REGS[type]}${String(1000 + ((seq += 37) % 8999)).padStart(4, '0')}`;

async function createVehicle(u, { type = 'FOUR_WHEELER', registrationNumber, model = 'Hyundai Creta' } = {}) {
  const r = await api().post('/v1/vehicles').set(bearer(u)).send({ registrationNumber: registrationNumber || uniqueReg(type), type, model });
  if (r.status !== 201) throw new Error(`vehicle failed ${JSON.stringify(r.body)}`);
  return r.body.data;
}

/** Owner with an ACTIVE label on a 4-wheeler. */
async function protectedVehicle(u) {
  const { order } = await placePaidOrder(u);
  const v = await createVehicle(u);
  const label = order.qrLabels[0];
  await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: label.qrUuid, vehicleId: v.id }).expect(200);
  const look = await api().get('/v1/vehicles/lookup').query({ reg: v.registrationNumber }).set(bearer(u)).expect(200);
  return { vehicle: v, label, vehicleRef: look.body.data.vehicleRef, order };
}

async function fundWallet(userId, amountPaise) {
  return ledger.credit(userId, amountPaise, 'ADJUSTMENT', { refType: 'TestFunding', refId: crypto.randomUUID() });
}

async function kycAndBank(u, { holderName = 'Test Owner' } = {}) {
  await api().post('/v1/me/kyc').set(bearer(u)).send({ panNumber: 'ABCDE1234F', nameOnPan: holderName }).expect(202);
  const b = await api().put('/v1/me/bank-account').set(bearer(u)).send({
    holderName, accountNumber: '50100123450192', confirmAccountNumber: '50100123450192', ifsc: 'HDFC0001234', upiId: 'testowner@okhdfc',
  });
  if (b.status !== 200) throw new Error(`bank failed ${JSON.stringify(b.body)}`);
  return b.body.data;
}

// Minimal valid files for upload tests
const PNG = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360000002000154A24F5D0000000049454E44AE426082', 'hex');
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');

module.exports = {
  api, bearer, idem, createUser, uniquePhone, uniqueEmail, PASSWORD, signed, webhook, productBySlug, addAddress, placePaidOrder,
  createVehicle, uniqueReg, protectedVehicle, fundWallet, kycAndBank, PNG, PDF,
};
