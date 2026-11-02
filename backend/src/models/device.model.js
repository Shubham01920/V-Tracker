'use strict';
const { Schema, model } = require('mongoose');
const { PLATFORMS } = require('../constants/enums');

const deviceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pushToken: { type: String, required: true, unique: true },
  platform: { type: String, enum: PLATFORMS, required: true },
  appVersion: String,
  deviceId: String,
  lastSeenAt: Date,
}, { timestamps: true });

module.exports = model('Device', deviceSchema);
