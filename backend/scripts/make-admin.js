#!/usr/bin/env node
'use strict';
/** Give an existing account the ADMIN role:  npm run make-admin -- someone@example.com */
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const { User } = require('../src/models');

(async () => {
  const email = String(process.argv[2] || '').toLowerCase();
  if (!email) { console.error('Usage: npm run make-admin -- <email>'); process.exit(1); }
  await connectDB();
  const u = await User.findOneAndUpdate({ email }, { role: 'ADMIN' }, { returnDocument: 'after' });
  console.log(u ? `${u.email} is now ADMIN` : `No user with e-mail ${email}`);
  await mongoose.disconnect();
  process.exit(u ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
