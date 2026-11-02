'use strict';
/** Rewards (RWD-*), referral (REF-*), payouts (PAY-*). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const rewards = require('../services/reward.service');
const referral = require('../services/referral.service');

module.exports = {
  rewards: asyncHandler(async (req, res) => R.ok(res, { items: await rewards.list(req.user._id, req.valid.query) })),
  scratch: asyncHandler(async (req, res) => R.ok(res, await rewards.scratch(req.user._id, req.valid.params.id))),
  rewardSummary: asyncHandler(async (req, res) => R.ok(res, await rewards.summary(req.user._id))),

  summary: asyncHandler(async (req, res) => R.ok(res, await referral.summary(req.user))),
  direct: asyncHandler(async (req, res) => { const r = await referral.direct(req.user, req.valid.query); return R.ok(res, { items: r.items, stats: r.stats }, r.meta); }),
  performance: asyncHandler(async (req, res) => R.ok(res, await referral.performance(req.user))),
  teamSummary: asyncHandler(async (req, res) => R.ok(res, await referral.teamSummary(req.user))),
  teamTree: asyncHandler(async (req, res) => { const r = await referral.teamTree(req.user, req.valid.query); return R.ok(res, { parent: r.parent, nodes: r.nodes }, r.meta); }),

  payouts: asyncHandler(async (req, res) => { const r = await referral.listPayouts(req.user, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  payoutSummary: asyncHandler(async (req, res) => R.ok(res, await referral.payoutSummary(req.user))),
  payoutsByTeam: asyncHandler(async (req, res) => R.ok(res, await referral.payoutsByTeam(req.user))),
};
