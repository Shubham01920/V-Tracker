'use strict';
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const env = require('./config/env');
const corsOptions = require('./config/cors');
const logger = require('./utils/logger');
const requestId = require('./middlewares/requestId.middleware');
const { sanitize, maintenance } = require('./middlewares/security.middleware');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const v1 = require('./routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);
app.set('query parser', 'simple');

app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(compression());
// keep the raw body: webhook signatures are computed over the exact bytes
app.use(express.json({ limit: '1mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(sanitize);
if (!env.isTest) app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: logger.stream }));

// Test-only hook: records which route pattern served each request, its status/error code and one real
// example per route. Used by the endpoint coverage check and to build the examples in api-docs/.
if (env.isTest && global.__ROUTE_HITS__) {
  // Express restores req.route when an error leaves the router, so remember the matched route at dispatch time.
  const Route = require('router/lib/route');
  if (!Route.prototype.__patched) {
    const dispatch = Route.prototype.dispatch;
    Route.prototype.dispatch = function patched(req, res, done) {
      req.__routeKey = `${req.method} ${req.baseUrl}${this.path === '/' ? '' : this.path}`;
      return dispatch.call(this, req, res, done);
    };
    Route.prototype.__patched = true;
  }
  app.use((req, res, next) => {
    const origJson = res.json.bind(res);
    let payload;
    res.json = (b) => { payload = b; return origJson(b); };
    res.on('finish', () => {
      if (!req.__routeKey) return;
      const key = req.__routeKey;
      const hit = global.__ROUTE_HITS__.get(key) || { statuses: {}, example: null, errors: {} };
      if (payload && payload.error && !hit.errors[payload.error.code]) hit.errors[payload.error.code] = { status: res.statusCode, response: payload };
      const code = payload && payload.error ? payload.error.code : 'OK';
      hit.statuses[`${res.statusCode} ${code}`] = (hit.statuses[`${res.statusCode} ${code}`] || 0) + 1;
      if (res.statusCode < 300 && !hit.example) {
        hit.example = {
          url: req.originalUrl, status: res.statusCode,
          headers: Object.fromEntries(['idempotency-key', 'content-type'].filter((h) => req.get(h)).map((h) => [h, req.get(h)])),
          body: req.is('multipart/form-data') ? { ...(req.body || {}), file: '<binary>' } : req.body, response: payload === undefined ? null : payload,
        };
      }
      global.__ROUTE_HITS__.set(key, hit);
    });
    next();
  });
}

app.use('/uploads/avatars', express.static(path.join(env.UPLOAD_DIR, 'avatars'), { maxAge: '7d', fallthrough: false }));
app.use('/static', express.static(path.resolve(__dirname, '../public'), { maxAge: '1d' }));
app.use('/health', healthRoutes);
app.get('/', (req, res) => res.json({ name: 'V Tracker API', version: require('../package.json').version, docs: '/v1 — see api-docs/ folder', health: '/health' }));

app.use(maintenance);
app.use(env.API_PREFIX, globalLimiter, v1);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
