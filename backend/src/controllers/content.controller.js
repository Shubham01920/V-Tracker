'use strict';
/** Content (CNT-01), support (SUP-*), config (CFG-01), lookups (LKP-01). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const content = require('../services/content.service');

module.exports = {
  content: asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    return R.ok(res, await content.getContent(req.valid.params.slug));
  }),
  faqs: asyncHandler(async (req, res) => R.ok(res, { items: await content.faqs() })),
  contact: asyncHandler(async (req, res) => R.ok(res, content.contact())),
  ticket: asyncHandler(async (req, res) => R.created(res, await content.createTicket(req.user, req.body))),
  config: asyncHandler(async (req, res) => R.ok(res, content.config())),
  pincode: asyncHandler(async (req, res) => R.ok(res, await content.pincode(req.valid.params.pin))),
};
