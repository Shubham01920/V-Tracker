'use strict';
/** Inserts reference data that is missing (never overwrites). Safe to run on every start. */
const fs = require('fs');
const path = require('path');
const ref = require('./referenceData');
const { Product, FastagIssuer, Coupon, Content, Faq, Pincode, Ifsc } = require('../models');
const logger = require('../utils/logger');

const PUBLIC_DIR = path.resolve(__dirname, '../../public/products');
const COLORS = { 'two-wheeler': '#1570EF', 'three-wheeler': '#087443', 'four-wheeler': '#0A1628', commercial: '#6B21A8', package: '#F5A623', 'label-closeup': '#0F1E35', windshield: '#334155' };

function writeProductImages() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  for (const [name, color] of Object.entries(COLORS)) {
    const file = path.join(PUBLIC_DIR, `${name}.svg`);
    if (fs.existsSync(file)) continue;
    const label = name.replace(/-/g, ' ').toUpperCase();
    fs.writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" rx="48" fill="${color}"/><rect x="170" y="130" width="260" height="260" rx="24" fill="#fff"/><g fill="${color}"><rect x="200" y="160" width="70" height="70"/><rect x="330" y="160" width="70" height="70"/><rect x="200" y="290" width="70" height="70"/><rect x="300" y="260" width="30" height="30"/><rect x="350" y="300" width="50" height="60"/></g><text x="300" y="470" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#F5A623" text-anchor="middle">V TRACKER</text><text x="300" y="515" font-family="Arial,sans-serif" font-size="24" fill="#fff" text-anchor="middle">${label}</text></svg>`);
  }
}

async function upsertMissing(Model, rows, key) {
  if (!rows.length) return 0;
  const ops = rows.map((r) => ({ updateOne: { filter: { [key]: r[key] }, update: { $setOnInsert: r }, upsert: true } }));
  const res = await Model.bulkWrite(ops, { ordered: false });
  return res.upsertedCount || 0;
}

async function ensureReferenceData() {
  writeProductImages();
  const counts = {
    products: await upsertMissing(Product, ref.products, 'slug'),
    issuers: await upsertMissing(FastagIssuer, ref.fastagIssuers, 'code'),
    coupons: await upsertMissing(Coupon, ref.coupons, 'code'),
    content: await upsertMissing(Content, ref.content, 'slug'),
    faqs: await upsertMissing(Faq, ref.faqs, 'question'),
    pincodes: await upsertMissing(Pincode, ref.pincodes, 'pincode'),
    ifsc: await upsertMissing(Ifsc, ref.ifsc, 'ifsc'),
  };
  const added = Object.values(counts).reduce((a, b) => a + b, 0);
  if (added) logger.info('Reference data inserted', counts);
  return counts;
}

module.exports = { ensureReferenceData };
