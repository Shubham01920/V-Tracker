'use strict';
/**
 * Loaded by every test file (through helpers/api.js). Each test file runs in its own process (node --test),
 * gets its own database on the test MongoDB server, and writes the routes it hit to tests/.artifacts/route-hits.
 */
require('./env');
const fs = require('fs');
const path = require('path');
const { before, after } = require('node:test');
const mongoose = require('mongoose');

const ART = path.resolve(__dirname, '../.artifacts');
const testFile = path.basename(process.argv[1] || 'test.js');

before(async () => {
  const base = process.env.TEST_MONGO_BASE_URI || fs.readFileSync(path.join(ART, 'mongo-uri.txt'), 'utf8').trim();
  const u = new URL(base);
  u.pathname = `/vt_${testFile.replace(/\W+/g, '_').slice(0, 30)}_${process.pid}`;
  const { connectDB } = require('../../src/config/db');
  await connectDB(u.toString());
  await mongoose.connection.dropDatabase();
  // dropDatabase removes indexes too: rebuild them (unique indexes are part of the business rules)
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  await require('../../src/config/bootstrap').ensureReferenceData();
});

after(async () => {
  const out = {};
  for (const [k, v] of global.__ROUTE_HITS__.entries()) out[k] = v;
  fs.mkdirSync(path.join(ART, 'route-hits'), { recursive: true });
  fs.writeFileSync(path.join(ART, 'route-hits', `${testFile}.json`), JSON.stringify(out, null, 2));
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.disconnect();
  }
});
