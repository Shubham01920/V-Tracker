'use strict';
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const fastag = require('../services/fastag.service');

module.exports = {
  issuers: asyncHandler(async (req, res) => R.ok(res, { items: await fastag.issuers() })),
  lookup: asyncHandler(async (req, res) => R.ok(res, await fastag.lookup(req.user, req.valid.query.vehicle))),
  transactions: asyncHandler(async (req, res) => { const r = await fastag.transactions(req.user, req.valid.params.vehicle, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  recharge: asyncHandler(async (req, res) => R.created(res, await fastag.createRecharge(req.user, req.body))),
  rechargeStatus: asyncHandler(async (req, res) => R.ok(res, await fastag.getRecharge(req.user, req.valid.params.id))),
};
