'use strict';
/**
 * Background jobs (node-cron):
 *  - every 5 min : cancel orders whose payment window expired, release stock
 *  - hourly      : auto-credit referral payouts older than PAYOUT_AUTO_CREDIT_DAYS
 *  - hourly      : expire old scratch cards
 *  - daily 09:00 : document expiry reminders (30 days before expiryDate)
 */
const cron = require('node-cron');
const logger = require('../utils/logger');
const { Reward, Document } = require('../models');
const orders = require('../services/order.service');
const referral = require('../services/referral.service');
const { notify } = require('../services/notification.service');
const { addDays } = require('../utils/helpers');
const { TYPE_LABELS } = require('../services/document.service');

async function expireRewards() {
  const r = await Reward.updateMany({ status: 'UNSCRATCHED', expiresAt: { $lt: new Date() } }, { status: 'EXPIRED' });
  return r.modifiedCount;
}

async function documentReminders() {
  const soon = await Document.find({ status: 'VERIFIED', expiryDate: { $gte: new Date(), $lte: addDays(new Date(), 30) }, expiryReminderSentAt: null }).limit(500);
  for (const d of soon) {
    await notify(d.userId, { type: 'DOCUMENT', title: `${TYPE_LABELS[d.type]} expires soon`, body: `It expires on ${d.expiryDate.toISOString().slice(0, 10)}. Renew it to stay covered.`, deepLink: 'vtracker://documents' });
    await Document.updateOne({ _id: d._id }, { expiryReminderSentAt: new Date() });
  }
  return soon.length;
}

async function runAll() {
  const out = {
    expiredOrders: await orders.expireStalePayments(),
    creditedPayouts: await referral.autoCreditDue(),
    expiredRewards: await expireRewards(),
    documentReminders: await documentReminders(),
  };
  return out;
}

function wrap(name, fn) {
  return async () => {
    try {
      const n = await fn();
      if (n) logger.info(`job ${name}`, { affected: n });
    } catch (e) { logger.error(`job ${name} failed`, { err: e.message }); }
  };
}

function start() {
  const tasks = [
    cron.schedule('*/5 * * * *', wrap('expire-payments', orders.expireStalePayments)),
    cron.schedule('7 * * * *', wrap('credit-payouts', referral.autoCreditDue)),
    cron.schedule('17 * * * *', wrap('expire-rewards', expireRewards)),
    cron.schedule('0 9 * * *', wrap('document-reminders', documentReminders), { timezone: 'Asia/Kolkata' }),
  ];
  logger.info('Background jobs scheduled');
  return () => tasks.forEach((t) => t.stop());
}

module.exports = { start, runAll, expireRewards, documentReminders };
