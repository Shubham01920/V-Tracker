'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, createUser, placePaidOrder } = require('./helpers/api');
const outbox = require('../src/services/providers/outbox');
const { Device } = require('../src/models');

describe('Notifications (NOT-01..04) and devices (DEV-01..02)', () => {
  test('DEV-01 register device (upsert), pushes reach it, DEV-02 remove', async () => {
    const u = await createUser();
    const d = await api().post('/v1/devices').set(bearer(u)).send({ pushToken: 'fcm-token-abcdefghijk-1', platform: 'android', appVersion: '1.0.0', deviceId: 'pixel-7' }).expect(201);
    expect(d.body.data).toMatchObject({ platform: 'ANDROID', appVersion: '1.0.0' });
    const again = await api().post('/v1/devices').set(bearer(u)).send({ pushToken: 'fcm-token-abcdefghijk-1', platform: 'ANDROID', appVersion: '1.0.1' }).expect(201);
    expect(again.body.data.id).toBe(d.body.data.id);
    expect(await Device.countDocuments({ userId: u.userId })).toBe(1);

    await placePaidOrder(u, { deliver: false });
    const push = outbox.last('push', (p) => p.tokens.includes('fcm-token-abcdefghijk-1'));
    expect(push.title).toBe('Payment successful');

    await api().post('/v1/devices').set(bearer(u)).send({ pushToken: 'short', platform: 'NOKIA' }).expect(422);
    await api().delete(`/v1/devices/${d.body.data.id}`).set(bearer(u)).expect(204);
    await api().delete(`/v1/devices/${d.body.data.id}`).set(bearer(u)).expect(404);
  });

  test('NOT-04 unread count, NOT-01 list, NOT-02 read one, NOT-03 read all', async () => {
    const u = await createUser();
    await placePaidOrder(u); // payment, shipped, delivered => 3 notifications
    const c1 = await api().get('/v1/notifications/unread-count').set(bearer(u)).expect(200);
    expect(c1.body.data.count).toBeGreaterThanOrEqual(3);
    const list = await api().get('/v1/notifications').query({ limit: 2 }).set(bearer(u)).expect(200);
    expect(list.body.data.items).toHaveLength(2);
    expect(list.body.meta.hasMore).toBe(true);
    expect(list.body.data.items[0]).toHaveProperty('deepLink');
    await api().patch(`/v1/notifications/${list.body.data.items[0].id}/read`).set(bearer(u)).expect(204);
    const c2 = await api().get('/v1/notifications/unread-count').set(bearer(u)).expect(200);
    expect(c2.body.data.count).toBe(c1.body.data.count - 1);
    await api().post('/v1/notifications/read-all').set(bearer(u)).expect(204);
    const c3 = await api().get('/v1/notifications/unread-count').set(bearer(u)).expect(200);
    expect(c3.body.data.count).toBe(0);
    const other = await createUser();
    await api().patch(`/v1/notifications/${list.body.data.items[1].id}/read`).set(bearer(other)).expect(404);
  });
});
