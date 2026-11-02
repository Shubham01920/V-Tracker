'use strict';
const { Schema, model } = require('mongoose');
const { NOTIFICATION_TYPES } = require('../constants/enums');

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  deepLink: String, // e.g. vtracker://calls/<id>
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = model('Notification', notificationSchema);
