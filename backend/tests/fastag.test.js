'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, idem, createUser, createVehicle, webhook } = require('./helpers/api');
const payment = require('../src/services/providers/payment.provider');
const { FastagRecharge } = require('../src/models');

describe('FASTag (FST-01..06)', () => {
  test('FST-01 issuers; FST-02 lookup only for own 4W/commercial; FST-03 transactions', async () => {
    const u = await createUser();
    const iss = await api().get('/v1/fastag/issuers').set(bearer(u)).expect(200);
    expect(iss.body.data.items).toHaveLength(7);
    expect(iss.body.data.items[0]).toEqual({ code: 'ICICI', name: 'ICICI Bank' });

    const car = await createVehicle(u);
    const bike = await createVehicle(u, { type: 'TWO_WHEELER' });
    const l = await api().get('/v1/fastag/lookup').query({ vehicle: car.registrationNumber }).set(bearer(u)).expect(200);
    expect(l.body.data).toMatchObject({ vehicle: car.registrationNumber, status: 'ACTIVE' });
    expect(l.body.data.balancePaise).toBeGreaterThan(0);
    expect(l.body.data.tagId).toMatch(/^34161FA8203/);
    const none = await api().get('/v1/fastag/lookup').query({ vehicle: bike.registrationNumber }).set(bearer(u)).expect(404);
    expect(none.body.error.code).toBe('FASTAG_NOT_FOUND');
    const stranger = await createUser();
    const probe = await api().get('/v1/fastag/lookup').query({ vehicle: car.registrationNumber }).set(bearer(stranger)).expect(403);
    expect(probe.body.error.code).toBe('VEHICLE_NOT_OWNED');

    const tx = await api().get(`/v1/fastag/vehicles/${car.registrationNumber}/transactions`).set(bearer(u)).expect(200);
    expect(tx.body.data.items).toHaveLength(3);
    expect(tx.body.data.items[0]).toMatchObject({ kind: 'TOLL' });
    await api().get(`/v1/fastag/vehicles/${car.registrationNumber}/transactions`).set(bearer(stranger)).expect(403);
  });

  test('FST-04 recharge -> payment webhook -> FST-06 credited; FST-05 status; limits', async () => {
    const u = await createUser();
    const car = await createVehicle(u);
    const tag = (await api().get('/v1/fastag/lookup').query({ vehicle: car.registrationNumber }).set(bearer(u)).expect(200)).body.data;
    const before = tag.balancePaise;
    const issuer = tag.issuerCode;
    const wrong = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: car.registrationNumber, issuerCode: issuer === 'ICICI' ? 'HDFC' : 'ICICI', amountPaise: 20000 }).expect(422);
    expect(wrong.body.error.details[0]).toMatchObject({ issue: 'issuer_mismatch', expected: issuer });
    const low = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: car.registrationNumber, issuerCode: issuer, amountPaise: 5000 }).expect(422);
    expect(low.body.error.code).toBe('BELOW_MINIMUM');
    const high = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: car.registrationNumber, issuerCode: issuer, amountPaise: 5000000 }).expect(422);
    expect(high.body.error.code).toBe('ABOVE_MAXIMUM');

    const r = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: car.registrationNumber.toLowerCase(), issuerCode: issuer, amountPaise: 50000, upiHandle: 'owner@okicici' }).expect(201);
    expect(r.body.data).toMatchObject({ status: 'PENDING_PAYMENT', amountPaise: 50000, payment: { method: 'UPI', upiHandle: 'owner@okicici' } });
    const pay = payment.simulateCheckout(r.body.data.payment.gatewayOrderId);
    await webhook('payment', { event: 'payment.captured', gatewayOrderId: r.body.data.payment.gatewayOrderId, gatewayPaymentId: pay.gatewayPaymentId, amountPaise: 50000 }).expect(200);
    const s1 = await api().get(`/v1/fastag/recharge/${r.body.data.id}`).set(bearer(u)).expect(200);
    expect(s1.body.data.status).toBe('PAID');

    const rec = await FastagRecharge.findById(r.body.data.id);
    await webhook('fastag', { event: 'recharge.credited', providerRef: rec.providerRef }).expect(200);
    const s2 = await api().get(`/v1/fastag/recharge/${r.body.data.id}`).set(bearer(u)).expect(200);
    expect(s2.body.data.status).toBe('CREDITED');
    const after = await api().get('/v1/fastag/lookup').query({ vehicle: car.registrationNumber }).set(bearer(u)).expect(200);
    expect(after.body.data.balancePaise).toBe(before + 50000);
    const tx = await api().get(`/v1/fastag/vehicles/${car.registrationNumber}/transactions`).set(bearer(u)).expect(200);
    expect(tx.body.data.items[0]).toMatchObject({ kind: 'RECHARGE', amountPaise: 50000 });

    // failed credit path
    const r2 = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: car.registrationNumber, issuerCode: issuer, amountPaise: 20000 }).expect(201);
    await webhook('payment', { event: 'payment.captured', gatewayOrderId: r2.body.data.payment.gatewayOrderId, gatewayPaymentId: 'pay_x', amountPaise: 20000 }).expect(200);
    const rec2 = await FastagRecharge.findById(r2.body.data.id);
    await webhook('fastag', { event: 'recharge.failed', providerRef: rec2.providerRef, reason: 'Tag blacklisted' }).expect(200);
    const s3 = await api().get(`/v1/fastag/recharge/${r2.body.data.id}`).set(bearer(u)).expect(200);
    expect(s3.body.data).toMatchObject({ status: 'FAILED', failureReason: 'Tag blacklisted' });

    const other = await createUser();
    await api().get(`/v1/fastag/recharge/${r.body.data.id}`).set(bearer(other)).expect(404);
    const badIssuer = await api().post('/v1/fastag/recharge').set(bearer(u)).set(idem()).send({ vehicle: car.registrationNumber, issuerCode: 'NOPE', amountPaise: 20000 }).expect(422);
    expect(badIssuer.body.error.code).toBe('VALIDATION_FAILED');
  });
});
