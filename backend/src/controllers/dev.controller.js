'use strict';
/**
 * NON-PRODUCTION helpers that play the role of the mock providers, so every flow can be run end to end
 * from Postman without a real gateway / courier / telephony / payout / FASTag account.
 * Mounted only when ENABLE_DEV_ROUTES is true and NODE_ENV !== production.
 */
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { uuid } = require('../utils/crypto');
const payment = require('../services/providers/payment.provider');
const outbox = require('../services/providers/outbox');
const { signPayload, SECRETS } = require('../middlewares/webhookSignature.middleware');
const orders = require('../services/order.service');
const contacts = require('../services/contact.service');
const wallet = require('../services/wallet.service');
const fastag = require('../services/fastag.service');
const { Order, Withdrawal, FastagRecharge, ContactEvent, User } = require('../models');
const { ROLES } = require('../constants/roles');

module.exports = {
  /** Pretend the user paid in the gateway sheet: returns what the SDK would return, and fires the captured webhook. */
  simulatePayment: asyncHandler(async (req, res) => {
    const { gatewayOrderId, outcome = 'success', sendWebhook = true } = req.body || {};
    if (!gatewayOrderId) throw new ApiError('VALIDATION_FAILED', 'gatewayOrderId is required');
    const order = await Order.findOne({ 'payment.gatewayOrderId': gatewayOrderId });
    const recharge = order ? null : await FastagRecharge.findOne({ 'payment.gatewayOrderId': gatewayOrderId });
    if (!order && !recharge) throw ApiError.notFound('Payment order');
    const checkout = payment.simulateCheckout(gatewayOrderId);
    let webhookResult = null;
    if (sendWebhook) {
      webhookResult = await orders.paymentWebhook({
        eventId: `evt_${uuid()}`, event: outcome === 'success' ? 'payment.captured' : 'payment.failed', gatewayOrderId,
        gatewayPaymentId: checkout.gatewayPaymentId, amountPaise: order ? order.totalPaise : recharge.amountPaise, reason: outcome === 'success' ? undefined : 'Declined by bank (simulated)',
      });
    }
    return R.ok(res, { checkout, webhook: webhookResult });
  }),

  advanceShipment: asyncHandler(async (req, res) => {
    const { orderId, status } = req.body || {};
    const o = await Order.findById(orderId);
    if (!o) throw ApiError.notFound('Order');
    return R.ok(res, await orders.courierWebhook({ eventId: `evt_${uuid()}`, awb: o.shipment && o.shipment.awb, orderNumber: o.orderNumber, status, detail: `Simulated ${status}`, location: 'Bengaluru Hub' }));
  }),

  completeCall: asyncHandler(async (req, res) => {
    const { contactId, outcome = 'ANSWERED', durationSec = 45 } = req.body || {};
    const ev = await ContactEvent.findById(contactId);
    if (!ev || !ev.sessionId) throw ApiError.notFound('Call');
    const event = { ANSWERED: 'call.completed', MISSED: 'call.missed', FAILED: 'call.failed' }[outcome] || 'call.completed';
    return R.ok(res, await contacts.telephonyWebhook({ eventId: `evt_${uuid()}`, event, sessionId: ev.sessionId, durationSec }));
  }),

  settlePayout: asyncHandler(async (req, res) => {
    const { withdrawalId, outcome = 'success' } = req.body || {};
    const w = await Withdrawal.findById(withdrawalId);
    if (!w || !w.providerRef) throw ApiError.notFound('Withdrawal');
    return R.ok(res, await wallet.payoutWebhook({
      eventId: `evt_${uuid()}`, event: outcome === 'success' ? 'payout.processed' : 'payout.failed', providerRef: w.providerRef,
      utr: outcome === 'success' ? `UTR${Date.now()}` : undefined, reason: outcome === 'success' ? undefined : 'Beneficiary bank offline (simulated)',
    }));
  }),

  settleFastag: asyncHandler(async (req, res) => {
    const { rechargeId, outcome = 'success' } = req.body || {};
    const r = await FastagRecharge.findById(rechargeId);
    if (!r || !r.providerRef) throw new ApiError('VALIDATION_FAILED', 'Recharge is not paid yet (no provider reference)');
    return R.ok(res, await fastag.fastagWebhook({ eventId: `evt_${uuid()}`, event: outcome === 'success' ? 'recharge.credited' : 'recharge.failed', providerRef: r.providerRef }));
  }),

  /** Returns the headers needed to call /v1/webhooks/<provider> yourself with this exact body string. */
  signWebhook: asyncHandler(async (req, res) => {
    const { provider, body } = req.body || {};
    if (!SECRETS[provider]) throw new ApiError('VALIDATION_FAILED', `provider must be one of ${Object.keys(SECRETS).join(', ')}`);
    const raw = typeof body === 'string' ? body : JSON.stringify(body || {});
    const ts = Math.floor(Date.now() / 1000);
    return R.ok(res, { rawBody: raw, headers: { 'X-Timestamp': String(ts), 'X-Signature': signPayload(SECRETS[provider](), ts, raw), 'Content-Type': 'application/json' } });
  }),

  outbox: asyncHandler(async (req, res) => R.ok(res, outbox.boxes)),

  makeAdmin: asyncHandler(async (req, res) => {
    const u = await User.findOneAndUpdate({ email: String((req.body || {}).email || '').toLowerCase() }, { role: ROLES.ADMIN }, { returnDocument: 'after' });
    if (!u) throw ApiError.notFound('User');
    return R.ok(res, { id: String(u._id), role: u.role, note: 'Role is read from the database on every request, so existing tokens now have admin access.' });
  }),
};
