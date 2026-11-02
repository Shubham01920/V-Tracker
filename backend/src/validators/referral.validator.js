'use strict';
const { Joi, objectId, page, idParam } = require('./common');
const { PAYOUT_STATUS } = require('../constants/enums');

module.exports = {
  rewards: { query: Joi.object({ status: Joi.string().valid('UNSCRATCHED', 'SCRATCHED', 'EXPIRED') }) },
  reward: { params: idParam },
  direct: { query: Joi.object({ q: Joi.string().trim().max(80).allow(''), ...page }) },
  tree: { query: Joi.object({ parentId: objectId, depth: Joi.number().integer().min(1).max(2).default(1), ...page }) },
  payouts: { query: Joi.object({ status: Joi.string().valid(...PAYOUT_STATUS), ...page }) },
};
