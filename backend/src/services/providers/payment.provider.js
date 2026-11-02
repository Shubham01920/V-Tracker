'use strict';
/**
 * Payment gateway adapter. Signature scheme is Razorpay-compatible:
 *   checkout signature = HMAC_SHA256(`${gatewayOrderId}|${gatewayPaymentId}`, PAYMENT_KEY_SECRET)
 * so switching PAYMENT_PROVIDER to a real Razorpay integration only needs createOrder() to call the Razorpay Orders API.
 */
const env = require('../../config/env');
const { hmac, safeEqual, randomToken } = require('../../utils/crypto');
const { addMinutes } = require('../../utils/helpers');

async function createOrder({ amountPaise, receipt }) {
  if (env.PAYMENT_PROVIDER !== 'mock') {
    // TODO real gateway: POST https://api.razorpay.com/v1/orders { amount, currency:'INR', receipt }
    throw new Error(`Payment provider "${env.PAYMENT_PROVIDER}" not implemented`);
  }
  return {
    gateway: 'mock',
    keyId: env.PAYMENT_KEY_ID,
    gatewayOrderId: `order_${randomToken(10).replace(/[-_]/g, 'x')}`,
    amountPaise,
    currency: 'INR',
    receipt,
    expiresAt: addMinutes(new Date(), env.PAYMENT_ORDER_TTL_MIN),
  };
}

const checkoutSignature = (gatewayOrderId, gatewayPaymentId) => hmac(env.PAYMENT_KEY_SECRET, `${gatewayOrderId}|${gatewayPaymentId}`);

function verifyCheckoutSignature(gatewayOrderId, gatewayPaymentId, signature) {
  return safeEqual(checkoutSignature(gatewayOrderId, gatewayPaymentId), signature);
}

/** Mock only: what the gateway's checkout sheet would return to the app after the user pays. */
function simulateCheckout(gatewayOrderId) {
  const gatewayPaymentId = `pay_${randomToken(10).replace(/[-_]/g, 'x')}`;
  return { gatewayOrderId, gatewayPaymentId, signature: checkoutSignature(gatewayOrderId, gatewayPaymentId) };
}

module.exports = { createOrder, verifyCheckoutSignature, checkoutSignature, simulateCheckout };
