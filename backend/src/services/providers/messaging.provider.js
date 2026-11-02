'use strict';
/**
 * SMS, e-mail and push delivery.
 * Default driver "mock" logs and stores messages in the outbox. To go live, implement the TODO branches
 * with your SMS gateway (e.g. MSG91 / Twilio), e-mail service (SES / SendGrid) and FCM (firebase-admin).
 */
const logger = require('../../utils/logger');
const outbox = require('./outbox');

const SMS_DRIVER = process.env.SMS_PROVIDER || 'mock';
const EMAIL_DRIVER = process.env.EMAIL_PROVIDER || 'mock';
const PUSH_DRIVER = process.env.PUSH_PROVIDER || 'mock';

async function sendSms(to, text, meta = {}) {
  if (SMS_DRIVER !== 'mock') throw new Error(`SMS provider "${SMS_DRIVER}" not implemented`);
  outbox.push('sms', { to, text, ...meta });
  logger.info('SMS (mock)', { to: `******${String(to).slice(-4)}`, kind: meta.kind });
  return { id: `sms_${Date.now()}` };
}

async function sendEmail({ to, subject, text, html, meta = {} }) {
  if (EMAIL_DRIVER !== 'mock') throw new Error(`E-mail provider "${EMAIL_DRIVER}" not implemented`);
  outbox.push('email', { to, subject, text, html, ...meta });
  logger.info('E-mail (mock)', { subject, kind: meta.kind });
  return { id: `email_${Date.now()}` };
}

/** tokens: array of FCM tokens. Returns tokens the provider reported as invalid so the caller can delete them. */
async function sendPush(tokens, { title, body, data }) {
  if (!tokens.length) return { invalidTokens: [] };
  if (PUSH_DRIVER !== 'mock') throw new Error(`Push provider "${PUSH_DRIVER}" not implemented`);
  outbox.push('push', { tokens, title, body, data });
  return { invalidTokens: [] };
}

module.exports = { sendSms, sendEmail, sendPush };
