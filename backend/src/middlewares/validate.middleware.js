'use strict';
const ApiError = require('../utils/ApiError');

/**
 * validate({ body, query, params }) with Joi schemas.
 * Express 5 makes req.query read-only, so validated values are stored in req.valid.{body,query,params}
 * (req.body is also replaced with the cleaned body).
 */
module.exports = (schemas) => (req, res, next) => {
  req.valid = req.valid || {};
  const details = [];
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;
    const { value, error } = schemas[part].validate(req[part] || {}, { abortEarly: false, stripUnknown: true, convert: true });
    if (error) {
      error.details.forEach((d) => details.push({ field: d.path.join('.') || part, issue: d.type, message: d.message.replace(/"/g, '') }));
    } else {
      req.valid[part] = value;
      if (part === 'body') req.body = value;
    }
  }
  if (details.length) return next(new ApiError('VALIDATION_FAILED', 'Please check the highlighted fields.', details));
  next();
};
