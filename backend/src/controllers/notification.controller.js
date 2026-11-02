'use strict';
/** Notifications (NOT-*) and devices (DEV-*). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const notifications = require('../services/notification.service');
const devices = require('../services/device.service');

module.exports = {
  list: asyncHandler(async (req, res) => { const r = await notifications.list(req.user._id, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  read: asyncHandler(async (req, res) => { await notifications.markRead(req.user._id, req.valid.params.id); return R.noContent(res); }),
  readAll: asyncHandler(async (req, res) => { await notifications.markAllRead(req.user._id); return R.noContent(res); }),
  unreadCount: asyncHandler(async (req, res) => R.ok(res, await notifications.unreadCount(req.user._id))),
  registerDevice: asyncHandler(async (req, res) => R.created(res, await devices.register(req.user, req.body))),
  removeDevice: asyncHandler(async (req, res) => { await devices.remove(req.user, req.valid.params.id); return R.noContent(res); }),
};
