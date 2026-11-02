'use strict';
/**
 * Checkout, orders, payments, tracking (CHK-*, ORD-*).
 * Rules: the server computes every total; the app never marks an order paid; the signed gateway webhook is the
 * source of truth for PAID (PDF §2.4, §4.6.5).
 */
const crypto = require('crypto');
const { Order, Product, Address, Coupon, CouponRedemption, QrLabel, User } = require('../models');
const { nextSeq } = require('../models/counter.model');
const business = require('../config/business');
const ApiError = require('../utils/ApiError');
const { paginate, pageMeta, rupees } = require('../utils/helpers');
const shop = require('./shop.service');
const payment = require('./providers/payment.provider');
const { createShipment } = require('./providers/misc.provider');
const { notify } = require('./notification.service');
const referral = require('./referral.service');
const webhook = require('./webhook.service');
const logger = require('../utils/logger');

const STAGE_TITLES = {
  PLACED: 'Order Placed', PROCESSED: 'Processed', SHIPPED: 'Shipped', IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
};
const STAGES = Object.keys(STAGE_TITLES);
const LABEL_PREFIX = { TWO_WHEELER: 'BIKE', THREE_WHEELER: 'AUTO', FOUR_WHEELER: 'CAR', COMMERCIAL: 'COM', ANY: 'ANY' };

// ---------------------------------------------------------------- coupons
async function resolveCoupon(user, code, subtotalPaise) {
  const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
  if (!coupon || !coupon.isActive) throw new ApiError('COUPON_INVALID', 'This coupon code is not valid', [{ field: 'couponCode', issue: 'invalid' }]);
  const now = new Date();
  if ((coupon.validFrom && coupon.validFrom > now) || (coupon.validTo && coupon.validTo < now)) throw new ApiError('COUPON_EXPIRED', 'This coupon has expired', [{ field: 'couponCode', issue: 'expired' }]);
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new ApiError('COUPON_LIMIT', 'This coupon is fully used', [{ field: 'couponCode', issue: 'limit' }]);
  if (coupon.perUserLimit && (await CouponRedemption.countDocuments({ couponId: coupon._id, userId: user._id })) >= coupon.perUserLimit) {
    throw new ApiError('COUPON_LIMIT', 'You have already used this coupon', [{ field: 'couponCode', issue: 'user_limit' }]);
  }
  if (subtotalPaise < coupon.minSubtotalPaise) {
    throw new ApiError('COUPON_INVALID', `Add items worth ${rupees(coupon.minSubtotalPaise - subtotalPaise)} more to use this coupon`, [{ field: 'couponCode', issue: 'min_subtotal', minSubtotalPaise: coupon.minSubtotalPaise }]);
  }
  let discount = coupon.type === 'FLAT' ? coupon.value : Math.round((subtotalPaise * coupon.value) / 100);
  if (coupon.maxDiscountPaise) discount = Math.min(discount, coupon.maxDiscountPaise);
  return { coupon, discountPaise: Math.min(discount, subtotalPaise) };
}

async function validateCoupon(user, { code, subtotalPaise }) {
  const { coupon, discountPaise } = await resolveCoupon(user, code, subtotalPaise);
  return { valid: true, code: coupon.code, discountPaise, description: coupon.description || null, reason: null };
}

// ---------------------------------------------------------------- pricing
function pointsDiscount(user, redeemPoints, capPaise) {
  const { minRedeem, redeemBlock, valuePerBlockPaise } = business.points;
  const available = user.pointsBalance || 0;
  if (!redeemPoints || available < minRedeem) return { pointsUsed: 0, pointsAppliedPaise: 0 };
  let blocks = Math.floor(available / redeemBlock);
  blocks = Math.min(blocks, Math.floor(capPaise / valuePerBlockPaise));
  return { pointsUsed: blocks * redeemBlock, pointsAppliedPaise: blocks * valuePerBlockPaise };
}

async function compute(user, { addressId, couponCode, redeemPoints }) {
  const cart = await shop.loadCart(user._id);
  const lines = await shop.priceCart(cart);
  let address = null;
  if (addressId) {
    address = await Address.findOne({ _id: addressId, userId: user._id });
    if (!address) throw ApiError.notFound('Address');
  } else {
    address = await Address.findOne({ userId: user._id, isDefault: true });
  }
  if (address && business.nonServiceablePincodes.includes(address.pincode)) {
    throw new ApiError('ADDRESS_NOT_SERVICEABLE', 'We do not deliver to this pincode yet', [{ field: 'addressId', issue: 'not_serviceable' }]);
  }
  const subtotalPaise = lines.reduce((s, l) => s + l.lineTotalPaise, 0);
  const taxPaise = lines.reduce((s, l) => s + Math.round((l.lineTotalPaise * l.taxRatePercent) / 100), 0);
  const deliveryPaise = lines.length ? business.deliveryFeePaise : 0;

  let discountPaise = 0;
  let coupon = null;
  if (couponCode) {
    const r = await resolveCoupon(user, couponCode, subtotalPaise);
    coupon = r.coupon;
    discountPaise = r.discountPaise;
  }
  const pts = pointsDiscount(user, redeemPoints, Math.max(0, subtotalPaise - discountPaise));
  const totalPaise = Math.max(0, subtotalPaise + taxPaise + deliveryPaise - discountPaise - pts.pointsAppliedPaise);
  return { lines, address, coupon, subtotalPaise, taxPaise, deliveryPaise, discountPaise, ...pts, totalPaise };
}

const presentLine = ({ _product, labelsIncluded, labelVehicleType, inStock, ...l }) => ({ ...l, inStock });

async function summary(user, query) {
  const c = await compute(user, query);
  const { minRedeem, redeemBlock, valuePerBlockPaise } = business.points;
  return {
    lines: c.lines.map(presentLine),
    address: c.address ? { id: String(c.address._id), name: c.address.name, line1: c.address.line1, line2: c.address.line2, city: c.address.city, state: c.address.state, pincode: c.address.pincode } : null,
    subtotalPaise: c.subtotalPaise,
    deliveryPaise: c.deliveryPaise,
    taxPaise: c.taxPaise,
    discountPaise: c.discountPaise,
    couponCode: c.coupon ? c.coupon.code : null,
    pointsAppliedPaise: c.pointsAppliedPaise,
    pointsUsed: c.pointsUsed,
    totalPaise: c.totalPaise,
    currency: business.currency,
    availablePoints: user.pointsBalance || 0,
    pointsRule: { minRedeem, redeemBlock, valuePerBlockPaise, label: `${redeemBlock} pts = ${rupees(valuePerBlockPaise)}` },
  };
}

// ---------------------------------------------------------------- CHK-03
async function reserveStock(lines) {
  const done = [];
  for (const l of lines) {
    const r = await Product.updateOne({ _id: l.productId, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
    if (!r.modifiedCount) {
      for (const d of done) await Product.updateOne({ _id: d.productId }, { $inc: { stock: d.qty } });
      throw new ApiError('OUT_OF_STOCK', `${l.title} is out of stock`, [{ field: 'productId', issue: 'stock', productId: l.productId }]);
    }
    done.push(l);
  }
}

async function releaseStock(order) {
  if (!order.stockReserved) return;
  const r = await Order.updateOne({ _id: order._id, stockReserved: true }, { stockReserved: false });
  if (!r.modifiedCount) return;
  for (const l of order.lines) await Product.updateOne({ _id: l.productId }, { $inc: { stock: l.qty } });
}

async function createOrder(user, body) {
  const c = await compute(user, body);
  if (!c.lines.length) throw new ApiError('CART_EMPTY', 'Your cart is empty');
  if (!c.address) throw new ApiError('ADDRESS_REQUIRED', 'Choose a delivery address', [{ field: 'addressId', issue: 'required' }]);
  if (body.expectedTotalPaise !== c.totalPaise) {
    throw new ApiError('PRICE_CHANGED', 'Prices changed since you opened checkout. Please review the new total.', [{ field: 'expectedTotalPaise', issue: 'mismatch', totalPaise: c.totalPaise }]);
  }
  if (c.totalPaise < 100) throw new ApiError('VALIDATION_FAILED', 'Order total is too low to pay online');
  await reserveStock(c.lines);

  const orderNumber = `ORD-${await nextSeq('order', 892300)}`;
  let order;
  try {
    const gw = await payment.createOrder({ amountPaise: c.totalPaise, receipt: orderNumber });
    const a = c.address;
    order = await Order.create({
      orderNumber, userId: user._id,
      lines: c.lines.map((l) => ({
        productId: l.productId, title: l.title, category: l.category, imageUrl: l.imageUrl, unitPricePaise: l.unitPricePaise, qty: l.qty,
        lineTotalPaise: l.lineTotalPaise, taxRatePercent: l.taxRatePercent, taxPaise: Math.round((l.lineTotalPaise * l.taxRatePercent) / 100),
        labelsIncluded: l.labelsIncluded, labelVehicleType: l.labelVehicleType,
      })),
      addressSnapshot: { name: a.name, phone: a.phone, label: a.label, line1: a.line1, line2: a.line2, pincode: a.pincode, city: a.city, state: a.state },
      subtotalPaise: c.subtotalPaise, deliveryPaise: c.deliveryPaise, taxPaise: c.taxPaise, discountPaise: c.discountPaise,
      pointsAppliedPaise: c.pointsAppliedPaise, pointsUsed: c.pointsUsed, totalPaise: c.totalPaise,
      couponCode: c.coupon ? c.coupon.code : undefined, couponId: c.coupon ? c.coupon._id : undefined,
      payment: { gateway: gw.gateway, gatewayOrderId: gw.gatewayOrderId, status: 'CREATED', expiresAt: gw.expiresAt },
      timeline: [{ status: 'PENDING_PAYMENT', note: 'Order created' }],
      stockReserved: true,
    });
    return {
      orderId: String(order._id), orderNumber, status: order.status, totalPaise: order.totalPaise, currency: business.currency,
      payment: { gateway: gw.gateway, keyId: gw.keyId, gatewayOrderId: gw.gatewayOrderId, amountPaise: gw.amountPaise, currency: gw.currency, expiresAt: gw.expiresAt },
    };
  } catch (e) {
    if (!order) for (const l of c.lines) await Product.updateOne({ _id: l.productId }, { $inc: { stock: l.qty } });
    throw e;
  }
}

// ---------------------------------------------------------------- CHK-04
async function confirmPayment(user, { orderId, gatewayPaymentId, signature }) {
  const order = await Order.findOne({ _id: orderId, userId: user._id });
  if (!order) throw new ApiError('ORDER_NOT_FOUND', 'Order not found');
  if (!payment.verifyCheckoutSignature(order.payment.gatewayOrderId, gatewayPaymentId, signature)) {
    throw new ApiError('SIGNATURE_INVALID', 'Payment signature could not be verified');
  }
  if (order.status === 'PENDING_PAYMENT' || order.status === 'CANCELLED') {
    await Order.updateOne({ _id: order._id, 'payment.status': 'CREATED' }, { 'payment.status': 'VERIFYING', 'payment.gatewayPaymentId': gatewayPaymentId });
  }
  const fresh = await Order.findById(order._id);
  const paid = !['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED'].includes(fresh.status);
  return { orderId: String(fresh._id), status: paid ? 'PAID' : 'VERIFYING', orderStatus: fresh.status };
}

// ---------------------------------------------------------------- PAID transition
async function generateLabels(order) {
  const existing = await QrLabel.countDocuments({ orderId: order._id });
  if (existing) return;
  const docs = [];
  for (const l of order.lines) {
    const n = (l.labelsIncluded || 0) * l.qty;
    for (let i = 0; i < n; i += 1) {
      const seq = await nextSeq('qrlabel', 90000);
      docs.push({ qrUuid: crypto.randomUUID(), code: `QR-${LABEL_PREFIX[l.labelVehicleType] || 'ANY'}-${seq}`, vehicleType: l.labelVehicleType || 'ANY', orderId: order._id, purchaserId: order.userId, status: 'GENERATED' });
    }
  }
  if (docs.length) await QrLabel.insertMany(docs);
}

async function markPaid(order, gatewayPaymentId) {
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: { $in: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED'] } },
    {
      status: 'PAID', paidAt: new Date(), 'payment.status': 'CAPTURED', 'payment.gatewayPaymentId': gatewayPaymentId, 'payment.capturedAt': new Date(),
      $push: { timeline: { status: 'PAID', note: 'Payment received', at: new Date() } },
    },
    { returnDocument: 'after' },
  );
  if (!updated) return order; // already paid
  if (!updated.stockReserved) {
    for (const l of updated.lines) await Product.updateOne({ _id: l.productId }, { $inc: { stock: -l.qty } });
    await Order.updateOne({ _id: updated._id }, { stockReserved: true });
  }
  await generateLabels(updated);
  await shop.clearCart(updated.userId);
  if (updated.couponId) {
    try {
      await CouponRedemption.create({ couponId: updated.couponId, userId: updated.userId, orderId: updated._id, discountPaise: updated.discountPaise });
      await Coupon.updateOne({ _id: updated.couponId }, { $inc: { usedCount: 1 } });
    } catch (e) { if (e.code !== 11000) throw e; }
  }
  if (updated.pointsUsed) {
    const r = await User.updateOne({ _id: updated.userId, pointsBalance: { $gte: updated.pointsUsed } }, { $inc: { pointsBalance: -updated.pointsUsed } });
    if (!r.modifiedCount) await User.updateOne({ _id: updated.userId }, { pointsBalance: 0 });
  }
  const earned = Math.floor(updated.totalPaise / business.points.earnPerPaise);
  if (earned > 0) await User.updateOne({ _id: updated.userId }, { $inc: { pointsBalance: earned } });

  try {
    const s = await createShipment({ orderNumber: updated.orderNumber });
    await Order.updateOne({ _id: updated._id }, {
      'shipment.courier': s.courier, 'shipment.awb': s.awb, 'shipment.eta': s.eta,
      $push: { 'shipment.stages': { code: 'PLACED', title: STAGE_TITLES.PLACED, detail: 'Your order has been placed', at: new Date() } },
    });
  } catch (e) { logger.warn('shipment creation failed', { order: updated.orderNumber, err: e.message }); }

  await referral.onOrderPaid(updated);
  await notify(updated.userId, { type: 'ORDER', title: 'Payment successful', body: `Order ${updated.orderNumber} is confirmed`, deepLink: `vtracker://orders/${updated._id}` });
  return updated;
}

async function markFailed(order, reason) {
  const r = await Order.findOneAndUpdate(
    { _id: order._id, status: 'PENDING_PAYMENT' },
    { status: 'PAYMENT_FAILED', 'payment.status': 'FAILED', 'payment.failureReason': reason || 'Payment failed', $push: { timeline: { status: 'PAYMENT_FAILED', note: reason || 'Payment failed', at: new Date() } } },
    { returnDocument: 'after' },
  );
  if (r) {
    await releaseStock(r);
    await notify(r.userId, { type: 'ORDER', title: 'Payment failed', body: `Payment for ${r.orderNumber} did not go through`, deepLink: `vtracker://orders/${r._id}` });
  }
}

async function markRefunded(order) {
  const r = await Order.findOneAndUpdate(
    { _id: order._id, status: { $in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    { status: 'REFUNDED', 'payment.status': 'REFUNDED', $push: { timeline: { status: 'REFUNDED', note: 'Refund processed', at: new Date() } } },
    { returnDocument: 'after' },
  );
  if (!r) return;
  await QrLabel.updateMany({ orderId: r._id, status: { $ne: 'ACTIVE' } }, { status: 'INACTIVE', disabledReason: 'ORDER_REFUNDED' });
  await referral.reverseForOrder(r._id);
}

/** CHK-05 handler (orders). FASTag recharges are delegated to fastag.service. */
async function paymentWebhook(payload) {
  return webhook.once('payment', payload, async (p) => {
    const order = await Order.findOne({ 'payment.gatewayOrderId': p.gatewayOrderId });
    if (!order) {
      const fastag = require('./fastag.service');
      return fastag.onPaymentEvent(p);
    }
    if (p.event === 'payment.captured') {
      if (p.amountPaise !== undefined && p.amountPaise !== order.totalPaise) {
        logger.error('payment amount mismatch', { order: order.orderNumber, expected: order.totalPaise, got: p.amountPaise });
        throw new ApiError('VALIDATION_FAILED', 'Captured amount does not match order total');
      }
      await markPaid(order, p.gatewayPaymentId);
    } else if (p.event === 'payment.failed') {
      await markFailed(order, p.reason);
    } else if (p.event === 'refund.processed') {
      await markRefunded(order);
    }
    const fresh = await Order.findById(order._id);
    return { orderId: String(order._id), status: fresh.status };
  });
}

// ---------------------------------------------------------------- ORD-01 / ORD-02
function progressStep(status) {
  return { PENDING_PAYMENT: 0, PAYMENT_FAILED: 0, CANCELLED: 0, PAID: 1, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3, REFUNDED: 0 }[status] || 0;
}

function itemsSummary(lines) {
  if (!lines.length) return '';
  const first = `${lines[0].title} x ${lines[0].qty}`;
  return lines.length > 1 ? `${first} + ${lines.length - 1} more` : first;
}

async function listOrders(user, { status, ...query }) {
  const p = paginate(query);
  const filter = { userId: user._id };
  if (status) filter.status = status;
  const [rows, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit), Order.countDocuments(filter)]);
  return {
    items: rows.map((o) => ({
      id: String(o._id), orderNumber: o.orderNumber, placedAt: o.createdAt, status: o.status, totalPaise: o.totalPaise, currency: o.currency,
      itemsSummary: itemsSummary(o.lines), itemCount: o.lines.reduce((s, l) => s + l.qty, 0), thumbnailUrl: o.lines[0] ? o.lines[0].imageUrl || null : null,
      progressStep: progressStep(o.status),
    })),
    meta: pageMeta(p, total),
  };
}

async function findOwnOrder(user, id) {
  const o = await Order.findOne({ _id: id, userId: user._id });
  if (!o) throw ApiError.notFound('Order');
  return o;
}

async function getOrder(user, id) {
  const o = await findOwnOrder(user, id);
  const labels = await QrLabel.find({ orderId: o._id }).sort({ code: 1 });
  return {
    id: String(o._id), orderNumber: o.orderNumber, status: o.status, placedAt: o.createdAt, paidAt: o.paidAt || null, progressStep: progressStep(o.status),
    lines: o.lines.map((l) => ({ productId: String(l.productId), title: l.title, category: l.category, imageUrl: l.imageUrl || null, unitPricePaise: l.unitPricePaise, qty: l.qty, lineTotalPaise: l.lineTotalPaise, taxPaise: l.taxPaise })),
    address: o.addressSnapshot,
    payment: { gateway: o.payment.gateway, status: o.payment.status, gatewayOrderId: o.payment.gatewayOrderId, gatewayPaymentId: o.payment.gatewayPaymentId || null, expiresAt: o.payment.expiresAt },
    totals: { subtotalPaise: o.subtotalPaise, deliveryPaise: o.deliveryPaise, taxPaise: o.taxPaise, discountPaise: o.discountPaise, pointsAppliedPaise: o.pointsAppliedPaise, totalPaise: o.totalPaise, currency: o.currency },
    couponCode: o.couponCode || null,
    qrLabels: labels.map((l) => ({ code: l.code, qrUuid: l.qrUuid, vehicleType: l.vehicleType, status: l.status })),
    shipment: o.shipment && o.shipment.awb ? { courier: o.shipment.courier, awb: o.shipment.awb, eta: o.shipment.eta } : null,
    timeline: o.timeline,
  };
}

// ---------------------------------------------------------------- ORD-03
async function tracking(user, ref) {
  const r = String(ref).trim();
  const or = [{ orderNumber: r.toUpperCase() }, { 'shipment.awb': r.toUpperCase() }];
  if (/^[a-f0-9]{24}$/i.test(r)) or.push({ _id: r });
  const o = await Order.findOne({ userId: user._id, $or: or });
  if (!o) throw new ApiError('NOT_FOUND', 'No order or shipment with this number on your account');
  const done = new Map((o.shipment && o.shipment.stages ? o.shipment.stages : []).map((s) => [s.code, s]));
  const lastIdx = STAGES.reduce((acc, code, i) => (done.has(code) ? i : acc), -1);
  return {
    orderId: String(o._id), orderNumber: o.orderNumber, status: o.status,
    courier: o.shipment ? o.shipment.courier || null : null, awb: o.shipment ? o.shipment.awb || null : null, eta: o.shipment ? o.shipment.eta || null : null,
    stages: STAGES.map((code, i) => {
      const s = done.get(code);
      let state = 'PENDING';
      if (i < lastIdx || (s && i === lastIdx && code === 'DELIVERED')) state = 'DONE';
      else if (i === lastIdx) state = 'CURRENT';
      return { code, title: STAGE_TITLES[code], detail: s ? s.detail || null : null, location: s ? s.location || null : null, at: s ? s.at : null, state };
    }),
  };
}

// ---------------------------------------------------------------- ORD-04
async function courierWebhook(payload) {
  return webhook.once('courier', payload, async (p) => {
    const o = await Order.findOne(p.awb ? { 'shipment.awb': p.awb } : { orderNumber: p.orderNumber });
    if (!o) return { ignored: true };
    if (!['PAID', 'PROCESSING', 'SHIPPED'].includes(o.status) && !(o.status === 'DELIVERED' && p.status === 'DELIVERED')) return { ignored: true, status: o.status };
    const at = p.at ? new Date(p.at) : new Date();
    const already = (o.shipment.stages || []).some((s) => s.code === p.status);
    const update = {};
    if (!already) update.$push = { 'shipment.stages': { code: p.status, title: STAGE_TITLES[p.status], detail: p.detail, location: p.location, at } };
    const set = {};
    if (p.eta) set['shipment.eta'] = new Date(p.eta);
    let newStatus = o.status;
    if (p.status === 'PROCESSED' && o.status === 'PAID') newStatus = 'PROCESSING';
    if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(p.status) && ['PAID', 'PROCESSING'].includes(o.status)) newStatus = 'SHIPPED';
    if (p.status === 'DELIVERED') { newStatus = 'DELIVERED'; set.deliveredAt = at; }
    if (newStatus !== o.status) {
      set.status = newStatus;
      update.$push = { ...(update.$push || {}), timeline: { status: newStatus, note: STAGE_TITLES[p.status], at } };
    }
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(update).length) await Order.updateOne({ _id: o._id }, update);

    if (newStatus === 'SHIPPED' && o.status !== 'SHIPPED') {
      await QrLabel.updateMany({ orderId: o._id, status: 'GENERATED' }, { status: 'SHIPPED' });
      await notify(o.userId, { type: 'ORDER', title: 'Order shipped', body: `${o.orderNumber} is on the way`, deepLink: `vtracker://orders/${o._id}/track` });
    }
    if (newStatus === 'DELIVERED' && o.status !== 'DELIVERED') {
      await QrLabel.updateMany({ orderId: o._id, status: { $in: ['GENERATED', 'SHIPPED'] } }, { status: 'DELIVERED' });
      await notify(o.userId, { type: 'ORDER', title: 'Order delivered', body: `Scan your new label to link it to a vehicle`, deepLink: `vtracker://scan` });
    }
    return { orderId: String(o._id), status: newStatus };
  });
}

// ---------------------------------------------------------------- job
async function expireStalePayments() {
  const stale = await Order.find({ status: 'PENDING_PAYMENT', 'payment.expiresAt': { $lt: new Date() }, 'payment.status': 'CREATED' }).limit(200);
  for (const o of stale) {
    const r = await Order.findOneAndUpdate(
      { _id: o._id, status: 'PENDING_PAYMENT', 'payment.status': 'CREATED' },
      { status: 'CANCELLED', $push: { timeline: { status: 'CANCELLED', note: 'Payment window expired', at: new Date() } } },
      { returnDocument: 'after' },
    );
    if (r) await releaseStock(r);
  }
  return stale.length;
}

module.exports = {
  summary, validateCoupon, createOrder, confirmPayment, paymentWebhook, listOrders, getOrder, tracking, courierWebhook,
  expireStalePayments, markPaid, STAGES,
};
