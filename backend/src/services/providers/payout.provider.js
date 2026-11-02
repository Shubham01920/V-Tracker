'use strict';
/**
 * Payout + bank verification adapter (e.g. RazorpayX / Cashfree Payouts). Mock driver by default.
 * Final payout result always arrives through the signed webhook WAL-05.
 */
const outbox = require('./outbox');
const { randomToken } = require('../../utils/crypto');

const DRIVER = process.env.PAYOUT_PROVIDER || 'mock';

/** Penny-drop / name-match. Mock: account numbers ending in 0000 fail; registered name = holder name. */
async function verifyBankAccount({ accountNumber, ifsc, holderName }) {
  if (DRIVER !== 'mock') throw new Error(`Payout provider "${DRIVER}" not implemented`);
  if (String(accountNumber).endsWith('0000')) return { ok: false, reason: 'ACCOUNT_INVALID' };
  return { ok: true, registeredName: holderName, providerRef: `fav_${randomToken(8)}`, ifsc };
}

async function createPayout({ amountPaise, mode, accountNumber, ifsc, upiId, reference }) {
  if (DRIVER !== 'mock') throw new Error(`Payout provider "${DRIVER}" not implemented`);
  const providerRef = `pout_${randomToken(10).replace(/[-_]/g, 'x')}`;
  outbox.push('payouts', { providerRef, amountPaise, mode, ifsc, reference, dest: mode === 'UPI' ? 'upi' : `****${String(accountNumber).slice(-4)}`, hasUpi: !!upiId });
  return { providerRef, status: 'PROCESSING' };
}

module.exports = { verifyBankAccount, createPayout };
