'use strict';
const { Joi, objectId, paise, page, idParam } = require('./common');
const { PRODUCT_CATEGORIES, ORDER_STATUS } = require('../constants/enums');

const productParam = Joi.object({ productId: objectId.required() });
const coupon = Joi.string().trim().uppercase().max(30).allow('', null);

module.exports = {
  products: { query: Joi.object({ category: Joi.string().valid('ALL', ...PRODUCT_CATEGORIES), q: Joi.string().trim().max(80).allow(''), ...page }) },
  product: { params: idParam },
  productParam: { params: productParam },
  setItem: { params: productParam, body: Joi.object({ qty: Joi.number().integer().min(1).max(99).required() }) },
  summary: { query: Joi.object({ addressId: objectId, couponCode: coupon, redeemPoints: Joi.boolean().default(false) }) },
  coupon: { body: Joi.object({ code: Joi.string().trim().uppercase().min(2).max(30).required(), subtotalPaise: paise.required() }) },
  createOrder: {
    body: Joi.object({ addressId: objectId.required(), couponCode: coupon, redeemPoints: Joi.boolean().default(false), expectedTotalPaise: paise.required() }),
  },
  confirm: {
    body: Joi.object({ orderId: objectId.required(), gatewayPaymentId: Joi.string().trim().max(100).required(), signature: Joi.string().trim().max(256).required() }),
  },
  orders: { query: Joi.object({ status: Joi.string().valid(...ORDER_STATUS), ...page }) },
  order: { params: idParam },
  tracking: { query: Joi.object({ ref: Joi.string().trim().min(3).max(40).required() }) },
};
