'use strict';
const Joi = require('joi');

const objectId = Joi.string().hex().length(24).messages({ 'string.length': '{{#label}} must be a valid id', 'string.hex': '{{#label}} must be a valid id' });
const phone = Joi.string().trim().pattern(/^[6-9]\d{9}$/).messages({ 'string.pattern.base': 'Enter a 10-digit Indian mobile number starting with 6-9' });
const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254);
const password = Joi.string().min(8).max(128).pattern(/[A-Za-z]/).pattern(/\d/)
  .messages({ 'string.min': 'Password must be at least 8 characters', 'string.pattern.base': 'Password must contain a letter and a number' });
const pincode = Joi.string().trim().pattern(/^[1-9]\d{5}$/).messages({ 'string.pattern.base': 'Pincode must be 6 digits' });
const paise = Joi.number().integer().min(0);
const page = { page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20) };
const uuid = Joi.string().guid({ version: ['uuidv4', 'uuidv5', 'uuidv1'] });

const idParam = Joi.object({ id: objectId.required() });

module.exports = { Joi, objectId, phone, email, password, pincode, paise, page, uuid, idParam };
