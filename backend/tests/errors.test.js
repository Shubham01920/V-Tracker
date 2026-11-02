'use strict';
/** Remaining documented error paths, one by one (so every error in api-docs is proven by a test). */
const { describe, test } = require('node:test');
const { expect } = require('expect');
const crypto = require('crypto');
const { api, bearer, idem, createUser, uniquePhone, uniqueEmail, PASSWORD, placePaidOrder, protectedVehicle, createVehicle, addAddress, productBySlug, PNG } = require('./helpers/api');
const { OtpChallenge, PasswordReset, QrLabel, Product, ContactEvent } = require('../src/models');
const business = require('../src/config/business');
const fastagProvider = require('../src/services/providers/fastag.provider');
const { signAccessToken } = require('../src/utils/generateToken');

describe('Documented error paths', () => {
  test('auth: OTP_EXPIRED, Google PHONE_TAKEN, reset TOKEN_EXPIRED, profile EMAIL_TAKEN', async () => {
    const reg = await api().post('/v1/auth/register').send({ fullName: 'Late User', email: uniqueEmail(), phone: uniquePhone(), password: PASSWORD }).expect(201);
    await OtpChallenge.updateOne({ challengeId: reg.body.data.verification.challengeId }, { expiresAt: new Date(Date.now() - 1000) });
    const exp = await api().post('/v1/auth/verify-otp').send({ challengeId: reg.body.data.verification.challengeId, code: reg.body.data.verification.devCode }).expect(410);
    expect(exp.body.error.code).toBe('OTP_EXPIRED');

    const u = await createUser();
    const g = await api().post('/v1/auth/google').send({ idToken: `mock:g-${Date.now()}:${uniqueEmail('g')}:G User`, phone: u.phone }).expect(409);
    expect(g.body.error.code).toBe('PHONE_TAKEN');

    const f = await api().post('/v1/auth/forgot-password').send({ email: u.email }).expect(202);
    await PasswordReset.updateMany({ userId: u.userId }, { expiresAt: new Date(Date.now() - 1000) });
    const te = await api().post('/v1/auth/reset-password').send({ token: f.body.data.devResetToken, newPassword: 'Another123' }).expect(410);
    expect(te.body.error.code).toBe('TOKEN_EXPIRED');

    const other = await createUser();
    const et = await api().patch('/v1/me').set(bearer(u)).send({ email: other.email }).expect(409);
    expect(et.body.error.code).toBe('EMAIL_TAKEN');
  });

  test('vehicles / qr / contacts / public', async () => {
    const owner = await createUser();
    const v = await createVehicle(owner);
    await api().delete('/v1/vehicles/0123456789abcdef01234567/qr').set(bearer(owner)).expect(404);
    const qnf = await api().post('/v1/qr/activate').set(bearer(owner)).send({ qrUuid: crypto.randomUUID(), vehicleId: v.id }).expect(404);
    expect(qnf.body.error.code).toBe('QR_NOT_FOUND');

    const { vehicleRef, label } = await protectedVehicle(owner);
    const self = await api().post('/v1/contacts/alert').set(bearer(owner)).send({ vehicleRef, reason: 'OTHER' }).expect(422);
    expect(self.body.error.code).toBe('CANNOT_CONTACT_SELF');

    const caller = await createUser();
    for (let i = 0; i < 3; i += 1) await api().post('/v1/contacts/call').set(bearer(caller)).send({ vehicleRef }).expect(202);
    const rl = await api().post('/v1/contacts/call').set(bearer(caller)).send({ vehicleRef }).expect(429);
    expect(rl.body.error.code).toBe('RATE_LIMITED');
    expect(rl.headers['retry-after']).toBe('3600');
    const calls = await api().get('/v1/calls').set(bearer(owner)).expect(200);
    await api().post(`/v1/calls/${calls.body.data.items[0].id}/block`).set(bearer(owner)).expect(200);
    await ContactEvent.deleteMany({ callerUserId: caller.userId });
    const blk = await api().post('/v1/contacts/alert').set(bearer(caller)).send({ vehicleRef, reason: 'OTHER' }).expect(403);
    expect(blk.body.error.code).toBe('CONTACT_BLOCKED');

    const { User } = require('../src/models');
    const caller2 = await createUser();
    await User.updateOne({ _id: owner.userId }, { phoneVerified: false, alertPhoneVerified: false });
    const un = await api().post('/v1/contacts/call').set(bearer(caller2)).send({ vehicleRef }).expect(409);
    expect(un.body.error.code).toBe('OWNER_UNAVAILABLE');
    await User.updateOne({ _id: owner.userId }, { phoneVerified: true, alertPhoneVerified: true });

    const cap = await api().post(`/v1/public/scan/${label.qrUuid}/alert`).send({ reason: 'OTHER', captchaToken: 'fail' }).expect(400);
    expect(cap.body.error.code).toBe('CAPTCHA_FAILED');
    const rnf = await api().post(`/v1/public/scan/${crypto.randomUUID()}/report`).send({ kind: 'MISUSE' }).expect(404);
    expect(rnf.body.error.code).toBe('QR_NOT_FOUND');
    await QrLabel.updateOne({ qrUuid: label.qrUuid }, { status: 'INACTIVE' });
    const gone = await api().get(`/v1/public/scan/${label.qrUuid}`).expect(410);
    expect(gone.body.error.code).toBe('QR_INACTIVE');
    const gone2 = await api().post(`/v1/public/scan/${label.qrUuid}/alert`).send({ reason: 'OTHER', captchaToken: 'ok' }).expect(410);
    expect(gone2.body.error.code).toBe('QR_INACTIVE');
  });

  test('cart / checkout / order', async () => {
    const u = await createUser();
    const nf = await api().put('/v1/cart/items/0123456789abcdef01234567').set(bearer(u)).send({ qty: 1 }).expect(404);
    expect(nf.body.error.code).toBe('NOT_FOUND');

    const four = await productBySlug('four-wheeler-qr-label');
    await api().put(`/v1/cart/items/${four._id}`).set(bearer(u)).send({ qty: 1 }).expect(200);
    const a = await addAddress(u, { pincode: '799999' });
    business.nonServiceablePincodes.push('799999');
    const ns = await api().get('/v1/checkout/summary').query({ addressId: a.id }).set(bearer(u)).expect(422);
    expect(ns.body.error.code).toBe('ADDRESS_NOT_SERVICEABLE');
    business.nonServiceablePincodes.pop();

    const { Coupon } = require('../src/models');
    await Coupon.create({ code: 'EXPIREDX', type: 'FLAT', value: 1000, validTo: new Date(Date.now() - 1000) });
    await Coupon.create({ code: 'FULLX', type: 'FLAT', value: 1000, usageLimit: 1, usedCount: 1 });
    expect((await api().get('/v1/checkout/summary').query({ couponCode: 'EXPIREDX' }).set(bearer(u)).expect(422)).body.error.code).toBe('COUPON_EXPIRED');
    expect((await api().get('/v1/checkout/summary').query({ couponCode: 'FULLX' }).set(bearer(u)).expect(422)).body.error.code).toBe('COUPON_LIMIT');

    const s = await api().get('/v1/checkout/summary').query({ addressId: a.id }).set(bearer(u)).expect(200);
    await api().delete(`/v1/addresses/${a.id}`).set(bearer(u)).expect(204);
    const noAddr = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: a.id, expectedTotalPaise: s.body.data.totalPaise }).expect(404);
    expect(noAddr.body.error.code).toBe('NOT_FOUND');
    const u2 = await createUser();
    await api().put(`/v1/cart/items/${four._id}`).set(bearer(u2)).send({ qty: 1 }).expect(200);
    const s2 = await api().get('/v1/checkout/summary').set(bearer(u2)).expect(200);
    const req = await api().post('/v1/orders').set(bearer(u2)).set(idem()).send({ addressId: '0123456789abcdef01234567', expectedTotalPaise: s2.body.data.totalPaise }).expect(404);
    expect(req.body.error.code).toBe('NOT_FOUND');
    // ADDRESS_REQUIRED: the summary has no default address and the order cannot be placed without one
    const { Address } = require('../src/models');
    const a2 = await addAddress(u2);
    await Address.deleteOne({ _id: a2.id });
    const ar = await require('../src/services/order.service').createOrder({ _id: require('mongoose').Types.ObjectId.createFromHexString(u2.userId), pointsBalance: 0 }, { expectedTotalPaise: s2.body.data.totalPaise }).catch((e) => e);
    expect(ar.code).toBe('ADDRESS_REQUIRED');

    const a3 = await addAddress(u2);
    await Product.updateOne({ _id: four._id }, { stock: 0 });
    const oos = await api().post('/v1/orders').set(bearer(u2)).set(idem()).send({ addressId: a3.id, expectedTotalPaise: s2.body.data.totalPaise }).expect(409);
    expect(oos.body.error.code).toBe('OUT_OF_STOCK');
    await Product.updateOne({ _id: four._id }, { stock: 5000 });
  });

  test('wallet re-auth, FASTag provider errors, document size', async () => {
    const u = await createUser();
    const { User } = require('../src/models');
    const user = await User.findById(u.userId);
    const stale = signAccessToken({ userId: user._id, role: user.role, sid: 's', tokenVersion: user.tokenVersion, authTime: Math.floor(Date.now() / 1000) - 7200 });
    const re = await api().post('/v1/withdrawals').set(bearer(stale)).set(idem()).send({ amountPaise: 60000 }).expect(401);
    expect(re.body.error.code).toBe('REAUTH_REQUIRED');

    const car = await createVehicle(u);
    const bike = await createVehicle(u, { type: 'TWO_WHEELER' });
    const orig = fastagProvider.lookup;
    fastagProvider.lookup = async () => { throw new Error('aggregator down'); };
    const down = await api().get('/v1/fastag/lookup').query({ vehicle: car.registrationNumber }).set(bearer(u)).expect(503);
    expect(down.body.error.code).toBe('PROVIDER_UNAVAILABLE');
    fastagProvider.lookup = orig;
    const stranger = await createUser();
    const notOwned = await api().post('/v1/fastag/recharge').set(bearer(stranger)).set(idem()).send({ vehicle: car.registrationNumber, issuerCode: 'ICICI', amountPaise: 20000 }).expect(403);
    expect(notOwned.body.error.code).toBe('VEHICLE_NOT_OWNED');
    const noTag = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: bike.registrationNumber, issuerCode: 'ICICI', amountPaise: 20000 }).expect(404);
    expect(noTag.body.error.code).toBe('FASTAG_NOT_FOUND');

    const big = await api().post('/v1/documents').set(bearer(u)).field('type', 'PUC').field('number', 'PUC1234').field('consent', 'true')
      .attach('file', Buffer.concat([PNG, Buffer.alloc(10 * 1024 * 1024 + 10)]), { filename: 'big.png', contentType: 'image/png' }).expect(413);
    expect(big.body.error.code).toBe('FILE_TOO_LARGE');
  });
});
