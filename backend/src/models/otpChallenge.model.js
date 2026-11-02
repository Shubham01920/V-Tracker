'use strict';
const { Schema, model } = require('mongoose');
const { OTP_PURPOSE } = require('../constants/enums');

const otpChallengeSchema = new Schema({
  challengeId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: OTP_PURPOSE, required: true },
  phone: { type: String, required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, required: true },
  consumedAt: Date,
  invalidatedAt: Date,
}, { timestamps: true });

otpChallengeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = model('OtpChallenge', otpChallengeSchema);
