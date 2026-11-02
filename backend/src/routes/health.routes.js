'use strict';
const router = require('express').Router();
const c = require('../controllers/health.controller');

router.get('/', c.health);

module.exports = router;
