'use strict';
const multer = require('multer');
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError('ROUTE_NOT_FOUND', `No route for ${req.method} ${req.originalUrl.split('?')[0]}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let e = err;

  if (e instanceof multer.MulterError) {
    e = e.code === 'LIMIT_FILE_SIZE'
      ? new ApiError('FILE_TOO_LARGE', 'File is too large')
      : new ApiError('VALIDATION_FAILED', e.message, [{ field: e.field || 'file', issue: e.code }]);
  } else if (e && e.type === 'entity.parse.failed') {
    e = new ApiError('BAD_REQUEST', 'Malformed JSON body');
  } else if (e && e.type === 'entity.too.large') {
    e = new ApiError('PAYLOAD_TOO_LARGE', 'Request body is too large');
  } else if (e && e.name === 'CastError') {
    e = new ApiError('NOT_FOUND', 'Resource not found');
  } else if (e && e.name === 'ValidationError' && e.errors) {
    e = new ApiError('VALIDATION_FAILED', 'Please check the highlighted fields.',
      Object.values(e.errors).map((x) => ({ field: x.path, issue: x.kind, message: x.message })));
  } else if (e && e.code === 11000) {
    const field = Object.keys(e.keyPattern || e.keyValue || {})[0] || 'field';
    e = new ApiError('CONFLICT', `Duplicate value for ${field}`, [{ field, issue: 'duplicate' }]);
  }

  if (!e || !e.isApiError) {
    logger.error('Unhandled error', { requestId: req.id, path: req.originalUrl, err: err && err.stack });
    e = new ApiError('INTERNAL_ERROR', env.isProd ? 'Something went wrong' : (err && err.message) || 'Internal error');
  } else if (e.status >= 500) {
    logger.error(e.message, { requestId: req.id, code: e.code });
  }

  if (e.status === 429 && e.retryAfter) res.set('Retry-After', String(e.retryAfter));
  const body = { error: { code: e.code, message: e.message } };
  if (e.details) body.error.details = e.details;
  body.requestId = req.id;
  res.status(e.status).json(body);
}

module.exports = { notFound, errorHandler };
