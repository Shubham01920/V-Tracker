'use strict';
/** Inbound provider webhooks (CAL-03, CHK-05, ORD-04, WAL-05, FST-06). Signature is checked before this runs. */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const contacts = require('../services/contact.service');
const orders = require('../services/order.service');
const wallet = require('../services/wallet.service');
const fastag = require('../services/fastag.service');

module.exports = {
  telephony: asyncHandler(async (req, res) => R.ok(res, await contacts.telephonyWebhook(req.body))),
  payment: asyncHandler(async (req, res) => R.ok(res, await orders.paymentWebhook(req.body))),
  courier: asyncHandler(async (req, res) => R.ok(res, await orders.courierWebhook(req.body))),
  payout: asyncHandler(async (req, res) => R.ok(res, await wallet.payoutWebhook(req.body))),
  fastag: asyncHandler(async (req, res) => R.ok(res, await fastag.fastagWebhook(req.body))),
};
