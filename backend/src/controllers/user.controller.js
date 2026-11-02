'use strict';
/** Profile (PRF-*) and addresses (ADR-*). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const users = require('../services/user.service');
const addresses = require('../services/address.service');

module.exports = {
  me: asyncHandler(async (req, res) => R.ok(res, await users.getMe(req.user))),
  updateMe: asyncHandler(async (req, res) => R.ok(res, await users.updateMe(req.user, req.body))),
  avatar: asyncHandler(async (req, res) => R.ok(res, await users.uploadAvatar(req.user, req.file))),

  listAddresses: asyncHandler(async (req, res) => R.ok(res, { items: await addresses.list(req.user._id) })),
  createAddress: asyncHandler(async (req, res) => R.created(res, await addresses.create(req.user._id, req.body))),
  updateAddress: asyncHandler(async (req, res) => R.ok(res, await addresses.update(req.user._id, req.valid.params.id, req.body))),
  deleteAddress: asyncHandler(async (req, res) => { await addresses.remove(req.user._id, req.valid.params.id); return R.noContent(res); }),
};
