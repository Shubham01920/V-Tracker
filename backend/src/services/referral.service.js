'use strict';
/**
 * Referral network, team tree and payouts (REF-*, PAY-*).
 * Payout amounts come from config/business.js -> referral.levels (PLACEHOLDER, legal review needed: PDF §0 item 8).
 * Earned = PENDING + CREDITED, Credited = in wallet, Pending = not yet in wallet. Same definition on every screen.
 */
const mongoose = require('mongoose');
const { User, Payout, Reward } = require('../models');
const business = require('../config/business');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const ledger = require('./ledger.service');
const { notify } = require('./notification.service');
const { maskEmail, paginate, pageMeta, escapeRegex, rupees, addDays } = require('../utils/helpers');

const oid = (id) => new mongoose.Types.ObjectId(String(id));

// ---------------------------------------------------------------- engine
/** Called once when an order becomes PAID. Creates PENDING payouts for up to 15 ancestors. */
async function onOrderPaid(order) {
  await User.updateOne({ _id: order.userId }, { isActiveMember: true });
  if (!business.referral.enabled) return [];
  const buyer = await User.findById(order.userId);
  if (!buyer || !buyer.ancestors || !buyer.ancestors.length) return [];
  const created = [];
  for (let i = 0; i < Math.min(buyer.ancestors.length, business.referral.maxLevels); i += 1) {
    const level = i + 1;
    const rule = business.referral.levels.find((l) => l.level === level);
    if (!rule || rule.bonusPaise <= 0) continue;
    const ancestorId = buyer.ancestors[i];
    const direct = await User.countDocuments({ referredBy: ancestorId, phoneVerified: true });
    if (direct < rule.requiredDirectReferrals) continue;
    try {
      const p = await Payout.create({
        userId: ancestorId, fromUserId: buyer._id, orderId: order._id, level, amountPaise: rule.bonusPaise,
        title: `Team ${level} Referral Bonus`,
      });
      created.push(p);
      await notify(ancestorId, { type: 'PAYOUT', title: 'Referral bonus earned', body: `${rupees(rule.bonusPaise)} from ${buyer.fullName} (Team ${level})`, deepLink: 'vtracker://payouts' });
    } catch (e) {
      if (e.code !== 11000) throw e;
    }
  }
  return created;
}

/** PENDING -> CREDITED (wallet credit). Used by the auto-credit job and the admin endpoint. */
async function creditPayout(payoutId) {
  const p = await Payout.findOneAndUpdate({ _id: payoutId, status: 'PENDING' }, { status: 'CREDITED', creditedAt: new Date() }, { returnDocument: 'after' });
  if (!p) return null;
  await ledger.credit(p.userId, p.amountPaise, 'REFERRAL_PAYOUT', { refType: 'Payout', refId: p._id });
  return p;
}

async function reversePayout(payoutId) {
  const p = await Payout.findById(payoutId);
  if (!p || p.status === 'REVERSED') return p;
  const wasCredited = p.status === 'CREDITED';
  const r = await Payout.findOneAndUpdate({ _id: p._id, status: p.status }, { status: 'REVERSED', reversedAt: new Date() }, { returnDocument: 'after' });
  if (r && wasCredited) {
    try { await ledger.debit(p.userId, p.amountPaise, 'PAYOUT_REVERSAL', { refType: 'Payout', refId: p._id }); } catch { /* balance already withdrawn: flagged for manual recovery */ }
  }
  return r;
}

async function reverseForOrder(orderId) {
  const ps = await Payout.find({ orderId, status: { $ne: 'REVERSED' } });
  for (const p of ps) await reversePayout(p._id);
}

async function autoCreditDue() {
  const due = await Payout.find({ status: 'PENDING', createdAt: { $lte: addDays(new Date(), -env.PAYOUT_AUTO_CREDIT_DAYS) } }).limit(500);
  let n = 0;
  for (const p of due) if (await creditPayout(p._id)) n += 1;
  return n;
}

// ---------------------------------------------------------------- helpers
async function teamCounts(userId) {
  const [total, active] = await Promise.all([
    User.countDocuments({ ancestors: oid(userId), phoneVerified: true }),
    User.countDocuments({ ancestors: oid(userId), phoneVerified: true, isActiveMember: true }),
  ]);
  return { total, active };
}

async function payoutTotals(userId) {
  const rows = await Payout.aggregate([
    { $match: { userId: oid(userId) } },
    { $group: { _id: '$status', amount: { $sum: '$amountPaise' }, count: { $sum: 1 } } },
  ]);
  const t = { PENDING: { amount: 0, count: 0 }, CREDITED: { amount: 0, count: 0 }, REVERSED: { amount: 0, count: 0 } };
  rows.forEach((r) => { t[r._id] = { amount: r.amount, count: r.count }; });
  return t;
}

async function byLevel(userId) {
  const rows = await Payout.aggregate([
    { $match: { userId: oid(userId), status: { $ne: 'REVERSED' } } },
    {
      $group: {
        _id: '$level',
        credited: { $sum: { $cond: [{ $eq: ['$status', 'CREDITED'] }, '$amountPaise', 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$amountPaise', 0] } },
        count: { $sum: 1 },
      },
    },
  ]);
  return new Map(rows.map((r) => [r._id, r]));
}

// ---------------------------------------------------------------- REF-01
async function summary(user) {
  const [cards, earned] = await Promise.all([
    Reward.countDocuments({ userId: user._id, source: 'REFERRAL' }),
    Reward.aggregate([{ $match: { userId: user._id, source: 'REFERRAL', status: 'SCRATCHED' } }, { $group: { _id: null, t: { $sum: '$result.amountPaise' } } }]),
  ]);
  const totals = await payoutTotals(user._id);
  const shareUrl = `${env.PUBLIC_BASE_URL}/r/${user.referralCode}`;
  return {
    code: user.referralCode,
    shareUrl,
    shareText: `Protect your vehicle with V Tracker - people can reach you without seeing your number. Sign up with my code ${user.referralCode}: ${shareUrl}`,
    totalEarnedPaise: (earned[0] ? earned[0].t : 0) + totals.CREDITED.amount + totals.PENDING.amount,
    rewardCashbackPaise: earned[0] ? earned[0].t : 0,
    scratchCardCount: cards,
  };
}

// ---------------------------------------------------------------- REF-02
async function direct(user, { q, ...query }) {
  const p = paginate(query);
  const filter = { referredBy: user._id, phoneVerified: true };
  if (q) filter.$or = [{ fullName: new RegExp(escapeRegex(q), 'i') }, { memberId: new RegExp(escapeRegex(q), 'i') }];
  const [rows, total, all, active] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit),
    User.countDocuments(filter),
    User.countDocuments({ referredBy: user._id, phoneVerified: true }),
    User.countDocuments({ referredBy: user._id, phoneVerified: true, isActiveMember: true }),
  ]);
  const items = await Promise.all(rows.map(async (u, i) => {
    const t = await teamCounts(u._id);
    return {
      sn: p.skip + i + 1, name: u.fullName, emailMasked: maskEmail(u.email), userId: u.memberId, joinedAt: u.createdAt,
      totalTeam: t.total, activeTeam: t.active, status: u.isActiveMember ? 'ACTIVE' : 'INACTIVE',
    };
  }));
  return { items, stats: { total: all, active, activePercent: all ? Math.round((active / all) * 100) : 0 }, meta: pageMeta(p, total) };
}

// ---------------------------------------------------------------- REF-03
async function performance(user) {
  const [directCount, team, totals, levels, wallet, cashback] = await Promise.all([
    User.countDocuments({ referredBy: user._id, phoneVerified: true }),
    teamCounts(user._id),
    payoutTotals(user._id),
    byLevel(user._id),
    ledger.getWallet(user._id),
    Reward.aggregate([{ $match: { userId: user._id, status: 'SCRATCHED' } }, { $group: { _id: null, t: { $sum: '$result.amountPaise' } } }]),
  ]);
  const teamEarned = totals.CREDITED.amount + totals.PENDING.amount;
  const cashbackPaise = cashback[0] ? cashback[0].t : 0;
  return {
    profile: { name: user.fullName, memberId: user.memberId, referralCode: user.referralCode, emailMasked: maskEmail(user.email), avatarUrl: user.avatarUrl || null },
    overview: { directReferrals: directCount, totalTeam: team.total, activeTeam: team.active, totalPayouts: totals.CREDITED.count + totals.PENDING.count },
    earnings: {
      personalEarningsPaise: teamEarned + cashbackPaise,
      availableBalancePaise: wallet.availablePaise,
      heldBalancePaise: wallet.heldPaise,
      totalTeamsEarningsPaise: teamEarned,
      creditedPaise: totals.CREDITED.amount,
      pendingPaise: totals.PENDING.amount,
      rewardCashbackPaise: cashbackPaise,
    },
    teamEarnings: business.referral.levels.map((l) => {
      const r = levels.get(l.level);
      return { level: l.level, team: `Team ${l.level}`, amountPaise: r ? r.credited + r.pending : 0, count: r ? r.count : 0 };
    }),
    activityRate: { activeMembers: team.active, totalMembers: team.total, activePercent: team.total ? Math.round((team.active / team.total) * 100) : 0 },
    requirements: business.referral.levels.map((l) => ({
      level: l.level, team: `Team ${l.level}`, requiredDirectReferrals: l.requiredDirectReferrals, currentDirectReferrals: directCount,
      met: directCount >= l.requiredDirectReferrals, bonusPaise: l.bonusPaise,
    })),
    payoutStatus: {
      creditedPaise: totals.CREDITED.amount, creditedCount: totals.CREDITED.count,
      pendingPaise: totals.PENDING.amount, pendingCount: totals.PENDING.count,
      reversedPaise: totals.REVERSED.amount, reversedCount: totals.REVERSED.count,
    },
    programEnabled: business.referral.enabled,
  };
}

// ---------------------------------------------------------------- REF-04 / REF-05
async function teamSummary(user) {
  const t = await teamCounts(user._id);
  const levels = await User.aggregate([
    { $match: { ancestors: user._id, phoneVerified: true } },
    { $project: { idx: { $indexOfArray: ['$ancestors', user._id] } } },
    { $group: { _id: { $add: ['$idx', 1] }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return {
    totalMembers: t.total, activeMembers: t.active, activeRatePercent: t.total ? Math.round((t.active / t.total) * 100) : 0,
    byLevel: levels.map((l) => ({ level: l._id, members: l.count })),
  };
}

async function nodeOf(u, step) {
  const childCount = await User.countDocuments({ referredBy: u._id, phoneVerified: true });
  return { id: String(u._id), step, stepLabel: `S${step}`, name: u.fullName, userId: u.memberId, joinedAt: u.createdAt, status: u.isActiveMember ? 'ACTIVE' : 'INACTIVE', childCount };
}

/** Lazy tree: children of parentId (default: me), `depth` levels (max 2), paginated at the first level. */
async function teamTree(user, { parentId, depth = 1, ...query }) {
  const p = paginate(query);
  let parent = user;
  let parentStep = 1;
  if (parentId && String(parentId) !== String(user._id)) {
    parent = await User.findOne({ _id: parentId, ancestors: user._id });
    if (!parent) throw ApiError.notFound('Team member');
    parentStep = parent.ancestors.findIndex((a) => String(a) === String(user._id)) + 2;
  }
  const filter = { referredBy: parent._id, phoneVerified: true };
  const [kids, total] = await Promise.all([User.find(filter).sort({ createdAt: 1 }).skip(p.skip).limit(p.limit), User.countDocuments(filter)]);
  const nodes = await Promise.all(kids.map(async (k) => {
    const n = await nodeOf(k, parentStep + 1);
    if (depth >= 2 && n.childCount) {
      const gk = await User.find({ referredBy: k._id, phoneVerified: true }).sort({ createdAt: 1 }).limit(20);
      n.children = await Promise.all(gk.map((g) => nodeOf(g, parentStep + 2)));
    }
    return n;
  }));
  return { parent: await nodeOf(parent, parentStep), nodes, meta: pageMeta(p, total) };
}

// ---------------------------------------------------------------- PAY-01..03
async function listPayouts(user, { status, ...query }) {
  const p = paginate(query);
  const filter = { userId: user._id };
  if (status) filter.status = status;
  const [rows, total] = await Promise.all([Payout.find(filter).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit), Payout.countDocuments(filter)]);
  const from = await User.find({ _id: { $in: rows.map((r) => r.fromUserId) } }).select('fullName memberId');
  const fm = new Map(from.map((u) => [String(u._id), u]));
  return {
    items: rows.map((r) => {
      const f = fm.get(String(r.fromUserId));
      return {
        id: String(r._id), amountPaise: r.amountPaise, step: `S${r.level}`, level: r.level, title: r.title, status: r.status,
        from: f ? { name: f.fullName, userId: f.memberId } : null, at: r.createdAt, creditedAt: r.creditedAt || null,
      };
    }),
    meta: pageMeta(p, total),
  };
}

async function payoutSummary(user) {
  const [t, levels] = await Promise.all([payoutTotals(user._id), byLevel(user._id)]);
  return {
    totalEarnedPaise: t.CREDITED.amount + t.PENDING.amount,
    totalPayouts: t.CREDITED.count + t.PENDING.count,
    creditedPaise: t.CREDITED.amount,
    creditedCount: t.CREDITED.count,
    pendingPaise: t.PENDING.amount,
    pendingCount: t.PENDING.count,
    teams: [...levels.values()].sort((a, b) => a._id - b._id).map((l) => ({ level: l._id, team: `Team ${l._id}`, count: l.count })),
  };
}

async function payoutsByTeam(user) {
  const [t, levels] = await Promise.all([payoutTotals(user._id), byLevel(user._id)]);
  const gross = t.CREDITED.amount + t.PENDING.amount;
  return {
    overall: { totalPaise: gross, creditedPaise: t.CREDITED.amount, pendingPaise: t.PENDING.amount, count: t.CREDITED.count + t.PENDING.count, activeTeams: levels.size },
    teams: business.referral.levels.map(({ level }) => {
      const r = levels.get(level) || { credited: 0, pending: 0, count: 0 };
      const total = r.credited + r.pending;
      return {
        level, team: `Team ${level}`, totalPaise: total, creditedPaise: r.credited, pendingPaise: r.pending, count: r.count,
        sharePercent: gross ? Math.round((total / gross) * 1000) / 10 : 0, avgPaise: r.count ? Math.round(total / r.count) : 0,
      };
    }),
  };
}

module.exports = {
  onOrderPaid, creditPayout, reversePayout, reverseForOrder, autoCreditDue,
  summary, direct, performance, teamSummary, teamTree, listPayouts, payoutSummary, payoutsByTeam,
};
