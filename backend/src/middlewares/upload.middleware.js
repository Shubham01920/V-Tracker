'use strict';
const multer = require('multer');
const ApiError = require('../utils/ApiError');

/** Files are kept in memory, checked by magic bytes, then written by the service (documents are encrypted). */
const SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'application/pdf': (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
};

function detectMime(buffer) {
  for (const [mime, test] of Object.entries(SIGNATURES)) if (buffer && buffer.length > 4 && test(buffer)) return mime;
  return null;
}

function uploader({ field, maxBytes, types, required = true }) {
  const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files: 1 } }).single(field);
  return (req, res, next) => {
    m(req, res, (err) => {
      if (err) return next(err);
      if (!req.file) {
        if (!required) return next();
        return next(new ApiError('FILE_REQUIRED', `Attach a file in the "${field}" field`, [{ field, issue: 'required' }]));
      }
      const real = detectMime(req.file.buffer);
      if (!real || !types.includes(real)) return next(new ApiError('UNSUPPORTED_TYPE', `Allowed types: ${types.join(', ')}`));
      req.file.detectedMime = real;
      next();
    });
  };
}

module.exports = {
  avatarUpload: uploader({ field: 'file', maxBytes: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png'] }),
  documentUpload: uploader({ field: 'file', maxBytes: 10 * 1024 * 1024, types: ['application/pdf', 'image/jpeg', 'image/png'] }),
  detectMime,
};
