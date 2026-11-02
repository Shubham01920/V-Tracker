'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, createUser, uniquePhone, PNG, PDF } = require('./helpers/api');

describe('Profile (PRF-01..03)', () => {
  test('PRF-01 returns the profile with masked phones', async () => {
    const u = await createUser({ fullName: 'Basavarajappa K' });
    const r = await api().get('/v1/me').set(bearer(u)).expect(200);
    expect(r.body.data).toMatchObject({ id: u.userId, fullName: 'Basavarajappa K', email: u.email, phoneVerified: true, alertPhoneVerified: true, kycStatus: 'NOT_SUBMITTED' });
    expect(r.body.data.referralCode).toMatch(/^VT[A-Z0-9]{6}$/);
    expect(r.body.data.memberId).toMatch(/^VT\d+$/);
    expect(JSON.stringify(r.body.data)).not.toContain(u.phone);
  });

  test('PRF-02 updates fields; phone change needs OTP before it applies', async () => {
    const u = await createUser();
    const r = await api().patch('/v1/me').set(bearer(u)).send({ fullName: 'Renamed Owner', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', locality: 'Koramangala' }).expect(200);
    expect(r.body.data).toMatchObject({ fullName: 'Renamed Owner', city: 'Bengaluru', pincode: '560034', locality: 'Koramangala' });
    expect(r.body.data.verification).toBeUndefined();

    const newPhone = uniquePhone();
    const p = await api().patch('/v1/me').set(bearer(u)).send({ phone: newPhone }).expect(200);
    expect(p.body.data.pendingPhoneVerification).toBe(true);
    expect(p.body.data.phoneLast4).toBe(u.phone.slice(-4)); // not applied yet
    const v = await api().post('/v1/auth/verify-otp').send({ challengeId: p.body.data.verification.phone.challengeId, code: p.body.data.verification.phone.devCode }).expect(200);
    expect(v.body.data.purpose).toBe('PHONE_CHANGE');
    const me = await api().get('/v1/me').set(bearer(u)).expect(200);
    expect(me.body.data.phoneLast4).toBe(newPhone.slice(-4));
    expect(me.body.data.pendingPhoneVerification).toBe(false);

    const alert = uniquePhone();
    const a = await api().patch('/v1/me').set(bearer(u)).send({ alertPhone: alert }).expect(200);
    await api().post('/v1/auth/verify-otp').send({ challengeId: a.body.data.verification.alertPhone.challengeId, code: a.body.data.verification.alertPhone.devCode }).expect(200);
    const me2 = await api().get('/v1/me').set(bearer(u)).expect(200);
    expect(me2.body.data.alertPhoneMasked.endsWith(alert.slice(-2))).toBe(true);

    const other = await createUser();
    const taken = await api().patch('/v1/me').set(bearer(u)).send({ phone: other.phone }).expect(409);
    expect(taken.body.error.code).toBe('PHONE_TAKEN');
    const empty = await api().patch('/v1/me').set(bearer(u)).send({}).expect(422);
    expect(empty.body.error.code).toBe('VALIDATION_FAILED');
  });

  test('PRF-03 avatar upload accepts images only', async () => {
    const u = await createUser();
    const r = await api().post('/v1/me/avatar').set(bearer(u)).attach('file', PNG, { filename: 'me.png', contentType: 'image/png' }).expect(200);
    expect(r.body.data.avatarUrl).toMatch(/\/uploads\/avatars\/.+\.png$/);
    const path = new URL(r.body.data.avatarUrl).pathname;
    await api().get(path).expect(200).expect('Content-Type', /png/);
    const bad = await api().post('/v1/me/avatar').set(bearer(u)).attach('file', PDF, { filename: 'x.png', contentType: 'image/png' }).expect(415);
    expect(bad.body.error.code).toBe('UNSUPPORTED_TYPE');
    const none = await api().post('/v1/me/avatar').set(bearer(u)).expect(422);
    expect(none.body.error.code).toBe('FILE_REQUIRED');
    const big = await api().post('/v1/me/avatar').set(bearer(u)).attach('file', Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024 + 10)]), { filename: 'big.png', contentType: 'image/png' }).expect(413);
    expect(big.body.error.code).toBe('FILE_TOO_LARGE');
  });
});

describe('Addresses (ADR-01..04)', () => {
  const addr = (o = {}) => ({ name: 'Shubham Maurya', phone: '9876543210', label: 'HOME', line1: 'Flat 302, Cyber Towers', line2: 'Madhapur', pincode: '500081', city: 'Hyderabad', state: 'Telangana', ...o });

  test('ADR-02 first address becomes default; only one default at a time', async () => {
    const u = await createUser();
    const a = await api().post('/v1/addresses').set(bearer(u)).send(addr()).expect(201);
    expect(a.body.data.isDefault).toBe(true);
    const b = await api().post('/v1/addresses').set(bearer(u)).send(addr({ label: 'OFFICE', isDefault: true })).expect(201);
    expect(b.body.data.isDefault).toBe(true);
    const list = await api().get('/v1/addresses').set(bearer(u)).expect(200);
    expect(list.body.data.items).toHaveLength(2);
    expect(list.body.data.items.filter((x) => x.isDefault)).toHaveLength(1);
    expect(list.body.data.items[0].id).toBe(b.body.data.id);

    const noPhone = await api().post('/v1/addresses').set(bearer(u)).send(addr({ phone: undefined })).expect(422);
    expect(noPhone.body.error.details[0].field).toBe('phone');
  });

  test('ADR-03 update / promote and ADR-04 delete promotes another default', async () => {
    const u = await createUser();
    const a = (await api().post('/v1/addresses').set(bearer(u)).send(addr()).expect(201)).body.data;
    const b = (await api().post('/v1/addresses').set(bearer(u)).send(addr({ label: 'OFFICE' })).expect(201)).body.data;
    const up = await api().patch(`/v1/addresses/${b.id}`).set(bearer(u)).send({ line1: 'Plot 7, Hitech City', isDefault: true }).expect(200);
    expect(up.body.data).toMatchObject({ line1: 'Plot 7, Hitech City', isDefault: true });
    await api().delete(`/v1/addresses/${b.id}`).set(bearer(u)).expect(204);
    const list = await api().get('/v1/addresses').set(bearer(u)).expect(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0]).toMatchObject({ id: a.id, isDefault: true });
    const nf = await api().delete(`/v1/addresses/${b.id}`).set(bearer(u)).expect(404);
    expect(nf.body.error.code).toBe('NOT_FOUND');
    // another user cannot touch it
    const other = await createUser();
    await api().patch(`/v1/addresses/${a.id}`).set(bearer(other)).send({ line1: 'Hack street' }).expect(404);
    await api().patch('/v1/addresses/not-an-id').set(bearer(u)).send({ line1: 'x y z' }).expect(422);
  });

  test('ADR-02 limit of 10 addresses', async () => {
    const u = await createUser();
    for (let i = 0; i < 10; i += 1) await api().post('/v1/addresses').set(bearer(u)).send(addr({ line1: `House ${i + 1}, Main Road` })).expect(201);
    const r = await api().post('/v1/addresses').set(bearer(u)).send(addr()).expect(409);
    expect(r.body.error.code).toBe('LIMIT_REACHED');
  });
});
