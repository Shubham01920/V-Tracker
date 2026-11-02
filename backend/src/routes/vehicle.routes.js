'use strict';
/** /v1/vehicles, /v1/qr, /v1/contacts, /v1/public/scan, /v1/calls */
const express = require('express');
const c = require('../controllers/vehicle.controller');
const v = require('../validators/vehicle.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { publicLimiter, publicActionLimiter, contactLimiter, make } = require('../middlewares/rateLimit.middleware');

const lookupLimiter = make({ windowMs: 60 * 60 * 1000, limit: 60, name: 'lookup' });

const vehicles = express.Router();
vehicles.use(authenticate);
vehicles.get('/lookup', lookupLimiter, validate(v.lookup), c.lookup); // VEH-05 (before /:id)
vehicles.get('/', validate(v.list), c.list); // VEH-01
vehicles.post('/', validate(v.create), c.create); // VEH-02
vehicles.get('/:id', validate(v.id), c.detail); // VEH-03
vehicles.delete('/:id/qr', validate(v.id), c.unlinkQr); // VEH-04

const qr = express.Router();
qr.get('/:qrUuid/status', optionalAuth, validate(v.qrStatus), c.qrStatus); // QR-01
qr.post('/activate', authenticate, validate(v.activate), c.activate); // QR-02

const contacts = express.Router();
contacts.use(authenticate);
contacts.post('/call', contactLimiter, validate(v.call), c.call); // CON-01
contacts.post('/alert', contactLimiter, validate(v.alert), c.alert); // CON-02

const publicScan = express.Router();
publicScan.get('/:qrUuid', publicLimiter, validate(v.publicScan), c.publicScan); // PUB-01
publicScan.post('/:qrUuid/call', publicActionLimiter, validate(v.publicCall), c.publicCall); // PUB-02
publicScan.post('/:qrUuid/alert', publicActionLimiter, validate(v.publicAlert), c.publicAlert); // PUB-03
publicScan.post('/:qrUuid/report', publicActionLimiter, validate(v.publicReport), c.publicReport); // PUB-04

const calls = express.Router();
calls.use(authenticate);
calls.get('/', validate(v.calls), c.calls); // CAL-01
calls.get('/:id', validate(v.id), c.callDetail); // CAL-02
calls.post('/:id/block', validate(v.id), c.blockCaller); // extra: block a caller

module.exports = { vehicles, qr, contacts, publicScan, calls };
