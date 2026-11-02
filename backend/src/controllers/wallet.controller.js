'use strict';
/** Bank (BNK-*), KYC (KYC-01), wallet and withdrawals (WAL-*). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const wallet = require('../services/wallet.service');

module.exports = {
  getBank: asyncHandler(async (req, res) => R.ok(res, await wallet.getBank(req.user))),
  saveBank: asyncHandler(async (req, res) => R.ok(res, await wallet.saveBank(req.user, req.body))),
  ifsc: asyncHandler(async (req, res) => R.ok(res, await wallet.lookupIfsc(req.valid.params.code))),
  kyc: asyncHandler(async (req, res) => R.accepted(res, await wallet.submitKyc(req.user, req.body))),
  wallet: asyncHandler(async (req, res) => R.ok(res, await wallet.getWallet(req.user))),
  withdraw: asyncHandler(async (req, res) => R.accepted(res, await wallet.requestWithdrawal(req.user, req.body))),
  withdrawals: asyncHandler(async (req, res) => { const r = await wallet.listWithdrawals(req.user, req.valid.query); return R.ok(res, { items: r.items, summary: r.summary }, r.meta); }),
  withdrawal: asyncHandler(async (req, res) => R.ok(res, await wallet.getWithdrawal(req.user, req.valid.params.id))),
};
