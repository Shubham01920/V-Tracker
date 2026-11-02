'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, createUser, placePaidOrder } = require('./helpers/api');

describe('Content, support, config, lookups (CNT-01, SUP-01..03, CFG-01, LKP-01)', () => {
  test('CNT-01 about / privacy / terms are versioned', async () => {
    for (const slug of ['about', 'privacy', 'terms']) {
      const r = await api().get(`/v1/content/${slug}`).expect(200);
      expect(r.body.data).toMatchObject({ slug, version: '2026-07' });
      expect(r.body.data.blocks.length).toBeGreaterThan(2);
    }
    const nf = await api().get('/v1/content/cookies').expect(404);
    expect(nf.body.error.code).toBe('NOT_FOUND');
    await api().get('/v1/content/..%2Fetc').expect(422);
  });

  test('SUP-01 FAQs, SUP-02 contact, SUP-03 ticket', async () => {
    const f = await api().get('/v1/support/faqs').expect(200);
    expect(f.body.data.items).toHaveLength(5);
    expect(f.body.data.items[0].order).toBe(1);
    const c = await api().get('/v1/support/contact').expect(200);
    expect(c.body.data).toHaveProperty('email');
    expect(c.body.data).toHaveProperty('hours');

    const u = await createUser();
    await api().post('/v1/support/tickets').send({ category: 'ORDER', message: 'Where is my label?' }).expect(401);
    const { orderId } = await placePaidOrder(u, { deliver: false });
    const t = await api().post('/v1/support/tickets').set(bearer(u)).send({ category: 'ORDER', message: 'My label has not arrived yet', orderId }).expect(201);
    expect(t.body.data).toMatchObject({ status: 'OPEN' });
    expect(t.body.data.ticketNumber).toMatch(/^VT-\d+$/);
    const short = await api().post('/v1/support/tickets').set(bearer(u)).send({ category: 'ORDER', message: 'hi' }).expect(422);
    expect(short.body.error.code).toBe('VALIDATION_FAILED');
    const other = await createUser();
    const foreign = await api().post('/v1/support/tickets').set(bearer(other)).send({ category: 'ORDER', message: 'Someone else order here', orderId }).expect(422);
    expect(foreign.body.error.details[0].field).toBe('orderId');
  });

  test('CFG-01 config works without a token', async () => {
    const r = await api().get('/v1/config').expect(200);
    expect(r.body.data).toMatchObject({ minAppVersion: '1.0.0', maintenance: false, minWithdrawPaise: 50000, currency: 'INR' });
    expect(r.body.data.featureFlags.referralPayouts).toBe(true);
  });

  test('LKP-01 pincode lookup', async () => {
    const u = await createUser();
    const r = await api().get('/v1/lookup/pincode/560034').set(bearer(u)).expect(200);
    expect(r.body.data).toMatchObject({ pincode: '560034', city: 'Bengaluru', state: 'Karnataka' });
    const nf = await api().get('/v1/lookup/pincode/799999').set(bearer(u)).expect(404);
    expect(nf.body.error.code).toBe('PINCODE_NOT_FOUND');
    await api().get('/v1/lookup/pincode/12345').set(bearer(u)).expect(422);
    await api().get('/v1/lookup/pincode/560034').expect(401);
  });
});
