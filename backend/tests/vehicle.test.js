'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const crypto = require('crypto');
const { api, bearer, createUser, placePaidOrder, createVehicle, uniqueReg, protectedVehicle, webhook } = require('./helpers/api');
const outbox = require('../src/services/providers/outbox');
const { ContactEvent, QrLabel } = require('../src/models');

describe('Vehicles (VEH-01..05)', () => {
  test('VEH-02 create with normalisation; VEH-01 list; duplicates and format', async () => {
    const u = await createUser();
    const reg = uniqueReg('FOUR_WHEELER');
    const spaced = `${reg.slice(0, 2)} ${reg.slice(2, 4)} ${reg.slice(4, 6)} ${reg.slice(6)}`.toLowerCase();
    const v = await api().post('/v1/vehicles').set(bearer(u)).send({ registrationNumber: spaced, type: 'FOUR_WHEELER', model: 'Hyundai Creta', color: 'White' }).expect(201);
    expect(v.body.data).toMatchObject({ registrationNumber: reg, type: 'FOUR_WHEELER', qr: null });
    const other = await createUser();
    const dup = await api().post('/v1/vehicles').set(bearer(other)).send({ registrationNumber: reg, type: 'FOUR_WHEELER' }).expect(409);
    expect(dup.body.error.code).toBe('VEHICLE_EXISTS');
    const bad = await api().post('/v1/vehicles').set(bearer(u)).send({ registrationNumber: 'HELLO123', type: 'FOUR_WHEELER' }).expect(422);
    expect(bad.body.error.code).toBe('VALIDATION_FAILED');
    await api().post('/v1/vehicles').set(bearer(u)).send({ registrationNumber: '22BH1234AB', type: 'FOUR_WHEELER' }).expect(201);
    await createVehicle(u, { type: 'TWO_WHEELER', model: 'Honda Activa' });
    const list = await api().get('/v1/vehicles').set(bearer(u)).expect(200);
    expect(list.body.data.items).toHaveLength(3);
    expect(list.body.meta.total).toBe(3);
    const otherList = await api().get('/v1/vehicles').set(bearer(other)).expect(200);
    expect(otherList.body.data.items).toHaveLength(0);
  });

  test('QR-01 status states, QR-02 activation rules, VEH-03 detail, VEH-04 unlink + re-bind', async () => {
    const u = await createUser();
    const notShipped = await placePaidOrder(u, { deliver: false });
    const label0 = notShipped.order.qrLabels[0];
    const car = await createVehicle(u);
    const early = await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: label0.qrUuid, vehicleId: car.id }).expect(422);
    expect(early.body.error.code).toBe('QR_NOT_ELIGIBLE');

    const { order } = await placePaidOrder(u);
    const label = order.qrLabels[0];
    const st = await api().get(`/v1/qr/${label.qrUuid}/status`).set(bearer(u)).expect(200);
    expect(st.body.data).toMatchObject({ state: 'UNACTIVATED', canActivate: true, vehicleType: 'FOUR_WHEELER' });

    const stranger = await createUser();
    const steal = await api().post('/v1/qr/activate').set(bearer(stranger)).send({ qrUuid: label.qrUuid, vehicleId: car.id }).expect(422);
    expect(steal.body.error.code).toBe('QR_NOT_ELIGIBLE');
    const bike = await createVehicle(u, { type: 'TWO_WHEELER' });
    const wrongType = await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: label.qrUuid, vehicleId: bike.id }).expect(422);
    expect(wrongType.body.error.message).toMatch(/four wheeler/);

    const act = await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: label.qrUuid, vehicleId: car.id }).expect(200);
    expect(act.body.data).toMatchObject({ vehicleId: car.id, qrStatus: 'ACTIVE', qrCode: label.code });
    expect(act.body.data.rewardId).toBeTruthy();
    const again = await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: label.qrUuid, vehicleId: car.id }).expect(409);
    expect(again.body.error.code).toBe('QR_ALREADY_ACTIVE');

    const own = await api().get(`/v1/qr/${label.qrUuid}/status`).set(bearer(u)).expect(200);
    expect(own.body.data).toMatchObject({ state: 'ACTIVE_OWN', vehicleId: car.id });
    const anon = await api().get(`/v1/qr/${label.qrUuid}/status`).expect(200);
    expect(anon.body.data.state).toBe('ACTIVE_OTHER');
    expect(anon.body.data.vehicleRef).toMatch(/^vr_/);
    expect(anon.body.data.maskedPlate).not.toContain(car.registrationNumber.slice(4, 6));
    await api().get(`/v1/qr/${crypto.randomUUID()}/status`).expect(404);
    await api().get('/v1/qr/not-a-uuid/status').expect(422);

    await api().get(`/v1/public/scan/${label.qrUuid}`).expect(200);
    const det = await api().get(`/v1/vehicles/${car.id}`).set(bearer(u)).expect(200);
    expect(det.body.data.qr).toMatchObject({ code: label.code, status: 'ACTIVE', scanCount30d: 1 });
    await api().get(`/v1/vehicles/${car.id}`).set(bearer(stranger)).expect(404);

    // second label cannot go on a vehicle that already has one
    const second = order.qrLabels.length > 1 ? order.qrLabels[1] : (await placePaidOrder(u)).order.qrLabels[0];
    const hasQr = await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: second.qrUuid, vehicleId: car.id }).expect(409);
    expect(hasQr.body.error.code).toBe('VEHICLE_HAS_QR');

    await api().delete(`/v1/vehicles/${car.id}/qr`).set(bearer(u)).expect(204);
    const none = await api().delete(`/v1/vehicles/${car.id}/qr`).set(bearer(u)).expect(409);
    expect(none.body.error.code).toBe('QR_NOT_LINKED');
    const rebind = await api().post('/v1/qr/activate').set(bearer(u)).send({ qrUuid: label.qrUuid, vehicleId: car.id }).expect(200);
    expect(rebind.body.data.rewardId).toBeNull(); // activation reward only once per label

    await QrLabel.updateOne({ qrUuid: second.qrUuid }, { status: 'INACTIVE' });
    const inv = await api().get(`/v1/qr/${second.qrUuid}/status`).expect(200);
    expect(inv.body.data.state).toBe('INVALID');
  });

  test('VEH-05 lookup returns a safe summary only (no owner identity)', async () => {
    const owner = await createUser({ fullName: 'Sandeep Bhai' });
    const { vehicle } = await protectedVehicle(owner);
    const finder = await createUser();
    const r = await api().get('/v1/vehicles/lookup').query({ reg: vehicle.registrationNumber.toLowerCase() }).set(bearer(finder)).expect(200);
    expect(r.body.data).toMatchObject({ type: 'FOUR_WHEELER', hasActiveTag: true, isOwn: false, actions: ['CALL', 'ALERT'] });
    const text = JSON.stringify(r.body);
    expect(text).not.toContain('Sandeep');
    expect(text).not.toContain(owner.phone);
    expect(text).not.toContain(owner.email);
    const nf = await api().get('/v1/vehicles/lookup').query({ reg: 'MH12ZZ9999' }).set(bearer(finder)).expect(404);
    expect(nf.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Contacts (CON-01..02), public scan (PUB-01..04), calls (CAL-01..03)', () => {
  test('CON-01 app call, CAL-03 telephony webhook, CAL-01/02 history, block', async () => {
    const owner = await createUser();
    const { vehicleRef, vehicle } = await protectedVehicle(owner);
    const caller = await createUser();
    const self = await api().post('/v1/contacts/call').set(bearer(owner)).send({ vehicleRef }).expect(422);
    expect(self.body.error.code).toBe('CANNOT_CONTACT_SELF');

    const c = await api().post('/v1/contacts/call').set(bearer(caller)).send({ vehicleRef, reason: 'BLOCKING_ROAD' }).expect(202);
    expect(c.body.data).toMatchObject({ status: 'RINGING' });
    expect(c.body.data.sessionId).toMatch(/^cs_/);
    expect(outbox.last('calls', (x) => x.sessionId === c.body.data.sessionId).ownerLast4).toBe(owner.phone.slice(-4));

    await webhook('telephony', { event: 'call.completed', sessionId: c.body.data.sessionId, durationSec: 62 }).expect(200);
    const list = await api().get('/v1/calls').set(bearer(owner)).expect(200);
    expect(list.body.data.items[0]).toMatchObject({ kind: 'CALL', outcome: 'ANSWERED', reason: 'BLOCKING_ROAD', durationSec: 62, channel: 'APP' });
    expect(list.body.data.items[0].vehicle.registrationNumber).toBe(vehicle.registrationNumber);
    expect(JSON.stringify(list.body)).not.toContain(caller.phone);

    const c2 = await api().post('/v1/contacts/call').set(bearer(caller)).send({ vehicleRef, reason: 'EMERGENCY' }).expect(202);
    await webhook('telephony', { event: 'call.missed', sessionId: c2.body.data.sessionId }).expect(200);
    const missed = await api().get('/v1/calls').query({ type: 'MISSED' }).set(bearer(owner)).expect(200);
    expect(missed.body.data.items).toHaveLength(1);
    const emerg = await api().get('/v1/calls').query({ type: 'EMERGENCY' }).set(bearer(owner)).expect(200);
    expect(emerg.body.data.items).toHaveLength(1);

    const detail = await api().get(`/v1/calls/${missed.body.data.items[0].id}`).set(bearer(owner)).expect(200);
    expect(detail.body.data).toMatchObject({ outcome: 'MISSED', canBlock: true, isBlocked: false });
    await api().get(`/v1/calls/${missed.body.data.items[0].id}`).set(bearer(caller)).expect(404);

    // per-caller limit: 3 per vehicle per hour
    await api().post('/v1/contacts/alert').set(bearer(caller)).send({ vehicleRef, reason: 'LIGHTS_ON' }).expect(202);
    const limited = await api().post('/v1/contacts/alert').set(bearer(caller)).send({ vehicleRef, reason: 'LIGHTS_ON' }).expect(429);
    expect(limited.body.error.code).toBe('RATE_LIMITED');

    await api().post(`/v1/calls/${detail.body.data.id}/block`).set(bearer(owner)).expect(200);
    await ContactEvent.deleteMany({ callerUserId: caller.userId }); // clear the hourly limit
    const blocked = await api().post('/v1/contacts/call').set(bearer(caller)).send({ vehicleRef }).expect(403);
    expect(blocked.body.error.code).toBe('CONTACT_BLOCKED');
  });

  test('CON-02 app alert reaches owner as notification + SMS', async () => {
    const owner = await createUser();
    const { vehicleRef } = await protectedVehicle(owner);
    const caller = await createUser();
    const a = await api().post('/v1/contacts/alert').set(bearer(caller)).send({ vehicleRef, reason: 'LIGHTS_ON', note: 'Headlights on since morning' }).expect(202);
    expect(a.body.data.alertId).toBeDefined();
    expect(outbox.last('sms', (m) => m.to === owner.phone && m.kind === 'CONTACT_ALERT').text).toMatch(/Lights are left on/);
    const n = await api().get('/v1/notifications').set(bearer(owner)).expect(200);
    expect(n.body.data.items[0]).toMatchObject({ type: 'CONTACT_ALERT', read: false });
    await api().post('/v1/contacts/alert').set(bearer(caller)).send({ vehicleRef: 'vr_doesnotexist123', reason: 'OTHER' }).expect(404);
  });

  test('PUB-01..04 public web page: no owner data, captcha, inactive labels', async () => {
    const owner = await createUser({ fullName: 'Rahul Verma' });
    const { label } = await protectedVehicle(owner);
    const p = await api().get(`/v1/public/scan/${label.qrUuid}`).expect(200);
    expect(p.body.data).toMatchObject({ active: true, vehicleType: 'FOUR_WHEELER', actions: ['CALL', 'ALERT', 'REPORT'] });
    expect(p.body.data.reasons.map((r) => r.code)).toContain('EMERGENCY');
    expect(JSON.stringify(p.body)).not.toMatch(/Rahul|@|98\d{8}/);

    const noCaptcha = await api().post(`/v1/public/scan/${label.qrUuid}/call`).send({ callerPhone: '9123456780', captchaToken: 'fail' }).expect(400);
    expect(noCaptcha.body.error.code).toBe('CAPTCHA_FAILED');
    const call = await api().post(`/v1/public/scan/${label.qrUuid}/call`).send({ callerPhone: '9123456780', captchaToken: 'ok', reason: 'EMERGENCY' }).expect(202);
    expect(call.body.data.sessionId).toBeDefined();
    const alert = await api().post(`/v1/public/scan/${label.qrUuid}/alert`).send({ reason: 'BLOCKING_ROAD', captchaToken: 'ok' }).expect(202);
    expect(alert.body.data.alertId).toBeDefined();
    const rep = await api().post(`/v1/public/scan/${label.qrUuid}/report`).send({ kind: 'LABEL_DAMAGED', note: 'Half torn' }).expect(202);
    expect(rep.body.data.reportId).toBeDefined();
    const hist = await api().get('/v1/calls').set(bearer(owner)).expect(200);
    expect(hist.body.data.items.map((i) => i.channel)).toEqual(['WEB', 'WEB']);

    // unactivated label: page works, call is refused
    const u2 = await createUser();
    const { order } = await placePaidOrder(u2);
    const fresh = order.qrLabels[0];
    const pf = await api().get(`/v1/public/scan/${fresh.qrUuid}`).expect(200);
    expect(pf.body.data).toMatchObject({ active: false, actions: ['REPORT'], maskedPlate: null });
    const inactive = await api().post(`/v1/public/scan/${fresh.qrUuid}/call`).send({ callerPhone: '9123456780', captchaToken: 'ok' }).expect(410);
    expect(inactive.body.error.code).toBe('QR_INACTIVE');
    await api().get(`/v1/public/scan/${crypto.randomUUID()}`).expect(404);

    // owner without a verified number is unavailable for calls
    const { User } = require('../src/models');
    await User.updateOne({ _id: owner.userId }, { phoneVerified: false, alertPhoneVerified: false });
    const un = await api().post(`/v1/public/scan/${label.qrUuid}/call`).send({ callerPhone: '9123456781', captchaToken: 'ok' }).expect(409);
    expect(un.body.error.code).toBe('OWNER_UNAVAILABLE');
  });
});
