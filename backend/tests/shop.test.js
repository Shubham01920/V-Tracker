'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, idem, createUser, productBySlug, addAddress, placePaidOrder, webhook } = require('./helpers/api');
const payment = require('../src/services/providers/payment.provider');
const { Product, Order, User } = require('../src/models');
const orderService = require('../src/services/order.service');

describe('Catalogue and wishlist (SHP-01..02, WSH-01..02)', () => {
  test('SHP-01 lists products, filters by category and searches', async () => {
    const all = await api().get('/v1/products').expect(200);
    expect(all.body.data.items.length).toBe(5);
    expect(all.body.meta).toMatchObject({ page: 1, limit: 20, total: 5, hasMore: false });
    const p = all.body.data.items[0];
    expect(Number.isInteger(p.pricePaise)).toBe(true);
    expect(p.imageUrl).toMatch(/^http/);
    expect(p.wishlisted).toBeUndefined();

    const four = await api().get('/v1/products').query({ category: 'FOUR_WHEELER' }).expect(200);
    expect(four.body.data.items.map((i) => i.slug)).toEqual(['four-wheeler-qr-label']);
    const q = await api().get('/v1/products').query({ q: 'bikes' }).expect(200);
    expect(q.body.data.items[0].slug).toBe('two-wheeler-qr-label');
    const paged = await api().get('/v1/products').query({ limit: 2, page: 2 }).expect(200);
    expect(paged.body.data.items).toHaveLength(2);
    expect(paged.body.meta.hasMore).toBe(true);
    await api().get('/v1/products').query({ category: 'BOAT' }).expect(422);
    // regex characters are escaped
    await api().get('/v1/products').query({ q: '(((' }).expect(200);
  });

  test('SHP-02 detail + WSH-01/02 wishlist toggles', async () => {
    const u = await createUser();
    const p = await productBySlug('four-wheeler-qr-label');
    const d = await api().get(`/v1/products/${p._id}`).set(bearer(u)).expect(200);
    expect(d.body.data).toMatchObject({ title: '4 Wheeler QR Label', pricePaise: 99900, wishlisted: false, ratingCount: 1200 });
    expect(d.body.data.gallery.length).toBeGreaterThan(1);
    expect(d.body.data.features.length).toBeGreaterThan(0);

    await api().put(`/v1/wishlist/${p._id}`).set(bearer(u)).expect(204);
    await api().put(`/v1/wishlist/${p._id}`).set(bearer(u)).expect(204); // idempotent
    const list = await api().get('/v1/products').set(bearer(u)).expect(200);
    expect(list.body.data.items.find((i) => i.id === String(p._id)).wishlisted).toBe(true);
    await api().delete(`/v1/wishlist/${p._id}`).set(bearer(u)).expect(204);
    const again = await api().get(`/v1/products/${p._id}`).set(bearer(u)).expect(200);
    expect(again.body.data.wishlisted).toBe(false);

    await api().get('/v1/products/0123456789abcdef01234567').expect(404);
    await api().put('/v1/wishlist/0123456789abcdef01234567').set(bearer(u)).expect(404);
  });
});

describe('Cart (CRT-01..04)', () => {
  test('set qty, re-price, remove, clear, stock and qty limits', async () => {
    const u = await createUser();
    const four = await productBySlug('four-wheeler-qr-label');
    const two = await productBySlug('two-wheeler-qr-label');
    const empty = await api().get('/v1/cart').set(bearer(u)).expect(200);
    expect(empty.body.data).toMatchObject({ items: [], totalItems: 0, subtotalPaise: 0 });

    await api().put(`/v1/cart/items/${four._id}`).set(bearer(u)).send({ qty: 1 }).expect(200);
    const c = await api().put(`/v1/cart/items/${two._id}`).set(bearer(u)).send({ qty: 2 }).expect(200);
    expect(c.body.data.totalItems).toBe(3);
    expect(c.body.data.subtotalPaise).toBe(99900 + 2 * 49900);

    // price changes in the catalogue are reflected on the next read
    await Product.updateOne({ _id: two._id }, { pricePaise: 45900 });
    const re = await api().get('/v1/cart').set(bearer(u)).expect(200);
    expect(re.body.data.subtotalPaise).toBe(99900 + 2 * 45900);
    await Product.updateOne({ _id: two._id }, { pricePaise: 49900 });

    const rm = await api().delete(`/v1/cart/items/${two._id}`).set(bearer(u)).expect(200);
    expect(rm.body.data.items.map((i) => i.productId)).toEqual([String(four._id)]);

    const limit = await api().put(`/v1/cart/items/${four._id}`).set(bearer(u)).send({ qty: 11 }).expect(422);
    expect(limit.body.error.code).toBe('QTY_LIMIT');
    await Product.updateOne({ _id: two._id }, { stock: 1 });
    const oos = await api().put(`/v1/cart/items/${two._id}`).set(bearer(u)).send({ qty: 2 }).expect(409);
    expect(oos.body.error.code).toBe('OUT_OF_STOCK');
    await Product.updateOne({ _id: two._id }, { stock: 5000 });

    await api().delete('/v1/cart').set(bearer(u)).expect(204);
    const after = await api().get('/v1/cart').set(bearer(u)).expect(200);
    expect(after.body.data.items).toHaveLength(0);
  });
});

describe('Checkout and payments (CHK-01..05)', () => {
  test('CHK-01 summary: tax, delivery, coupon and points computed by the server', async () => {
    const u = await createUser();
    const four = await productBySlug('four-wheeler-qr-label');
    await api().put(`/v1/cart/items/${four._id}`).set(bearer(u)).send({ qty: 1 }).expect(200);
    const a = await addAddress(u);
    const s = await api().get('/v1/checkout/summary').query({ addressId: a.id }).set(bearer(u)).expect(200);
    expect(s.body.data).toMatchObject({ subtotalPaise: 99900, deliveryPaise: 6000, taxPaise: 17982, discountPaise: 0, totalPaise: 99900 + 6000 + 17982 });
    expect(s.body.data.address.id).toBe(a.id);

    const withCoupon = await api().get('/v1/checkout/summary').query({ addressId: a.id, couponCode: 'welcome50' }).set(bearer(u)).expect(200);
    expect(withCoupon.body.data.discountPaise).toBe(5000);
    expect(withCoupon.body.data.totalPaise).toBe(s.body.data.totalPaise - 5000);

    await User.updateOne({ _id: u.userId }, { pointsBalance: 520 });
    const pts = await api().get('/v1/checkout/summary').query({ redeemPoints: true }).set(bearer(u)).expect(200);
    expect(pts.body.data).toMatchObject({ pointsUsed: 500, pointsAppliedPaise: 5000, availablePoints: 520 });

    const bad = await api().get('/v1/checkout/summary').query({ couponCode: 'NOPE' }).set(bearer(u)).expect(422);
    expect(bad.body.error.code).toBe('COUPON_INVALID');
  });

  test('CHK-02 validate coupon', async () => {
    const u = await createUser();
    const ok = await api().post('/v1/coupons/validate').set(bearer(u)).send({ code: 'save10', subtotalPaise: 150000 }).expect(200);
    expect(ok.body.data).toMatchObject({ valid: true, code: 'SAVE10', discountPaise: 15000 });
    const capped = await api().post('/v1/coupons/validate').set(bearer(u)).send({ code: 'SAVE10', subtotalPaise: 900000 }).expect(200);
    expect(capped.body.data.discountPaise).toBe(20000);
    const min = await api().post('/v1/coupons/validate').set(bearer(u)).send({ code: 'SAVE10', subtotalPaise: 1000 }).expect(422);
    expect(min.body.error.code).toBe('COUPON_INVALID');
    const { Coupon } = require('../src/models');
    await Coupon.create({ code: 'OLDONE', type: 'FLAT', value: 1000, validTo: new Date(Date.now() - 86400000) });
    const exp = await api().post('/v1/coupons/validate').set(bearer(u)).send({ code: 'OLDONE', subtotalPaise: 100000 }).expect(422);
    expect(exp.body.error.code).toBe('COUPON_EXPIRED');
    await Coupon.create({ code: 'USEDUP', type: 'FLAT', value: 1000, usageLimit: 1, usedCount: 1 });
    const lim = await api().post('/v1/coupons/validate').set(bearer(u)).send({ code: 'USEDUP', subtotalPaise: 100000 }).expect(422);
    expect(lim.body.error.code).toBe('COUPON_LIMIT');
  });

  test('CHK-03 create order: idempotency, price lock, empty cart, stock reserve', async () => {
    const u = await createUser();
    const noKey = await api().post('/v1/orders').set(bearer(u)).send({ addressId: '0123456789abcdef01234567', expectedTotalPaise: 1 }).expect(400);
    expect(noKey.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
    const a = await addAddress(u);
    const emptyCart = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: a.id, expectedTotalPaise: 0 }).expect(422);
    expect(emptyCart.body.error.code).toBe('CART_EMPTY');

    const four = await productBySlug('four-wheeler-qr-label');
    const stockBefore = four.stock;
    await api().put(`/v1/cart/items/${four._id}`).set(bearer(u)).send({ qty: 2 }).expect(200);
    const s = await api().get('/v1/checkout/summary').query({ addressId: a.id }).set(bearer(u)).expect(200);
    const changed = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: a.id, expectedTotalPaise: s.body.data.totalPaise - 1 }).expect(409);
    expect(changed.body.error.code).toBe('PRICE_CHANGED');
    expect(changed.body.error.details[0].totalPaise).toBe(s.body.data.totalPaise);

    const key = idem();
    const body = { addressId: a.id, expectedTotalPaise: s.body.data.totalPaise };
    const o1 = await api().post('/v1/orders').set(bearer(u)).set(key).send(body).expect(201);
    expect(o1.body.data).toMatchObject({ status: 'PENDING_PAYMENT', totalPaise: s.body.data.totalPaise, payment: { gateway: 'mock', amountPaise: s.body.data.totalPaise, currency: 'INR' } });
    expect(o1.body.data.orderNumber).toMatch(/^ORD-\d+$/);
    const o2 = await api().post('/v1/orders').set(bearer(u)).set(key).send(body).expect(201);
    expect(o2.headers['idempotent-replayed']).toBe('true');
    expect(o2.body.data.orderId).toBe(o1.body.data.orderId);
    const reuse = await api().post('/v1/orders').set(bearer(u)).set(key).send({ ...body, redeemPoints: true }).expect(422);
    expect(reuse.body.error.code).toBe('IDEMPOTENCY_KEY_REUSED');
    expect(await Order.countDocuments({ userId: u.userId })).toBe(1);
    expect((await Product.findById(four._id)).stock).toBe(stockBefore - 2);
  });

  test('CHK-04 confirm + CHK-05 webhook -> PAID, labels, cart cleared, shipment, points', async () => {
    const u = await createUser();
    const pkg = await productBySlug('complete-protection-package');
    await api().put(`/v1/cart/items/${pkg._id}`).set(bearer(u)).send({ qty: 1 }).expect(200);
    const a = await addAddress(u);
    const s = await api().get('/v1/checkout/summary').query({ addressId: a.id, couponCode: 'WELCOME50' }).set(bearer(u)).expect(200);
    const o = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: a.id, couponCode: 'WELCOME50', expectedTotalPaise: s.body.data.totalPaise }).expect(201);
    const { gatewayOrderId } = o.body.data.payment;

    const badSig = await api().post('/v1/payments/confirm').set(bearer(u)).send({ orderId: o.body.data.orderId, gatewayPaymentId: 'pay_x', signature: 'bad' }).expect(401);
    expect(badSig.body.error.code).toBe('SIGNATURE_INVALID');
    const co = payment.simulateCheckout(gatewayOrderId);
    const conf = await api().post('/v1/payments/confirm').set(bearer(u)).send({ orderId: o.body.data.orderId, gatewayPaymentId: co.gatewayPaymentId, signature: co.signature }).expect(200);
    expect(conf.body.data.status).toBe('VERIFYING');
    const nf = await api().post('/v1/payments/confirm').set(bearer(u)).send({ orderId: '0123456789abcdef01234567', gatewayPaymentId: co.gatewayPaymentId, signature: co.signature }).expect(404);
    expect(nf.body.error.code).toBe('ORDER_NOT_FOUND');

    // amount mismatch is rejected
    await webhook('payment', { event: 'payment.captured', gatewayOrderId, gatewayPaymentId: co.gatewayPaymentId, amountPaise: 1 }).expect(422);
    const wh = await webhook('payment', { event: 'payment.captured', gatewayOrderId, gatewayPaymentId: co.gatewayPaymentId, amountPaise: o.body.data.totalPaise }).expect(200);
    expect(wh.body.data).toMatchObject({ received: true, status: 'PAID' });

    const d = await api().get(`/v1/orders/${o.body.data.orderId}`).set(bearer(u)).expect(200);
    expect(d.body.data.status).toBe('PAID');
    expect(d.body.data.qrLabels).toHaveLength(5);
    expect(d.body.data.qrLabels[0]).toMatchObject({ vehicleType: 'ANY', status: 'GENERATED' });
    expect(d.body.data.shipment.awb).toMatch(/^BD\d{9}$/);
    expect(d.body.data.couponCode).toBe('WELCOME50');
    const cart = await api().get('/v1/cart').set(bearer(u)).expect(200);
    expect(cart.body.data.items).toHaveLength(0);
    const me = await api().get('/v1/me').set(bearer(u)).expect(200);
    expect(me.body.data.pointsBalance).toBe(Math.floor(o.body.data.totalPaise / 1000));
    const conf2 = await api().post('/v1/payments/confirm').set(bearer(u)).send({ orderId: o.body.data.orderId, gatewayPaymentId: co.gatewayPaymentId, signature: co.signature }).expect(200);
    expect(conf2.body.data.status).toBe('PAID');
    // coupon is now used up for this user
    const again = await api().post('/v1/coupons/validate').set(bearer(u)).send({ code: 'WELCOME50', subtotalPaise: 100000 }).expect(422);
    expect(again.body.error.code).toBe('COUPON_LIMIT');
  });

  test('CHK-05 failed payment releases stock; refund disables unused labels; expiry job cancels', async () => {
    const u = await createUser();
    const two = await productBySlug('two-wheeler-qr-label');
    const before = (await Product.findById(two._id)).stock;
    await api().put(`/v1/cart/items/${two._id}`).set(bearer(u)).send({ qty: 1 }).expect(200);
    const a = await addAddress(u);
    const s = await api().get('/v1/checkout/summary').set(bearer(u)).expect(200);
    const o = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: a.id, expectedTotalPaise: s.body.data.totalPaise }).expect(201);
    await webhook('payment', { event: 'payment.failed', gatewayOrderId: o.body.data.payment.gatewayOrderId, reason: 'Card declined' }).expect(200);
    const d = await api().get(`/v1/orders/${o.body.data.orderId}`).set(bearer(u)).expect(200);
    expect(d.body.data.status).toBe('PAYMENT_FAILED');
    expect((await Product.findById(two._id)).stock).toBe(before);

    const paid = await placePaidOrder(u, { slug: 'two-wheeler-qr-label', deliver: false });
    await webhook('payment', { event: 'refund.processed', gatewayOrderId: paid.gatewayOrderId }).expect(200);
    const r = await api().get(`/v1/orders/${paid.orderId}`).set(bearer(u)).expect(200);
    expect(r.body.data.status).toBe('REFUNDED');
    expect(r.body.data.qrLabels.every((l) => l.status === 'INACTIVE')).toBe(true);

    await api().put(`/v1/cart/items/${two._id}`).set(bearer(u)).send({ qty: 1 }).expect(200);
    const s2 = await api().get('/v1/checkout/summary').set(bearer(u)).expect(200);
    const o2 = await api().post('/v1/orders').set(bearer(u)).set(idem()).send({ addressId: a.id, expectedTotalPaise: s2.body.data.totalPaise }).expect(201);
    await Order.updateOne({ _id: o2.body.data.orderId }, { 'payment.expiresAt': new Date(Date.now() - 1000) });
    await orderService.expireStalePayments();
    expect((await Order.findById(o2.body.data.orderId)).status).toBe('CANCELLED');
  });
});

describe('Orders and tracking (ORD-01..04)', () => {
  test('ORD-01 list, ORD-02 detail, ORD-03 tracking, ORD-04 courier events', async () => {
    const u = await createUser();
    const { orderId, order } = await placePaidOrder(u, { qty: 2, deliver: false });
    const list = await api().get('/v1/orders').set(bearer(u)).expect(200);
    expect(list.body.data.items[0]).toMatchObject({ id: orderId, status: 'PAID', itemCount: 2, progressStep: 1 });
    expect(list.body.data.items[0].itemsSummary).toBe('4 Wheeler QR Label x 2');
    const filtered = await api().get('/v1/orders').query({ status: 'DELIVERED' }).set(bearer(u)).expect(200);
    expect(filtered.body.data.items).toHaveLength(0);

    expect(order.qrLabels).toHaveLength(2);
    expect(order.address.phone).toBe('9876543210');

    const t1 = await api().get('/v1/tracking').query({ ref: order.orderNumber }).set(bearer(u)).expect(200);
    expect(t1.body.data.courier).toBe('Blue Dart Express');
    expect(t1.body.data.stages.map((s) => s.state)).toEqual(['CURRENT', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']);

    const awb = order.shipment.awb;
    await webhook('courier', { awb, status: 'PROCESSED' }).expect(200);
    await webhook('courier', { awb, status: 'SHIPPED', location: 'Bengaluru Hub' }).expect(200);
    const t2 = await api().get('/v1/tracking').query({ ref: awb }).set(bearer(u)).expect(200);
    expect(t2.body.data.status).toBe('SHIPPED');
    expect(t2.body.data.stages.slice(0, 4).map((s) => s.state)).toEqual(['DONE', 'DONE', 'CURRENT', 'PENDING']);
    await webhook('courier', { awb, status: 'IN_TRANSIT' }).expect(200);
    await webhook('courier', { orderNumber: order.orderNumber, status: 'DELIVERED' }).expect(200);
    const t3 = await api().get('/v1/tracking').query({ ref: orderId }).set(bearer(u)).expect(200);
    expect(t3.body.data.status).toBe('DELIVERED');
    expect(t3.body.data.stages.find((s) => s.code === 'DELIVERED').state).toBe('DONE');
    const d = await api().get(`/v1/orders/${orderId}`).set(bearer(u)).expect(200);
    expect(d.body.data.qrLabels.every((l) => l.status === 'DELIVERED')).toBe(true);
    expect(d.body.data.progressStep).toBe(3);

    const other = await createUser();
    await api().get('/v1/tracking').query({ ref: order.orderNumber }).set(bearer(other)).expect(404);
    await api().get(`/v1/orders/${orderId}`).set(bearer(other)).expect(404);
    // duplicate event ids are processed once
    const s = require('./helpers/api').signed('courier', { eventId: 'dup-1', awb, status: 'DELIVERED' });
    await api().post('/v1/webhooks/courier').set(s.headers).send(s.raw).expect(200);
    const dup = await api().post('/v1/webhooks/courier').set(s.headers).send(s.raw).expect(200);
    expect(dup.body.data.duplicate).toBe(true);
  });
});
