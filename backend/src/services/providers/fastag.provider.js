'use strict';
/**
 * FASTag aggregator adapter (a licensed NPCI/NETC partner is required in production — PDF §5.11).
 * The mock driver keeps tag data in the FastagAccount / FastagTransaction collections.
 *   - Two- and three-wheelers have no FASTag -> not found (matches NHAI rules).
 *   - Four-wheelers / commercial get a tag provisioned on first lookup.
 */
const { FastagAccount, FastagTransaction, FastagIssuer } = require('../../models');
const outbox = require('./outbox');
const { randomToken, sha256 } = require('../../utils/crypto');

const DRIVER = process.env.FASTAG_PROVIDER || 'mock';
const PLAZAS = [
  ['Electronic City Toll', 'Bengaluru, KA'], ['Nelamangala Toll', 'Bengaluru Rural, KA'],
  ['Kherki Daula Toll', 'Gurugram, HR'], ['Khed Shivapur Toll', 'Pune, MH'], ['Panthangi Toll', 'Nalgonda, TS'],
];

async function ensureMockAccount(vehicleNumber, vehicleType) {
  let acc = await FastagAccount.findOne({ vehicleNumber });
  if (acc) return acc;
  if (!['FOUR_WHEELER', 'COMMERCIAL'].includes(vehicleType)) return null;
  const issuers = await FastagIssuer.find({ isActive: true }).sort({ sortOrder: 1 });
  const h = parseInt(sha256(vehicleNumber).slice(0, 8), 16);
  const issuer = issuers.length ? issuers[h % issuers.length] : { code: 'ICICI', name: 'ICICI Bank' };
  try {
    acc = await FastagAccount.create({
      vehicleNumber, issuerCode: issuer.code, issuerName: `${issuer.name} FASTag`,
      tagId: `34161FA8203${String(h).padStart(12, '0').slice(0, 12)}`, status: 'ACTIVE', balancePaise: 20000 + (h % 50) * 1000,
    });
  } catch (e) {
    if (e.code === 11000) return FastagAccount.findOne({ vehicleNumber });
    throw e;
  }
  const now = Date.now();
  await FastagTransaction.insertMany([0, 1, 2].map((i) => ({
    vehicleNumber, kind: 'TOLL', plaza: PLAZAS[(h + i) % PLAZAS.length][0], location: PLAZAS[(h + i) % PLAZAS.length][1],
    amountPaise: 6500 + ((h >> i) % 10) * 500, at: new Date(now - (i + 1) * 86400000 * 2),
  })));
  return acc;
}

async function lookup(vehicleNumber, vehicleType) {
  if (DRIVER !== 'mock') throw new Error(`FASTag provider "${DRIVER}" not implemented`);
  const acc = await ensureMockAccount(vehicleNumber, vehicleType);
  if (!acc) return null;
  return { issuer: acc.issuerName, issuerCode: acc.issuerCode, tagId: acc.tagId, status: acc.status, balancePaise: acc.balancePaise };
}

async function transactions(vehicleNumber, { skip, limit }) {
  const [items, total] = await Promise.all([
    FastagTransaction.find({ vehicleNumber }).sort({ at: -1 }).skip(skip).limit(limit).lean(),
    FastagTransaction.countDocuments({ vehicleNumber }),
  ]);
  return { items, total };
}

async function createRecharge({ vehicleNumber, issuerCode, amountPaise, reference }) {
  if (DRIVER !== 'mock') throw new Error(`FASTag provider "${DRIVER}" not implemented`);
  const providerRef = `ftr_${randomToken(10).replace(/[-_]/g, 'x')}`;
  outbox.push('fastag', { providerRef, vehicleNumber, issuerCode, amountPaise, reference });
  return { providerRef, status: 'PROCESSING' };
}

/** Mock store only: reflect a confirmed credit in the tag balance. A real aggregator owns the balance. */
async function applyMockCredit({ vehicleNumber, amountPaise, refId }) {
  if (DRIVER !== 'mock') return;
  await FastagAccount.updateOne({ vehicleNumber }, { $inc: { balancePaise: amountPaise } });
  await FastagTransaction.create({ vehicleNumber, kind: 'RECHARGE', plaza: 'Recharge via V Tracker', location: 'UPI', amountPaise, refId });
}

module.exports = { lookup, transactions, createRecharge, applyMockCredit };
