'use strict';
/** Minimal admin tools implied by the app (PDF §1.3): document review and payout credit/reversal. ADMIN role only. */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const docs = require('../services/document.service');
const referral = require('../services/referral.service');
const { Payout } = require('../models');

module.exports = {
  documents: asyncHandler(async (req, res) => R.ok(res, { items: await docs.adminList(req.valid.query) })),
  reviewDocument: asyncHandler(async (req, res) => R.ok(res, await docs.adminReview(req.user, req.valid.params.id, req.body))),
  payoutAction: asyncHandler(async (req, res) => {
    const p = await Payout.findById(req.valid.params.id);
    if (!p) throw ApiError.notFound('Payout');
    const r = req.body.action === 'CREDIT' ? await referral.creditPayout(p._id) : await referral.reversePayout(p._id);
    const fresh = await Payout.findById(p._id);
    return R.ok(res, { id: String(fresh._id), status: fresh.status, changed: !!r });
  }),
};
