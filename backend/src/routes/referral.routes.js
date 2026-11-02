'use strict';
/** /v1/rewards, /v1/referral, /v1/payouts */
const express = require('express');
const c = require('../controllers/referral.controller');
const v = require('../validators/referral.validator');
const validate = require('../middlewares/validate.middleware');
const idempotency = require('../middlewares/idempotency.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const rewards = express.Router();
rewards.use(authenticate);
rewards.get('/summary', c.rewardSummary); // RWD-03 (before /:id)
rewards.get('/', validate(v.rewards), c.rewards); // RWD-01
rewards.post('/:id/scratch', validate(v.reward), idempotency, c.scratch); // RWD-02

const referral = express.Router();
referral.use(authenticate);
referral.get('/summary', c.summary); // REF-01
referral.get('/direct', validate(v.direct), c.direct); // REF-02
referral.get('/performance', c.performance); // REF-03
referral.get('/team/summary', c.teamSummary); // REF-04
referral.get('/team/tree', validate(v.tree), c.teamTree); // REF-05

const payouts = express.Router();
payouts.use(authenticate);
payouts.get('/summary', c.payoutSummary); // PAY-02
payouts.get('/by-team', c.payoutsByTeam); // PAY-03
payouts.get('/', validate(v.payouts), c.payouts); // PAY-01

module.exports = { rewards, referral, payouts };
