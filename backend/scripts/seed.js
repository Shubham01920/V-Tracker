#!/usr/bin/env node
'use strict';
/**
 * Seeds MongoDB with reference data + a complete demo account, built through the real services
 * (so every number on every screen agrees, PDF §3.6).
 *
 *   npm run seed           -> reference data + demo data (skips demo data if it already exists)
 *   npm run seed:reset     -> DROPS the database first, then seeds everything
 *
 * All people, numbers and accounts below are fictional.
 */
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const { ensureReferenceData } = require('../src/config/bootstrap');
const m = require('../src/models');
const auth = require('../src/services/auth.service');
const addresses = require('../src/services/address.service');
const shop = require('../src/services/shop.service');
const orders = require('../src/services/order.service');
const vehicles = require('../src/services/vehicle.service');
const contacts = require('../src/services/contact.service');
const rewards = require('../src/services/reward.service');
const referral = require('../src/services/referral.service');
const wallet = require('../src/services/wallet.service');
const fastag = require('../src/services/fastag.service');
const payment = require('../src/services/providers/payment.provider');
const { uuid } = require('../src/utils/crypto');

const PASSWORD = 'Demo@1234';
const ev = () => `seed_${uuid()}`;

async function makeUser({ fullName, email, phone, referralCode, role }) {
  const r = await auth.register({ fullName, email, phone, password: PASSWORD, referralCode });
  const code = (await m.OtpChallenge.findOne({ challengeId: r.verification.challengeId })) && r.verification.devCode;
  if (!code) throw new Error('Seeding needs EXPOSE_DEV_SECRETS=true (non-production) to read the OTP');
  await auth.verifyOtp({ challengeId: r.verification.challengeId, code }, {});
  if (role) await m.User.updateOne({ _id: r.userId }, { role });
  return m.User.findById(r.userId);
}

async function buy(user, slug, qty, addressId, { deliver = true, ship = true } = {}) {
  const p = await m.Product.findOne({ slug });
  await shop.setItem(user, p._id, qty);
  const fresh = await m.User.findById(user._id);
  const s = await orders.summary(fresh, { addressId });
  const o = await orders.createOrder(fresh, { addressId, expectedTotalPaise: s.totalPaise });
  const co = payment.simulateCheckout(o.payment.gatewayOrderId);
  await orders.paymentWebhook({ eventId: ev(), event: 'payment.captured', gatewayOrderId: o.payment.gatewayOrderId, gatewayPaymentId: co.gatewayPaymentId, amountPaise: o.totalPaise });
  const order = await m.Order.findById(o.orderId);
  if (ship) {
    await orders.courierWebhook({ eventId: ev(), awb: order.shipment.awb, status: 'PROCESSED', location: 'Bengaluru Warehouse' });
    await orders.courierWebhook({ eventId: ev(), awb: order.shipment.awb, status: 'SHIPPED', location: 'Bengaluru Hub' });
    await orders.courierWebhook({ eventId: ev(), awb: order.shipment.awb, status: 'IN_TRANSIT', location: 'Hyderabad Hub' });
  }
  if (deliver) {
    await orders.courierWebhook({ eventId: ev(), awb: order.shipment.awb, status: 'OUT_FOR_DELIVERY', location: 'Madhapur' });
    await orders.courierWebhook({ eventId: ev(), awb: order.shipment.awb, status: 'DELIVERED', location: 'Madhapur' });
  }
  return m.Order.findById(o.orderId);
}

async function main() {
  const reset = process.argv.includes('--reset');
  if (env.isProd) throw new Error('Refusing to seed demo data with NODE_ENV=production');
  await connectDB();
  if (reset) {
    await mongoose.connection.dropDatabase();
    await Promise.all(Object.values(mongoose.models).map((x) => x.syncIndexes()));
    console.log('Database dropped.');
  }
  const ref = await ensureReferenceData();
  console.log('Reference data:', ref);

  if (await m.User.exists({ email: 'demo@vtracker.app' })) {
    console.log('Demo data already present (use `npm run seed:reset` to rebuild).');
    return;
  }

  // ---------------- people (fictional)
  const admin = await makeUser({ fullName: 'V Tracker Admin', email: 'admin@vtracker.app', phone: '9000000099', role: 'ADMIN' });
  const owner = await makeUser({ fullName: 'Shubham Maurya', email: 'demo@vtracker.app', phone: '9000000001' });
  const t1 = await makeUser({ fullName: 'Pavan S H', email: 'pavan.demo@vtracker.app', phone: '9000000002', referralCode: owner.referralCode });
  const t2 = await makeUser({ fullName: 'Khaja Vali M', email: 'khaja.demo@vtracker.app', phone: '9000000003', referralCode: owner.referralCode });
  const t3 = await makeUser({ fullName: 'Ganesha K', email: 'ganesha.demo@vtracker.app', phone: '9000000004', referralCode: t1.referralCode });
  const bystander = await makeUser({ fullName: 'Ravi Kumar', email: 'ravi.demo@vtracker.app', phone: '9000000005' });

  // ---------------- addresses
  const home = await addresses.create(owner._id, { name: 'Shubham Maurya', phone: '9000000001', label: 'HOME', line1: 'Flat 302, Cyber Towers', line2: 'Madhapur', pincode: '500081', city: 'Hyderabad', state: 'Telangana', isDefault: true });
  await addresses.create(owner._id, { name: 'Shubham Maurya', phone: '9000000001', label: 'OFFICE', line1: '4th Floor, Mindspace', line2: 'Hitech City', pincode: '500081', city: 'Hyderabad', state: 'Telangana' });
  for (const u of [t1, t2, t3]) {
    const a = await addresses.create(u._id, { name: u.fullName, phone: u.phone, label: 'HOME', line1: '12, 4th Cross, Koramangala', pincode: '560034', city: 'Bengaluru', state: 'Karnataka' });
    await buy(u, 'two-wheeler-qr-label', 1, a.id, { deliver: false, ship: false });
  }

  // ---------------- orders: one delivered (labels), one in transit
  const delivered = await buy(owner, 'four-wheeler-qr-label', 2, home.id);
  await buy(owner, 'two-wheeler-qr-label', 1, home.id, { deliver: false });

  // ---------------- vehicles + activation
  const creta = await vehicles.create(owner._id, { registrationNumber: 'TS09EG4321', type: 'FOUR_WHEELER', model: 'Hyundai Creta', color: 'White' });
  await vehicles.create(owner._id, { registrationNumber: 'KA17SP1234', type: 'FOUR_WHEELER', model: 'Maruti Swift', color: 'Red' });
  await vehicles.create(owner._id, { registrationNumber: 'TS07AB9876', type: 'TWO_WHEELER', model: 'Honda Activa', color: 'Grey' });
  const labels = await m.QrLabel.find({ orderId: delivered._id }).sort({ code: 1 });
  await vehicles.activate(owner, { qrUuid: labels[0].qrUuid, vehicleId: creta.id });

  // ---------------- contacts: public alert + calls (answered + missed)
  await contacts.publicAlert(labels[0].qrUuid, { reason: 'BLOCKING_ROAD', note: 'Please move your car, gate is blocked', captchaToken: 'seed' }, '127.0.0.10');
  const c1 = await contacts.publicCall(labels[0].qrUuid, { callerPhone: '9000000006', captchaToken: 'seed', reason: 'EMERGENCY' }, '127.0.0.11');
  await contacts.telephonyWebhook({ eventId: ev(), event: 'call.completed', sessionId: c1.sessionId, durationSec: 74 });
  const look = await vehicles.lookup(bystander, 'TS09EG4321');
  const c2 = await contacts.appCall(bystander, { vehicleRef: look.vehicleRef, reason: 'LIGHTS_ON' });
  await contacts.telephonyWebhook({ eventId: ev(), event: 'call.missed', sessionId: c2.sessionId });

  // ---------------- rewards: scratch one referral card, keep the rest
  const cards = await m.Reward.find({ userId: owner._id }).sort({ createdAt: 1 });
  if (cards[0]) await rewards.scratch(owner._id, cards[0]._id);

  // ---------------- payouts: credit the pending ones so the wallet has money
  const pend = await m.Payout.find({ userId: owner._id, status: 'PENDING' }).sort({ createdAt: 1 });
  if (pend[0]) await referral.creditPayout(pend[0]._id);
  // demo top-up so a withdrawal can be tried right away (labelled in the ledger)
  await require('../src/services/ledger.service').credit(owner._id, 1245000, 'ADJUSTMENT', { refType: 'SeedDemo', refId: 'demo-balance', note: 'Demo balance' });

  // ---------------- KYC + bank + one completed withdrawal
  const fresh = await m.User.findById(owner._id);
  await wallet.submitKyc(fresh, { panNumber: 'ABCDE1234F', nameOnPan: 'Shubham Maurya' });
  await wallet.saveBank(await m.User.findById(owner._id), { holderName: 'Shubham Maurya', accountNumber: '50100000000192', confirmAccountNumber: '50100000000192', ifsc: 'HDFC0001234', upiId: 'shubham.demo@okhdfc' });
  const w = await wallet.requestWithdrawal(await m.User.findById(owner._id), { amountPaise: 250000, mode: 'BANK' });
  const wd = await m.Withdrawal.findById(w.id);
  await wallet.payoutWebhook({ eventId: ev(), event: 'payout.processed', providerRef: wd.providerRef, utr: 'HDFCN520261023001' });

  // ---------------- FASTag: credited recharge on the Creta
  const tag = await fastag.lookup(owner, 'TS09EG4321');
  const r = await fastag.createRecharge(owner, { vehicle: 'TS09EG4321', issuerCode: tag.issuerCode, amountPaise: 50000, upiHandle: 'shubham.demo@okhdfc' });
  const pay = payment.simulateCheckout(r.payment.gatewayOrderId);
  await orders.paymentWebhook({ eventId: ev(), event: 'payment.captured', gatewayOrderId: r.payment.gatewayOrderId, gatewayPaymentId: pay.gatewayPaymentId, amountPaise: 50000 });
  const rec = await m.FastagRecharge.findById(r.id);
  await fastag.fastagWebhook({ eventId: ev(), event: 'recharge.credited', providerRef: rec.providerRef });

  // ---------------- documents: one verified RC, one pending insurance
  const docs = require('../src/services/document.service');
  const pdf = { buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'), detectedMime: 'application/pdf', size: 64, originalname: 'rc.pdf' };
  const rc = await docs.upload(owner, { type: 'VEHICLE_RC', number: 'TS09EG4321RC2021', expiryDate: new Date('2037-05-31') }, pdf);
  await docs.adminReview(admin, rc.id, { decision: 'APPROVE' });
  await docs.upload(owner, { type: 'MOTOR_INSURANCE', number: 'POL-3365-2026-77', expiryDate: new Date('2027-03-31') }, pdf);

  // ---------------- support ticket + device
  await require('../src/services/content.service').createTicket(owner, { category: 'QR_LABEL', message: 'How do I move a label to my new car?' });
  await m.Device.create({ userId: owner._id, pushToken: 'demo-fcm-token-0001', platform: 'ANDROID', appVersion: '1.0.0', deviceId: 'demo-device' });

  console.log('\nDemo data ready. Log in with:');
  console.table([
    { role: 'Owner (full demo)', email: 'demo@vtracker.app', password: PASSWORD },
    { role: 'Admin', email: 'admin@vtracker.app', password: PASSWORD },
    { role: 'Team member', email: 'pavan.demo@vtracker.app', password: PASSWORD },
    { role: 'Bystander', email: 'ravi.demo@vtracker.app', password: PASSWORD },
  ]);
  console.log(`Unactivated label to try QR-02 / QR-01: ${labels[1] ? labels[1].qrUuid : '-'}`);
  console.log(`Public scan page data: GET ${env.PUBLIC_BASE_URL}/v1/public/scan/${labels[0].qrUuid}`);
  void t2; void t3;
}

main()
  .then(() => mongoose.disconnect())
  .catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
