'use strict';
const { Notification, Device } = require('../models');
const { sendPush } = require('./providers/messaging.provider');
const logger = require('../utils/logger');
const { paginate, pageMeta } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

const present = (n) => ({
  id: String(n._id), type: n.type, title: n.title, body: n.body, deepLink: n.deepLink || null, data: n.data || null, read: n.read, at: n.createdAt,
});

/** Store an in-app notification and push it to every registered device. Never throws (best effort). */
async function notify(userId, { type, title, body = '', deepLink, data }) {
  try {
    const n = await Notification.create({ userId, type, title, body, deepLink, data });
    const devices = await Device.find({ userId }).select('pushToken').lean();
    const { invalidTokens } = await sendPush(devices.map((d) => d.pushToken), { title, body, data: { ...(data || {}), deepLink, notificationId: String(n._id) } });
    if (invalidTokens.length) await Device.deleteMany({ pushToken: { $in: invalidTokens } });
    return n;
  } catch (e) {
    logger.warn('notify failed', { err: e.message });
    return null;
  }
}

async function list(userId, query) {
  const p = paginate(query);
  const [items, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit),
    Notification.countDocuments({ userId }),
  ]);
  return { items: items.map(present), meta: pageMeta(p, total) };
}

async function markRead(userId, id) {
  const r = await Notification.updateOne({ _id: id, userId }, { read: true, readAt: new Date() });
  if (!r.matchedCount) throw ApiError.notFound('Notification');
}

async function markAllRead(userId) {
  await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });
}

async function unreadCount(userId) {
  return { count: await Notification.countDocuments({ userId, read: false }) };
}

module.exports = { notify, list, markRead, markAllRead, unreadCount, present };
