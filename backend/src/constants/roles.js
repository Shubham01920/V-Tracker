'use strict';
/** PDF §6.3 Roles */
const ROLES = Object.freeze({ OWNER: 'OWNER', ADMIN: 'ADMIN', SYSTEM: 'SYSTEM' });
module.exports = { ROLES, ALL_ROLES: Object.values(ROLES) };
