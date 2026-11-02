'use strict';
const { Joi, phone, email, pincode, idParam } = require('./common');
const { ADDRESS_LABELS } = require('../constants/enums');

const text = (max) => Joi.string().trim().max(max).allow('');

const addressFields = {
  name: Joi.string().trim().min(2).max(80),
  phone,
  label: Joi.string().valid(...ADDRESS_LABELS),
  line1: Joi.string().trim().min(3).max(200),
  line2: text(200),
  pincode,
  city: Joi.string().trim().min(2).max(80),
  state: Joi.string().trim().min(2).max(80),
  isDefault: Joi.boolean(),
};

module.exports = {
  updateMe: {
    body: Joi.object({
      fullName: Joi.string().trim().min(2).max(80),
      email,
      phone,
      alertPhone: phone,
      address: text(200),
      place: text(80),
      city: text(80),
      state: text(80),
      pincode: pincode.allow(''),
      locality: text(120),
      nearBy: text(120),
    }).min(1).messages({ 'object.min': 'Send at least one field to update' }),
  },
  createAddress: {
    body: Joi.object({
      ...addressFields,
      name: addressFields.name.required(),
      phone: addressFields.phone.required(),
      line1: addressFields.line1.required(),
      pincode: addressFields.pincode.required(),
      city: addressFields.city.required(),
      state: addressFields.state.required(),
      label: addressFields.label.default('HOME'),
      isDefault: addressFields.isDefault.default(false),
    }),
  },
  updateAddress: { params: idParam, body: Joi.object(addressFields).min(1) },
  addressId: { params: idParam },
};
