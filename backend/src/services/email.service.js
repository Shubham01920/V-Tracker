'use strict';
/** Transactional e-mail templates. Delivery goes through the messaging provider. */
const env = require('../config/env');
const { sendEmail } = require('./providers/messaging.provider');

async function sendPasswordReset(to, name, token) {
  const link = `vtracker://reset-password?token=${encodeURIComponent(token)}`;
  const web = `${env.PUBLIC_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: 'Reset your V Tracker password',
    text: `Hi ${name},\n\nUse this link to set a new password (valid for ${env.RESET_TOKEN_EXPIRES_MIN} minutes):\n${link}\n\nOr open: ${web}\n\nIf you did not request this, ignore this e-mail.`,
    meta: { kind: 'PASSWORD_RESET', token },
  });
}

async function sendWelcome(to, name) {
  return sendEmail({ to, subject: 'Welcome to V Tracker', text: `Hi ${name}, your account is ready.`, meta: { kind: 'WELCOME' } });
}

module.exports = { sendPasswordReset, sendWelcome };
