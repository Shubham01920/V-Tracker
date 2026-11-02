'use strict';
/** /v1/fastag, /v1/documents, /v1/files, /v1/content, /v1/support, /v1/config, /v1/lookup/pincode, /v1/webhooks, /v1/admin, /v1/dev */
const express = require('express');
const v = require('../validators/misc.validator');
const validate = require('../middlewares/validate.middleware');
const idempotency = require('../middlewares/idempotency.middleware');
const authorize = require('../middlewares/role.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { documentUpload } = require('../middlewares/upload.middleware');
const { verifyWebhook } = require('../middlewares/webhookSignature.middleware');
const { moneyLimiter, make } = require('../middlewares/rateLimit.middleware');
const fastagC = require('../controllers/fastag.controller');
const docC = require('../controllers/document.controller');
const contentC = require('../controllers/content.controller');
const hookC = require('../controllers/webhook.controller');
const adminC = require('../controllers/admin.controller');
const devC = require('../controllers/dev.controller');

const fastag = express.Router();
fastag.use(authenticate);
fastag.get('/issuers', fastagC.issuers); // FST-01
fastag.get('/lookup', make({ windowMs: 60 * 60 * 1000, limit: 60, name: 'fastag' }), validate(v.fastagLookup), fastagC.lookup); // FST-02
fastag.get('/vehicles/:vehicle/transactions', validate(v.fastagTxns), fastagC.transactions); // FST-03
fastag.post('/recharge', moneyLimiter, validate(v.fastagRecharge), idempotency, fastagC.recharge); // FST-04
fastag.get('/recharge/:id', validate(v.fastagRechargeId), fastagC.rechargeStatus); // FST-05

const documents = express.Router();
documents.use(authenticate);
documents.post('/export', docC.startExport); // DOC-04
documents.get('/export/:jobId', validate(v.exportJob), docC.exportStatus); // extra: export job status
documents.get('/', validate(v.documents), docC.list); // DOC-01
documents.post('/', documentUpload, validate(v.uploadDocument), docC.upload); // DOC-02
documents.get('/:id/download-url', validate(v.documentId), docC.downloadUrl); // DOC-03

const files = express.Router();
files.get('/:token', docC.serveFile); // signed download links from DOC-03 / DOC-04

const content = express.Router();
content.get('/:slug', validate(v.contentSlug), contentC.content); // CNT-01

const support = express.Router();
support.get('/faqs', contentC.faqs); // SUP-01
support.get('/contact', contentC.contact); // SUP-02
support.post('/tickets', authenticate, validate(v.ticket), contentC.ticket); // SUP-03

const config = express.Router();
config.get('/', contentC.config); // CFG-01

const pincode = express.Router();
pincode.get('/:pin', authenticate, validate(v.pincode), contentC.pincode); // LKP-01

const webhooks = express.Router();
webhooks.post('/telephony', verifyWebhook('telephony'), validate(v.webhooks.telephony), hookC.telephony); // CAL-03
webhooks.post('/payment', verifyWebhook('payment'), validate(v.webhooks.payment), hookC.payment); // CHK-05
webhooks.post('/courier', verifyWebhook('courier'), validate(v.webhooks.courier), hookC.courier); // ORD-04
webhooks.post('/payout', verifyWebhook('payout'), validate(v.webhooks.payout), hookC.payout); // WAL-05
webhooks.post('/fastag', verifyWebhook('fastag'), validate(v.webhooks.fastag), hookC.fastag); // FST-06

const admin = express.Router();
admin.use(authenticate, authorize('ADMIN'));
admin.get('/documents', validate(v.admin.documents), adminC.documents);
admin.patch('/documents/:id', validate(v.admin.review), adminC.reviewDocument);
admin.patch('/payouts/:id', validate(v.admin.payout), adminC.payoutAction);

const dev = express.Router();
dev.post('/payments/simulate', devC.simulatePayment);
dev.post('/shipments/advance', devC.advanceShipment);
dev.post('/calls/complete', devC.completeCall);
dev.post('/payouts/settle', devC.settlePayout);
dev.post('/fastag/settle', devC.settleFastag);
dev.post('/webhooks/sign', devC.signWebhook);
dev.get('/outbox', devC.outbox);
dev.post('/make-admin', devC.makeAdmin);

module.exports = { fastag, documents, files, content, support, config, pincode, webhooks, admin, dev };
