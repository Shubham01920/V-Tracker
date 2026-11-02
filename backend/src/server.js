'use strict';
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');
const bootstrap = require('./config/bootstrap');
const jobs = require('./jobs/cleanup.job');

async function main() {
  await connectDB();
  if (env.BOOTSTRAP_ON_START) await bootstrap.ensureReferenceData();
  const stopJobs = env.JOBS_ENABLED ? jobs.start() : () => {};
  const server = app.listen(env.PORT, () => logger.info(`V Tracker API listening on ${env.PUBLIC_BASE_URL} (${env.NODE_ENV})`));

  const shutdown = (sig) => {
    logger.info(`${sig} received, shutting down`);
    stopJobs();
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (e) => logger.error('unhandledRejection', { err: e && e.stack }));

main().catch((e) => {
  logger.error('Failed to start', { err: e.stack });
  console.error(e);
  process.exit(1);
});
