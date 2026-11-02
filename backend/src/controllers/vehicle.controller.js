'use strict';
/** Vehicles, QR, contacts, public scan, call history (VEH-*, QR-*, CON-*, PUB-*, CAL-*). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const vehicles = require('../services/vehicle.service');
const contacts = require('../services/contact.service');

module.exports = {
  list: asyncHandler(async (req, res) => { const r = await vehicles.list(req.user._id, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  create: asyncHandler(async (req, res) => R.created(res, await vehicles.create(req.user._id, req.body))),
  detail: asyncHandler(async (req, res) => R.ok(res, await vehicles.detail(req.user._id, req.valid.params.id))),
  unlinkQr: asyncHandler(async (req, res) => { await vehicles.unlinkQr(req.user._id, req.valid.params.id); return R.noContent(res); }),
  lookup: asyncHandler(async (req, res) => R.ok(res, await vehicles.lookup(req.user, req.valid.query.reg))),

  qrStatus: asyncHandler(async (req, res) => R.ok(res, await vehicles.qrStatus(req.valid.params.qrUuid, req.user))),
  activate: asyncHandler(async (req, res) => R.ok(res, await vehicles.activate(req.user, req.body))),

  call: asyncHandler(async (req, res) => R.accepted(res, await contacts.appCall(req.user, req.body))),
  alert: asyncHandler(async (req, res) => R.accepted(res, await contacts.appAlert(req.user, req.body))),

  publicScan: asyncHandler(async (req, res) => R.ok(res, await contacts.publicScan(req.valid.params.qrUuid, req.ip))),
  publicCall: asyncHandler(async (req, res) => R.accepted(res, await contacts.publicCall(req.valid.params.qrUuid, req.body, req.ip))),
  publicAlert: asyncHandler(async (req, res) => R.accepted(res, await contacts.publicAlert(req.valid.params.qrUuid, req.body, req.ip))),
  publicReport: asyncHandler(async (req, res) => R.accepted(res, await contacts.publicReport(req.valid.params.qrUuid, req.body, req.ip))),

  calls: asyncHandler(async (req, res) => { const r = await contacts.history(req.user._id, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  callDetail: asyncHandler(async (req, res) => R.ok(res, await contacts.historyItem(req.user._id, req.valid.params.id))),
  blockCaller: asyncHandler(async (req, res) => R.ok(res, await contacts.blockCaller(req.user._id, req.valid.params.id))),
};
