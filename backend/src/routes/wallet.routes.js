'use strict';
/** /v1/wallet, /v1/withdrawals, /v1/lookup/ifsc. Bank + KYC live under /v1/me (user.routes.js). */
const express = require('express');
const c = require('../controllers/wallet.controller');
const v = require('../validators/wallet.validator');
const validate = require('../middlewares/validate.middleware');
const idempotency = require('../middlewares/idempotency.middleware');
const { authenticate, requireRecentAuth } = require('../middlewares/auth.middleware');
const { moneyLimiter } = require('../middlewares/rateLimit.middleware');

const wallet = express.Router();
wallet.get('/', authenticate, c.wallet); // WAL-01

const withdrawals = express.Router();
withdrawals.use(authenticate);
withdrawals.post('/', moneyLimiter, validate(v.withdraw), requireRecentAuth, idempotency, c.withdraw); // WAL-02
withdrawals.get('/', validate(v.withdrawals), c.withdrawals); // WAL-03
withdrawals.get('/:id', validate(v.withdrawal), c.withdrawal); // WAL-04

const ifsc = express.Router();
ifsc.get('/:code', authenticate, validate(v.ifsc), c.ifsc); // BNK-03

module.exports = { wallet, withdrawals, ifsc };
