'use strict';
const { Schema, model } = require('mongoose');

const passwordResetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  usedAt: Date,
}, { timestamps: true });

passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = model('PasswordReset', passwordResetSchema);
