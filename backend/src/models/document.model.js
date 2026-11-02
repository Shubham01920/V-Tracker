'use strict';
const { Schema, model } = require('mongoose');
const { DOCUMENT_TYPES, DOCUMENT_STATUS } = require('../constants/enums');

/** Identity / vehicle document. The file on disk is encrypted; the number is encrypted, only a mask is returned. */
const documentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: DOCUMENT_TYPES, required: true },
  numberEnc: { type: String, required: true },
  numberMasked: String,
  expiryDate: Date,
  status: { type: String, enum: DOCUMENT_STATUS, default: 'PENDING_VERIFICATION' },
  file: { storageKey: String, mime: String, size: Number, originalName: String },
  reviewedAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  consentAt: { type: Date, required: true },
  expiryReminderSentAt: Date,
  accessLog: [{ _id: false, at: Date, action: String, by: Schema.Types.ObjectId }],
}, { timestamps: true });

documentSchema.index({ userId: 1, type: 1, createdAt: -1 });

const exportJobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['QUEUED', 'RUNNING', 'READY', 'FAILED'], default: 'QUEUED' },
  storageKey: String,
  documentCount: Number,
  error: String,
  readyAt: Date,
}, { timestamps: true });
exportJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 86400 });

module.exports = { Document: model('Document', documentSchema), ExportJob: model('ExportJob', exportJobSchema) };
