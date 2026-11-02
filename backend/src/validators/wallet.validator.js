'use strict';
const { Joi, paise, page, idParam } = require('./common');
const { WITHDRAW_MODE } = require('../constants/enums');

const acct = Joi.string().trim().pattern(/^\d{8,18}$/).messages({ 'string.pattern.base': 'Account number must be 8-18 digits' });

module.exports = {
  saveBank: {
    body: Joi.object({
      holderName: Joi.string().trim().min(2).max(80).required(),
      bankName: Joi.string().trim().max(80).allow(''),
      accountNumber: acct.required(),
      confirmAccountNumber: acct.required(),
      ifsc: Joi.string().trim().uppercase().length(11).required(),
      branch: Joi.string().trim().max(120).allow(''),
      upiId: Joi.string().trim().lowercase().pattern(/^[a-z0-9.\-_]{2,256}@[a-z]{2,64}$/).allow('', null)
        .messages({ 'string.pattern.base': 'Enter a valid UPI ID, e.g. name@okhdfc' }),
      currentPassword: Joi.string().max(128),
    }),
  },
  ifsc: { params: Joi.object({ code: Joi.string().trim().uppercase().length(11).required() }) },
  kyc: {
    body: Joi.object({
      panNumber: Joi.string().trim().uppercase().length(10).required(),
      nameOnPan: Joi.string().trim().min(2).max(80).required(),
    }),
  },
  withdraw: {
    body: Joi.object({ amountPaise: paise.min(1).required(), mode: Joi.string().valid(...WITHDRAW_MODE).default('BANK'), currentPassword: Joi.string().max(128) }),
  },
  withdrawals: { query: Joi.object({ status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED'), ...page }) },
  withdrawal: { params: idParam },
};
