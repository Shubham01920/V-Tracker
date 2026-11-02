'use strict';
const { Schema, model } = require('mongoose');

/** Rotating refresh tokens. Only the SHA-256 hash is stored. familyId groups one login session. */
const refreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  familyId: { type: String, required: true, index: true },
  deviceId: String,
  authTime: { type: Number, required: true }, // unix seconds of the original login
  expiresAt: { type: Date, required: true },
  revokedAt: Date,
  revokedReason: String,
  replacedByHash: String,
  createdIp: String,
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 86400 });

module.exports = model('RefreshToken', refreshTokenSchema);
