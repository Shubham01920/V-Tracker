'use strict';
const { Schema, model } = require('mongoose');
const { REPORT_KINDS } = require('../constants/enums');

const abuseReportSchema = new Schema({
  qrLabelId: { type: Schema.Types.ObjectId, ref: 'QrLabel', required: true, index: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  kind: { type: String, enum: REPORT_KINDS, required: true },
  note: { type: String, maxlength: 500 },
  ipHash: String,
  status: { type: String, enum: ['OPEN', 'REVIEWED', 'CLOSED'], default: 'OPEN' },
}, { timestamps: true });

module.exports = model('AbuseReport', abuseReportSchema);
