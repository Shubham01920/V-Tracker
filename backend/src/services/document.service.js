'use strict';
/**
 * Document vault (DOC-*). Files are AES-256-GCM encrypted at rest, numbers are encrypted, every access is logged,
 * and downloads use short-lived HMAC-signed links (PDF §4.11.3).
 */
const fs = require('fs/promises');
const path = require('path');
const archiver = require('archiver');
const { PassThrough } = require('stream');
const env = require('../config/env');
const { Document, ExportJob } = require('../models');
const ApiError = require('../utils/ApiError');
const { encrypt, encryptBuffer, decryptBuffer, hmac, safeEqual, randomToken } = require('../utils/crypto');
const { notify } = require('./notification.service');
const logger = require('../utils/logger');

const TYPE_LABELS = {
  VEHICLE_RC: 'Vehicle Registration (RC)', FASTAG_CERTIFICATE: 'FASTag Certificate', MOTOR_INSURANCE: 'Motor Insurance', PUC: 'PUC Certificate', DRIVING_LICENCE: 'Driving Licence',
};
const EXT = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };
const LINK_TTL_SEC = 5 * 60;

const maskNumber = (n) => {
  const s = String(n).replace(/\s+/g, '');
  return s.length <= 4 ? '****' : `${'*'.repeat(Math.min(8, s.length - 4))}${s.slice(-4)}`;
};

const absPath = (key) => {
  const p = path.resolve(env.UPLOAD_DIR, key);
  if (!p.startsWith(path.resolve(env.UPLOAD_DIR))) throw new ApiError('FORBIDDEN', 'Invalid file path');
  return p;
};

async function writeEncrypted(key, buffer) {
  const p = absPath(key);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, encryptBuffer(buffer));
}

const readDecrypted = async (key) => decryptBuffer(await fs.readFile(absPath(key)));

function present(d) {
  const expired = d.expiryDate && d.expiryDate < new Date();
  return {
    id: String(d._id), type: d.type, typeLabel: TYPE_LABELS[d.type], numberMasked: d.numberMasked,
    status: expired && d.status === 'VERIFIED' ? 'EXPIRED' : d.status, expiryDate: d.expiryDate || null,
    file: d.file ? { mime: d.file.mime, size: d.file.size } : null, rejectionReason: d.rejectionReason || null, createdAt: d.createdAt,
  };
}

async function list(user, { type }) {
  const q = { userId: user._id };
  if (type) q.type = type;
  const rows = await Document.find(q).sort({ createdAt: -1 });
  return rows.map(present);
}

async function upload(user, body, file) {
  if (!TYPE_LABELS[body.type]) throw new ApiError('DOCUMENT_TYPE_INVALID', `type must be one of ${Object.keys(TYPE_LABELS).join(', ')}`, [{ field: 'type', issue: 'invalid' }]);
  const ext = EXT[file.detectedMime];
  const storageKey = `documents/${user._id}/${randomToken(16)}.${ext}.enc`;
  await writeEncrypted(storageKey, file.buffer);
  const d = await Document.create({
    userId: user._id, type: body.type, numberEnc: encrypt(body.number), numberMasked: maskNumber(body.number), expiryDate: body.expiryDate || undefined,
    file: { storageKey, mime: file.detectedMime, size: file.size, originalName: String(file.originalname || `document.${ext}`).slice(0, 120) },
    consentAt: new Date(), accessLog: [{ at: new Date(), action: 'UPLOAD', by: user._id }],
  });
  return { id: String(d._id), status: d.status, numberMasked: d.numberMasked, type: d.type };
}

// ---------------------------------------------------------------- signed links
function signLink(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(env.FILE_URL_SECRET, body)}`;
}

function readLink(token) {
  const [body, sig] = String(token).split('.');
  if (!body || !sig || !safeEqual(hmac(env.FILE_URL_SECRET, body), sig)) throw new ApiError('FORBIDDEN', 'Invalid download link');
  const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (p.exp < Math.floor(Date.now() / 1000)) throw new ApiError('TOKEN_EXPIRED', 'Download link has expired', undefined, 410);
  return p;
}

async function downloadUrl(user, id) {
  const d = await Document.findOne({ _id: id, userId: user._id });
  if (!d || !d.file || !d.file.storageKey) throw ApiError.notFound('Document');
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SEC;
  const name = `${d.type.toLowerCase()}-${d.numberMasked.slice(-4)}.${EXT[d.file.mime] || 'bin'}`;
  const token = signLink({ k: d.file.storageKey, m: d.file.mime, n: name, exp, d: String(d._id) });
  await Document.updateOne({ _id: d._id }, { $push: { accessLog: { $each: [{ at: new Date(), action: 'DOWNLOAD_LINK', by: user._id }], $slice: -100 } } });
  return { url: `${env.PUBLIC_BASE_URL}${env.API_PREFIX}/files/${token}`, expiresAt: new Date(exp * 1000) };
}

/** GET /v1/files/:token — serves the decrypted file for a valid, unexpired signed link. */
async function serveFile(token) {
  const p = readLink(token);
  const buffer = await readDecrypted(p.k).catch(() => { throw ApiError.notFound('File'); });
  if (p.d) Document.updateOne({ _id: p.d }, { $push: { accessLog: { $each: [{ at: new Date(), action: 'DOWNLOAD' }], $slice: -100 } } }).catch(() => {});
  return { buffer, mime: p.m, name: p.n };
}

// ---------------------------------------------------------------- DOC-04 export
async function runExport(jobId) {
  const job = await ExportJob.findByIdAndUpdate(jobId, { status: 'RUNNING' }, { returnDocument: 'after' });
  try {
    const docs = await Document.find({ userId: job.userId, status: 'VERIFIED' });
    const archive = archiver('zip', { zlib: { level: 9 } });
    const out = new PassThrough();
    const chunks = [];
    out.on('data', (c) => chunks.push(c));
    const done = new Promise((resolve, reject) => { out.on('end', resolve); archive.on('error', reject); });
    archive.pipe(out);
    for (const d of docs) {
      const buf = await readDecrypted(d.file.storageKey);
      archive.append(buf, { name: `${d.type.toLowerCase()}-${d.numberMasked.slice(-4)}-${String(d._id).slice(-6)}.${EXT[d.file.mime] || 'bin'}` });
    }
    await archive.finalize();
    await done;
    const storageKey = `exports/${job.userId}/${randomToken(12)}.zip.enc`;
    await writeEncrypted(storageKey, Buffer.concat(chunks));
    await ExportJob.updateOne({ _id: job._id }, { status: 'READY', storageKey, documentCount: docs.length, readyAt: new Date() });
    const exp = Math.floor(Date.now() / 1000) + 24 * 3600;
    const url = `${env.PUBLIC_BASE_URL}${env.API_PREFIX}/files/${signLink({ k: storageKey, m: 'application/zip', n: 'vtracker-documents.zip', exp })}`;
    await notify(job.userId, { type: 'DOCUMENT', title: 'Your documents are ready', body: `${docs.length} verified document(s) bundled. Link valid for 24 hours.`, deepLink: url, data: { jobId: String(job._id), url } });
  } catch (e) {
    logger.error('document export failed', { jobId: String(jobId), err: e.message });
    await ExportJob.updateOne({ _id: jobId }, { status: 'FAILED', error: e.message });
  }
}

async function startExport(user) {
  const count = await Document.countDocuments({ userId: user._id, status: 'VERIFIED' });
  if (!count) throw new ApiError('NO_VERIFIED_DOCUMENTS', 'You have no verified documents to download yet');
  const job = await ExportJob.create({ userId: user._id, status: 'QUEUED' });
  setImmediate(() => { runExport(job._id).catch(() => {}); });
  return { jobId: String(job._id), status: 'QUEUED', documentCount: count };
}

async function exportStatus(user, jobId) {
  const job = await ExportJob.findOne({ _id: jobId, userId: user._id });
  if (!job) throw ApiError.notFound('Export');
  const out = { jobId: String(job._id), status: job.status, documentCount: job.documentCount || null, readyAt: job.readyAt || null, url: null, expiresAt: null };
  if (job.status === 'READY') {
    const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SEC;
    out.url = `${env.PUBLIC_BASE_URL}${env.API_PREFIX}/files/${signLink({ k: job.storageKey, m: 'application/zip', n: 'vtracker-documents.zip', exp })}`;
    out.expiresAt = new Date(exp * 1000);
  }
  return out;
}

// ---------------------------------------------------------------- admin review
async function adminList({ status = 'PENDING_VERIFICATION' }) {
  const rows = await Document.find({ status }).sort({ createdAt: 1 }).limit(200);
  return rows.map((d) => ({ ...present(d), userId: String(d.userId) }));
}

async function adminReview(admin, id, { decision, reason }) {
  const status = decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
  const d = await Document.findOneAndUpdate(
    { _id: id },
    { status, reviewedAt: new Date(), reviewedBy: admin._id, rejectionReason: status === 'REJECTED' ? reason || 'Document could not be verified' : null, $push: { accessLog: { at: new Date(), action: `REVIEW_${status}`, by: admin._id } } },
    { returnDocument: 'after' },
  );
  if (!d) throw ApiError.notFound('Document');
  await notify(d.userId, {
    type: 'DOCUMENT', title: status === 'VERIFIED' ? 'Document verified' : 'Document rejected',
    body: `${TYPE_LABELS[d.type]} ${status === 'VERIFIED' ? 'is verified' : `was rejected: ${d.rejectionReason}`}`, deepLink: 'vtracker://documents',
  });
  return present(d);
}

module.exports = { list, upload, downloadUrl, serveFile, startExport, exportStatus, runExport, adminList, adminReview, maskNumber, TYPE_LABELS };
