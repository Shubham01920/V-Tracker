'use strict';
const crypto = require('crypto');

/** Echo the client's X-Request-Id (or create one) — PDF §6.2. */
module.exports = (req, res, next) => {
  const incoming = req.get('X-Request-Id');
  req.id = incoming && /^[A-Za-z0-9-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  next();
};
