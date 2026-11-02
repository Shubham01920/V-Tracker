#!/usr/bin/env node
'use strict';
/**
 * Test runner (works on Windows, macOS, Linux):
 *   npm test                       -> all tests + endpoint coverage check (every one of the 90 endpoints must be hit)
 *   npm test -- auth shop          -> only tests/auth.test.js and tests/shop.test.js
 *   npm run test:only              -> all tests, no coverage check
 *
 * MongoDB: uses TEST_MONGO_URI when set (e.g. mongodb://127.0.0.1:27017), otherwise starts an in-memory server
 * with mongodb-memory-server (downloads mongod once; set MONGOMS_SYSTEM_BINARY to reuse an installed mongod).
 */
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

// async spawn: the in-memory mongod pipes its log to this process, so the event loop must keep running
const run = (cmd, argv, opts) => new Promise((resolve) => { spawn(cmd, argv, opts).on('exit', (code) => resolve(code)); });

const ROOT = path.resolve(__dirname, '..');
const ART = path.join(ROOT, 'tests', '.artifacts');
const args = process.argv.slice(2);
const noCoverage = args.includes('--no-coverage-check');
const filters = args.filter((a) => !a.startsWith('--'));

async function main() {
  fs.rmSync(path.join(ART, 'route-hits'), { recursive: true, force: true });
  fs.mkdirSync(path.join(ART, 'route-hits'), { recursive: true });

  let server = null;
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const opts = process.env.MONGOMS_SYSTEM_BINARY ? { binary: { systemBinary: process.env.MONGOMS_SYSTEM_BINARY, checkMD5: false } } : {};
    console.log('Starting in-memory MongoDB ...');
    server = await MongoMemoryServer.create(opts);
    uri = server.getUri();
  }
  fs.writeFileSync(path.join(ART, 'mongo-uri.txt'), uri);

  let files = fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => f.endsWith('.test.js')).sort();
  if (filters.length) files = files.filter((f) => filters.some((x) => f.includes(x)));
  if (!files.length) { console.error('No test files matched'); process.exit(1); }

  const status = await run(process.execPath, ['--test', '--test-concurrency=1', '--test-reporter=spec', ...files.map((f) => path.join('tests', f))], {
    cwd: ROOT, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', TEST_MONGO_BASE_URI: uri },
  });
  if (server) await server.stop();
  if (status !== 0) process.exit(status || 1);

  if (!noCoverage && !filters.length) {
    const c = spawnSync(process.execPath, [path.join(__dirname, 'check-endpoint-coverage.js')], { cwd: ROOT, stdio: 'inherit' });
    process.exit(c.status || 0);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
