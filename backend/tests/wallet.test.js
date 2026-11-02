'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, idem, createUser, fundWallet, kycAndBank, webhook, PASSWORD } = require('./helpers/api');
const { signAccessToken } = require('../src/utils/generateToken');
const { User, BankAccount, LedgerEntry } = require('../src/models');

const staleToken = async (u) => {
  const user = await User.findById(u.userId);
  return signAccessToken({ userId: user._id, role: user.role, sid: 'old-session', tokenVersion: user.tokenVersion, authTime: Math.floor(Date.now() / 1000) - 3600 });
};

describe('Bank and KYC (BNK-01..03, KYC-01)', () => {
  test('BNK-03 IFSC lookup', async () => {
    const u = await createUser();
    const r = await api().get('/v1/lookup/ifsc/hdfc0001234').set(bearer(u)).expect(200);
    expect(r.body.data).toMatchObject({ ifsc: 'HDFC0001234', bankName: 'HDFC Bank', branch: 'Bengaluru - Koramangala' });
    const byCode = await api().get('/v1/lookup/ifsc/SBIN0009999').set(bearer(u)).expect(200);
    expect(byCode.body.data).toMatchObject({ bankName: 'State Bank of India', branch: null });
    const bad = await api().get('/v1/lookup/ifsc/HDFC1001234').set(bearer(u)).expect(422);
    expect(bad.body.error.code).toBe('IFSC_INVALID');
    const unknown = await api().get('/v1/lookup/ifsc/ZZZZ0001234').set(bearer(u)).expect(422);
    expect(unknown.body.error.code).toBe('IFSC_INVALID');
  });

  test('KYC-01 PAN format and verification', async () => {
    const u = await createUser();
    const bad = await api().post('/v1/me/kyc').set(bearer(u)).send({ panNumber: 'ABCD12345F', nameOnPan: 'Test Owner' }).expect(422);
    expect(bad.body.error.code).toBe('PAN_INVALID');
    const ok = await api().post('/v1/me/kyc').set(bearer(u)).send({ panNumber: 'abcde1234f', nameOnPan: 'Test Owner' }).expect(202);
    expect(ok.body.data).toEqual({ status: 'VERIFIED', panLast4: '234F', nameOnPan: 'Test Owner' });
    const me = await api().get('/v1/me').set(bearer(u)).expect(200);
    expect(me.body.data.kycStatus).toBe('VERIFIED');
    const raw = await User.findById(u.userId).lean();
    expect(JSON.stringify(raw)).not.toContain('ABCDE1234F'); // encrypted at rest
  });

  test('BNK-02 save: mismatch, name match, encrypted, masked on read; change triggers cooldown; re-auth', async () => {
    const u = await createUser({ fullName: 'Shubham Maurya' });
    const nf = await api().get('/v1/me/bank-account').set(bearer(u)).expect(404);
    expect(nf.body.error.code).toBe('NOT_FOUND');
    const base = { holderName: 'Shubham Maurya', accountNumber: '50100123450192', confirmAccountNumber: '50100123450192', ifsc: 'HDFC0001234' };
    const mm = await api().put('/v1/me/bank-account').set(bearer(u)).send({ ...base, confirmAccountNumber: '50100123450193' }).expect(422);
    expect(mm.body.error.code).toBe('ACCOUNT_MISMATCH');
    const nm = await api().put('/v1/me/bank-account').set(bearer(u)).send({ ...base, holderName: 'Somebody Else' }).expect(422);
    expect(nm.body.error.code).toBe('NAME_MISMATCH');
    const ifsc = await api().put('/v1/me/bank-account').set(bearer(u)).send({ ...base, ifsc: 'BADC0DE1234' }).expect(422);
    expect(ifsc.body.error.code).toBe('IFSC_INVALID');

    const stale = await staleToken(u);
    const re = await api().put('/v1/me/bank-account').set(bearer(stale)).send(base).expect(401);
    expect(re.body.error.code).toBe('REAUTH_REQUIRED');
    const withPwd = await api().put('/v1/me/bank-account').set(bearer(stale)).send({ ...base, upiId: 'shubham@okhdfc', currentPassword: PASSWORD }).expect(200);
    expect(withPwd.body.data).toMatchObject({ bankName: 'HDFC Bank', accountLast4: '0192', status: 'VERIFIED', upiMasked: 'sh***@okhdfc', cooldownUntil: null });

    const get = await api().get('/v1/me/bank-account').set(bearer(u)).expect(200);
    expect(JSON.stringify(get.body)).not.toContain('50100123450192');
    const raw = await BankAccount.findOne({ userId: u.userId }).lean();
    expect(JSON.stringify(raw)).not.toContain('50100123450192');

    const changed = await api().put('/v1/me/bank-account').set(bearer(u)).send({ ...base, accountNumber: '50100999994829', confirmAccountNumber: '50100999994829' }).expect(200);
    expect(changed.body.data.accountLast4).toBe('4829');
    expect(new Date(changed.body.data.cooldownUntil).getTime()).toBeGreaterThan(Date.now() + 23 * 3600 * 1000);
  });
});

describe('Wallet and withdrawals (WAL-01..05)', () => {
  test('WAL-01 wallet and WAL-02 guard rails', async () => {
    const u = await createUser();
    const w = await api().get('/v1/wallet').set(bearer(u)).expect(200);
    expect(w.body.data).toMatchObject({ availablePaise: 0, heldPaise: 0, minWithdrawPaise: 50000, kycStatus: 'NOT_SUBMITTED', bankStatus: 'NOT_SUBMITTED' });
    const noKey = await api().post('/v1/withdrawals').set(bearer(u)).send({ amountPaise: 60000 }).expect(400);
    expect(noKey.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
    const low = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 10000 }).expect(422);
    expect(low.body.error.code).toBe('BELOW_MINIMUM');
    const high = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 99999999 }).expect(422);
    expect(high.body.error.code).toBe('ABOVE_MAXIMUM');
    const kyc = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 60000 }).expect(403);
    expect(kyc.body.error.code).toBe('KYC_REQUIRED');
    await api().post('/v1/me/kyc').set(bearer(u)).send({ panNumber: 'ABCDE1234F', nameOnPan: 'Test Owner' }).expect(202);
    const bank = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 60000 }).expect(403);
    expect(bank.body.error.code).toBe('BANK_NOT_VERIFIED');
    await api().put('/v1/me/bank-account').set(bearer(u)).send({ holderName: 'Test Owner', accountNumber: '50100123450192', confirmAccountNumber: '50100123450192', ifsc: 'HDFC0001234' }).expect(200);
    const upi = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 60000, mode: 'UPI' }).expect(422);
    expect(upi.body.error.code).toBe('UPI_NOT_SET');
    const poor = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 60000 }).expect(422);
    expect(poor.body.error.code).toBe('INSUFFICIENT_BALANCE');
    await BankAccount.updateOne({ userId: u.userId }, { cooldownUntil: new Date(Date.now() + 3600000) });
    const cool = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 60000 }).expect(403);
    expect(cool.body.error.code).toBe('BANK_COOLDOWN');
  });

  test('WAL-02 hold -> WAL-05 processed settles; failed releases; WAL-03/04 history', async () => {
    const u = await createUser();
    await kycAndBank(u);
    await fundWallet(u.userId, 1245000);
    const key = idem();
    const r = await api().post('/v1/withdrawals').set(bearer(u)).set(key).send({ amountPaise: 250000, mode: 'BANK' }).expect(202);
    expect(r.body.data).toMatchObject({ status: 'PENDING', amountPaise: 250000, mode: 'BANK' });
    expect(r.body.data.txnId).toMatch(/^TXN\d+$/);
    const replay = await api().post('/v1/withdrawals').set(bearer(u)).set(key).send({ amountPaise: 250000, mode: 'BANK' }).expect(202);
    expect(replay.body.data.id).toBe(r.body.data.id);
    let w = await api().get('/v1/wallet').set(bearer(u)).expect(200);
    expect(w.body.data).toMatchObject({ availablePaise: 995000, heldPaise: 250000 });

    const { Withdrawal } = require('../src/models');
    const wd = await Withdrawal.findById(r.body.data.id);
    await webhook('payout', { event: 'payout.processed', providerRef: wd.providerRef, utr: 'HDFCN52026102399' }).expect(200);
    w = await api().get('/v1/wallet').set(bearer(u)).expect(200);
    expect(w.body.data).toMatchObject({ availablePaise: 995000, heldPaise: 0, lifetimeWithdrawnPaise: 250000 });
    const d = await api().get(`/v1/withdrawals/${r.body.data.id}`).set(bearer(u)).expect(200);
    expect(d.body.data).toMatchObject({ status: 'COMPLETED', utr: 'HDFCN52026102399', bank: { bankName: 'HDFC Bank', accountLast4: '0192' } });
    // repeated provider event does not double-settle
    await webhook('payout', { event: 'payout.failed', providerRef: wd.providerRef }).expect(200);
    expect((await Withdrawal.findById(wd._id)).status).toBe('COMPLETED');

    const r2 = await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 120000, mode: 'UPI' }).expect(202);
    const wd2 = await Withdrawal.findById(r2.body.data.id);
    await webhook('payout', { event: 'payout.failed', providerRef: wd2.providerRef, reason: 'Account frozen' }).expect(200);
    w = await api().get('/v1/wallet').set(bearer(u)).expect(200);
    expect(w.body.data).toMatchObject({ availablePaise: 995000, heldPaise: 0 });
    const d2 = await api().get(`/v1/withdrawals/${r2.body.data.id}`).set(bearer(u)).expect(200);
    expect(d2.body.data).toMatchObject({ status: 'FAILED', failureReason: 'Account frozen' });

    await api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 50000 }).expect(202);
    const h = await api().get('/v1/withdrawals').set(bearer(u)).expect(200);
    expect(h.body.data.items.map((i) => i.status)).toEqual(['PENDING', 'FAILED', 'COMPLETED']);
    expect(h.body.data.summary).toMatchObject({ paidOutPaise: 250000, pendingPaise: 50000, failedPaise: 120000 });
    const f = await api().get('/v1/withdrawals').query({ status: 'COMPLETED' }).set(bearer(u)).expect(200);
    expect(f.body.data.items).toHaveLength(1);
    const other = await createUser();
    await api().get(`/v1/withdrawals/${r.body.data.id}`).set(bearer(other)).expect(404);

    // ledger: every movement recorded once
    const kinds = (await LedgerEntry.find({ userId: u.userId }).lean()).map((e) => e.kind).sort();
    expect(kinds).toEqual(['ADJUSTMENT', 'WITHDRAWAL_HOLD', 'WITHDRAWAL_HOLD', 'WITHDRAWAL_HOLD', 'WITHDRAWAL_RELEASE', 'WITHDRAWAL_SETTLED']);
  });

  test('WAL-02 concurrent requests cannot overdraw', async () => {
    const u = await createUser();
    await kycAndBank(u);
    await fundWallet(u.userId, 100000);
    const rs = await Promise.all([1, 2, 3].map(() => api().post('/v1/withdrawals').set(bearer(u)).set(idem()).send({ amountPaise: 60000 })));
    expect(rs.filter((r) => r.status === 202)).toHaveLength(1);
    expect(rs.filter((r) => r.status === 422).every((r) => r.body.error.code === 'INSUFFICIENT_BALANCE')).toBe(true);
    const w = await api().get('/v1/wallet').set(bearer(u)).expect(200);
    expect(w.body.data).toMatchObject({ availablePaise: 40000, heldPaise: 60000 });
  });
});
