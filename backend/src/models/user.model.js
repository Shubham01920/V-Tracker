'use strict';
const { Schema, model } = require('mongoose');
const { ROLES, ALL_ROLES } = require('../constants/roles');

const kycSchema = new Schema({
  status: { type: String, enum: ['NOT_SUBMITTED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'], default: 'NOT_SUBMITTED' },
  panEnc: String,
  panLast4: String,
  nameOnPan: String,
  submittedAt: Date,
  verifiedAt: Date,
  rejectionReason: String,
}, { _id: false });

const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, lowercase: true, trim: true },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String },
  phoneVerified: { type: Boolean, default: false },
  pendingPhone: String,
  alertPhone: String,
  alertPhoneVerified: { type: Boolean, default: false },
  pendingAlertPhone: String,
  passwordHash: { type: String, select: true },
  googleSub: String,

  role: { type: String, enum: ALL_ROLES, default: ROLES.OWNER },
  status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },

  memberId: { type: String, required: true },
  referralCode: { type: String, required: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  ancestors: [{ type: Schema.Types.ObjectId, ref: 'User' }], // [parent, grandparent, ...] max 15
  isActiveMember: { type: Boolean, default: false }, // true after first PAID order

  avatarUrl: String,
  address: String,
  place: String,
  city: String,
  state: String,
  pincode: String,
  locality: String,
  nearBy: String,

  pointsBalance: { type: Number, default: 0, min: 0 },
  kyc: { type: kycSchema, default: () => ({}) },

  failedLoginCount: { type: Number, default: 0 },
  lockUntil: Date,
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: Date,
  deletedAt: Date,
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
userSchema.index({ googleSub: 1 }, { unique: true, partialFilterExpression: { googleSub: { $type: 'string' } } });
userSchema.index({ memberId: 1 }, { unique: true });
userSchema.index({ referralCode: 1 }, { unique: true });
userSchema.index({ referredBy: 1, createdAt: -1 });
userSchema.index({ ancestors: 1 });

module.exports = model('User', userSchema);
