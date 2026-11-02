'use strict';
/** FASTag, documents, content/support/lookups, notifications/devices, webhooks, admin. */
const { Joi, objectId, paise, page, idParam } = require('./common');
const { DOCUMENT_TYPES, SUPPORT_CATEGORIES, PLATFORMS, SHIPMENT_STAGES } = require('../constants/enums');

const plate = Joi.string().trim().min(4).max(16).required();
const eventId = Joi.string().trim().min(1).max(128).required();

module.exports = {
  fastagLookup: { query: Joi.object({ vehicle: plate }) },
  fastagTxns: { params: Joi.object({ vehicle: plate }), query: Joi.object(page) },
  fastagRecharge: {
    body: Joi.object({
      vehicle: plate, issuerCode: Joi.string().trim().uppercase().max(20).required(), amountPaise: paise.min(1).required(),
      upiHandle: Joi.string().trim().lowercase().pattern(/^[a-z0-9.\-_]{2,256}@[a-z]{2,64}$/).allow('', null),
    }),
  },
  fastagRechargeId: { params: idParam },

  documents: { query: Joi.object({ type: Joi.string().valid(...DOCUMENT_TYPES) }) },
  uploadDocument: {
    body: Joi.object({
      type: Joi.string().trim().uppercase().max(40).required(), // checked in the service -> DOCUMENT_TYPE_INVALID
      number: Joi.string().trim().min(4).max(40).required(),
      expiryDate: Joi.date().iso().allow('', null),
      consent: Joi.boolean().truthy('true').valid(true).required().messages({ 'any.only': 'You must consent to storing this document', 'any.required': 'consent=true is required' }),
    }),
  },
  documentId: { params: idParam },
  exportJob: { params: Joi.object({ jobId: objectId.required() }) },

  contentSlug: { params: Joi.object({ slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]{2,40}$/).required() }) },
  ticket: {
    body: Joi.object({
      category: Joi.string().valid(...SUPPORT_CATEGORIES).required(),
      message: Joi.string().trim().min(10).max(2000).required(),
      orderId: objectId, vehicleId: objectId,
    }),
  },
  pincode: { params: Joi.object({ pin: Joi.string().pattern(/^[1-9]\d{5}$/).required().messages({ 'string.pattern.base': 'Pincode must be 6 digits' }) }) },

  notifications: { query: Joi.object(page) },
  notificationId: { params: idParam },
  device: {
    body: Joi.object({
      pushToken: Joi.string().trim().min(10).max(4096).required(),
      platform: Joi.string().uppercase().valid(...PLATFORMS).required(),
      appVersion: Joi.string().trim().max(20).allow(''),
      deviceId: Joi.string().trim().max(128).allow(''),
    }),
  },
  deviceId: { params: idParam },

  webhooks: {
    telephony: { body: Joi.object({ eventId, event: Joi.string().valid('call.answered', 'call.completed', 'call.missed', 'call.failed').required(), sessionId: Joi.string().required(), durationSec: Joi.number().integer().min(0), providerRef: Joi.string() }).unknown(true) },
    payment: { body: Joi.object({ eventId, event: Joi.string().valid('payment.captured', 'payment.failed', 'refund.processed').required(), gatewayOrderId: Joi.string().required(), gatewayPaymentId: Joi.string(), amountPaise: paise, reason: Joi.string().max(200) }).unknown(true) },
    courier: { body: Joi.object({ eventId, awb: Joi.string(), orderNumber: Joi.string(), status: Joi.string().valid(...SHIPMENT_STAGES).required(), detail: Joi.string().max(200), location: Joi.string().max(120), at: Joi.date().iso(), eta: Joi.date().iso() }).or('awb', 'orderNumber').unknown(true) },
    payout: { body: Joi.object({ eventId, event: Joi.string().valid('payout.processed', 'payout.failed', 'payout.reversed').required(), providerRef: Joi.string().required(), utr: Joi.string().max(40), reason: Joi.string().max(200) }).unknown(true) },
    fastag: { body: Joi.object({ eventId, event: Joi.string().valid('recharge.credited', 'recharge.failed').required(), providerRef: Joi.string().required(), reason: Joi.string().max(200) }).unknown(true) },
  },

  admin: {
    documents: { query: Joi.object({ status: Joi.string().valid('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED') }) },
    review: { params: idParam, body: Joi.object({ decision: Joi.string().valid('APPROVE', 'REJECT').required(), reason: Joi.string().trim().max(200) }) },
    payout: { params: idParam, body: Joi.object({ action: Joi.string().valid('CREDIT', 'REVERSE').required() }) },
  },
};
