'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, createUser, signed } = require('./helpers/api');
const { signPayload, SECRETS } = require('../src/middlewares/webhookSignature.middleware');

describe('Cross-cutting: webhooks, envelope, errors, injection, health', () => {
  test('webhooks reject missing, wrong and stale signatures on all five providers', async () => {
    for (const p of ['telephony', 'payment', 'courier', 'payout', 'fastag']) {
      const none = await api().post(`/v1/webhooks/${p}`).send({ eventId: 'x' }).expect(401);
      expect(none.body.error.code).toBe('SIGNATURE_INVALID');
      const s = signed(p, { eventId: 'x', event: 'noop' });
      await api().post(`/v1/webhooks/${p}`).set({ ...s.headers, 'X-Signature': 'f'.repeat(64) }).send(s.raw).expect(401);
      const old = Math.floor(Date.now() / 1000) - 3600;
      const raw = JSON.stringify({ eventId: 'y' });
      await api().post(`/v1/webhooks/${p}`).set({ 'Content-Type': 'application/json', 'X-Timestamp': String(old), 'X-Signature': signPayload(SECRETS[p](), old, raw) }).send(raw).expect(401);
      // signed but invalid payload -> validation error, nothing processed
      const bad = signed(p, { eventId: 'z', event: 'nonsense' });
      const v = await api().post(`/v1/webhooks/${p}`).set(bad.headers).send(bad.raw).expect(422);
      expect(v.body.error.code).toBe('VALIDATION_FAILED');
    }
    // unknown session is acknowledged (so the provider stops retrying) but ignored
    const s = signed('telephony', { eventId: 'e1', event: 'call.completed', sessionId: 'cs_unknown' });
    const r = await api().post('/v1/webhooks/telephony').set(s.headers).send(s.raw).expect(200);
    expect(r.body.data.ignored).toBe(true);
  });

  test('envelope, request id echo, 404 route, malformed JSON, NoSQL operator stripping', async () => {
    const r = await api().get('/v1/config').set('X-Request-Id', 'abc12345-test-req').expect(200);
    expect(r.body.requestId).toBe('abc12345-test-req');
    expect(r.headers['x-request-id']).toBe('abc12345-test-req');
    const nf = await api().get('/v1/does-not-exist').expect(404);
    expect(nf.body).toMatchObject({ error: { code: 'ROUTE_NOT_FOUND' } });
    const mal = await api().post('/v1/auth/login').set('Content-Type', 'application/json').send('{"email":').expect(400);
    expect(mal.body.error.code).toBe('BAD_REQUEST');
    const u = await createUser();
    const inj = await api().post('/v1/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } }).expect(422);
    expect(inj.body.error.code).toBe('VALIDATION_FAILED');
    const inj2 = await api().patch('/v1/me').set(bearer(u)).send({ fullName: 'Ok Name', $set: { role: 'ADMIN' } }).expect(200);
    expect(inj2.body.data.role).toBe('OWNER');
    const castErr = await api().get('/v1/orders/not-an-id').set(bearer(u)).expect(422);
    expect(castErr.body.error.code).toBe('VALIDATION_FAILED');
  });

  test('health and root', async () => {
    const h = await api().get('/health').expect(200);
    expect(h.body.data).toMatchObject({ status: 'ok', db: 'up' });
    const root = await api().get('/').expect(200);
    expect(root.body.name).toBe('V Tracker API');
  });

  test('dev simulators (non-production only) drive the mock providers', async () => {
    const u = await createUser();
    const sig = await api().post('/v1/dev/webhooks/sign').send({ provider: 'courier', body: { eventId: 'dev-1', orderNumber: 'ORD-0', status: 'SHIPPED' } }).expect(200);
    await api().post('/v1/webhooks/courier').set(sig.body.data.headers).send(sig.body.data.rawBody).expect(200);
    const ob = await api().get('/v1/dev/outbox').expect(200);
    expect(ob.body.data.sms.length).toBeGreaterThan(0);
    const adm = await api().post('/v1/dev/make-admin').send({ email: u.email }).expect(200);
    expect(adm.body.data.role).toBe('ADMIN');
  });
});
