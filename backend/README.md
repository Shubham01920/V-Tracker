# V Tracker API (Node.js + Express + MongoDB)

Backend for the **V Tracker** Flutter app (`snap_q`), built from *V Tracker — Technical Documentation (Revision 2)*.
It implements **all 90 endpoints of PDF §6.4** (85 used by the app / public scan page + 5 signed provider webhooks),
with MongoDB (Mongoose) models, validation, security, background jobs, seed data and an automated test suite that
calls every endpoint.

| | |
|---|---|
| Endpoints | 90 (PDF §6.4) + health, admin review, signed file download, dev simulators |
| Tests | 58 tests in 14 files, **90 / 90 endpoints return their documented success status**, 149 error cases checked |
| API docs | `api-docs/endpoints/` — one JSON file per endpoint (90 files), plus `index.json` and a Postman collection |
| Database | MongoDB 6+ (works on a standalone server — no replica set / transactions needed) |
| Node | 20.10 or newer |

---

## 1. Quick start (Windows PowerShell, macOS, Linux)

```powershell
cd backend
npm install
copy .env.example .env        # macOS/Linux: cp .env.example .env
# fill JWT_ACCESS_SECRET, DATA_ENCRYPTION_KEY (64 hex), FILE_URL_SECRET, PAYMENT_KEY_SECRET and WEBHOOK_SECRET_* (see .env.example)
# a ready-to-use development .env is already included in this folder

npm run seed:reset            # reference data + a full demo account
npm run dev                   # http://localhost:5000  (npm start for production)
```

MongoDB: install MongoDB Community Server locally (`mongodb://127.0.0.1:27017/vtracker`) or put an Atlas URI in `MONGO_URI`.

Demo logins created by the seed (all fictional, password `Demo@1234`):

| Who | E-mail |
|---|---|
| Owner with vehicles, orders, calls, rewards, team, wallet, bank, FASTag, documents | `demo@vtracker.app` |
| Admin (document review, payout credit) | `admin@vtracker.app` |
| Team member | `pavan.demo@vtracker.app` |
| Bystander | `ravi.demo@vtracker.app` |

Check it works: `GET http://localhost:5000/health` → `{"data":{"status":"ok","db":"up"}}`.

## 2. Testing

```powershell
npm test                      # all tests + endpoint coverage check (fails if any of the 90 endpoints is not proven)
npm test -- shop wallet       # only tests/shop.test.js and tests/wallet.test.js
npm run test:only             # all tests, no coverage check
npm run docs:generate         # rebuild api-docs/ with the real request/response pairs captured by the last test run
```

Tests start a throw-away MongoDB automatically (`mongodb-memory-server`, downloads `mongod` once on first run).
To use your own MongoDB instead: `$env:TEST_MONGO_URI="mongodb://127.0.0.1:27017"; npm test` (each test file uses its own
database and drops it afterwards). Each test file runs in its own process with Node's built-in test runner.

Output of `npm test` ends with:

```
ℹ tests 58
ℹ pass 58
ℹ fail 0
================ ENDPOINT COVERAGE ================
Endpoints in catalogue      : 90
Called by tests             : 90
Returned documented success : 90
Distinct error codes checked: 149
```

`tests/.artifacts/coverage-report.json` lists, for each endpoint, the statuses and error codes seen and the test files that called it.

## 3. Folder structure

```
backend/
├── src/
│   ├── config/        env.js (validated settings) · db.js · cors.js · business.js (all business rules)
│   │                  referenceData.js + bootstrap.js (products, issuers, coupons, legal text, FAQs, pincodes, IFSC)
│   ├── constants/     roles.js · enums.js · errorCodes.js (error code -> HTTP status)
│   ├── models/        31 Mongoose models (user, refreshToken, otpChallenge, vehicle, qrLabel, contactEvent, order,
│   │                  cart, coupon, reward, payout, wallet, ledgerEntry, bankAccount, withdrawal, fastag, document ...)
│   ├── controllers/   one per group: auth, user, vehicle, notification, shop, referral, wallet, fastag,
│   │                  document, content, webhook, admin, health, dev
│   ├── services/      business logic (auth, otp, user, address, vehicle, contact, shop, order, reward,
│   │                  referral, ledger, wallet, fastag, document, content, notification, webhook, email)
│   │   └── providers/ adapters for payment, payout, telephony, FASTag, courier, SMS/e-mail/push, CAPTCHA, Google
│   ├── routes/        index.js mounts everything under /v1 (each line tagged with its PDF id)
│   ├── middlewares/   auth (+optional, +re-auth) · role · validate · idempotency · rateLimit · upload ·
│   │                  webhookSignature · requestId · security (NoSQL-operator stripping, maintenance) · error
│   ├── validators/    Joi schemas per group
│   ├── utils/         ApiError · ApiResponse · asyncHandler · generateToken · crypto (AES-256-GCM, HMAC) · helpers · logger
│   ├── jobs/          cleanup.job.js (expire unpaid orders, auto-credit payouts, expire cards, document reminders)
│   ├── docs/          apiCatalogue.js — the 90 endpoints (drives docs, Postman and the coverage check)
│   ├── app.js
│   └── server.js
├── api-docs/
│   ├── endpoints/     01_AUTH-01_register.json ... 90_LKP-01_pincode-lookup.json   (one file per endpoint)
│   ├── index.json
│   ├── V-Tracker.postman_collection.json
│   └── V-Tracker.postman_environment.json
├── scripts/           seed.js · run-tests.js · check-endpoint-coverage.js · generate-api-docs.js · make-admin.js
├── tests/             auth · user · vehicle · notification · shop · referral · wallet · fastag · document ·
│                      content · security · errors · ratelimit (.test.js) + helpers/
├── uploads/           avatars (public) · documents + exports (AES-256-GCM encrypted)
├── logs/              daily JSON log files
├── .env / .env.example
└── package.json
```

## 4. Conventions (PDF §6.2)

* Base path `/v1`. JSON, camelCase fields, enums `UPPER_SNAKE_CASE`.
* Success: `{ "data": ..., "meta": { page, limit, total, hasMore }?, "requestId": "..." }`
* Error: `{ "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [{ field, issue, message }] }, "requestId": "..." }`
* Money is **integer paise** (`99900` = ₹999). Times are ISO-8601 UTC.
* `Idempotency-Key` (UUID) is required on CHK-03, RWD-02, WAL-02, FST-04; a retry with the same key replays the first response (`Idempotent-Replayed: true`).
* Access token 15 min (JWT), refresh token 30 days, rotated on every use; re-using an old refresh token kills the session family.
* BNK-02 and WAL-02 need a recent login (15 min) or `currentPassword` in the body.
* Webhooks: `X-Timestamp` (unix seconds) + `X-Signature` = hex HMAC-SHA256 of `"<X-Timestamp>.<raw body>"` with `WEBHOOK_SECRET_<PROVIDER>`; older than 5 min is rejected; each `eventId` is processed once.

## 5. All endpoints

Full request/response details, real examples and error examples: `api-docs/endpoints/<file>.json`.

**Authentication**

| ID | Method | Path | Auth |
|---|---|---|---|
| AUTH-01 | POST | `/v1/auth/register` | None |
| AUTH-02 | POST | `/v1/auth/verify-otp` | None |
| AUTH-03 | POST | `/v1/auth/login` | None |
| AUTH-04 | POST | `/v1/auth/google` | None |
| AUTH-05 | POST | `/v1/auth/refresh` | Refresh token |
| AUTH-06 | POST | `/v1/auth/forgot-password` | None |
| AUTH-07 | POST | `/v1/auth/reset-password` | Reset token |
| AUTH-08 | POST | `/v1/auth/logout` | Bearer |

**Profile**

| ID | Method | Path | Auth |
|---|---|---|---|
| PRF-01 | GET | `/v1/me` | Bearer |
| PRF-02 | PATCH | `/v1/me` | Bearer |
| PRF-03 | POST | `/v1/me/avatar` | Bearer |

**Addresses**

| ID | Method | Path | Auth |
|---|---|---|---|
| ADR-01 | GET | `/v1/addresses` | Bearer |
| ADR-02 | POST | `/v1/addresses` | Bearer |
| ADR-03 | PATCH | `/v1/addresses/{id}` | Bearer |
| ADR-04 | DELETE | `/v1/addresses/{id}` | Bearer |

**Vehicles, QR, contacts and public scan**

| ID | Method | Path | Auth |
|---|---|---|---|
| VEH-01 | GET | `/v1/vehicles` | Bearer |
| VEH-02 | POST | `/v1/vehicles` | Bearer |
| VEH-03 | GET | `/v1/vehicles/{id}` | Bearer |
| VEH-04 | DELETE | `/v1/vehicles/{id}/qr` | Bearer |
| VEH-05 | GET | `/v1/vehicles/lookup` | Bearer |
| QR-01 | GET | `/v1/qr/{qrUuid}/status` | Optional |
| QR-02 | POST | `/v1/qr/activate` | Bearer |
| CON-01 | POST | `/v1/contacts/call` | Bearer |
| CON-02 | POST | `/v1/contacts/alert` | Bearer |
| PUB-01 | GET | `/v1/public/scan/{qrUuid}` | None |
| PUB-02 | POST | `/v1/public/scan/{qrUuid}/call` | None |
| PUB-03 | POST | `/v1/public/scan/{qrUuid}/alert` | None |
| PUB-04 | POST | `/v1/public/scan/{qrUuid}/report` | None |

**Calls, notifications and devices**

| ID | Method | Path | Auth |
|---|---|---|---|
| CAL-01 | GET | `/v1/calls` | Bearer |
| CAL-02 | GET | `/v1/calls/{id}` | Bearer |
| CAL-03 | POST | `/v1/webhooks/telephony` | HMAC |
| NOT-01 | GET | `/v1/notifications` | Bearer |
| NOT-02 | PATCH | `/v1/notifications/{id}/read` | Bearer |
| NOT-03 | POST | `/v1/notifications/read-all` | Bearer |
| NOT-04 | GET | `/v1/notifications/unread-count` | Bearer |
| DEV-01 | POST | `/v1/devices` | Bearer |
| DEV-02 | DELETE | `/v1/devices/{id}` | Bearer |

**Catalogue, wishlist and cart**

| ID | Method | Path | Auth |
|---|---|---|---|
| SHP-01 | GET | `/v1/products` | Optional |
| SHP-02 | GET | `/v1/products/{id}` | Optional |
| WSH-01 | PUT | `/v1/wishlist/{productId}` | Bearer |
| WSH-02 | DELETE | `/v1/wishlist/{productId}` | Bearer |
| CRT-01 | GET | `/v1/cart` | Bearer |
| CRT-02 | PUT | `/v1/cart/items/{productId}` | Bearer |
| CRT-03 | DELETE | `/v1/cart/items/{productId}` | Bearer |
| CRT-04 | DELETE | `/v1/cart` | Bearer |

**Checkout and payments**

| ID | Method | Path | Auth |
|---|---|---|---|
| CHK-01 | GET | `/v1/checkout/summary` | Bearer |
| CHK-02 | POST | `/v1/coupons/validate` | Bearer |
| CHK-03 | POST | `/v1/orders` | Bearer + Idempotency-Key |
| CHK-04 | POST | `/v1/payments/confirm` | Bearer |
| CHK-05 | POST | `/v1/webhooks/payment` | HMAC |

**Orders and tracking**

| ID | Method | Path | Auth |
|---|---|---|---|
| ORD-01 | GET | `/v1/orders` | Bearer |
| ORD-02 | GET | `/v1/orders/{id}` | Bearer |
| ORD-03 | GET | `/v1/tracking` | Bearer |
| ORD-04 | POST | `/v1/webhooks/courier` | HMAC |

**Rewards, referral and payouts**

| ID | Method | Path | Auth |
|---|---|---|---|
| RWD-01 | GET | `/v1/rewards` | Bearer |
| RWD-02 | POST | `/v1/rewards/{id}/scratch` | Bearer + Idempotency-Key |
| RWD-03 | GET | `/v1/rewards/summary` | Bearer |
| REF-01 | GET | `/v1/referral/summary` | Bearer |
| REF-02 | GET | `/v1/referral/direct` | Bearer |
| REF-03 | GET | `/v1/referral/performance` | Bearer |
| REF-04 | GET | `/v1/referral/team/summary` | Bearer |
| REF-05 | GET | `/v1/referral/team/tree` | Bearer |
| PAY-01 | GET | `/v1/payouts` | Bearer |
| PAY-02 | GET | `/v1/payouts/summary` | Bearer |
| PAY-03 | GET | `/v1/payouts/by-team` | Bearer |

**Bank, KYC and wallet**

| ID | Method | Path | Auth |
|---|---|---|---|
| BNK-01 | GET | `/v1/me/bank-account` | Bearer |
| BNK-02 | PUT | `/v1/me/bank-account` | Bearer + recent re-authentication |
| BNK-03 | GET | `/v1/lookup/ifsc/{code}` | Bearer |
| KYC-01 | POST | `/v1/me/kyc` | Bearer |
| WAL-01 | GET | `/v1/wallet` | Bearer |
| WAL-02 | POST | `/v1/withdrawals` | Bearer + Idempotency-Key + recent re-authentication |
| WAL-03 | GET | `/v1/withdrawals` | Bearer |
| WAL-04 | GET | `/v1/withdrawals/{id}` | Bearer |
| WAL-05 | POST | `/v1/webhooks/payout` | HMAC |

**FASTag**

| ID | Method | Path | Auth |
|---|---|---|---|
| FST-01 | GET | `/v1/fastag/issuers` | Bearer |
| FST-02 | GET | `/v1/fastag/lookup` | Bearer |
| FST-03 | GET | `/v1/fastag/vehicles/{vehicle}/transactions` | Bearer |
| FST-04 | POST | `/v1/fastag/recharge` | Bearer + Idempotency-Key |
| FST-05 | GET | `/v1/fastag/recharge/{id}` | Bearer |
| FST-06 | POST | `/v1/webhooks/fastag` | HMAC |

**Documents**

| ID | Method | Path | Auth |
|---|---|---|---|
| DOC-01 | GET | `/v1/documents` | Bearer |
| DOC-02 | POST | `/v1/documents` | Bearer |
| DOC-03 | GET | `/v1/documents/{id}/download-url` | Bearer |
| DOC-04 | POST | `/v1/documents/export` | Bearer |

**Content, support, config and lookups**

| ID | Method | Path | Auth |
|---|---|---|---|
| CNT-01 | GET | `/v1/content/{slug}` | None |
| SUP-01 | GET | `/v1/support/faqs` | None |
| SUP-02 | GET | `/v1/support/contact` | None |
| SUP-03 | POST | `/v1/support/tickets` | Bearer |
| CFG-01 | GET | `/v1/config` | None |
| LKP-01 | GET | `/v1/lookup/pincode/{pin}` | Bearer |

**Extra (not in the PDF table, needed for the flows to work)**

| Method | Path | Why |
|---|---|---|
| GET | `/health` | load balancer / uptime check |
| POST | `/v1/calls/{id}/block` | owner blocks an abusive caller (PDF §4.5.6 backend rule) |
| GET | `/v1/documents/export/{jobId}` | poll the DOC-04 export job |
| GET | `/v1/files/{token}` | serves files behind the signed links from DOC-03 / DOC-04 |
| GET / PATCH | `/v1/admin/documents[/{id}]` | admin approves / rejects documents (ADMIN role) |
| PATCH | `/v1/admin/payouts/{id}` | admin credits or reverses a referral payout (ADMIN role) |
| POST/GET | `/v1/dev/*` | **development only** simulators (see §7); not mounted when `NODE_ENV=production` |

## 6. Main flows

**Sign-up:** AUTH-01 → SMS OTP → AUTH-02 returns tokens. (In development `verification.devCode` holds the OTP.)

**Buying labels:** CRT-02 → CHK-01 (server totals) → CHK-03 (stock reserved, gateway order) → app opens gateway → CHK-04 (signature check, status `VERIFYING`) → gateway webhook CHK-05 `payment.captured` → order `PAID`: QR labels generated, cart cleared, points earned, shipment created, referral payouts created → courier webhook ORD-04 `SHIPPED`/`DELIVERED` → labels become activatable.

**Protecting a vehicle:** VEH-02 → scan label → QR-01 says `UNACTIVATED` → QR-02 binds it (first time: activation scratch card).

**Bystander contact:** scan → public page PUB-01 (masked plate only) → PUB-02 masked call (telephony bridge; caller number never stored, only a one-way hash) or PUB-03 alert (push + SMS to owner) → telephony webhook CAL-03 → owner sees it in CAL-01.

**Money:** every balance change goes through `services/ledger.service.js` (atomic guarded `$inc` + append-only `LedgerEntry`, idempotent per reference). Withdrawal: WAL-02 holds the amount → payout webhook WAL-05 settles it or releases it back. One definition is used on every screen: *earned* = pending + credited, *credited* = in the wallet, *pending* = not yet in the wallet (fixes PDF §3.6).

## 7. Third-party providers

The PDF does not name the providers, so every integration is an adapter in `src/services/providers/` with a working
**mock** driver (default). The whole system runs end to end offline. To go live, implement the marked `TODO` branch and
set the `*_PROVIDER` variable:

| Adapter | Real provider examples | Notes |
|---|---|---|
| payment.provider.js | Razorpay / Cashfree | signature scheme is already Razorpay-compatible |
| payout.provider.js | RazorpayX / Cashfree Payouts | penny-drop + payouts; result via WAL-05 |
| telephony.provider.js | Exotel / Knowlarity | masked bridge; events via CAL-03 |
| fastag.provider.js | licensed NETC aggregator | mock stores balances in Mongo |
| misc.provider.js | courier (Shiprocket / Blue Dart), CAPTCHA (Turnstile / hCaptcha — already implemented), Google sign-in (already implemented via tokeninfo) |
| messaging.provider.js | MSG91 / Twilio SMS, SES / SendGrid, Firebase FCM |

Development simulators (only when `NODE_ENV` is not production):

| Call | Does |
|---|---|
| `POST /v1/dev/payments/simulate { gatewayOrderId }` | returns the gateway's paymentId + signature (for CHK-04) and fires the captured webhook |
| `POST /v1/dev/shipments/advance { orderId, status }` | courier event (`SHIPPED`, `DELIVERED`, ...) |
| `POST /v1/dev/calls/complete { contactId, outcome }` | telephony result (`ANSWERED` / `MISSED`) |
| `POST /v1/dev/payouts/settle { withdrawalId, outcome }` | payout success / failure |
| `POST /v1/dev/fastag/settle { rechargeId }` | FASTag credit |
| `POST /v1/dev/webhooks/sign { provider, body }` | gives you `X-Timestamp` / `X-Signature` to call a webhook from Postman |
| `GET /v1/dev/outbox` | SMS, e-mails, pushes, calls the mock providers "sent" |

## 8. Postman

Import `api-docs/V-Tracker.postman_collection.json` (and the environment file). Run **AUTH-03 Login** with the demo
account (or AUTH-01 → AUTH-02): the access token, refresh token and ids (address, vehicle, product, order, QR label,
reward) are saved into collection variables automatically, so the other requests work without copy-pasting.

## 9. Security fixes relative to the app (PDF §0)

* TLS: the server never disables certificate checks; remove `MyHttpOverrides` from the Flutter `main.dart` before calling this API.
* No owner identity, phone, insurance or PUC is ever returned by VEH-05 or the public scan endpoints (gap G3).
* Scratch-card amounts are decided on the server at scratch time (gap G5).
* Bank account numbers, UPI IDs, PAN, document numbers and document files are encrypted at rest (AES-256-GCM); only last-4 / masks are returned.
* Passwords: bcrypt, minimum 8 characters with a letter and a digit; 5 failed logins lock the account for 15 minutes.
* Rate limits per class (auth, OTP, public page, public actions, contacts, lookups, money) plus per-caller-per-vehicle contact limits and caller blocking.
* NoSQL operator keys (`$gt`, `a.b`) are stripped from bodies; every input is validated with Joi.

## 10. Decisions that need the business / legal team

These are flagged in `src/config/business.js` as **PLACEHOLDER** and are easy to change in one place:

1. **Referral payouts (15 levels)** — PDF §0 item 8 asks for legal review. The engine is built but **disabled by default** (`REFERRAL_PAYOUTS_ENABLED=false` in `.env.example`; the development `.env` turns it on so the demo shows data). Bonus amounts per level are placeholders. "Total Deposit / EMI paid months" from the team tree were **not** implemented because nothing in the source defines them.
2. ₹5,999 package — sold as "Complete Protection Package" (5 universal labels), not as an income plan.
3. Points earning rule (1 point per ₹10), withdrawal maximum (₹50,000), FASTag recharge maximum (₹10,000), scratch-card ranges, bank-change cooldown (24 h).
4. GST is charged at 18% on top of the listed price (the Shop screen says "Excl. 18% GST"; the Checkout screen's 12% was inconsistent).
5. KYC and bank verification auto-approve in mock mode (`KYC_AUTO_VERIFY`, `BANK_AUTO_VERIFY`); with real providers set them to `false`.

## 11. Production checklist

* `NODE_ENV=production` (dev routes, dev OTP echo and Google mock are switched off automatically; missing secrets stop the server).
* Strong values for every secret in `.env.example`; `TRUST_PROXY=1` behind Nginx / a load balancer; `CORS_ORIGINS` for the public scan web page.
* Implement the real provider adapters; register webhook URLs `https://<api>/v1/webhooks/{payment|courier|payout|fastag|telephony}` with the same secrets.
* Run one instance per CPU behind a load balancer; for more than one instance move rate-limit counters to Redis (express-rate-limit store).
* Back up MongoDB and the `uploads/` folder (or swap the file storage in `document.service.js` / `user.service.js` for S3).
