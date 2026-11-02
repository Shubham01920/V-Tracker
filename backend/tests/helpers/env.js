'use strict';
/* Runs before every test file (jest "setupFiles"), before any app module is loaded. */
const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_ENABLED = 'false';
process.env.REFERRAL_PAYOUTS_ENABLED = 'true';
process.env.OTP_RESEND_AFTER_SEC = '0';
process.env.BCRYPT_ROUNDS = '4';
process.env.JOBS_ENABLED = 'false';
process.env.PUBLIC_BASE_URL = 'http://localhost:5000';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'vtracker-test-uploads');
process.env.LOG_DIR = path.join(os.tmpdir(), 'vtracker-test-logs');
// Use fixed test secrets so tests never depend on a developer's .env
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789abcdef';
process.env.DATA_ENCRYPTION_KEY = 'a'.repeat(64);
process.env.FILE_URL_SECRET = 'test-file-secret';
process.env.PAYMENT_KEY_SECRET = 'test-payment-secret';
for (const p of ['PAYMENT', 'COURIER', 'PAYOUT', 'FASTAG', 'TELEPHONY']) process.env[`WEBHOOK_SECRET_${p}`] = `test-webhook-${p.toLowerCase()}`;

global.__ROUTE_HITS__ = new Map();
