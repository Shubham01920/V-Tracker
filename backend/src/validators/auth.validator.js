'use strict';
const { Joi, phone, email, password } = require('./common');

const deviceId = Joi.string().trim().max(128);

module.exports = {
  register: {
    body: Joi.object({
      fullName: Joi.string().trim().min(2).max(80).required(),
      email: email.required(),
      phone: phone.required(),
      password: password.required(),
      referralCode: Joi.string().trim().uppercase().max(20).allow('', null),
    }),
  },
  verifyOtp: {
    body: Joi.object({
      challengeId: Joi.string().trim().guid().required(),
      code: Joi.string().trim().pattern(/^\d{6}$/).required().messages({ 'string.pattern.base': 'Enter the 6-digit code' }),
      deviceId,
    }),
  },
  login: { body: Joi.object({ email: email.required(), password: Joi.string().min(1).max(128).required(), deviceId }) },
  google: {
    body: Joi.object({
      idToken: Joi.string().trim().min(10).max(4096).required(),
      deviceId,
      phone: phone.optional(),
      referralCode: Joi.string().trim().uppercase().max(20).allow('', null),
    }),
  },
  refresh: { body: Joi.object({ refreshToken: Joi.string().trim().min(20).max(256).required() }) },
  forgot: { body: Joi.object({ email: email.required() }) },
  reset: {
    body: Joi.object({
      token: Joi.string().trim().min(20).max(256).required(),
      newPassword: Joi.string().max(128).required(), // strength checked in the service -> WEAK_PASSWORD
    }),
  },
  logout: { body: Joi.object({ refreshToken: Joi.string().trim().min(20).max(256).required() }) },
};
