#!/usr/bin/env node
'use strict';
/**
 * Builds the API documentation from src/docs/apiCatalogue.js + the real request/response pairs captured
 * by the last `npm test` run (tests/.artifacts/examples.json):
 *
 *   api-docs/endpoints/<ID>.<name>.json        one file per endpoint (90 files)
 *   api-docs/index.json                        list of all endpoints with file names
 *   api-docs/V-Tracker.postman_collection.json import into Postman (tokens are captured automatically)
 *   api-docs/V-Tracker.postman_environment.json
 *
 * Run: npm test   (captures examples)  then  npm run docs:generate
 */
const fs = require('fs');
const path = require('path');
const catalogue = require('../src/docs/apiCatalogue');
const { ERROR_STATUS } = require('../src/constants/errorCodes');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'api-docs');
const EP = path.join(OUT, 'endpoints');
const exFile = path.join(ROOT, 'tests/.artifacts/examples.json');
const examples = fs.existsSync(exFile) ? JSON.parse(fs.readFileSync(exFile, 'utf8')) : {};
const coverageFile = path.join(ROOT, 'tests/.artifacts/coverage-report.json');
const coverage = fs.existsSync(coverageFile) ? Object.fromEntries(JSON.parse(fs.readFileSync(coverageFile, 'utf8')).endpoints.map((e) => [e.id, e])) : {};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Shorten tokens / long strings and long arrays so examples stay readable. */
function tidy(v, key = '') {
  if (Array.isArray(v)) return v.slice(0, 3).map((x) => tidy(x));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tidy(x, k)]));
  if (typeof v === 'string') {
    if (/^(accessToken)$/.test(key)) return `${v.slice(0, 24)}...<JWT>`;
    if (/^(refreshToken|token|devResetToken|signature)$/.test(key)) return `${v.slice(0, 12)}...`;
    if (/\/v1\/files\//.test(v)) return v.replace(/(\/v1\/files\/)[^"?]+/, '$1<signed-token>');
    if (v.length > 300) return `${v.slice(0, 120)}...`;
  }
  return v;
}

const toPostmanPath = (p) => p.replace(/\{(\w+)\}/g, ':$1');
const authHeader = (e) => (['None', 'HMAC'].includes(e.auth) ? {} : e.auth === 'Optional' ? { Authorization: 'Bearer <accessToken> (optional)' } : { Authorization: 'Bearer <accessToken>' });

function headersFor(e) {
  const h = { ...authHeader(e) };
  if (e.method !== 'GET' && e.method !== 'DELETE') h['Content-Type'] = e.bodyType || 'application/json';
  if (/Idempotency-Key/.test(e.auth)) h['Idempotency-Key'] = '<new UUID per new request; reuse it only to retry the same request>';
  if (e.auth === 'HMAC') {
    h['X-Timestamp'] = '<unix seconds>';
    h['X-Signature'] = '<hex HMAC-SHA256 of "<X-Timestamp>.<raw body>" with WEBHOOK_SECRET_<PROVIDER>>';
  }
  h['X-Request-Id'] = '<optional UUID, echoed back>';
  return h;
}

function curl(e, ex) {
  const url = ex && ex.success ? `http://localhost:5000${ex.success.url}` : `http://localhost:5000/v1${e.path}`;
  const parts = [`curl -X ${e.method} "${url}"`];
  if (!['None', 'HMAC'].includes(e.auth)) parts.push('-H "Authorization: Bearer $ACCESS_TOKEN"');
  if (/Idempotency-Key/.test(e.auth)) parts.push('-H "Idempotency-Key: $(uuidgen)"');
  if (e.auth === 'HMAC') parts.push('-H "X-Timestamp: $TS" -H "X-Signature: $SIG"');
  const body = ex && ex.success && ex.success.body && Object.keys(ex.success.body).length ? ex.success.body : null;
  if (e.bodyType === 'multipart/form-data') {
    Object.entries(body || e.body || {}).forEach(([k, v]) => parts.push(k === 'file' ? '-F "file=@/path/to/file"' : `-F "${k}=${typeof v === 'string' && !v.includes('|') ? v : `<${k}>`}"`));
  } else if (body) {
    parts.push('-H "Content-Type: application/json"');
    parts.push(`-d '${JSON.stringify(tidy(body))}'`);
  }
  return parts.join(' \\\n  ');
}

function build(e) {
  const ex = examples[e.id] || {};
  const cov = coverage[e.id];
  const errs = [...new Set([...(e.errors || []), ...Object.keys(ex.errors || {})])].filter((c) => c !== 'ROUTE_NOT_FOUND');
  return {
    id: e.id,
    name: e.name,
    group: e.group,
    method: e.method,
    path: `/v1${e.path}`,
    url: `{{baseUrl}}/v1${e.path}`,
    auth: e.auth,
    webhook: !!e.webhook,
    calledBy: e.screens || [],
    purpose: e.purpose,
    request: {
      headers: headersFor(e),
      pathParams: e.params || {},
      query: e.query || {},
      bodyType: e.method === 'GET' || e.method === 'DELETE' ? null : e.bodyType || 'application/json',
      body: e.body || {},
      example: ex.success ? { url: ex.success.url, headers: ex.success.headers, body: tidy(ex.success.body || {}) } : null,
    },
    responses: {
      success: { status: e.success, example: ex.success ? tidy(ex.success.response) : (e.success === 204 ? null : { data: {}, requestId: '<uuid>' }) },
      errors: errs.map((code) => {
        const real = ex.errors && ex.errors[code];
        return { code, status: real ? real.status : ERROR_STATUS[code] || 400, example: real ? tidy(real.response) : { error: { code, message: '<human readable message>' }, requestId: '<uuid>' }, verifiedByTests: !!real };
      }),
      commonErrors: ['VALIDATION_FAILED (422)', 'UNAUTHORIZED / TOKEN_EXPIRED / TOKEN_INVALID (401)', 'RATE_LIMITED (429)', 'INTERNAL_ERROR (500)'].filter((x) => !(e.auth === 'None' && x.startsWith('UNAUTH'))),
    },
    notes: e.notes || null,
    curl: curl(e, ex),
    testing: cov ? { testedBy: cov.testFiles, statusesSeenInTests: cov.statuses, passed: cov.successStatusSeen } : { testedBy: [], note: 'run npm test to fill this in' },
  };
}

function postmanItem(e, doc) {
  const ex = examples[e.id] || {};
  const headers = [];
  if (!['None', 'HMAC'].includes(e.auth)) headers.push({ key: 'Authorization', value: 'Bearer {{accessToken}}' });
  if (/Idempotency-Key/.test(e.auth)) headers.push({ key: 'Idempotency-Key', value: '{{$guid}}' });
  if (e.auth === 'HMAC') {
    headers.push({ key: 'X-Timestamp', value: '{{webhookTs}}' }, { key: 'X-Signature', value: '{{webhookSig}}' });
  }
  const urlRaw = `{{baseUrl}}/v1${toPostmanPath(e.path)}`;
  const query = Object.keys(e.query || {}).map((k) => {
    let val = '';
    try { val = ex.success ? new URL(`http://x${ex.success.url}`).searchParams.get(k) || '' : ''; } catch { /* */ }
    return { key: k, value: val, disabled: !val };
  });
  const req = {
    method: e.method,
    header: headers,
    url: { raw: urlRaw + (query.filter((q) => !q.disabled).length ? `?${query.filter((q) => !q.disabled).map((q) => `${q.key}=${q.value}`).join('&')}` : ''), host: ['{{baseUrl}}'], path: ['v1', ...toPostmanPath(e.path).split('/').filter(Boolean)], query, variable: Object.keys(e.params || {}).map((k) => ({ key: k, value: `{{${k}}}` })) },
    description: `${e.id} - ${e.purpose}\n\nAuth: ${e.auth}\nCalled by: ${(e.screens || []).join(', ')}`,
  };
  if (e.bodyType === 'multipart/form-data') {
    req.body = { mode: 'formdata', formdata: Object.keys(e.body || {}).map((k) => (k === 'file' ? { key: 'file', type: 'file', src: '' } : { key: k, value: (ex.success && ex.success.body && ex.success.body[k] !== undefined ? String(ex.success.body[k]) : ''), type: 'text' })) };
  } else if (!['GET', 'DELETE'].includes(e.method)) {
    req.body = { mode: 'raw', raw: JSON.stringify(ex.success && ex.success.body ? ex.success.body : Object.fromEntries(Object.keys(e.body || {}).map((k) => [k, ''])), null, 2), options: { raw: { language: 'json' } } };
  }
  const item = { name: `${e.id} ${e.name}`, request: req, response: [] };
  if (doc.responses.success.example) {
    item.response.push({ name: `${e.success} example`, originalRequest: req, status: 'OK', code: e.success, _postman_previewlanguage: 'json', header: [{ key: 'Content-Type', value: 'application/json' }], body: JSON.stringify(doc.responses.success.example, null, 2) });
  }
  const captures = {
    'AUTH-01': ["const d = pm.response.json().data; if (d && d.verification) { pm.collectionVariables.set('challengeId', d.verification.challengeId); if (d.verification.devCode) pm.collectionVariables.set('otpCode', d.verification.devCode); }"],
    'AUTH-02': ["const d = pm.response.json().data; if (d) { pm.collectionVariables.set('accessToken', d.accessToken); pm.collectionVariables.set('refreshToken', d.refreshToken); }"],
    'AUTH-03': ["const d = pm.response.json().data; if (d) { pm.collectionVariables.set('accessToken', d.accessToken); pm.collectionVariables.set('refreshToken', d.refreshToken); }"],
    'AUTH-04': ["const d = pm.response.json().data; if (d && d.accessToken) { pm.collectionVariables.set('accessToken', d.accessToken); pm.collectionVariables.set('refreshToken', d.refreshToken); }"],
    'AUTH-05': ["const d = pm.response.json().data; if (d) { pm.collectionVariables.set('accessToken', d.accessToken); pm.collectionVariables.set('refreshToken', d.refreshToken); }"],
    'AUTH-06': ["const d = pm.response.json().data; if (d && d.devResetToken) pm.collectionVariables.set('resetToken', d.devResetToken);"],
    'ADR-02': ["const d = pm.response.json().data; if (d) { pm.collectionVariables.set('addressId', d.id); pm.collectionVariables.set('id', d.id); }"],
    'VEH-02': ["const d = pm.response.json().data; if (d) pm.collectionVariables.set('vehicleId', d.id);"],
    'VEH-05': ["const d = pm.response.json().data; if (d) pm.collectionVariables.set('vehicleRef', d.vehicleRef);"],
    'SHP-01': ["const d = pm.response.json().data; if (d && d.items[0]) pm.collectionVariables.set('productId', d.items[0].id);"],
    'CHK-01': ["const d = pm.response.json().data; if (d) pm.collectionVariables.set('expectedTotalPaise', d.totalPaise);"],
    'CHK-03': ["const d = pm.response.json().data; if (d) { pm.collectionVariables.set('orderId', d.orderId); pm.collectionVariables.set('gatewayOrderId', d.payment.gatewayOrderId); }"],
    'ORD-02': ["const d = pm.response.json().data; if (d && d.qrLabels && d.qrLabels[0]) pm.collectionVariables.set('qrUuid', d.qrLabels[0].qrUuid);"],
    'RWD-01': ["const d = pm.response.json().data; const c = d && d.items.find(i => i.status === 'UNSCRATCHED'); if (c) pm.collectionVariables.set('rewardId', c.id);"],
    'DEV-01': ["const d = pm.response.json().data; if (d) pm.collectionVariables.set('deviceId', d.id);"],
  };
  if (captures[e.id]) item.event = [{ listen: 'test', script: { type: 'text/javascript', exec: captures[e.id] } }];
  return item;
}

function main() {
  fs.rmSync(EP, { recursive: true, force: true });
  fs.mkdirSync(EP, { recursive: true });
  const index = [];
  const groups = new Map();
  catalogue.forEach((e, i) => {
    const doc = build(e);
    const file = `${String(i + 1).padStart(2, '0')}_${e.id}_${slug(e.name)}.json`;
    fs.writeFileSync(path.join(EP, file), `${JSON.stringify(doc, null, 2)}\n`);
    index.push({ no: i + 1, id: e.id, group: e.group, method: e.method, path: doc.path, auth: e.auth, successStatus: e.success, file: `endpoints/${file}`, tested: doc.testing.passed === true });
    if (!groups.has(e.group)) groups.set(e.group, []);
    groups.get(e.group).push(postmanItem(e, doc));
  });

  fs.writeFileSync(path.join(OUT, 'index.json'), `${JSON.stringify({
    title: 'V Tracker API - endpoint index', version: 'v1', baseUrl: 'http://localhost:5000', total: index.length,
    webhooks: index.filter((x) => x.auth === 'HMAC').length,
    envelope: { success: '{ data, meta?, requestId }', error: '{ error: { code, message, details? }, requestId }' },
    conventions: 'Money: integer paise. Times: ISO-8601 UTC. Enums: UPPER_SNAKE_CASE. Pagination: page, limit (max 100) -> meta { page, limit, total, hasMore }.',
    endpoints: index,
  }, null, 2)}\n`);

  const vars = ['baseUrl', 'accessToken', 'refreshToken', 'challengeId', 'otpCode', 'resetToken', 'id', 'addressId', 'vehicleId', 'vehicleRef', 'qrUuid', 'productId', 'orderId', 'gatewayOrderId', 'expectedTotalPaise', 'rewardId', 'deviceId', 'webhookTs', 'webhookSig'];
  const collection = {
    info: {
      name: 'V Tracker API v1',
      description: 'All 90 endpoints from the V Tracker technical documentation (PDF §6.4). Run AUTH-01 then AUTH-02 (or AUTH-03) first: tokens and ids are saved into collection variables automatically. Webhooks need X-Timestamp/X-Signature: get them from POST /v1/dev/webhooks/sign (development only).',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: vars.map((k) => ({ key: k, value: k === 'baseUrl' ? 'http://localhost:5000' : '' })),
    item: [...groups.entries()].map(([name, items]) => ({ name, item: items })),
  };
  fs.writeFileSync(path.join(OUT, 'V-Tracker.postman_collection.json'), `${JSON.stringify(collection, null, 2)}\n`);
  fs.writeFileSync(path.join(OUT, 'V-Tracker.postman_environment.json'), `${JSON.stringify({ name: 'V Tracker local', values: [{ key: 'baseUrl', value: 'http://localhost:5000', enabled: true }] }, null, 2)}\n`);

  console.log(`Wrote ${index.length} endpoint files to api-docs/endpoints, plus index.json and the Postman collection.`);
  if (!Object.keys(examples).length) console.log('Note: no captured examples found - run `npm test` first for real response examples.');
}

main();
