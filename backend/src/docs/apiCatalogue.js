'use strict';
/**
 * Master list of the 90 endpoints in PDF §6.4 (85 app/public + 5 provider webhooks).
 * Drives: api-docs/*.json (one file per endpoint), the Postman collection, and the endpoint coverage check in tests.
 * Field notation: "type | required | description".
 */
const B = 'Bearer';
const AUTH_HDR = { Authorization: 'Bearer <accessToken>' };
const IDEM = { 'Idempotency-Key': '<uuid, new for every new request>' };
const HMAC_HDR = { 'X-Timestamp': '<unix seconds>', 'X-Signature': '<hex HMAC-SHA256 of "<X-Timestamp>.<raw body>" with the provider secret>' };
const page = { page: 'integer | optional | default 1', limit: 'integer | optional | default 20, max 100' };

const E = (id, group, name, method, path, auth, o = {}) => ({ id, group, name, method, path, auth, ...o });

module.exports = [
  // ------------------------------------------------------------------ Authentication (8)
  E('AUTH-01', 'Authentication', 'Register', 'POST', '/auth/register', 'None', {
    screens: ['Signup tab'], success: 201,
    purpose: 'Create an owner account, attach an optional referrer and send a phone OTP. Repeating the call for an unverified phone updates the details and re-sends the OTP (rate-limited).',
    body: { fullName: 'string | required | 2-80 chars', email: 'string | required | e-mail', phone: 'string | required | 10-digit Indian mobile (6-9 first)', password: 'string | required | min 8, letters + digits', referralCode: 'string | optional | another user\'s code' },
    errors: ['EMAIL_TAKEN', 'PHONE_TAKEN', 'REFERRAL_INVALID', 'VALIDATION_FAILED', 'RATE_LIMITED'],
    notes: 'verification.devCode is returned only when NODE_ENV is not production.',
  }),
  E('AUTH-02', 'Authentication', 'Verify OTP', 'POST', '/auth/verify-otp', 'None', {
    screens: ['OTP verification'], success: 200,
    purpose: 'Confirm the 6-digit code; activates the account (or applies a phone / alert-number change) and returns tokens.',
    body: { challengeId: 'uuid | required | from AUTH-01 / PRF-02', code: 'string | required | 6 digits', deviceId: 'string | optional' },
    errors: ['OTP_INVALID', 'OTP_EXPIRED', 'OTP_ATTEMPTS_EXCEEDED'],
    notes: 'Code expires after 5 minutes; 5 wrong attempts invalidate it.',
  }),
  E('AUTH-03', 'Authentication', 'Login', 'POST', '/auth/login', 'None', {
    screens: ['Login tab'], success: 200, purpose: 'E-mail + password sign-in. Same error for unknown e-mail and wrong password.',
    body: { email: 'string | required', password: 'string | required', deviceId: 'string | optional' },
    errors: ['INVALID_CREDENTIALS', 'ACCOUNT_LOCKED', 'PHONE_NOT_VERIFIED'],
    notes: '5 failures lock the account for 15 minutes. PHONE_NOT_VERIFIED includes a fresh verification challenge in error.details.',
  }),
  E('AUTH-04', 'Authentication', 'Google sign-in', 'POST', '/auth/google', 'None', {
    screens: ['Login tab', 'Signup tab'], success: 200, purpose: 'Exchange a Google ID token for app tokens. New users must also send phone.',
    body: { idToken: 'string | required | Google ID token (dev: "mock:<sub>:<email>:<name>")', phone: 'string | required for new users', referralCode: 'string | optional', deviceId: 'string | optional' },
    errors: ['TOKEN_INVALID', 'PHONE_REQUIRED', 'PHONE_TAKEN'],
  }),
  E('AUTH-05', 'Authentication', 'Refresh tokens', 'POST', '/auth/refresh', 'Refresh token', {
    screens: ['Splash and session check', 'HTTP interceptor'], success: 200, purpose: 'Rotate the refresh token and get a new access token. Re-using an old refresh token revokes the whole session family.',
    body: { refreshToken: 'string | required' }, errors: ['REFRESH_INVALID', 'REFRESH_REUSED'],
  }),
  E('AUTH-06', 'Authentication', 'Forgot password', 'POST', '/auth/forgot-password', 'None', {
    screens: ['Forgot Password'], success: 202, purpose: 'Send a single-use reset link. Always answers 202 so registered e-mails cannot be discovered.',
    body: { email: 'string | required' }, errors: ['RATE_LIMITED'], notes: 'data.devResetToken is returned only outside production.',
  }),
  E('AUTH-07', 'Authentication', 'Reset password', 'POST', '/auth/reset-password', 'Reset token', {
    screens: ['Reset Password'], success: 204, purpose: 'Consume the reset token, set a new password and revoke every existing session.',
    body: { token: 'string | required | from the e-mailed link', newPassword: 'string | required | min 8, letters + digits' },
    errors: ['TOKEN_INVALID', 'TOKEN_EXPIRED', 'WEAK_PASSWORD', 'VALIDATION_FAILED'],
  }),
  E('AUTH-08', 'Authentication', 'Logout', 'POST', '/auth/logout', B, {
    screens: ['Drawer', 'Profile'], success: 204, purpose: 'Revoke the refresh-token family on the server.', body: { refreshToken: 'string | required' }, errors: [],
  }),

  // ------------------------------------------------------------------ Profile (3)
  E('PRF-01', 'Profile', 'Get my profile', 'GET', '/me', B, { screens: ['Drawer', 'Home', 'Profile', 'Edit Profile'], success: 200, purpose: 'Current user with masked phones, avatar, address fields, referral code and KYC state.', errors: [] }),
  E('PRF-02', 'Profile', 'Update my profile', 'PATCH', '/me', B, {
    screens: ['Edit Profile'], success: 200, purpose: 'Save changed fields only. A new mobile or alert number is applied after OTP (response.verification).',
    body: { fullName: 'string', email: 'string', phone: 'string | triggers OTP', alertPhone: 'string | triggers OTP', address: 'string', place: 'string', city: 'string', state: 'string', pincode: 'string', locality: 'string', nearBy: 'string' },
    errors: ['VALIDATION_FAILED', 'PHONE_TAKEN', 'EMAIL_TAKEN'],
  }),
  E('PRF-03', 'Profile', 'Upload avatar', 'POST', '/me/avatar', B, {
    screens: ['Edit Profile'], success: 200, bodyType: 'multipart/form-data', purpose: 'Upload a JPEG/PNG (max 5 MB) as the profile photo.', body: { file: 'file | required | image/jpeg or image/png' },
    errors: ['FILE_TOO_LARGE', 'UNSUPPORTED_TYPE', 'FILE_REQUIRED'],
  }),

  // ------------------------------------------------------------------ Addresses (4)
  E('ADR-01', 'Addresses', 'List addresses', 'GET', '/addresses', B, { screens: ['Checkout', 'Address Book'], success: 200, purpose: 'Saved addresses, default first.', errors: [] }),
  E('ADR-02', 'Addresses', 'Add address', 'POST', '/addresses', B, {
    screens: ['Address Book'], success: 201, purpose: 'Save an address. The first one, or one sent with isDefault=true, becomes the default.',
    body: { name: 'string | required', phone: 'string | required | recipient mobile', label: 'HOME|OFFICE|OTHER | optional', line1: 'string | required', line2: 'string | optional', pincode: 'string | required | 6 digits', city: 'string | required', state: 'string | required', isDefault: 'boolean | optional' },
    errors: ['VALIDATION_FAILED', 'LIMIT_REACHED'],
  }),
  E('ADR-03', 'Addresses', 'Update address', 'PATCH', '/addresses/{id}', B, {
    screens: ['Address Book'], success: 200, purpose: 'Update fields or promote to default.', params: { id: 'string | required' }, body: { '...': 'any ADR-02 field' }, errors: ['NOT_FOUND'],
  }),
  E('ADR-04', 'Addresses', 'Delete address', 'DELETE', '/addresses/{id}', B, {
    screens: ['Address Book'], success: 204, purpose: 'Delete; if it was the default the oldest remaining address becomes default.', params: { id: 'string | required' }, errors: ['NOT_FOUND'],
  }),

  // ------------------------------------------------------------------ Vehicles, QR, contacts, public scan (13)
  E('VEH-01', 'Vehicles, QR, contacts and public scan', 'List my vehicles', 'GET', '/vehicles', B, { screens: ['My Vehicles', 'QR Activation', 'FASTag Balance'], success: 200, purpose: 'Owner vehicles with label state.', query: page, errors: [] }),
  E('VEH-02', 'Vehicles, QR, contacts and public scan', 'Add vehicle', 'POST', '/vehicles', B, {
    screens: ['Add Vehicle', 'QR Activation'], success: 201, purpose: 'Create a vehicle. Registration number is normalised (no spaces, upper case) and unique across owners.',
    body: { registrationNumber: 'string | required | e.g. KA17SP1234', type: 'TWO_WHEELER|THREE_WHEELER|FOUR_WHEELER|COMMERCIAL | required', model: 'string | optional', color: 'string | optional' },
    errors: ['VEHICLE_EXISTS', 'VALIDATION_FAILED'],
  }),
  E('VEH-03', 'Vehicles, QR, contacts and public scan', 'Vehicle detail', 'GET', '/vehicles/{id}', B, { screens: ['My Vehicles (Manage QR)'], success: 200, purpose: 'One vehicle with label code, activation date and 30-day scan count.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('VEH-04', 'Vehicles, QR, contacts and public scan', 'Unlink label', 'DELETE', '/vehicles/{id}/qr', B, { screens: ['My Vehicles'], success: 204, purpose: 'Unlink the label (sold / damaged vehicle) so it can be re-bound by QR-02.', params: { id: 'string | required' }, errors: ['QR_NOT_LINKED', 'NOT_FOUND'] }),
  E('VEH-05', 'Vehicles, QR, contacts and public scan', 'Lookup by plate', 'GET', '/vehicles/lookup', B, {
    screens: ['Vehicle Search'], success: 200, purpose: 'Resolve a plate to a SAFE summary: masked plate, type, label active, opaque vehicleRef. Never owner name, phone, insurance or PUC.',
    query: { reg: 'string | required | registration number' }, errors: ['NOT_FOUND', 'RATE_LIMITED'],
  }),
  E('QR-01', 'Vehicles, QR, contacts and public scan', 'Scanned label status', 'GET', '/qr/{qrUuid}/status', 'Optional', {
    screens: ['Scan tab'], success: 200, purpose: 'Tell the app what a scanned code is: UNACTIVATED, ACTIVE_OWN, ACTIVE_OTHER or INVALID.', params: { qrUuid: 'uuid | required' }, errors: ['QR_NOT_FOUND'],
  }),
  E('QR-02', 'Vehicles, QR, contacts and public scan', 'Activate label', 'POST', '/qr/activate', B, {
    screens: ['QR Activation'], success: 200, purpose: 'Bind a SHIPPED/DELIVERED label bought by this user to one of their vehicles. Issues an activation scratch card the first time.',
    body: { qrUuid: 'uuid | required', vehicleId: 'string | required' }, errors: ['QR_NOT_FOUND', 'QR_ALREADY_ACTIVE', 'QR_NOT_ELIGIBLE', 'VEHICLE_HAS_QR'],
  }),
  E('CON-01', 'Vehicles, QR, contacts and public scan', 'Call owner (app)', 'POST', '/contacts/call', B, {
    screens: ['Vehicle Search', 'Scan tab'], success: 202, purpose: 'Start a masked bridged call to the owner of vehicleRef.',
    body: { vehicleRef: 'string | required | from VEH-05 / QR-01', reason: 'BLOCKING_ROAD|LIGHTS_ON|DOORS_OPEN|TOWING|EMERGENCY|OTHER | optional' },
    errors: ['CONTACT_BLOCKED', 'OWNER_UNAVAILABLE', 'RATE_LIMITED', 'CANNOT_CONTACT_SELF'],
  }),
  E('CON-02', 'Vehicles, QR, contacts and public scan', 'Send alert (app)', 'POST', '/contacts/alert', B, {
    screens: ['Vehicle Search'], success: 202, purpose: 'Send a preset alert to the owner app + SMS.', body: { vehicleRef: 'string | required', reason: 'enum | required', note: 'string | optional | max 280' },
    errors: ['CONTACT_BLOCKED', 'RATE_LIMITED', 'CANNOT_CONTACT_SELF'],
  }),
  E('PUB-01', 'Vehicles, QR, contacts and public scan', 'Public scan page data', 'GET', '/public/scan/{qrUuid}', 'None', {
    screens: ['Public scan web page'], success: 200, purpose: 'Masked plate, vehicle type and allowed actions for the bystander web page. Never owner data.', params: { qrUuid: 'uuid | required' }, errors: ['QR_NOT_FOUND', 'QR_INACTIVE'],
  }),
  E('PUB-02', 'Vehicles, QR, contacts and public scan', 'Public call owner', 'POST', '/public/scan/{qrUuid}/call', 'None', {
    screens: ['Public scan web page'], success: 202, purpose: 'Bystander enters own number; a masked call is bridged.', params: { qrUuid: 'uuid | required' },
    body: { callerPhone: 'string | required', captchaToken: 'string | required in production', reason: 'enum | optional' }, errors: ['CAPTCHA_FAILED', 'OWNER_UNAVAILABLE', 'RATE_LIMITED', 'QR_INACTIVE'],
  }),
  E('PUB-03', 'Vehicles, QR, contacts and public scan', 'Public send alert', 'POST', '/public/scan/{qrUuid}/alert', 'None', {
    screens: ['Public scan web page'], success: 202, purpose: 'Send a preset message when a call is not wanted.', params: { qrUuid: 'uuid | required' },
    body: { reason: 'enum | required', note: 'string | optional', callerPhone: 'string | optional', captchaToken: 'string' }, errors: ['CAPTCHA_FAILED', 'RATE_LIMITED', 'QR_INACTIVE'],
  }),
  E('PUB-04', 'Vehicles, QR, contacts and public scan', 'Public report', 'POST', '/public/scan/{qrUuid}/report', 'None', {
    screens: ['Public scan web page'], success: 202, purpose: 'Report misuse or a damaged label.', params: { qrUuid: 'uuid | required' }, body: { kind: 'LABEL_DAMAGED|MISUSE|OTHER | required', note: 'string | optional' }, errors: ['RATE_LIMITED', 'QR_NOT_FOUND'],
  }),

  // ------------------------------------------------------------------ Calls, notifications, devices (9)
  E('CAL-01', 'Calls, notifications and devices', 'Call history', 'GET', '/calls', B, { screens: ['Call History'], success: 200, purpose: 'Contacts received (calls and alerts). Never contains the caller\'s number.', query: { type: 'ALL|EMERGENCY|MISSED | optional', ...page }, errors: [] }),
  E('CAL-02', 'Calls, notifications and devices', 'Call detail', 'GET', '/calls/{id}', B, { screens: ['Call History'], success: 200, purpose: 'One contact with duration, reason and block option.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('CAL-03', 'Calls, notifications and devices', 'Telephony webhook', 'POST', '/webhooks/telephony', 'HMAC', {
    webhook: true, screens: ['(provider)'], success: 200, purpose: 'Call events from the telephony provider update call history.',
    body: { eventId: 'string | required | unique per event', event: 'call.answered|call.completed|call.missed|call.failed', sessionId: 'string | required', durationSec: 'integer | optional' }, errors: ['SIGNATURE_INVALID'],
  }),
  E('NOT-01', 'Calls, notifications and devices', 'List notifications', 'GET', '/notifications', B, { screens: ['Notifications'], success: 200, purpose: 'Notifications with type, deep link and read state.', query: page, errors: [] }),
  E('NOT-02', 'Calls, notifications and devices', 'Mark notification read', 'PATCH', '/notifications/{id}/read', B, { screens: ['Notifications'], success: 204, purpose: 'Mark one notification read.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('NOT-03', 'Calls, notifications and devices', 'Mark all read', 'POST', '/notifications/read-all', B, { screens: ['Notifications'], success: 204, purpose: 'Clear the unread badge.', errors: [] }),
  E('NOT-04', 'Calls, notifications and devices', 'Unread count', 'GET', '/notifications/unread-count', B, { screens: ['Home'], success: 200, purpose: 'Drives the red dot on the bell.', errors: [] }),
  E('DEV-01', 'Calls, notifications and devices', 'Register device', 'POST', '/devices', B, {
    screens: ['Navigation shell'], success: 201, purpose: 'Register the FCM push token (upsert by token).', body: { pushToken: 'string | required', platform: 'ANDROID|IOS|WEB | required', appVersion: 'string | optional', deviceId: 'string | optional' }, errors: ['VALIDATION_FAILED'],
  }),
  E('DEV-02', 'Calls, notifications and devices', 'Remove device', 'DELETE', '/devices/{id}', B, { screens: ['Drawer', 'Profile (Logout)'], success: 204, purpose: 'Stop pushes to a signed-out phone.', params: { id: 'string | required | from DEV-01' }, errors: ['NOT_FOUND'] }),

  // ------------------------------------------------------------------ Catalogue, wishlist, cart (8)
  E('SHP-01', 'Catalogue, wishlist and cart', 'List products', 'GET', '/products', 'Optional', {
    screens: ['Shop'], success: 200, purpose: 'Catalogue with integer prices (paise) and image URLs. With a token, each item has wishlisted.', query: { category: 'ALL|PACKAGE|TWO_WHEELER|THREE_WHEELER|FOUR_WHEELER|COMMERCIAL | optional', q: 'string | optional | search', ...page }, errors: [],
  }),
  E('SHP-02', 'Catalogue, wishlist and cart', 'Product detail', 'GET', '/products/{id}', 'Optional', { screens: ['Product Detail'], success: 200, purpose: 'Gallery, features, rating and review count.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('WSH-01', 'Catalogue, wishlist and cart', 'Add to wishlist', 'PUT', '/wishlist/{productId}', B, { screens: ['Shop', 'Product Detail'], success: 204, purpose: 'Idempotent add.', params: { productId: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('WSH-02', 'Catalogue, wishlist and cart', 'Remove from wishlist', 'DELETE', '/wishlist/{productId}', B, { screens: ['Shop', 'Product Detail'], success: 204, purpose: 'Idempotent remove.', params: { productId: 'string | required' }, errors: [] }),
  E('CRT-01', 'Catalogue, wishlist and cart', 'Get cart', 'GET', '/cart', B, { screens: ['Home', 'Shop', 'Cart'], success: 200, purpose: 'Server cart, re-priced on every read.', errors: [] }),
  E('CRT-02', 'Catalogue, wishlist and cart', 'Set cart quantity', 'PUT', '/cart/items/{productId}', B, {
    screens: ['Product Detail', 'Cart'], success: 200, purpose: 'Set the quantity of a line (adds the line if missing).', params: { productId: 'string | required' }, body: { qty: 'integer | required | 1-10' }, errors: ['OUT_OF_STOCK', 'QTY_LIMIT', 'NOT_FOUND'],
  }),
  E('CRT-03', 'Catalogue, wishlist and cart', 'Remove cart line', 'DELETE', '/cart/items/{productId}', B, { screens: ['Cart'], success: 200, purpose: 'Remove a line; returns the updated cart.', params: { productId: 'string | required' }, errors: [] }),
  E('CRT-04', 'Catalogue, wishlist and cart', 'Clear cart', 'DELETE', '/cart', B, { screens: ['Payment Result'], success: 204, purpose: 'Fallback clear after PAID (the server also clears it).', errors: [] }),

  // ------------------------------------------------------------------ Checkout and payments (5)
  E('CHK-01', 'Checkout and payments', 'Checkout summary', 'GET', '/checkout/summary', B, {
    screens: ['Checkout'], success: 200, purpose: 'Server-computed delivery, tax, discounts and total. The app only displays them.',
    query: { addressId: 'string | optional | default address if omitted', couponCode: 'string | optional', redeemPoints: 'boolean | optional' }, errors: ['ADDRESS_NOT_SERVICEABLE', 'COUPON_INVALID', 'COUPON_EXPIRED', 'COUPON_LIMIT'],
  }),
  E('CHK-02', 'Checkout and payments', 'Validate coupon', 'POST', '/coupons/validate', B, { screens: ['Checkout'], success: 200, purpose: 'Check a coupon against cart value, user and dates.', body: { code: 'string | required', subtotalPaise: 'integer | required' }, errors: ['COUPON_INVALID', 'COUPON_EXPIRED', 'COUPON_LIMIT'] }),
  E('CHK-03', 'Checkout and payments', 'Create order', 'POST', '/orders', 'Bearer + Idempotency-Key', {
    headers: IDEM, screens: ['Checkout'], success: 201, purpose: 'Create the order with locked prices, reserve stock and return a payment-gateway session.',
    body: { addressId: 'string | required', couponCode: 'string | optional', redeemPoints: 'boolean | optional', expectedTotalPaise: 'integer | required | must equal CHK-01 totalPaise' },
    errors: ['PRICE_CHANGED', 'CART_EMPTY', 'OUT_OF_STOCK', 'NOT_FOUND', 'IDEMPOTENCY_KEY_REQUIRED', 'IDEMPOTENCY_KEY_REUSED'],
  }),
  E('CHK-04', 'Checkout and payments', 'Confirm payment', 'POST', '/payments/confirm', B, {
    screens: ['Payment'], success: 200, purpose: 'Send the gateway payment id + signature after checkout. Final PAID comes from the CHK-05 webhook; poll ORD-02.',
    body: { orderId: 'string | required', gatewayPaymentId: 'string | required', signature: 'string | required | HMAC_SHA256("<gatewayOrderId>|<gatewayPaymentId>", key secret)' }, errors: ['SIGNATURE_INVALID', 'ORDER_NOT_FOUND'],
  }),
  E('CHK-05', 'Checkout and payments', 'Payment webhook', 'POST', '/webhooks/payment', 'HMAC', {
    webhook: true, screens: ['(provider)'], success: 200, purpose: 'Gateway events: payment.captured -> order PAID (labels generated, cart cleared, shipment created); payment.failed; refund.processed. Also settles FASTag recharges.',
    body: { eventId: 'string | required', event: 'payment.captured|payment.failed|refund.processed', gatewayOrderId: 'string | required', gatewayPaymentId: 'string', amountPaise: 'integer | checked against the order' }, errors: ['SIGNATURE_INVALID'],
  }),

  // ------------------------------------------------------------------ Orders and tracking (4)
  E('ORD-01', 'Orders and tracking', 'List orders', 'GET', '/orders', B, { screens: ['My Orders'], success: 200, purpose: 'Orders newest first with status, totals and 3-step progress.', query: { status: 'order status | optional', ...page }, errors: [] }),
  E('ORD-02', 'Orders and tracking', 'Order detail', 'GET', '/orders/{id}', B, { screens: ['Order Detail', 'Payment Result'], success: 200, purpose: 'Lines, address snapshot, payment state, totals, QR label codes and timeline.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('ORD-03', 'Orders and tracking', 'Track shipment', 'GET', '/tracking', B, { screens: ['Track Order', 'Order Detail'], success: 200, purpose: 'Order number, order id or AWB -> courier, ETA and 6-stage timeline. Only the caller\'s orders.', query: { ref: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('ORD-04', 'Orders and tracking', 'Courier webhook', 'POST', '/webhooks/courier', 'HMAC', {
    webhook: true, screens: ['(provider)'], success: 200, purpose: 'Courier status events advance the order and its labels (SHIPPED / DELIVERED make labels activatable).',
    body: { eventId: 'string | required', awb: 'string | awb or orderNumber', orderNumber: 'string', status: 'PLACED|PROCESSED|SHIPPED|IN_TRANSIT|OUT_FOR_DELIVERY|DELIVERED', detail: 'string', location: 'string', at: 'ISO date', eta: 'ISO date' }, errors: ['SIGNATURE_INVALID'],
  }),

  // ------------------------------------------------------------------ Rewards, referral, payouts (11)
  E('RWD-01', 'Rewards, referral and payouts', 'List rewards', 'GET', '/rewards', B, { screens: ['Rewards'], success: 200, purpose: 'Scratch cards. The value of an unscratched card is never sent.', query: { status: 'UNSCRATCHED|SCRATCHED|EXPIRED | optional' }, errors: [] }),
  E('RWD-02', 'Rewards, referral and payouts', 'Scratch card', 'POST', '/rewards/{id}/scratch', 'Bearer + Idempotency-Key', {
    headers: IDEM, screens: ['Rewards'], success: 200, purpose: 'Server decides and records the amount and credits the wallet. Repeating with the same Idempotency-Key returns the same result.', params: { id: 'string | required' }, errors: ['REWARD_ALREADY_SCRATCHED', 'REWARD_EXPIRED'],
  }),
  E('RWD-03', 'Rewards, referral and payouts', 'Rewards summary', 'GET', '/rewards/summary', B, { screens: ['Rewards'], success: 200, purpose: 'Total cashback, points and unscratched count.', errors: [] }),
  E('REF-01', 'Rewards, referral and payouts', 'Referral summary', 'GET', '/referral/summary', B, { screens: ['Refer and Earn'], success: 200, purpose: 'Own code, share link + message, total earned and card count.', errors: [] }),
  E('REF-02', 'Rewards, referral and payouts', 'Direct referrals', 'GET', '/referral/direct', B, { screens: ['Direct Referral'], success: 200, purpose: 'People invited directly with masked e-mail, team size and status.', query: { q: 'string | optional', ...page }, errors: [] }),
  E('REF-03', 'Rewards, referral and payouts', 'Performance', 'GET', '/referral/performance', B, { screens: ['Your Performance'], success: 200, purpose: 'Every block of the Your Performance page from one ledger so numbers agree.', errors: [] }),
  E('REF-04', 'Rewards, referral and payouts', 'Team summary', 'GET', '/referral/team/summary', B, { screens: ['Team Performance'], success: 200, purpose: 'Total members, active members, active rate and members per level.', errors: [] }),
  E('REF-05', 'Rewards, referral and payouts', 'Team tree', 'GET', '/referral/team/tree', B, { screens: ['Team Performance'], success: 200, purpose: 'Lazy-loaded children of one node (default: me).', query: { parentId: 'string | optional', depth: 'integer | optional | 1-2', ...page }, errors: ['NOT_FOUND'] }),
  E('PAY-01', 'Rewards, referral and payouts', 'List payouts', 'GET', '/payouts', B, { screens: ['Payout History'], success: 200, purpose: 'Referral payout records.', query: { status: 'PENDING|CREDITED|REVERSED | optional', ...page }, errors: [] }),
  E('PAY-02', 'Rewards, referral and payouts', 'Payout summary', 'GET', '/payouts/summary', B, { screens: ['Payout History'], success: 200, purpose: 'Totals and per-team counts (same ledger as PAY-03).', errors: [] }),
  E('PAY-03', 'Rewards, referral and payouts', 'Payouts by team', 'GET', '/payouts/by-team', B, { screens: ['Payouts by Teams'], success: 200, purpose: 'Per level: total, credited, pending, count, share and average.', errors: [] }),

  // ------------------------------------------------------------------ Bank, KYC, wallet (9)
  E('BNK-01', 'Bank, KYC and wallet', 'Get bank account', 'GET', '/me/bank-account', B, { screens: ['Bank Details', 'Withdraw'], success: 200, purpose: 'Masked bank record (last 4 only).', errors: ['NOT_FOUND'] }),
  E('BNK-02', 'Bank, KYC and wallet', 'Save bank account', 'PUT', '/me/bank-account', 'Bearer + recent re-authentication', {
    screens: ['Bank Details'], success: 200, purpose: 'Save and verify (name match). Changing the account pauses withdrawals for 24 h.',
    body: { holderName: 'string | required', bankName: 'string | optional', accountNumber: 'string | required | 8-18 digits', confirmAccountNumber: 'string | required', ifsc: 'string | required', branch: 'string | optional', upiId: 'string | optional', currentPassword: 'string | required if login older than 15 min' },
    errors: ['IFSC_INVALID', 'ACCOUNT_MISMATCH', 'NAME_MISMATCH', 'REAUTH_REQUIRED'],
  }),
  E('BNK-03', 'Bank, KYC and wallet', 'IFSC lookup', 'GET', '/lookup/ifsc/{code}', B, { screens: ['Bank Details'], success: 200, purpose: 'Bank name and branch from IFSC.', params: { code: 'string | required | 11 chars' }, errors: ['IFSC_INVALID'] }),
  E('KYC-01', 'Bank, KYC and wallet', 'Submit PAN', 'POST', '/me/kyc', B, { screens: ['PAN KYC'], success: 202, purpose: 'Submit PAN. Withdrawals stay blocked until VERIFIED.', body: { panNumber: 'string | required | ABCDE1234F', nameOnPan: 'string | required' }, errors: ['PAN_INVALID'] }),
  E('WAL-01', 'Bank, KYC and wallet', 'Get wallet', 'GET', '/wallet', B, { screens: ['Withdraw'], success: 200, purpose: 'Withdrawable and held balance, limits, KYC and bank state.', errors: [] }),
  E('WAL-02', 'Bank, KYC and wallet', 'Request withdrawal', 'POST', '/withdrawals', 'Bearer + Idempotency-Key + recent re-authentication', {
    headers: IDEM, screens: ['Withdraw'], success: 202, purpose: 'Create a payout request, hold the amount and send it to the payout provider.',
    body: { amountPaise: 'integer | required | min 50000', mode: 'BANK|UPI | optional', currentPassword: 'string | required if login older than 15 min' },
    errors: ['INSUFFICIENT_BALANCE', 'BELOW_MINIMUM', 'ABOVE_MAXIMUM', 'KYC_REQUIRED', 'BANK_NOT_VERIFIED', 'BANK_COOLDOWN', 'REAUTH_REQUIRED'],
  }),
  E('WAL-03', 'Bank, KYC and wallet', 'Withdrawal history', 'GET', '/withdrawals', B, { screens: ['Withdraw History'], success: 200, purpose: 'Requests newest first plus paid-out / pending totals.', query: { status: 'PENDING|COMPLETED|FAILED | optional', ...page }, errors: [] }),
  E('WAL-04', 'Bank, KYC and wallet', 'Withdrawal detail', 'GET', '/withdrawals/{id}', B, { screens: ['Withdraw History'], success: 200, purpose: 'One request with UTR and failure reason.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('WAL-05', 'Bank, KYC and wallet', 'Payout webhook', 'POST', '/webhooks/payout', 'HMAC', {
    webhook: true, screens: ['(provider)'], success: 200, purpose: 'payout.processed settles the hold; payout.failed / payout.reversed release it back to available.',
    body: { eventId: 'string | required', event: 'payout.processed|payout.failed|payout.reversed', providerRef: 'string | required', utr: 'string', reason: 'string' }, errors: ['SIGNATURE_INVALID'],
  }),

  // ------------------------------------------------------------------ FASTag (6)
  E('FST-01', 'FASTag', 'FASTag issuers', 'GET', '/fastag/issuers', B, { screens: ['FASTag Recharge'], success: 200, purpose: 'Supported issuer banks.', errors: [] }),
  E('FST-02', 'FASTag', 'FASTag balance', 'GET', '/fastag/lookup', B, { screens: ['FASTag Balance'], success: 200, purpose: 'Issuer, tag id, status and balance. Only for the owner\'s own vehicles.', query: { vehicle: 'string | required | registration number' }, errors: ['FASTAG_NOT_FOUND', 'VEHICLE_NOT_OWNED', 'PROVIDER_UNAVAILABLE'] }),
  E('FST-03', 'FASTag', 'Toll transactions', 'GET', '/fastag/vehicles/{vehicle}/transactions', B, { screens: ['FASTag Balance'], success: 200, purpose: 'Recent toll passages and recharges.', params: { vehicle: 'string | required' }, query: page, errors: ['VEHICLE_NOT_OWNED'] }),
  E('FST-04', 'FASTag', 'Create recharge', 'POST', '/fastag/recharge', 'Bearer + Idempotency-Key', {
    headers: IDEM, screens: ['FASTag Recharge'], success: 201, purpose: 'Create a recharge and a UPI payment session.',
    body: { vehicle: 'string | required', issuerCode: 'string | required | from FST-01', amountPaise: 'integer | required | min 10000', upiHandle: 'string | optional' }, errors: ['BELOW_MINIMUM', 'ABOVE_MAXIMUM', 'VEHICLE_NOT_OWNED', 'FASTAG_NOT_FOUND'],
  }),
  E('FST-05', 'FASTag', 'Recharge status', 'GET', '/fastag/recharge/{id}', B, { screens: ['FASTag Recharge'], success: 200, purpose: 'Poll until CREDITED or FAILED.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('FST-06', 'FASTag', 'FASTag webhook', 'POST', '/webhooks/fastag', 'HMAC', {
    webhook: true, screens: ['(provider)'], success: 200, purpose: 'Aggregator confirms credit (recharge.credited) or failure.', body: { eventId: 'string | required', event: 'recharge.credited|recharge.failed', providerRef: 'string | required', reason: 'string' }, errors: ['SIGNATURE_INVALID'],
  }),

  // ------------------------------------------------------------------ Documents (4)
  E('DOC-01', 'Documents', 'List documents', 'GET', '/documents', B, { screens: ['Verified Documents'], success: 200, purpose: 'Type, masked number, status and expiry.', query: { type: 'VEHICLE_RC|FASTAG_CERTIFICATE|MOTOR_INSURANCE|PUC|DRIVING_LICENCE | optional' }, errors: [] }),
  E('DOC-02', 'Documents', 'Upload document', 'POST', '/documents', B, {
    screens: ['Verified Documents'], success: 201, bodyType: 'multipart/form-data', purpose: 'Upload (pdf/jpeg/png, max 10 MB). Stored encrypted; queued for admin review.',
    body: { file: 'file | required', type: 'enum | required', number: 'string | required', expiryDate: 'YYYY-MM-DD | optional', consent: 'true | required' }, errors: ['FILE_TOO_LARGE', 'UNSUPPORTED_TYPE', 'DOCUMENT_TYPE_INVALID', 'VALIDATION_FAILED'],
  }),
  E('DOC-03', 'Documents', 'Document download link', 'GET', '/documents/{id}/download-url', B, { screens: ['Verified Documents'], success: 200, purpose: 'Signed link valid 5 minutes.', params: { id: 'string | required' }, errors: ['NOT_FOUND'] }),
  E('DOC-04', 'Documents', 'Export verified documents', 'POST', '/documents/export', B, { screens: ['Verified Documents'], success: 202, purpose: 'Async ZIP of all verified files; a notification carries the link when ready.', errors: ['NO_VERIFIED_DOCUMENTS'] }),

  // ------------------------------------------------------------------ Content, support, config, lookups (6)
  E('CNT-01', 'Content, support, config and lookups', 'Legal / about content', 'GET', '/content/{slug}', 'None', { screens: ['About Us', 'Privacy Policy', 'Terms and Conditions'], success: 200, purpose: 'Versioned content blocks.', params: { slug: 'about|privacy|terms | required' }, errors: ['NOT_FOUND'] }),
  E('SUP-01', 'Content, support, config and lookups', 'FAQs', 'GET', '/support/faqs', 'None', { screens: ['Help and Support'], success: 200, purpose: 'FAQ list.', errors: [] }),
  E('SUP-02', 'Content, support, config and lookups', 'Support contact', 'GET', '/support/contact', 'None', { screens: ['Help and Support'], success: 200, purpose: 'Support e-mail, phone, hours.', errors: [] }),
  E('SUP-03', 'Content, support, config and lookups', 'Raise ticket', 'POST', '/support/tickets', B, {
    screens: ['Help and Support'], success: 201, purpose: 'Create a support ticket.', body: { category: 'ORDER|QR_LABEL|CALLS|PAYMENTS|WITHDRAWAL|FASTAG|DOCUMENTS|ACCOUNT|OTHER | required', message: 'string | required | 10-2000', orderId: 'string | optional', vehicleId: 'string | optional' }, errors: ['VALIDATION_FAILED'],
  }),
  E('CFG-01', 'Content, support, config and lookups', 'App config', 'GET', '/config', 'None', { screens: ['Splash and session check'], success: 200, purpose: 'Minimum app version, maintenance flag, limits and feature flags.', errors: [] }),
  E('LKP-01', 'Content, support, config and lookups', 'Pincode lookup', 'GET', '/lookup/pincode/{pin}', B, { screens: ['Edit Profile', 'Address Book'], success: 200, purpose: 'City and state from a pincode.', params: { pin: 'string | required | 6 digits' }, errors: ['PINCODE_NOT_FOUND'] }),
];

module.exports.AUTH_HDR = AUTH_HDR;
module.exports.HMAC_HDR = HMAC_HDR;
