'use strict';
/** Catalogue, wishlist, cart, checkout, payments, orders (SHP, WSH, CRT, CHK, ORD). */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const shop = require('../services/shop.service');
const orders = require('../services/order.service');

module.exports = {
  products: asyncHandler(async (req, res) => { const r = await shop.listProducts(req.user, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  product: asyncHandler(async (req, res) => R.ok(res, await shop.getProduct(req.user, req.valid.params.id))),
  addWishlist: asyncHandler(async (req, res) => { await shop.addWishlist(req.user, req.valid.params.productId); return R.noContent(res); }),
  removeWishlist: asyncHandler(async (req, res) => { await shop.removeWishlist(req.user, req.valid.params.productId); return R.noContent(res); }),

  cart: asyncHandler(async (req, res) => R.ok(res, await shop.getCart(req.user))),
  setItem: asyncHandler(async (req, res) => R.ok(res, await shop.setItem(req.user, req.valid.params.productId, req.body.qty))),
  removeItem: asyncHandler(async (req, res) => R.ok(res, await shop.removeItem(req.user, req.valid.params.productId))),
  clearCart: asyncHandler(async (req, res) => { await shop.clearCart(req.user._id); return R.noContent(res); }),

  summary: asyncHandler(async (req, res) => R.ok(res, await orders.summary(req.user, req.valid.query))),
  validateCoupon: asyncHandler(async (req, res) => R.ok(res, await orders.validateCoupon(req.user, req.body))),
  createOrder: asyncHandler(async (req, res) => R.created(res, await orders.createOrder(req.user, req.body))),
  confirmPayment: asyncHandler(async (req, res) => R.ok(res, await orders.confirmPayment(req.user, req.body))),

  orders: asyncHandler(async (req, res) => { const r = await orders.listOrders(req.user, req.valid.query); return R.ok(res, { items: r.items }, r.meta); }),
  order: asyncHandler(async (req, res) => R.ok(res, await orders.getOrder(req.user, req.valid.params.id))),
  tracking: asyncHandler(async (req, res) => R.ok(res, await orders.tracking(req.user, req.valid.query.ref))),
};
