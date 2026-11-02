'use strict';
/**
 * The ONE place that changes wallet balances (PDF §0 item 7, §3.6).
 * Pattern: claim the movement first by inserting a LedgerEntry (unique on refType+refId+kind), then apply an
 * atomic, guarded $inc on the Wallet, then record the resulting balances on the entry.
 * A duplicate claim means the movement already happened, so repeated webhooks or retries never double-count.
 * Works on a standalone MongoDB (no multi-document transactions needed).
 */
const { Wallet, LedgerEntry } = require('../models');
const ApiError = require('../utils/ApiError');

async function getWallet(userId) {
  return Wallet.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { upsert: true, returnDocument: 'after' });
}

/** Returns the claimed entry, or null when this (refType, refId, kind) was already applied. */
async function claim(userId, kind, amountPaise, ref = {}) {
  try {
    return await LedgerEntry.create({
      userId, kind, amountPaise, refType: ref.refType, refId: ref.refId ? String(ref.refId) : undefined, note: ref.note,
    });
  } catch (e) {
    if (e.code === 11000) return null;
    throw e;
  }
}

async function finish(entry, wallet) {
  await LedgerEntry.updateOne({ _id: entry._id }, { availableAfterPaise: wallet.availablePaise, heldAfterPaise: wallet.heldPaise });
  return wallet;
}

async function apply(userId, kind, signedAmount, guard, inc, ref, insufficientMsg) {
  await getWallet(userId);
  const entry = await claim(userId, kind, signedAmount, ref);
  if (!entry) return getWallet(userId);
  const w = await Wallet.findOneAndUpdate({ userId, ...guard }, { $inc: inc }, { returnDocument: 'after' });
  if (!w) {
    await LedgerEntry.deleteOne({ _id: entry._id });
    if (insufficientMsg) throw new ApiError('INSUFFICIENT_BALANCE', insufficientMsg);
    return getWallet(userId);
  }
  return finish(entry, w);
}

/** Add withdrawable money (reward cashback, credited referral payout). */
const credit = (userId, amountPaise, kind, ref = {}) => (amountPaise <= 0 ? getWallet(userId)
  : apply(userId, kind, amountPaise, {}, { availablePaise: amountPaise, lifetimeCreditedPaise: amountPaise }, ref));

/** Remove money that was credited (e.g. reversed payout). Never goes negative. */
const debit = (userId, amountPaise, kind, ref = {}) => apply(userId, kind, -amountPaise,
  { availablePaise: { $gte: amountPaise } }, { availablePaise: -amountPaise }, ref, 'Wallet balance is too low for this adjustment');

/** Withdrawal step 1: available -> held. */
const hold = (userId, amountPaise, ref) => apply(userId, 'WITHDRAWAL_HOLD', -amountPaise,
  { availablePaise: { $gte: amountPaise } }, { availablePaise: -amountPaise, heldPaise: amountPaise }, ref, 'Amount is more than your available balance');

/** Withdrawal success: the held amount leaves the wallet. */
const settleHold = (userId, amountPaise, ref) => apply(userId, 'WITHDRAWAL_SETTLED', 0,
  { heldPaise: { $gte: amountPaise } }, { heldPaise: -amountPaise, lifetimeWithdrawnPaise: amountPaise }, ref);

/** Withdrawal failure: the held amount returns to available. */
const releaseHold = (userId, amountPaise, ref) => apply(userId, 'WITHDRAWAL_RELEASE', amountPaise,
  { heldPaise: { $gte: amountPaise } }, { heldPaise: -amountPaise, availablePaise: amountPaise }, ref);

module.exports = { getWallet, credit, debit, hold, settleHold, releaseHold };
