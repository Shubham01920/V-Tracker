'use strict';
const mongoose = require('mongoose');
const R = require('../utils/ApiResponse');

const started = Date.now();

module.exports = {
  health: (req, res) => {
    const db = mongoose.connection.readyState === 1 ? 'up' : 'down';
    res.status(db === 'up' ? 200 : 503);
    return R.send(res, db === 'up' ? 200 : 503, { status: db === 'up' ? 'ok' : 'degraded', db, uptimeSec: Math.round((Date.now() - started) / 1000), version: require('../../package.json').version });
  },
};
