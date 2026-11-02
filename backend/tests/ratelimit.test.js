'use strict';
/** Rate limiting is switched off in the other test files; this file runs with it ON (PDF §6.8). */
require('./helpers/env');
process.env.RATE_LIMIT_ENABLED = 'true';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const crypto = require('crypto');
const { api, bearer, createUser, uniqueEmail, uniquePhone, PASSWORD, protectedVehicle } = require('./helpers/api');

describe('Rate limits', () => {
  test('auth endpoints: 30 per 15 min per IP', async () => {
    let last;
    for (let i = 0; i < 31; i += 1) last = await api().post('/v1/auth/forgot-password').send({ email: uniqueEmail() });
    expect(last.status).toBe(429);
    expect(last.body.error.code).toBe('RATE_LIMITED');
    expect(last.headers['retry-after']).toBeDefined();
    const reg = await api().post('/v1/auth/register').send({ fullName: 'Limited User', email: uniqueEmail(), phone: uniquePhone(), password: PASSWORD });
    expect(reg.status).toBe(429);
  });

  test('public scan actions: 10 per hour per IP; plate lookups 60 per hour', async () => {
    // createUser uses the auth limiter, which is exhausted above; use the OTP/verify path via the service instead
    const authService = require('../src/services/auth.service');
    const mk = async () => {
      const r = await authService.register({ fullName: 'Rl Owner', email: uniqueEmail(), phone: uniquePhone(), password: PASSWORD });
      return authService.verifyOtp({ challengeId: r.verification.challengeId, code: r.verification.devCode }, {});
    };
    const owner = await mk();
    owner.userId = owner.user.id;
    const { label, vehicle } = await protectedVehicle(owner);
    let last;
    for (let i = 0; i < 11; i += 1) last = await api().post(`/v1/public/scan/${label.qrUuid}/report`).send({ kind: 'OTHER' });
    expect(last.status).toBe(429);
    const call = await api().post(`/v1/public/scan/${label.qrUuid}/call`).send({ callerPhone: '9123456789', captchaToken: 'ok' });
    expect(call.status).toBe(429);
    const alert = await api().post(`/v1/public/scan/${label.qrUuid}/alert`).send({ reason: 'OTHER', captchaToken: 'ok' });
    expect(alert.status).toBe(429);

    const finder = await mk();
    let l;
    for (let i = 0; i < 61; i += 1) l = await api().get('/v1/vehicles/lookup').query({ reg: vehicle.registrationNumber }).set(bearer(finder));
    expect(l.status).toBe(429);
    expect(l.body.error.code).toBe('RATE_LIMITED');

    // the unauthenticated public page itself allows 30/min
    let p;
    for (let i = 0; i < 31; i += 1) p = await api().get(`/v1/public/scan/${crypto.randomUUID()}`);
    expect(p.status).toBe(429);
  });
});
