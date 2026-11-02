'use strict';
/** /v1/notifications and /v1/devices */
const express = require('express');
const c = require('../controllers/notification.controller');
const v = require('../validators/misc.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const notifications = express.Router();
notifications.use(authenticate);
notifications.get('/unread-count', c.unreadCount); // NOT-04
notifications.post('/read-all', c.readAll); // NOT-03
notifications.get('/', validate(v.notifications), c.list); // NOT-01
notifications.patch('/:id/read', validate(v.notificationId), c.read); // NOT-02

const devices = express.Router();
devices.use(authenticate);
devices.post('/', validate(v.device), c.registerDevice); // DEV-01
devices.delete('/:id', validate(v.deviceId), c.removeDevice); // DEV-02

module.exports = { notifications, devices };
