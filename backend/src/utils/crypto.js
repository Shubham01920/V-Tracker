'use strict';
const crypto = require('crypto');
const env = require('../config/env');

const KEY = Buffer.from(env.DATA_ENCRYPTION_KEY, 'hex');

/** AES-256-GCM. Output: base64(iv | tag | ciphertext). */
function encrypt(plain) {
  if (plain === undefined || plain === null || plain === '') return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}

function decrypt(blob) {
  if (!blob) return null;
  const buf = Buffer.from(blob, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', KEY, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8');
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(buffer), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]);
}

function decryptBuffer(buf) {
  const d = crypto.createDecipheriv('aes-256-gcm', KEY, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]);
}

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex');

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const randomDigits = (n) => Array.from({ length: n }, () => crypto.randomInt(0, 10)).join('');
const randomUpper = (n) => {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: n }, () => A[crypto.randomInt(0, A.length)]).join('');
};

module.exports = { encrypt, decrypt, encryptBuffer, decryptBuffer, sha256, hmac, safeEqual, randomToken, randomDigits, randomUpper, uuid: () => crypto.randomUUID() };
