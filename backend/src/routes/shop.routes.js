'use strict';
/** /v1/products, /v1/wishlist, /v1/cart, /v1/checkout, /v1/coupons, /v1/orders, /v1/payments, /v1/tracking */
const express = require('express');
const c = require('../controllers/shop.controller');
const v = require('../validators/shop.validator');
const validate = require('../middlewares/validate.middleware');
const idempotency = require('../middlewares/idempotency.middleware');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { moneyLimiter } = require('../middlewares/rateLimit.middleware');

const products = express.Router();
products.get('/', optionalAuth, validate(v.products), c.products); // SHP-01
products.get('/:id', optionalAuth, validate(v.product), c.product); // SHP-02

const wishlist = express.Router();
wishlist.use(authenticate);
wishlist.put('/:productId', validate(v.productParam), c.addWishlist); // WSH-01
wishlist.delete('/:productId', validate(v.productParam), c.removeWishlist); // WSH-02

const cart = express.Router();
cart.use(authenticate);
cart.get('/', c.cart); // CRT-01
cart.put('/items/:productId', validate(v.setItem), c.setItem); // CRT-02
cart.delete('/items/:productId', validate(v.productParam), c.removeItem); // CRT-03
cart.delete('/', c.clearCart); // CRT-04

const checkout = express.Router();
checkout.get('/summary', authenticate, validate(v.summary), c.summary); // CHK-01

const coupons = express.Router();
coupons.post('/validate', authenticate, validate(v.coupon), c.validateCoupon); // CHK-02

const orders = express.Router();
orders.use(authenticate);
orders.post('/', moneyLimiter, validate(v.createOrder), idempotency, c.createOrder); // CHK-03
orders.get('/', validate(v.orders), c.orders); // ORD-01
orders.get('/:id', validate(v.order), c.order); // ORD-02

const payments = express.Router();
payments.post('/confirm', authenticate, validate(v.confirm), c.confirmPayment); // CHK-04

const tracking = express.Router();
tracking.get('/', authenticate, validate(v.tracking), c.tracking); // ORD-03

module.exports = { products, wishlist, cart, checkout, coupons, orders, payments, tracking };
