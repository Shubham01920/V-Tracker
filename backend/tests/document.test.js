'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const fs = require('fs');
const path = require('path');
const { api, bearer, createUser, PNG, PDF } = require('./helpers/api');
const { User, Document, ExportJob } = require('../src/models');

const waitFor = async (fn, ms = 5000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 50)); }
  return false;
};

describe('Documents (DOC-01..04) + admin review + signed files', () => {
  test('upload encrypted, list masked, download via signed link, admin review, export ZIP', async () => {
    const u = await createUser();
    const none = await api().post('/v1/documents/export').set(bearer(u)).expect(422);
    expect(none.body.error.code).toBe('NO_VERIFIED_DOCUMENTS');

    const up = await api().post('/v1/documents').set(bearer(u))
      .field('type', 'VEHICLE_RC').field('number', 'MH12AB1234RC0001').field('expiryDate', '2037-05-31').field('consent', 'true')
      .attach('file', PDF, { filename: 'rc.pdf', contentType: 'application/pdf' }).expect(201);
    expect(up.body.data).toMatchObject({ type: 'VEHICLE_RC', status: 'PENDING_VERIFICATION', numberMasked: '********0001' });
    await api().post('/v1/documents').set(bearer(u)).field('type', 'PUC').field('number', 'PUC998877').field('consent', 'true')
      .attach('file', PNG, { filename: 'puc.png', contentType: 'image/png' }).expect(201);

    const noConsent = await api().post('/v1/documents').set(bearer(u)).field('type', 'PUC').field('number', 'PUC998877')
      .attach('file', PNG, { filename: 'puc.png', contentType: 'image/png' }).expect(422);
    expect(noConsent.body.error.details[0].field).toBe('consent');
    const badType = await api().post('/v1/documents').set(bearer(u)).field('type', 'PASSPORT').field('number', 'P1234567').field('consent', 'true')
      .attach('file', PNG, { filename: 'p.png', contentType: 'image/png' }).expect(422);
    expect(badType.body.error.code).toBe('DOCUMENT_TYPE_INVALID');
    const badFile = await api().post('/v1/documents').set(bearer(u)).field('type', 'PUC').field('number', 'PUC1').field('consent', 'true')
      .attach('file', Buffer.from('MZ fake exe'), { filename: 'x.pdf', contentType: 'application/pdf' }).expect(415);
    expect(badFile.body.error.code).toBe('UNSUPPORTED_TYPE');

    // file on disk is encrypted (no %PDF header)
    const doc = await Document.findById(up.body.data.id);
    const onDisk = fs.readFileSync(path.join(process.env.UPLOAD_DIR, doc.file.storageKey));
    expect(onDisk.subarray(0, 4).toString()).not.toBe('%PDF');
    expect(JSON.stringify(doc.toObject())).not.toContain('MH12AB1234RC0001');

    const list = await api().get('/v1/documents').set(bearer(u)).expect(200);
    expect(list.body.data.items).toHaveLength(2);
    const rcOnly = await api().get('/v1/documents').query({ type: 'VEHICLE_RC' }).set(bearer(u)).expect(200);
    expect(rcOnly.body.data.items).toHaveLength(1);
    expect(rcOnly.body.data.items[0]).toMatchObject({ typeLabel: 'Vehicle Registration (RC)', file: { mime: 'application/pdf' } });

    const link = await api().get(`/v1/documents/${up.body.data.id}/download-url`).set(bearer(u)).expect(200);
    expect(new Date(link.body.data.expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(5 * 60 * 1000 + 1000);
    const filePath = new URL(link.body.data.url).pathname;
    const dl = await api().get(filePath).buffer(true).parse((res, cb) => { const c = []; res.on('data', (d) => c.push(d)); res.on('end', () => cb(null, Buffer.concat(c))); }).expect(200);
    expect(dl.headers['content-type']).toBe('application/pdf');
    expect(Buffer.compare(dl.body, PDF)).toBe(0);
    const tampered = await api().get(`${filePath.slice(0, -3)}abc`).expect(403);
    expect(tampered.body.error.code).toBe('FORBIDDEN');
    const other = await createUser();
    await api().get(`/v1/documents/${up.body.data.id}/download-url`).set(bearer(other)).expect(404);

    // admin review
    const admin = await createUser();
    await api().get('/v1/admin/documents').set(bearer(admin)).expect(403);
    await User.updateOne({ _id: admin.userId }, { role: 'ADMIN' });
    const queue = await api().get('/v1/admin/documents').set(bearer(admin)).expect(200);
    expect(queue.body.data.items.length).toBeGreaterThanOrEqual(2);
    const ok = await api().patch(`/v1/admin/documents/${up.body.data.id}`).set(bearer(admin)).send({ decision: 'APPROVE' }).expect(200);
    expect(ok.body.data.status).toBe('VERIFIED');
    const pucId = list.body.data.items.find((i) => i.type === 'PUC').id;
    const rej = await api().patch(`/v1/admin/documents/${pucId}`).set(bearer(admin)).send({ decision: 'REJECT', reason: 'Blurry photo' }).expect(200);
    expect(rej.body.data).toMatchObject({ status: 'REJECTED', rejectionReason: 'Blurry photo' });

    // export
    const ex = await api().post('/v1/documents/export').set(bearer(u)).expect(202);
    expect(ex.body.data).toMatchObject({ status: 'QUEUED', documentCount: 1 });
    expect(await waitFor(async () => (await ExportJob.findById(ex.body.data.jobId)).status === 'READY')).toBe(true);
    const st = await api().get(`/v1/documents/export/${ex.body.data.jobId}`).set(bearer(u)).expect(200);
    expect(st.body.data.status).toBe('READY');
    const zip = await api().get(new URL(st.body.data.url).pathname).buffer(true).parse((res, cb) => { const c = []; res.on('data', (d) => c.push(d)); res.on('end', () => cb(null, Buffer.concat(c))); }).expect(200);
    expect(zip.body.subarray(0, 2).toString()).toBe('PK');
    const n = await api().get('/v1/notifications').set(bearer(u)).expect(200);
    expect(n.body.data.items.some((i) => i.title === 'Your documents are ready')).toBe(true);
  });
});
