'use strict';
const { describe, test } = require('node:test');
const { expect } = require('expect');
const { api, bearer, idem, createUser, placePaidOrder } = require('./helpers/api');
const { User, Reward, Payout } = require('../src/models');
const referralService = require('../src/services/referral.service');

describe('Rewards (RWD-01..03)', () => {
  test('referral signup issues cards; scratch is server-decided, idempotent and credits wallet', async () => {
    const referrer = await createUser({ fullName: 'Referrer One' });
    const friend = await createUser({ fullName: 'Pavan S H', referralCode: referrer.user.referralCode.toLowerCase() });
    const list = await api().get('/v1/rewards').set(bearer(referrer)).expect(200);
    expect(list.body.data.items).toHaveLength(1);
    const card = list.body.data.items[0];
    expect(card).toMatchObject({ source: 'REFERRAL', status: 'UNSCRATCHED', result: null });
    expect(JSON.stringify(card)).not.toMatch(/minPaise|maxPaise|amountPaise/);
    const friendCards = await api().get('/v1/rewards').set(bearer(friend)).expect(200);
    expect(friendCards.body.data.items[0].source).toBe('SIGNUP');

    const noKey = await api().post(`/v1/rewards/${card.id}/scratch`).set(bearer(referrer)).expect(400);
    expect(noKey.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
    const key = idem();
    const s1 = await api().post(`/v1/rewards/${card.id}/scratch`).set(bearer(referrer)).set(key).expect(200);
    expect(s1.body.data.amountPaise).toBeGreaterThanOrEqual(1000);
    expect(s1.body.data.amountPaise).toBeLessThanOrEqual(10000);
    expect(s1.body.data.amountPaise % 100).toBe(0);
    const s2 = await api().post(`/v1/rewards/${card.id}/scratch`).set(bearer(referrer)).set(key).expect(200);
    expect(s2.body.data).toEqual(s1.body.data);
    const s3 = await api().post(`/v1/rewards/${card.id}/scratch`).set(bearer(referrer)).set(idem()).expect(409);
    expect(s3.body.error.code).toBe('REWARD_ALREADY_SCRATCHED');

    const wallet = await api().get('/v1/wallet').set(bearer(referrer)).expect(200);
    expect(wallet.body.data.availablePaise).toBe(s1.body.data.amountPaise);
    const sum = await api().get('/v1/rewards/summary').set(bearer(referrer)).expect(200);
    expect(sum.body.data).toMatchObject({ totalCashbackPaise: s1.body.data.amountPaise, unscratchedCount: 0 });
    const scratched = await api().get('/v1/rewards').query({ status: 'SCRATCHED' }).set(bearer(referrer)).expect(200);
    expect(scratched.body.data.items[0].result.amountPaise).toBe(s1.body.data.amountPaise);

    // expired cards cannot be scratched; other users cannot scratch my card
    const fc = friendCards.body.data.items[0];
    await api().post(`/v1/rewards/${fc.id}/scratch`).set(bearer(referrer)).set(idem()).expect(404);
    await Reward.updateOne({ _id: fc.id }, { expiresAt: new Date(Date.now() - 1000) });
    const exp = await api().post(`/v1/rewards/${fc.id}/scratch`).set(bearer(friend)).set(idem()).expect(410);
    expect(exp.body.error.code).toBe('REWARD_EXPIRED');
  });
});

describe('Referral (REF-01..05) and payouts (PAY-01..03)', () => {
  test('network: summary, direct list with masked e-mail, tree, team summary, payouts per level', async () => {
    const root = await createUser({ fullName: 'Basavarajappa K' });
    const a = await createUser({ fullName: 'Khaja Vali M', referralCode: root.user.referralCode });
    const b = await createUser({ fullName: 'Ganesha K', referralCode: root.user.referralCode });
    const a1 = await createUser({ fullName: 'Level Two', referralCode: a.user.referralCode });

    const s = await api().get('/v1/referral/summary').set(bearer(root)).expect(200);
    expect(s.body.data).toMatchObject({ code: root.user.referralCode, scratchCardCount: 2 });
    expect(s.body.data.shareText).toContain(root.user.referralCode);
    expect(s.body.data.shareUrl).toContain(`/r/${root.user.referralCode}`);

    const d = await api().get('/v1/referral/direct').set(bearer(root)).expect(200);
    expect(d.body.data.items).toHaveLength(2);
    expect(d.body.data.stats).toMatchObject({ total: 2, active: 0, activePercent: 0 });
    const ka = d.body.data.items.find((i) => i.name === 'Khaja Vali M');
    expect(ka).toMatchObject({ totalTeam: 1, status: 'INACTIVE' });
    expect(ka.emailMasked).toMatch(/^\w{2}\*+@example\.com$/);
    expect(JSON.stringify(d.body)).not.toContain(a.email);
    const q = await api().get('/v1/referral/direct').query({ q: 'ganesha' }).set(bearer(root)).expect(200);
    expect(q.body.data.items.map((i) => i.name)).toEqual(['Ganesha K']);

    // level-2 member buys -> payouts for a (level 1) and root (level 2, needs 2 direct referrals: root has 2)
    await placePaidOrder(a1, { deliver: false });
    const rootPay = await api().get('/v1/payouts').set(bearer(root)).expect(200);
    expect(rootPay.body.data.items).toHaveLength(1);
    expect(rootPay.body.data.items[0]).toMatchObject({ level: 2, step: 'S2', status: 'PENDING', amountPaise: 1000, title: 'Team 2 Referral Bonus' });
    expect(rootPay.body.data.items[0].from.name).toBe('Level Two');
    const aPay = await api().get('/v1/payouts').query({ status: 'PENDING' }).set(bearer(a)).expect(200);
    expect(aPay.body.data.items[0]).toMatchObject({ level: 1, amountPaise: 5000 });

    // b buys (direct of root) -> root level 1 payout
    await placePaidOrder(b, { deliver: false });
    const sum = await api().get('/v1/payouts/summary').set(bearer(root)).expect(200);
    expect(sum.body.data).toMatchObject({ totalEarnedPaise: 6000, totalPayouts: 2, pendingPaise: 6000, pendingCount: 2, creditedPaise: 0 });
    expect(sum.body.data.teams).toEqual([{ level: 1, team: 'Team 1', count: 1 }, { level: 2, team: 'Team 2', count: 1 }]);
    const byTeam = await api().get('/v1/payouts/by-team').set(bearer(root)).expect(200);
    expect(byTeam.body.data.teams).toHaveLength(15);
    expect(byTeam.body.data.overall).toMatchObject({ totalPaise: 6000, pendingPaise: 6000, creditedPaise: 0, count: 2, activeTeams: 2 });
    expect(byTeam.body.data.teams[0]).toMatchObject({ level: 1, totalPaise: 5000, sharePercent: 83.3, avgPaise: 5000 });

    // credit via admin endpoint -> wallet; the same totals move from pending to credited on every screen
    const admin = await createUser();
    await User.updateOne({ _id: admin.userId }, { role: 'ADMIN' });
    const pid = (await Payout.findOne({ userId: root.userId, level: 1 }))._id;
    await api().patch(`/v1/admin/payouts/${pid}`).set(bearer(root)).send({ action: 'CREDIT' }).expect(403);
    const cr = await api().patch(`/v1/admin/payouts/${pid}`).set(bearer(admin)).send({ action: 'CREDIT' }).expect(200);
    expect(cr.body.data.status).toBe('CREDITED');
    const sum2 = await api().get('/v1/payouts/summary').set(bearer(root)).expect(200);
    expect(sum2.body.data).toMatchObject({ totalEarnedPaise: 6000, creditedPaise: 5000, pendingPaise: 1000 });
    const perf = await api().get('/v1/referral/performance').set(bearer(root)).expect(200);
    expect(perf.body.data.overview).toMatchObject({ directReferrals: 2, totalTeam: 3, activeTeam: 2, totalPayouts: 2 });
    expect(perf.body.data.earnings).toMatchObject({ availableBalancePaise: 5000, creditedPaise: 5000, pendingPaise: 1000, totalTeamsEarningsPaise: 6000 });
    expect(perf.body.data.teamEarnings).toHaveLength(15);
    expect(perf.body.data.requirements[1]).toMatchObject({ level: 2, requiredDirectReferrals: 2, currentDirectReferrals: 2, met: true });
    expect(perf.body.data.profile.memberId).toBe(root.user.memberId);
    const credited = await api().get('/v1/payouts').query({ status: 'CREDITED' }).set(bearer(root)).expect(200);
    expect(credited.body.data.items).toHaveLength(1);

    // auto-credit job credits old pending payouts
    await Payout.collection.updateMany({ userId: new (require('mongoose').Types.ObjectId)(root.userId), status: 'PENDING' }, { $set: { createdAt: new Date(Date.now() - 8 * 86400000) } });
    expect(await referralService.autoCreditDue()).toBe(1);
    const w = await api().get('/v1/wallet').set(bearer(root)).expect(200);
    expect(w.body.data.availablePaise).toBe(6000);

    // reverse
    await api().patch(`/v1/admin/payouts/${pid}`).set(bearer(admin)).send({ action: 'REVERSE' }).expect(200);
    const w2 = await api().get('/v1/wallet').set(bearer(root)).expect(200);
    expect(w2.body.data.availablePaise).toBe(1000);

    const ts = await api().get('/v1/referral/team/summary').set(bearer(root)).expect(200);
    expect(ts.body.data).toMatchObject({ totalMembers: 3, activeMembers: 2, activeRatePercent: 67 });
    expect(ts.body.data.byLevel).toEqual([{ level: 1, members: 2 }, { level: 2, members: 1 }]);
    const tree = await api().get('/v1/referral/team/tree').query({ depth: 2 }).set(bearer(root)).expect(200);
    expect(tree.body.data.parent).toMatchObject({ step: 1, stepLabel: 'S1', childCount: 2 });
    const kNode = tree.body.data.nodes.find((n) => n.name === 'Khaja Vali M');
    expect(kNode).toMatchObject({ step: 2, childCount: 1 });
    expect(kNode.children[0]).toMatchObject({ name: 'Level Two', step: 3, status: 'ACTIVE' });
    const sub = await api().get('/v1/referral/team/tree').query({ parentId: kNode.id }).set(bearer(root)).expect(200);
    expect(sub.body.data.nodes.map((n) => n.name)).toEqual(['Level Two']);
    // cannot browse someone else's tree
    await api().get('/v1/referral/team/tree').query({ parentId: root.userId }).set(bearer(a)).expect(404);
  });
});
