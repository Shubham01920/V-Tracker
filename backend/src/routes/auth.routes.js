'use strict';
const router = require('express').Router();
const c = require('../controllers/auth.controller');
const v = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/register', authLimiter, validate(v.register), c.register); // AUTH-01
router.post('/verify-otp', otpLimiter, validate(v.verifyOtp), c.verifyOtp); // AUTH-02
router.post('/login', authLimiter, validate(v.login), c.login); // AUTH-03
router.post('/google', authLimiter, validate(v.google), c.google); // AUTH-04
router.post('/refresh', validate(v.refresh), c.refresh); // AUTH-05
router.post('/forgot-password', authLimiter, validate(v.forgot), c.forgotPassword); // AUTH-06
router.post('/reset-password', authLimiter, validate(v.reset), c.resetPassword); // AUTH-07
router.post('/logout', authenticate, validate(v.logout), c.logout); // AUTH-08

module.exports = router;
