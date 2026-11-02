'use strict';
/** Content, support, config and lookups (CNT-01, SUP-*, CFG-01, LKP-01). */
const env = require('../config/env');
const business = require('../config/business');
const { Content, Faq, SupportTicket, Pincode, Order, Vehicle } = require('../models');
const { nextSeq } = require('../models/counter.model');
const ApiError = require('../utils/ApiError');

async function getContent(slug) {
  const c = await Content.findOne({ slug });
  if (!c) throw ApiError.notFound('Content');
  return { slug: c.slug, title: c.title, version: c.version, updatedAt: c.updatedAt, blocks: c.blocks };
}

async function faqs() {
  const rows = await Faq.find({ isActive: true }).sort({ order: 1 });
  return rows.map((f) => ({ id: String(f._id), question: f.question, answer: f.answer, order: f.order }));
}

const contact = () => ({ email: env.SUPPORT_EMAIL, phone: env.SUPPORT_PHONE, hours: env.SUPPORT_HOURS });

async function createTicket(user, { category, message, orderId, vehicleId }) {
  if (orderId && !(await Order.exists({ _id: orderId, userId: user._id }))) throw new ApiError('VALIDATION_FAILED', 'Order not found on your account', [{ field: 'orderId', issue: 'not_found' }]);
  if (vehicleId && !(await Vehicle.exists({ _id: vehicleId, ownerId: user._id }))) throw new ApiError('VALIDATION_FAILED', 'Vehicle not found on your account', [{ field: 'vehicleId', issue: 'not_found' }]);
  const t = await SupportTicket.create({ ticketNumber: `VT-${await nextSeq('ticket', 10000)}`, userId: user._id, category, message, orderId, vehicleId });
  return { ticketId: String(t._id), ticketNumber: t.ticketNumber, status: t.status };
}

function config() {
  return {
    minAppVersion: env.MIN_APP_VERSION,
    latestAppVersion: env.LATEST_APP_VERSION,
    maintenance: env.MAINTENANCE_MODE,
    supportContact: contact(),
    minWithdrawPaise: business.minWithdrawPaise,
    maxWithdrawPaise: business.maxWithdrawPaise,
    fastagMinRechargePaise: business.fastagMinRechargePaise,
    deliveryFeePaise: business.deliveryFeePaise,
    currency: business.currency,
    scanBaseUrl: env.SCAN_WEB_BASE_URL,
    featureFlags: {
      googleSignIn: true,
      referralPayouts: business.referral.enabled,
      fastag: true,
      documentVault: true,
      withdrawals: true,
    },
  };
}

async function pincode(pin) {
  const row = await Pincode.findOne({ pincode: pin });
  if (row) return { pincode: row.pincode, city: row.city, state: row.state, district: row.district || null };
  if (env.PINCODE_API_ENABLED) {
    try {
      const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const j = await r.json();
      const po = j && j[0] && j[0].Status === 'Success' && j[0].PostOffice && j[0].PostOffice[0];
      if (po) {
        const doc = { pincode: pin, city: po.Block && po.Block !== 'NA' ? po.Block : po.District, state: po.State, district: po.District };
        await Pincode.updateOne({ pincode: pin }, doc, { upsert: true });
        return doc;
      }
    } catch { /* fall through */ }
  }
  throw new ApiError('PINCODE_NOT_FOUND', 'We could not find this pincode. Enter city and state manually.');
}

module.exports = { getContent, faqs, contact, createTicket, config, pincode };
