'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, createUser, uniquePhone, uniqueEmail, PASSWORD } = require('./helpers/api');
const outbox = require('../src/services/providers/outbox');

describe('Authentication (AUTH-01..08)', () => {
  test('AUTH-01 register -> AUTH-02 verify OTP returns tokens and user', async () => {
    const phone = uniquePhone();
    const email = uniqueEmail();
    const reg = await api().post('/v1/auth/register').send({ fullName: 'Shubham Maurya', email, phone, password: PASSWORD }).expect(201);
    expect(reg.body.data.userId).toBeDefined();
    expect(reg.body.data.verification).toMatchObject({ resendAfterSec: 0, expiresInSec: 300 });
    expect(reg.body.data.verification.devCode).toMatch(/^\d{6}$/);
    expect(outbox.last('sms', (m) => m.to === phone).text).toContain(reg.body.data.verification.devCode);

    const v = await api().post('/v1/auth/verify-otp').send({ challengeId: reg.body.data.verification.challengeId, code: reg.body.data.verification.devCode }).expect(200);
    expect(v.body.data).toHaveProperty('accessToken');
    expect(v.body.data).toHaveProperty('refreshToken');
    expect(v.body.data.expiresIn).toBe(900);
    expect(v.body.data.user).toMatchObject({ fullName: 'Shubham Maurya', email, phoneVerified: true, kycStatus: 'NOT_SUBMITTED' });
    expect(v.body.data.user.phoneMasked).toBe(`${phone.slice(0, 2)}******${phone.slice(-2)}`);
    expect(v.body.requestId).toBeDefined();
  });

  test('AUTH-01 validation, duplicates and referral codes', async () => {
    const bad = await api().post('/v1/auth/register').send({ fullName: 'A', email: 'nope', phone: '12345', password: 'short' }).expect(422);
    expect(bad.body.error.code).toBe('VALIDATION_FAILED');
    expect([...new Set(bad.body.error.details.map((d) => d.field))].sort()).toEqual(['email', 'fullName', 'password', 'phone']);

    const u = await createUser();
    const dupPhone = await api().post('/v1/auth/register').send({ fullName: 'X Y', email: uniqueEmail(), phone: u.phone, password: PASSWORD }).expect(409);
    expect(dupPhone.body.error.code).toBe('PHONE_TAKEN');
    const dupEmail = await api().post('/v1/auth/register').send({ fullName: 'X Y', email: u.email, phone: uniquePhone(), password: PASSWORD }).expect(409);
    expect(dupEmail.body.error.code).toBe('EMAIL_TAKEN');
    const badRef = await api().post('/v1/auth/register').send({ fullName: 'X Y', email: uniqueEmail(), phone: uniquePhone(), password: PASSWORD, referralCode: 'NOPE1234' }).expect(422);
    expect(badRef.body.error.code).toBe('REFERRAL_INVALID');

    // long TLDs are valid (PDF §3.8 regex bug fixed)
    await api().post('/v1/auth/register').send({ fullName: 'Long Tld', email: `a${Date.now()}@company.technology`, phone: uniquePhone(), password: PASSWORD }).expect(201);
  });

  test('AUTH-01 repeat call for an unverified phone re-sends the OTP', async () => {
    const phone = uniquePhone();
    const email = uniqueEmail();
    const a = await api().post('/v1/auth/register').send({ fullName: 'Repeat User', email, phone, password: PASSWORD }).expect(201);
    const b = await api().post('/v1/auth/register').send({ fullName: 'Repeat User', email, phone, password: PASSWORD }).expect(201);
    expect(b.body.data.userId).toBe(a.body.data.userId);
    expect(b.body.data.verification.challengeId).not.toBe(a.body.data.verification.challengeId);
    // the first challenge is now invalid
    const old = await api().post('/v1/auth/verify-otp').send({ challengeId: a.body.data.verification.challengeId, code: a.body.data.verification.devCode }).expect(400);
    expect(old.body.error.code).toBe('OTP_INVALID');
  });

  test('AUTH-02 wrong code counts attempts and locks after 5', async () => {
    const reg = await api().post('/v1/auth/register').send({ fullName: 'Otp User', email: uniqueEmail(), phone: uniquePhone(), password: PASSWORD }).expect(201);
    const { challengeId, devCode } = reg.body.data.verification;
    const wrong = devCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i += 1) {
      const r = await api().post('/v1/auth/verify-otp').send({ challengeId, code: wrong }).expect(400);
      expect(r.body.error.code).toBe('OTP_INVALID');
    }
    const fifth = await api().post('/v1/auth/verify-otp').send({ challengeId, code: wrong }).expect(429);
    expect(fifth.body.error.code).toBe('OTP_ATTEMPTS_EXCEEDED');
    await api().post('/v1/auth/verify-otp').send({ challengeId, code: devCode }).expect(400);
  });

  test('AUTH-03 login, wrong password, unverified phone and lockout', async () => {
    const u = await createUser();
    const ok = await api().post('/v1/auth/login').send({ email: u.email.toUpperCase(), password: PASSWORD, deviceId: 'pixel-7' }).expect(200);
    expect(ok.body.data.user.id).toBe(u.userId);

    const unknown = await api().post('/v1/auth/login').send({ email: 'nobody@example.com', password: PASSWORD }).expect(401);
    const wrong = await api().post('/v1/auth/login').send({ email: u.email, password: 'Wrong123x' }).expect(401);
    expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(wrong.body.error).toEqual(unknown.body.error);

    const email = uniqueEmail();
    await api().post('/v1/auth/register').send({ fullName: 'Pending User', email, phone: uniquePhone(), password: PASSWORD }).expect(201);
    const pend = await api().post('/v1/auth/login').send({ email, password: PASSWORD }).expect(403);
    expect(pend.body.error.code).toBe('PHONE_NOT_VERIFIED');
    expect(pend.body.error.details[0].verification.challengeId).toBeDefined();

    const victim = await createUser();
    for (let i = 0; i < 4; i += 1) await api().post('/v1/auth/login').send({ email: victim.email, password: 'Wrong123x' }).expect(401);
    const locked = await api().post('/v1/auth/login').send({ email: victim.email, password: 'Wrong123x' }).expect(423);
    expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');
    await api().post('/v1/auth/login').send({ email: victim.email, password: PASSWORD }).expect(423);
  });

  test('AUTH-04 Google sign-in: existing user, new user needs phone', async () => {
    const u = await createUser();
    const linked = await api().post('/v1/auth/google').send({ idToken: `mock:gsub-${u.userId}:${u.email}:Test Owner` }).expect(200);
    expect(linked.body.data.isNewUser).toBe(false);
    expect(linked.body.data.user.id).toBe(u.userId);

    const email = uniqueEmail('google');
    const need = await api().post('/v1/auth/google').send({ idToken: `mock:gsub-new-${Date.now()}:${email}:New Google` }).expect(422);
    expect(need.body.error.code).toBe('PHONE_REQUIRED');
    const created = await api().post('/v1/auth/google').send({ idToken: `mock:gsub-new2-${Date.now()}:${email}:New Google`, phone: uniquePhone() }).expect(200);
    expect(created.body.data.isNewUser).toBe(true);
    expect(created.body.data.verification.challengeId).toBeDefined();
    expect(created.body.data.user.phoneVerified).toBe(false);

    const bad = await api().post('/v1/auth/google').send({ idToken: 'mock:onlysub' }).expect(401);
    expect(bad.body.error.code).toBe('TOKEN_INVALID');
  });

  test('AUTH-05 refresh rotates tokens and detects reuse', async () => {
    const u = await createUser();
    const r1 = await api().post('/v1/auth/refresh').send({ refreshToken: u.refreshToken }).expect(200);
    expect(r1.body.data.refreshToken).not.toBe(u.refreshToken);
    await api().get('/v1/me').set(bearer(r1.body.data.accessToken)).expect(200);

    const reuse = await api().post('/v1/auth/refresh').send({ refreshToken: u.refreshToken }).expect(401);
    expect(reuse.body.error.code).toBe('REFRESH_REUSED');
    // whole family revoked, including the new token
    const after = await api().post('/v1/auth/refresh').send({ refreshToken: r1.body.data.refreshToken }).expect(401);
    expect(['REFRESH_INVALID', 'REFRESH_REUSED']).toContain(after.body.error.code);

    const junk = await api().post('/v1/auth/refresh').send({ refreshToken: 'x'.repeat(40) }).expect(401);
    expect(junk.body.error.code).toBe('REFRESH_INVALID');
  });

  test('AUTH-06 forgot password always 202; AUTH-07 reset revokes sessions', async () => {
    const u = await createUser();
    const unknown = await api().post('/v1/auth/forgot-password').send({ email: 'ghost@example.com' }).expect(202);
    expect(unknown.body.data).toEqual({});
    const f = await api().post('/v1/auth/forgot-password').send({ email: u.email }).expect(202);
    const token = f.body.data.devResetToken;
    expect(outbox.last('email', (m) => m.to === u.email).subject).toMatch(/Reset/);

    const weak = await api().post('/v1/auth/reset-password').send({ token, newPassword: 'abc' }).expect(422);
    expect(weak.body.error.code).toBe('WEAK_PASSWORD');
    await api().post('/v1/auth/reset-password').send({ token, newPassword: 'NewSecret99' }).expect(204);
    const again = await api().post('/v1/auth/reset-password').send({ token, newPassword: 'NewSecret99' }).expect(400);
    expect(again.body.error.code).toBe('TOKEN_INVALID');

    // old access + refresh tokens no longer work
    const old = await api().get('/v1/me').set(bearer(u)).expect(401);
    expect(old.body.error.code).toBe('TOKEN_INVALID');
    await api().post('/v1/auth/refresh').send({ refreshToken: u.refreshToken }).expect(401);
    await api().post('/v1/auth/login').send({ email: u.email, password: 'NewSecret99' }).expect(200);
  });

  test('AUTH-08 logout revokes the refresh token', async () => {
    const u = await createUser();
    await api().post('/v1/auth/logout').send({ refreshToken: u.refreshToken }).expect(401);
    await api().post('/v1/auth/logout').set(bearer(u)).send({ refreshToken: u.refreshToken }).expect(204);
    const r = await api().post('/v1/auth/refresh').send({ refreshToken: u.refreshToken }).expect(401);
    expect(r.body.error.code).toBe('REFRESH_INVALID');
  });

  test('bearer token errors', async () => {
    const none = await api().get('/v1/me').expect(401);
    expect(none.body.error.code).toBe('UNAUTHORIZED');
    const junk = await api().get('/v1/me').set('Authorization', 'Bearer abc.def.ghi').expect(401);
    expect(junk.body.error.code).toBe('TOKEN_INVALID');
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ sub: '0'.repeat(24), tv: 0 }, process.env.JWT_ACCESS_SECRET, { expiresIn: -10, issuer: 'vtracker-api', audience: 'vtracker-app' });
    const e = await api().get('/v1/me').set('Authorization', `Bearer ${expired}`).expect(401);
    expect(e.body.error.code).toBe('TOKEN_EXPIRED');
  });
});
