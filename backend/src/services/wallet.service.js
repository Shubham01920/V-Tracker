'use strict';
/** Bank account, KYC, wallet and withdrawals (BNK-*, KYC-01, WAL-*). */
const env = require('../config/env');
const business = require('../config/business');
const { BankAccount, Withdrawal, Ifsc } = require('../models');
const ApiError = require('../utils/ApiError');
const { encrypt, decrypt, randomDigits } = require('../utils/crypto');
const { maskUpi, paginate, pageMeta, rupees } = require('../utils/helpers');
const ledger = require('./ledger.service');
const payoutProvider = require('./providers/payout.provider');
const { notify } = require('./notification.service');
const webhook = require('./webhook.service');

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const BANK_CODES = {
  HDFC: 'HDFC Bank', ICIC: 'ICICI Bank', SBIN: 'State Bank of India', UTIB: 'Axis Bank', KKBK: 'Kotak Mahindra Bank', PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda', CNRB: 'Canara Bank', UBIN: 'Union Bank of India', IDFB: 'IDFC FIRST Bank', YESB: 'Yes Bank', INDB: 'IndusInd Bank',
  FDRL: 'Federal Bank', KARB: 'Karnataka Bank', IOBA: 'Indian Overseas Bank', BKID: 'Bank of India', MAHB: 'Bank of Maharashtra', AUBL: 'AU Small Finance Bank',
};

const normName = (s) => String(s || '').toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
function namesMatch(a, b) {
  const x = normName(a).split(' ').filter(Boolean);
  const y = new Set(normName(b).split(' ').filter(Boolean));
  if (!x.length || !y.size) return false;
  const common = x.filter((t) => y.has(t)).length;
  return common >= Math.min(2, Math.min(x.length, y.size));
}

// ---------------------------------------------------------------- BNK-03
async function lookupIfsc(code) {
  const ifsc = String(code).toUpperCase();
  if (!IFSC_RE.test(ifsc)) throw new ApiError('IFSC_INVALID', 'IFSC must look like HDFC0001234');
  const row = await Ifsc.findOne({ ifsc });
  if (row) return { ifsc, bankName: row.bankName, branch: row.branch, city: row.city };
  if (env.IFSC_API_ENABLED) {
    try {
      const r = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (r.ok) {
        const j = await r.json();
        await Ifsc.updateOne({ ifsc }, { ifsc, bankName: j.BANK, branch: j.BRANCH, city: j.CITY }, { upsert: true });
        return { ifsc, bankName: j.BANK, branch: j.BRANCH, city: j.CITY };
      }
      if (r.status === 404) throw new ApiError('IFSC_INVALID', 'IFSC code not found');
    } catch (e) { if (e.isApiError) throw e; }
  }
  const bankName = BANK_CODES[ifsc.slice(0, 4)];
  if (!bankName) throw new ApiError('IFSC_INVALID', 'IFSC code not found');
  return { ifsc, bankName, branch: null, city: null };
}

// ---------------------------------------------------------------- BNK-01 / BNK-02
function presentBank(b) {
  return {
    bankName: b.bankName, accountLast4: b.accountLast4, accountMasked: `XXXX XXXX ${b.accountLast4}`, ifsc: b.ifsc, holderName: b.holderName,
    branch: b.branch || null, upiMasked: b.upiMasked || null, status: b.status, verifiedAt: b.verifiedAt || null,
    cooldownUntil: b.cooldownUntil && b.cooldownUntil > new Date() ? b.cooldownUntil : null,
  };
}

async function getBank(user) {
  const b = await BankAccount.findOne({ userId: user._id });
  if (!b) throw new ApiError('NOT_FOUND', 'No bank account saved yet');
  return presentBank(b);
}

async function saveBank(user, body) {
  if (body.accountNumber !== body.confirmAccountNumber) {
    throw new ApiError('ACCOUNT_MISMATCH', 'Account numbers do not match', [{ field: 'confirmAccountNumber', issue: 'mismatch' }]);
  }
  const info = await lookupIfsc(body.ifsc);
  const expectedName = user.kyc && user.kyc.status === 'VERIFIED' ? user.kyc.nameOnPan : user.fullName;
  if (!namesMatch(body.holderName, expectedName)) {
    throw new ApiError('NAME_MISMATCH', 'Account holder name must match your verified name', [{ field: 'holderName', issue: 'mismatch' }]);
  }
  const verify = await payoutProvider.verifyBankAccount({ accountNumber: body.accountNumber, ifsc: info.ifsc, holderName: body.holderName });
  if (!verify.ok) throw new ApiError('VALIDATION_FAILED', 'The bank could not verify this account', [{ field: 'accountNumber', issue: 'unverifiable' }]);
  if (!namesMatch(verify.registeredName, body.holderName)) throw new ApiError('NAME_MISMATCH', 'Name registered with the bank does not match');

  const existing = await BankAccount.findOne({ userId: user._id });
  const changed = existing && (decrypt(existing.accountNumberEnc) !== body.accountNumber || existing.ifsc !== info.ifsc);
  const doc = {
    userId: user._id, holderName: body.holderName, bankName: body.bankName || info.bankName, accountNumberEnc: encrypt(body.accountNumber),
    accountLast4: body.accountNumber.slice(-4), ifsc: info.ifsc, branch: body.branch || info.branch || undefined,
    upiEnc: body.upiId ? encrypt(body.upiId) : undefined, upiMasked: body.upiId ? maskUpi(body.upiId) : undefined,
    status: env.BANK_AUTO_VERIFY ? 'VERIFIED' : 'PENDING_VERIFICATION', verifiedAt: env.BANK_AUTO_VERIFY ? new Date() : undefined,
    providerRef: verify.providerRef,
  };
  if (changed) doc.cooldownUntil = new Date(Date.now() + business.bankCooldownHours * 3600 * 1000);
  else if (existing) doc.cooldownUntil = existing.cooldownUntil;
  const b = await BankAccount.findOneAndUpdate({ userId: user._id }, { $set: doc, ...(body.upiId ? {} : { $unset: { upiEnc: 1, upiMasked: 1 } }) }, { upsert: true, returnDocument: 'after' });
  if (changed) await notify(user._id, { type: 'SYSTEM', title: 'Bank account changed', body: `Withdrawals are paused for ${business.bankCooldownHours} hours for your security.`, deepLink: 'vtracker://bank' });
  return presentBank(b);
}

// ---------------------------------------------------------------- KYC-01
async function submitKyc(user, { panNumber, nameOnPan }) {
  const pan = String(panNumber).toUpperCase();
  if (!PAN_RE.test(pan)) throw new ApiError('PAN_INVALID', 'Enter a valid PAN, e.g. ABCDE1234F', [{ field: 'panNumber', issue: 'format' }]);
  if (user.kyc && user.kyc.status === 'VERIFIED') return { status: 'VERIFIED', panLast4: user.kyc.panLast4, nameOnPan: user.kyc.nameOnPan };
  const status = env.KYC_AUTO_VERIFY ? 'VERIFIED' : 'PENDING_VERIFICATION';
  user.kyc = { status, panEnc: encrypt(pan), panLast4: pan.slice(-4), nameOnPan: nameOnPan.trim(), submittedAt: new Date(), verifiedAt: status === 'VERIFIED' ? new Date() : undefined };
  await user.save();
  return { status, panLast4: pan.slice(-4), nameOnPan: user.kyc.nameOnPan };
}

// ---------------------------------------------------------------- WAL-01
async function getWallet(user) {
  const [w, b] = await Promise.all([ledger.getWallet(user._id), BankAccount.findOne({ userId: user._id })]);
  return {
    availablePaise: w.availablePaise, heldPaise: w.heldPaise, lifetimeCreditedPaise: w.lifetimeCreditedPaise, lifetimeWithdrawnPaise: w.lifetimeWithdrawnPaise,
    minWithdrawPaise: business.minWithdrawPaise, maxWithdrawPaise: business.maxWithdrawPaise, currency: business.currency,
    kycStatus: (user.kyc && user.kyc.status) || 'NOT_SUBMITTED',
    bankStatus: b ? b.status : 'NOT_SUBMITTED',
    bankCooldownUntil: b && b.cooldownUntil && b.cooldownUntil > new Date() ? b.cooldownUntil : null,
    upiAvailable: !!(b && b.upiEnc),
  };
}

// ---------------------------------------------------------------- WAL-02
async function requestWithdrawal(user, { amountPaise, mode }) {
  if (amountPaise < business.minWithdrawPaise) throw new ApiError('BELOW_MINIMUM', `Minimum withdrawal is ${rupees(business.minWithdrawPaise)}`, [{ field: 'amountPaise', issue: 'min' }]);
  if (amountPaise > business.maxWithdrawPaise) throw new ApiError('ABOVE_MAXIMUM', `Maximum withdrawal is ${rupees(business.maxWithdrawPaise)}`, [{ field: 'amountPaise', issue: 'max' }]);
  if (!user.kyc || user.kyc.status !== 'VERIFIED') throw new ApiError('KYC_REQUIRED', 'Verify your PAN before withdrawing');
  const bank = await BankAccount.findOne({ userId: user._id });
  if (!bank || bank.status !== 'VERIFIED') throw new ApiError('BANK_NOT_VERIFIED', 'Add and verify a bank account first');
  if (bank.cooldownUntil && bank.cooldownUntil > new Date()) throw new ApiError('BANK_COOLDOWN', `Withdrawals resume at ${bank.cooldownUntil.toISOString()} after a bank change`);
  if (mode === 'UPI' && !bank.upiEnc) throw new ApiError('UPI_NOT_SET', 'Add a UPI ID in Bank Details first', [{ field: 'mode', issue: 'upi_missing' }]);

  const txnId = `TXN${Date.now()}${randomDigits(4)}`;
  const w = await Withdrawal.create({
    userId: user._id, txnId, amountPaise, mode, status: 'PENDING',
    bank: { bankName: bank.bankName, accountLast4: bank.accountLast4, ifsc: bank.ifsc, upiMasked: mode === 'UPI' ? bank.upiMasked : undefined },
  });
  try {
    await ledger.hold(user._id, amountPaise, { refType: 'Withdrawal', refId: w._id });
  } catch (e) {
    await Withdrawal.deleteOne({ _id: w._id });
    throw e;
  }
  try {
    const r = await payoutProvider.createPayout({
      amountPaise, mode, accountNumber: decrypt(bank.accountNumberEnc), ifsc: bank.ifsc, upiId: mode === 'UPI' ? decrypt(bank.upiEnc) : undefined, reference: txnId,
    });
    await Withdrawal.updateOne({ _id: w._id }, { providerRef: r.providerRef, status: 'PROCESSING' });
  } catch (e) {
    await ledger.releaseHold(user._id, amountPaise, { refType: 'Withdrawal', refId: w._id });
    await Withdrawal.updateOne({ _id: w._id }, { status: 'FAILED', failureReason: 'Payout provider unavailable' });
    throw new ApiError('PROVIDER_UNAVAILABLE', 'Payouts are temporarily unavailable. Your balance was not changed.');
  }
  return { id: String(w._id), txnId, status: 'PENDING', amountPaise, mode };
}

// ---------------------------------------------------------------- WAL-03 / WAL-04
function presentWithdrawal(w, full = false) {
  const out = {
    id: String(w._id), txnId: w.txnId, amountPaise: w.amountPaise, mode: w.mode,
    status: w.status === 'PROCESSING' ? 'PENDING' : w.status, bank: { bankName: w.bank.bankName, accountLast4: w.bank.accountLast4, upiMasked: w.bank.upiMasked || null },
    createdAt: w.createdAt, completedAt: w.completedAt || null,
  };
  if (full) { out.utr = w.utr || null; out.failureReason = w.failureReason || null; out.bank.ifsc = w.bank.ifsc; out.providerStatus = w.status; }
  return out;
}

async function listWithdrawals(user, { status, ...query }) {
  const p = paginate(query);
  const filter = { userId: user._id };
  if (status === 'PENDING') filter.status = { $in: ['PENDING', 'PROCESSING'] };
  else if (status) filter.status = status;
  const [rows, total, sums] = await Promise.all([
    Withdrawal.find(filter).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit),
    Withdrawal.countDocuments(filter),
    Withdrawal.aggregate([{ $match: { userId: user._id } }, { $group: { _id: '$status', t: { $sum: '$amountPaise' } } }]),
  ]);
  const by = Object.fromEntries(sums.map((s) => [s._id, s.t]));
  return {
    items: rows.map((w) => presentWithdrawal(w)),
    summary: { paidOutPaise: by.COMPLETED || 0, pendingPaise: (by.PENDING || 0) + (by.PROCESSING || 0), failedPaise: by.FAILED || 0 },
    meta: pageMeta(p, total),
  };
}

async function getWithdrawal(user, id) {
  const w = await Withdrawal.findOne({ _id: id, userId: user._id });
  if (!w) throw ApiError.notFound('Withdrawal');
  return presentWithdrawal(w, true);
}

// ---------------------------------------------------------------- WAL-05
async function payoutWebhook(payload) {
  return webhook.once('payout', payload, async (p) => {
    const w = await Withdrawal.findOne({ providerRef: p.providerRef });
    if (!w) return { ignored: true };
    if (p.event === 'payout.processed') {
      const r = await Withdrawal.findOneAndUpdate({ _id: w._id, status: { $in: ['PENDING', 'PROCESSING'] } }, { status: 'COMPLETED', utr: p.utr, completedAt: new Date() }, { returnDocument: 'after' });
      if (r) {
        await ledger.settleHold(w.userId, w.amountPaise, { refType: 'Withdrawal', refId: w._id });
        await notify(w.userId, { type: 'WITHDRAWAL', title: 'Withdrawal successful', body: `${rupees(w.amountPaise)} sent to ${w.bank.bankName} ****${w.bank.accountLast4}`, deepLink: `vtracker://withdrawals/${w._id}` });
      }
    } else if (['payout.failed', 'payout.reversed'].includes(p.event)) {
      const r = await Withdrawal.findOneAndUpdate({ _id: w._id, status: { $in: ['PENDING', 'PROCESSING'] } }, { status: 'FAILED', failureReason: p.reason || 'Bank rejected the transfer', completedAt: new Date() }, { returnDocument: 'after' });
      if (r) {
        await ledger.releaseHold(w.userId, w.amountPaise, { refType: 'Withdrawal', refId: w._id });
        await notify(w.userId, { type: 'WITHDRAWAL', title: 'Withdrawal failed', body: `${rupees(w.amountPaise)} is back in your balance. ${p.reason || ''}`.trim(), deepLink: `vtracker://withdrawals/${w._id}` });
      }
    }
    const fresh = await Withdrawal.findById(w._id);
    return { withdrawalId: String(w._id), status: fresh.status };
  });
}

module.exports = { lookupIfsc, getBank, saveBank, submitKyc, getWallet, requestWithdrawal, listWithdrawals, getWithdrawal, payoutWebhook, namesMatch };
