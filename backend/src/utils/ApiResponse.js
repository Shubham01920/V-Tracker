'use strict';
/** Response envelope (PDF §6.2): { data, meta?, requestId } */
function send(res, status, data, meta) {
  if (status === 204) return res.status(204).end();
  const body = { data: data === undefined ? null : data };
  if (meta) body.meta = meta;
  body.requestId = res.req.id;
  return res.status(status).json(body);
}

module.exports = {
  ok: (res, data, meta) => send(res, 200, data, meta),
  created: (res, data) => send(res, 201, data),
  accepted: (res, data) => send(res, 202, data === undefined ? {} : data),
  noContent: (res) => send(res, 204),
  send,
};
