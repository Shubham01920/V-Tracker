'use strict';
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const auth = require('../services/auth.service');

const ctx = (req) => ({ ip: req.ip, deviceId: (req.body && req.body.deviceId) || req.get('X-Device-Id') || undefined });

module.exports = {
  register: asyncHandler(async (req, res) => R.created(res, await auth.register(req.body))),
  verifyOtp: asyncHandler(async (req, res) => R.ok(res, await auth.verifyOtp(req.body, ctx(req)))),
  login: asyncHandler(async (req, res) => R.ok(res, await auth.login(req.body, ctx(req)))),
  google: asyncHandler(async (req, res) => R.ok(res, await auth.google(req.body, ctx(req)))),
  refresh: asyncHandler(async (req, res) => R.ok(res, await auth.refresh(req.body, ctx(req)))),
  forgotPassword: asyncHandler(async (req, res) => R.accepted(res, await auth.forgotPassword(req.body))),
  resetPassword: asyncHandler(async (req, res) => { await auth.resetPassword(req.body); return R.noContent(res); }),
  logout: asyncHandler(async (req, res) => { await auth.logout(req.user, req.body, req.auth); return R.noContent(res); }),
};
