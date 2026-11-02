'use strict';
/* Minimal structured logger: console + daily file in logs/. Never log secrets. */
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../', process.env.LOG_DIR || 'logs');
const silent = process.env.NODE_ENV === 'test' && process.env.TEST_LOGS !== 'true';
let stream = null;

function fileStream() {
  if (silent) return null;
  const day = new Date().toISOString().slice(0, 10);
  if (!stream || stream.day !== day) {
    try {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      if (stream) stream.end();
      stream = fs.createWriteStream(path.join(LOG_DIR, `app-${day}.log`), { flags: 'a' });
      stream.day = day;
    } catch { stream = null; }
  }
  return stream;
}

function write(level, msg, meta) {
  if (silent) return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...(meta || {}) });
  (level === 'error' ? console.error : console.log)(line);
  const s = fileStream();
  if (s) s.write(line + '\n');
}

module.exports = {
  info: (m, meta) => write('info', m, meta),
  warn: (m, meta) => write('warn', m, meta),
  error: (m, meta) => write('error', m, meta),
  debug: (m, meta) => { if (process.env.LOG_LEVEL === 'debug') write('debug', m, meta); },
  stream: { write: (s) => write('http', s.trim()) },
};
