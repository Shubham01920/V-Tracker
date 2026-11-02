'use strict';
/**
 * Masked-call bridge (e.g. Exotel / Knowlarity). Both legs ring from a virtual number so neither party
 * sees the other's real number. Call results arrive by the signed webhook CAL-03.
 */
const outbox = require('./outbox');
const { randomToken } = require('../../utils/crypto');

const DRIVER = process.env.TELEPHONY_PROVIDER || 'mock';
const VIRTUAL_NUMBER = process.env.TELEPHONY_VIRTUAL_NUMBER || '+918000000000';

async function createBridge({ callerPhone, ownerPhone, reference }) {
  if (DRIVER !== 'mock') throw new Error(`Telephony provider "${DRIVER}" not implemented`);
  const sessionId = `cs_${randomToken(12).replace(/[-_]/g, 'x')}`;
  outbox.push('calls', { sessionId, reference, callerLast4: String(callerPhone).slice(-4), ownerLast4: String(ownerPhone).slice(-4) });
  return { sessionId, virtualNumber: VIRTUAL_NUMBER, status: 'RINGING' };
}

module.exports = { createBridge };
