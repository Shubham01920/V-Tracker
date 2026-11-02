'use strict';
/** Mounts every router under /v1 (PDF §6.2 versioned paths). */
const express = require('express');
const env = require('../config/env');
const authRoutes = require('./auth.routes');
const user = require('./user.routes');
const veh = require('./vehicle.routes');
const notif = require('./notification.routes');
const shop = require('./shop.routes');
const ref = require('./referral.routes');
const wal = require('./wallet.routes');
const misc = require('./misc.routes');

const v1 = express.Router();

v1.use('/auth', authRoutes); // AUTH-01..08
v1.use('/me', user.me); // PRF-01..03, BNK-01..02, KYC-01
v1.use('/addresses', user.addresses); // ADR-01..04
v1.use('/vehicles', veh.vehicles); // VEH-01..05
v1.use('/qr', veh.qr); // QR-01..02
v1.use('/contacts', veh.contacts); // CON-01..02
v1.use('/public/scan', veh.publicScan); // PUB-01..04
v1.use('/calls', veh.calls); // CAL-01..02
v1.use('/notifications', notif.notifications); // NOT-01..04
v1.use('/devices', notif.devices); // DEV-01..02
v1.use('/products', shop.products); // SHP-01..02
v1.use('/wishlist', shop.wishlist); // WSH-01..02
v1.use('/cart', shop.cart); // CRT-01..04
v1.use('/checkout', shop.checkout); // CHK-01
v1.use('/coupons', shop.coupons); // CHK-02
v1.use('/orders', shop.orders); // CHK-03, ORD-01..02
v1.use('/payments', shop.payments); // CHK-04
v1.use('/tracking', shop.tracking); // ORD-03
v1.use('/rewards', ref.rewards); // RWD-01..03
v1.use('/referral', ref.referral); // REF-01..05
v1.use('/payouts', ref.payouts); // PAY-01..03
v1.use('/wallet', wal.wallet); // WAL-01
v1.use('/withdrawals', wal.withdrawals); // WAL-02..04
v1.use('/lookup/ifsc', wal.ifsc); // BNK-03
v1.use('/lookup/pincode', misc.pincode); // LKP-01
v1.use('/fastag', misc.fastag); // FST-01..05
v1.use('/documents', misc.documents); // DOC-01..04
v1.use('/files', misc.files); // signed file downloads
v1.use('/content', misc.content); // CNT-01
v1.use('/support', misc.support); // SUP-01..03
v1.use('/config', misc.config); // CFG-01
v1.use('/webhooks', misc.webhooks); // CAL-03, CHK-05, ORD-04, WAL-05, FST-06
v1.use('/admin', misc.admin);
if (env.ENABLE_DEV_ROUTES) v1.use('/dev', misc.dev);

module.exports = v1;
