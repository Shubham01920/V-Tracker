'use strict';
/** Small pure helpers: masking, normalising, pagination, money. */

const maskPhone = (p) => (p ? `${String(p).slice(0, 2)}******${String(p).slice(-2)}` : null);

function maskEmail(e) {
  if (!e) return null;
  const [u, d] = String(e).split('@');
  return `${u.slice(0, 2)}${'*'.repeat(Math.max(3, u.length - 2))}@${d}`;
}

/** "MH12AB1234" -> "MH 12 ** 1234" */
function maskPlate(reg) {
  if (!reg) return null;
  const m = String(reg).match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{4})$/);
  if (m) return `${m[1]} ${m[2]} ${m[3] ? '**' : ''} ${m[4]}`.replace(/\s+/g, ' ').trim();
  return `${reg.slice(0, 2)} ** ${reg.slice(-4)}`;
}

const maskUpi = (u) => {
  if (!u) return null;
  const [n, h] = String(u).split('@');
  return `${n.slice(0, 2)}***@${h}`;
};

const normalizeReg = (r) => String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Indian registration: KA17SP1234, KA011234, 22BH1234AA
const REG_REGEX = /^(?:[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}|\d{2}BH\d{4}[A-Z]{1,2})$/;

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function paginate(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

const pageMeta = ({ page, limit }, total) => ({ page, limit, total, hasMore: page * limit < total });

const rupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: paise % 100 ? 2 : 0 })}`;

const addDays = (d, n) => new Date(new Date(d).getTime() + n * 86400000);
const addMinutes = (d, n) => new Date(new Date(d).getTime() + n * 60000);

module.exports = { maskPhone, maskEmail, maskPlate, maskUpi, normalizeReg, REG_REGEX, escapeRegex, paginate, pageMeta, rupees, addDays, addMinutes };
