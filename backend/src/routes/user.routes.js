'use strict';
/** /v1/me (profile, bank, KYC) and /v1/addresses */
const express = require('express');
const c = require('../controllers/user.controller');
const w = require('../controllers/wallet.controller');
const v = require('../validators/user.validator');
const wv = require('../validators/wallet.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate, requireRecentAuth } = require('../middlewares/auth.middleware');
const { avatarUpload } = require('../middlewares/upload.middleware');
const { moneyLimiter } = require('../middlewares/rateLimit.middleware');

const me = express.Router();
me.use(authenticate);
me.get('/', c.me); // PRF-01
me.patch('/', validate(v.updateMe), c.updateMe); // PRF-02
me.post('/avatar', avatarUpload, c.avatar); // PRF-03
me.get('/bank-account', w.getBank); // BNK-01
me.put('/bank-account', moneyLimiter, validate(wv.saveBank), requireRecentAuth, w.saveBank); // BNK-02
me.post('/kyc', moneyLimiter, validate(wv.kyc), w.kyc); // KYC-01

const addresses = express.Router();
addresses.use(authenticate);
addresses.get('/', c.listAddresses); // ADR-01
addresses.post('/', validate(v.createAddress), c.createAddress); // ADR-02
addresses.patch('/:id', validate(v.updateAddress), c.updateAddress); // ADR-03
addresses.delete('/:id', validate(v.addressId), c.deleteAddress); // ADR-04

module.exports = { me, addresses };
