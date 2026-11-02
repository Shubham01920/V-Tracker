'use strict';
const asyncHandler = require('../utils/asyncHandler');
const R = require('../utils/ApiResponse');
const docs = require('../services/document.service');

module.exports = {
  list: asyncHandler(async (req, res) => R.ok(res, { items: await docs.list(req.user, req.valid.query) })),
  upload: asyncHandler(async (req, res) => R.created(res, await docs.upload(req.user, req.body, req.file))),
  downloadUrl: asyncHandler(async (req, res) => R.ok(res, await docs.downloadUrl(req.user, req.valid.params.id))),
  startExport: asyncHandler(async (req, res) => R.accepted(res, await docs.startExport(req.user))),
  exportStatus: asyncHandler(async (req, res) => R.ok(res, await docs.exportStatus(req.user, req.valid.params.jobId))),
  serveFile: asyncHandler(async (req, res) => {
    const f = await docs.serveFile(req.params.token);
    res.set({
      'Content-Type': f.mime,
      'Content-Disposition': `attachment; filename="${f.name.replace(/[^\w.-]/g, '_')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(200).send(f.buffer);
  }),
};
