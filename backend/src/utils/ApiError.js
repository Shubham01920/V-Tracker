'use strict';
const { ERROR_STATUS } = require('../constants/errorCodes');

/**
 * Error carrying an API error code (PDF §6.6).
 *   throw new ApiError('EMAIL_TAKEN')                       -> status from table
 *   throw new ApiError('VALIDATION_FAILED', 'msg', details)
 *   throw ApiError.of(404, 'NOT_FOUND', 'Vehicle not found')
 */
class ApiError extends Error {
  constructor(code, message, details, status) {
    super(message || code);
    this.code = code;
    this.status = status || ERROR_STATUS[code] || 400;
    this.details = details;
    this.isApiError = true;
  }

  static of(status, code, message, details) {
    return new ApiError(code, message, details, status);
  }

  static notFound(what = 'Resource') {
    return new ApiError('NOT_FOUND', `${what} not found`);
  }
}

module.exports = ApiError;
