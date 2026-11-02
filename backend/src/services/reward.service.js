'use strict';
const crypto = require('crypto');
const { Reward, User } = require('../models');
const business = require('../config/business');
const ledger = require('./ledger.service');
const { notify } = require('./notification.service');
const ApiError = require('../utils/ApiError');
const { addDays, rupees } = require('../utils/helpers');
const { randomUpper } = require('../utils/crypto');

/** Issue a scratch card. Idempotent per (source, sourceRef, user). */
async function issueCard(userId, cfgKey, source, sourceRef) {
  const cfg = business.rewards[cfgKey];
  try {
    const r = await Reward.create({
      userId, title: cfg.title, subtitle: cfg.subtitle, type: 'CASHBACK', source, sourceRef: sourceRef ? String(sourceRef) : undefined,
      minPaise: cfg.minPaise, maxPaise: cfg.maxPaise, expiresAt: addDays(new Date(), cfg.expiresDays),
    });
    await notify(userId, { type: 'REWARD', title: 'You won a scratch card!', body: cfg.subtitle, deepLink: 'vtracker://rewards' });
    return r;
  } catch (e) {
    if (e.code === 11000) return null;
    throw e;
  }
}

function present(r) {
  const expired = r.status === 'UNSCRATCHED' && r.expiresAt && r.expiresAt < new Date();
  return {
    id: String(r._id),
    title: r.title,
    subtitle: r.subtitle,
    type: r.type,
    source: r.source,
    status: expired ? 'EXPIRED' : r.status,
    expiresAt: r.expiresAt || null,
    createdAt: r.createdAt,
    scratchedAt: r.scratchedAt || null,
    // face value of an unscratched card is never sent (PDF §4.9.2)
    result: r.status === 'SCRATCHED' ? { amountPaise: r.result.amountPaise, code: r.result.code || null, description: r.result.description } : null,
  };
}

async function list(userId, { status }) {
  const q = { userId };
  if (status) q.status = status;
  const items = await Reward.find(q).sort({ createdAt: -1 }).limit(200);
  return items.map(present);
}

/** RWD-02: server decides and records the amount, credits the wallet. */
async function scratch(userId, id) {
  const card = await Reward.findOne({ _id: id, userId });
  if (!card) throw ApiError.notFound('Reward');
  if (card.status === 'SCRATCHED') throw new ApiError('REWARD_ALREADY_SCRATCHED', 'This card was already scratched');
  if (card.expiresAt && card.expiresAt < new Date()) {
    await Reward.updateOne({ _id: card._id, status: 'UNSCRATCHED' }, { status: 'EXPIRED' });
    throw new ApiError('REWARD_EXPIRED', 'This card has expired');
  }
  if (card.status === 'EXPIRED') throw new ApiError('REWARD_EXPIRED', 'This card has expired');

  // multiples of ₹1 between min and max, inclusive
  const steps = Math.floor((card.maxPaise - card.minPaise) / 100);
  const amountPaise = card.minPaise + crypto.randomInt(0, steps + 1) * 100;
  const result = card.type === 'VOUCHER'
    ? { amountPaise: 0, code: `VT-${randomUpper(8)}`, description: 'Voucher code' }
    : { amountPaise, code: null, description: `${rupees(amountPaise)} cashback added to your wallet` };

  // atomic transition: only one caller can win the UNSCRATCHED -> SCRATCHED race
  const won = await Reward.findOneAndUpdate(
    { _id: card._id, status: 'UNSCRATCHED' },
    { status: 'SCRATCHED', result, scratchedAt: new Date() },
    { returnDocument: 'after' },
  );
  if (!won) throw new ApiError('REWARD_ALREADY_SCRATCHED', 'This card was already scratched');
  if (result.amountPaise > 0) await ledger.credit(userId, result.amountPaise, 'REWARD_CASHBACK', { refType: 'Reward', refId: won._id });
  return { id: String(won._id), amountPaise: result.amountPaise, code: result.code, description: result.description };
}

async function summary(userId) {
  const [agg, unscratchedCount, user] = await Promise.all([
    Reward.aggregate([{ $match: { userId, status: 'SCRATCHED', type: 'CASHBACK' } }, { $group: { _id: null, total: { $sum: '$result.amountPaise' } } }]),
    Reward.countDocuments({ userId, status: 'UNSCRATCHED', $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }),
    User.findById(userId).select('pointsBalance'),
  ]);
  const points = user ? user.pointsBalance : 0;
  const { redeemBlock, valuePerBlockPaise } = business.points;
  return {
    totalCashbackPaise: agg[0] ? agg[0].total : 0,
    pointsBalance: points,
    pointsValuePaise: Math.floor(points / redeemBlock) * valuePerBlockPaise,
    unscratchedCount,
  };
}

module.exports = { issueCard, list, scratch, summary, present };
