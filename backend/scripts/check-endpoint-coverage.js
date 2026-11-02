#!/usr/bin/env node
'use strict';
/**
 * Fails unless every endpoint in src/docs/apiCatalogue.js (the 90 endpoints of PDF §6.4) was called by the test
 * suite AND returned its documented success status at least once. Writes tests/.artifacts/coverage-report.json.
 */
const fs = require('fs');
const path = require('path');
const catalogue = require('../src/docs/apiCatalogue');

const ART = path.resolve(__dirname, '../tests/.artifacts');
const dir = path.join(ART, 'route-hits');
const norm = (p) => p.replace(/\{[^}]+\}/g, ':p').replace(/:[A-Za-z_]+/g, ':p').replace(/\/$/, '');

const hits = {};
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const [k, v] of Object.entries(data)) {
    const [method, route] = k.split(' ');
    const key = `${method} ${norm(route)}`;
    hits[key] = hits[key] || { statuses: {}, example: null, errors: {}, files: [] };
    for (const [code, ex] of Object.entries(v.errors || {})) if (!hits[key].errors[code]) hits[key].errors[code] = ex;
    for (const [s, n] of Object.entries(v.statuses)) hits[key].statuses[s] = (hits[key].statuses[s] || 0) + n;
    if (!hits[key].example && v.example) hits[key].example = v.example;
    hits[key].files.push(f.replace('.json', ''));
  }
}

const rows = catalogue.map((e) => {
  const key = `${e.method} ${norm(`/v1${e.path}`)}`;
  const h = hits[key];
  const statuses = h ? Object.keys(h.statuses) : [];
  const okHit = statuses.some((s) => s.startsWith(`${e.success} `));
  const errorCodesSeen = [...new Set(statuses.map((s) => s.split(' ')[1]).filter((c) => c !== 'OK'))];
  return { id: e.id, method: e.method, path: e.path, called: !!h, successStatusSeen: okHit, statuses, errorCodesSeen, testFiles: h ? [...new Set(h.files)] : [] };
});

// real request/response pairs captured during the run, used by scripts/generate-api-docs.js
const examples = {};
catalogue.forEach((e) => { const h = hits[`${e.method} ${norm(`/v1${e.path}`)}`]; if (h) examples[e.id] = { success: h.example, errors: h.errors }; });
fs.writeFileSync(path.join(ART, 'examples.json'), JSON.stringify(examples, null, 2));
fs.writeFileSync(path.join(ART, 'coverage-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), total: rows.length, endpoints: rows }, null, 2));

const missing = rows.filter((r) => !r.called);
const noSuccess = rows.filter((r) => r.called && !r.successStatusSeen);
const errorsTested = rows.reduce((s, r) => s + r.errorCodesSeen.length, 0);
console.log('\n================ ENDPOINT COVERAGE ================');
console.log(`Endpoints in catalogue      : ${rows.length}`);
console.log(`Called by tests             : ${rows.length - missing.length}`);
console.log(`Returned documented success : ${rows.length - missing.length - noSuccess.length}`);
console.log(`Distinct error codes checked: ${errorsTested}`);
if (missing.length) console.log('NOT CALLED:', missing.map((r) => `${r.id} ${r.method} ${r.path}`).join('\n  '));
if (noSuccess.length) console.log('NO SUCCESS RESPONSE:', noSuccess.map((r) => `${r.id} ${r.method} ${r.path} -> ${r.statuses.join(', ')}`).join('\n  '));
console.log('===================================================\n');
process.exit(missing.length || noSuccess.length ? 1 : 0);
