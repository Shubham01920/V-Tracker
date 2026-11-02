'use strict';
const { Device } = require('../models');
const ApiError = require('../utils/ApiError');

/** DEV-01: upsert by push token. A token moves to the new user if another account registered it before. */
async function register(user, { pushToken, platform, appVersion, deviceId }) {
  const d = await Device.findOneAndUpdate(
    { pushToken },
    { userId: user._id, platform, appVersion, deviceId, lastSeenAt: new Date() },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
  return { id: String(d._id), platform: d.platform, appVersion: d.appVersion || null };
}

async function remove(user, id) {
  const r = await Device.deleteOne({ _id: id, userId: user._id });
  if (!r.deletedCount) throw ApiError.notFound('Device');
}

module.exports = { register, remove };
