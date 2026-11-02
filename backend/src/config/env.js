'use strict';
/**
 * Centralised, validated environment configuration.
 * Every other file reads settings from here, never from process.env directly.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const bool = (v, d = false) => (v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()));
const int = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : parseInt(v, 10));
const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const env = {
  NODE_ENV,
  isProd,
  isTest,
  isDev: !isProd && !isTest,
  PORT: int(process.env.PORT, 5000),
  API_PREFIX: '/v1',
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || `http://localhost:${int(process.env.PORT, 5000)}`,
  SCAN_WEB_BASE_URL: process.env.SCAN_WEB_BASE_URL || 'https://scan.vtracker.example/s',
  TRUST_PROXY: int(process.env.TRUST_PROXY, 0),

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vtracker',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_ACCESS_EXPIRES_SEC: int(process.env.JWT_ACCESS_EXPIRES_SEC, 15 * 60),
  REFRESH_TOKEN_EXPIRES_DAYS: int(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 30),
  REAUTH_WINDOW_SEC: int(process.env.REAUTH_WINDOW_SEC, 15 * 60),
  RESET_TOKEN_EXPIRES_MIN: int(process.env.RESET_TOKEN_EXPIRES_MIN, 30),
  BCRYPT_ROUNDS: int(process.env.BCRYPT_ROUNDS, 10),

  // 32-byte key, hex (64 chars). Encrypts bank numbers, PAN and stored documents.
  DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY || '',
  FILE_URL_SECRET: process.env.FILE_URL_SECRET || '',

  CORS_ORIGINS: list(process.env.CORS_ORIGINS),

  RATE_LIMIT_ENABLED: bool(process.env.RATE_LIMIT_ENABLED, true),

  OTP_TTL_SEC: int(process.env.OTP_TTL_SEC, 300),
  OTP_MAX_ATTEMPTS: int(process.env.OTP_MAX_ATTEMPTS, 5),
  OTP_RESEND_AFTER_SEC: int(process.env.OTP_RESEND_AFTER_SEC, 30),
  // Non-production only: include the OTP / reset token in responses so the flow can be tested without SMS/e-mail.
  EXPOSE_DEV_SECRETS: !isProd && bool(process.env.EXPOSE_DEV_SECRETS, true),
  ENABLE_DEV_ROUTES: !isProd && bool(process.env.ENABLE_DEV_ROUTES, true),

  LOGIN_MAX_FAILURES: int(process.env.LOGIN_MAX_FAILURES, 5),
  LOGIN_LOCK_MIN: int(process.env.LOGIN_LOCK_MIN, 15),

  GOOGLE_CLIENT_IDS: list(process.env.GOOGLE_CLIENT_IDS),
  GOOGLE_AUTH_MOCK: !isProd && bool(process.env.GOOGLE_AUTH_MOCK, true),

  // Provider drivers. "mock" works offline; replace with real adapters in src/services/providers.
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
  PAYMENT_KEY_ID: process.env.PAYMENT_KEY_ID || 'rzp_test_mock',
  PAYMENT_KEY_SECRET: process.env.PAYMENT_KEY_SECRET || '',
  PAYMENT_ORDER_TTL_MIN: int(process.env.PAYMENT_ORDER_TTL_MIN, 30),

  WEBHOOK_SECRET_PAYMENT: process.env.WEBHOOK_SECRET_PAYMENT || '',
  WEBHOOK_SECRET_COURIER: process.env.WEBHOOK_SECRET_COURIER || '',
  WEBHOOK_SECRET_PAYOUT: process.env.WEBHOOK_SECRET_PAYOUT || '',
  WEBHOOK_SECRET_FASTAG: process.env.WEBHOOK_SECRET_FASTAG || '',
  WEBHOOK_SECRET_TELEPHONY: process.env.WEBHOOK_SECRET_TELEPHONY || '',
  WEBHOOK_TOLERANCE_SEC: int(process.env.WEBHOOK_TOLERANCE_SEC, 300),

  CAPTCHA_PROVIDER: process.env.CAPTCHA_PROVIDER || 'mock', // mock | turnstile | hcaptcha
  CAPTCHA_SECRET: process.env.CAPTCHA_SECRET || '',

  PINCODE_API_ENABLED: bool(process.env.PINCODE_API_ENABLED, false),
  IFSC_API_ENABLED: bool(process.env.IFSC_API_ENABLED, false),

  KYC_AUTO_VERIFY: bool(process.env.KYC_AUTO_VERIFY, true),
  BANK_AUTO_VERIFY: bool(process.env.BANK_AUTO_VERIFY, true),
  BANK_COOLDOWN_HOURS: int(process.env.BANK_COOLDOWN_HOURS, 24),

  REFERRAL_PAYOUTS_ENABLED: bool(process.env.REFERRAL_PAYOUTS_ENABLED, false),
  PAYOUT_AUTO_CREDIT_DAYS: int(process.env.PAYOUT_AUTO_CREDIT_DAYS, 7),

  MAINTENANCE_MODE: bool(process.env.MAINTENANCE_MODE, false),
  MIN_APP_VERSION: process.env.MIN_APP_VERSION || '1.0.0',
  LATEST_APP_VERSION: process.env.LATEST_APP_VERSION || '1.0.0',

  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@vtracker.example',
  SUPPORT_PHONE: process.env.SUPPORT_PHONE || '+91 80000 00000',
  SUPPORT_HOURS: process.env.SUPPORT_HOURS || 'Mon-Sat, 9:00 AM - 7:00 PM IST',

  UPLOAD_DIR: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
  LOG_DIR: path.resolve(__dirname, '../../', process.env.LOG_DIR || 'logs'),

  JOBS_ENABLED: bool(process.env.JOBS_ENABLED, !isTest),
  BOOTSTRAP_ON_START: bool(process.env.BOOTSTRAP_ON_START, true),
};

// Safe defaults for local development and tests only. Production must set real secrets.
const DEV_FALLBACKS = {
  JWT_ACCESS_SECRET: 'dev-only-access-secret-change-me-0123456789',
  DATA_ENCRYPTION_KEY: '0'.repeat(63) + '1',
  FILE_URL_SECRET: 'dev-only-file-url-secret',
  PAYMENT_KEY_SECRET: 'dev-payment-key-secret',
  WEBHOOK_SECRET_PAYMENT: 'dev-webhook-payment',
  WEBHOOK_SECRET_COURIER: 'dev-webhook-courier',
  WEBHOOK_SECRET_PAYOUT: 'dev-webhook-payout',
  WEBHOOK_SECRET_FASTAG: 'dev-webhook-fastag',
  WEBHOOK_SECRET_TELEPHONY: 'dev-webhook-telephony',
};

const missing = [];
for (const [k, v] of Object.entries(DEV_FALLBACKS)) {
  if (!env[k]) {
    if (isProd) missing.push(k);
    else env[k] = v;
  }
}
if (missing.length) {
  throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
}
if (!/^[0-9a-fA-F]{64}$/.test(env.DATA_ENCRYPTION_KEY)) {
  throw new Error('DATA_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}

module.exports = env;
