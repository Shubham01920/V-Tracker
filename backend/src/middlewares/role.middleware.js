'use strict';
const ApiError = require('../utils/ApiError');

/** authorize('ADMIN') — must run after authenticate. */
module.exports = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError('UNAUTHORIZED'));
  if (!roles.includes(req.user.role)) return next(new ApiError('FORBIDDEN', 'You do not have access to this resource'));
  next();
};
