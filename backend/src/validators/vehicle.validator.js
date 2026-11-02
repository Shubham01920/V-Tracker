'use strict';
const { Joi, objectId, phone, uuid, page, idParam } = require('./common');
const { VEHICLE_TYPES, ALERT_REASONS, REPORT_KINDS, CALL_FILTER } = require('../constants/enums');

const qrParam = Joi.object({ qrUuid: uuid.required().messages({ 'string.guid': 'Not a V Tracker label' }) });
const vehicleRef = Joi.string().trim().pattern(/^vr_[A-Za-z0-9_-]{8,40}$/).required();

module.exports = {
  list: { query: Joi.object(page) },
  create: {
    body: Joi.object({
      registrationNumber: Joi.string().trim().min(6).max(16).required(),
      type: Joi.string().valid(...VEHICLE_TYPES).required(),
      model: Joi.string().trim().max(80).allow(''),
      color: Joi.string().trim().max(40).allow(''),
    }),
  },
  id: { params: idParam },
  lookup: { query: Joi.object({ reg: Joi.string().trim().min(4).max(16).required() }) },
  qrStatus: { params: qrParam },
  activate: { body: Joi.object({ qrUuid: uuid.required(), vehicleId: objectId.required() }) },
  call: { body: Joi.object({ vehicleRef, reason: Joi.string().valid(...ALERT_REASONS).default('OTHER') }) },
  alert: { body: Joi.object({ vehicleRef, reason: Joi.string().valid(...ALERT_REASONS).required(), note: Joi.string().trim().max(280).allow('') }) },
  publicScan: { params: qrParam },
  publicCall: {
    params: qrParam,
    body: Joi.object({ callerPhone: phone.required(), captchaToken: Joi.string().trim().max(4096).allow(''), reason: Joi.string().valid(...ALERT_REASONS).default('OTHER') }),
  },
  publicAlert: {
    params: qrParam,
    body: Joi.object({
      reason: Joi.string().valid(...ALERT_REASONS).required(), note: Joi.string().trim().max(280).allow(''),
      callerPhone: phone.optional().allow(''), captchaToken: Joi.string().trim().max(4096).allow(''),
    }),
  },
  publicReport: { params: qrParam, body: Joi.object({ kind: Joi.string().valid(...REPORT_KINDS).required(), note: Joi.string().trim().max(500).allow('') }) },
  calls: { query: Joi.object({ type: Joi.string().valid(...CALL_FILTER).default('ALL'), ...page }) },
};
