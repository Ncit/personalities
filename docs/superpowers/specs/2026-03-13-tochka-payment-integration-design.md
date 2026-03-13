# Tochka Payment Integration Design

## Overview

Replace VK native payments (VKWebAppShowOrderBox) with Tochka Bank internet acquiring for premium purchases in the PersonaDev personality quiz app. Price: 150 RUB (intentional price change from previous 280 RUB). Users identified by VK ID.

## Amount Format

Tochka API accepts amounts in **rubles** (not kopeks). So 150 RUB = `"amount": "150"`. This was verified from the PDF documentation example where 10 RUB is sent as `"amount": "10"`.

## Architecture

```
Frontend (VK Mini App)          goodsv2 Server              Tochka API
─────────────────────          ──────────────              ──────────

1. User clicks "Buy Premium"
   POST /api/tochka/create-payment ──►
   {vk_user_id, app_id}           Checks for existing pending
                                   payment (dedup, reuse if <30min)
                                   Creates pending record
                                   in tochka_payments
                                   POST /acquiring/v1.0/payments ──►
                                   {data: {customerCode, amount:"150",
                                    purpose, paymentMode:["sbp","card"]},
                                    redirectUrl}
                                   ◄── {paymentLink, operationId}
   ◄── {paymentLink, operationId}

2. Frontend saves operationId to localStorage
   Then redirects to paymentLink
   User pays on Tochka page ─────────────────────────────►

3. Tochka redirects to redirectUrl
   https://nikmobdev.ru/personadev/?payment=success

4. Frontend reads operationId from localStorage
   POST /api/tochka/confirm-payment ──►
   {operationId}
                                   Looks up tochka_payments by operationId
                                   Uses stored vk_user_id, app_id (NOT from request)
                                   GET /acquiring/v1.0/payments/{operationId} ──►
                                   ◄── {status: "APPROVED"}
                                   Saves purchase in purchases table
                                   (vk_order_id: "tochka_{operationId}",
                                    status: "chargeable",
                                    notification_type: "tochka_payment",
                                    payment_source: "tochka")
   ◄── {success: true}

5. Frontend sets premium status
   Clears localStorage operationId
   Cleans query params from URL
```

## Backend Changes (goodsv2)

### New file: `services/tochka.js`

Tochka API client class with methods:

- `createPayment(customerCode, amount, purpose, paymentMode, redirectUrl)` — calls `POST {BASE_URL}/acquiring/v1.0/payments` with Bearer JWT auth. Request body format: `{data: {customerCode, amount, purpose, paymentMode}, redirectUrl}`. Returns `{paymentLink, operationId}`.
- `checkPaymentStatus(operationId)` — calls `GET {BASE_URL}/acquiring/v1.0/payments/{operationId}`. Returns payment data including `status`.
- `refundPayment(operationId, amount)` — calls `POST {BASE_URL}/acquiring/v1.0/payments/{operationId}/refund`. Request body: `{data: {amount}}`. Returns `{isRefunded}`.

Config from environment:
- `TOCHKA_API_KEY` — JWT Bearer token
- `TOCHKA_CUSTOMER_CODE` — 9-digit customer code starting with 3 (from Tochka dashboard)
- `TOCHKA_API_BASE_URL` — `https://enter.tochka.com/api/v2`

### New endpoints in `server.js`

**`POST /api/tochka/create-payment`** (and `/goodsshop/api/tochka/create-payment`)
- Input: `{vk_user_id, app_id}`
- Validates vk_user_id and app_id are present
- Dedup: if a `pending` payment exists for this vk_user_id created within last 30 minutes, return existing paymentLink instead of creating new one
- Creates payment via Tochka API:
  - `customerCode`: from `TOCHKA_CUSTOMER_CODE` env var
  - `amount`: `"150"`
  - `purpose`: "Premium PersonaDev"
  - `paymentMode`: ["sbp", "card"]
  - `redirectUrl`: `https://nikmobdev.ru/personadev/?payment=success`
- Stores pending payment in `tochka_payments` table (with vk_user_id, app_id)
- Returns: `{success: true, paymentLink, operationId}`

**`POST /api/tochka/confirm-payment`** (and `/goodsshop/api/tochka/confirm-payment`)
- Input: `{operationId}`
- Validates operationId exists in `tochka_payments` table
- **Uses stored vk_user_id and app_id from the tochka_payments record** (NOT from request body — prevents user spoofing)
- Checks Tochka API for payment status
- If status === "APPROVED":
  - Creates purchase in `purchases` table:
    - `vk_order_id`: `"tochka_{operationId}"`
    - `notification_type`: `"tochka_payment"`
    - `status`: `"chargeable"` (matches existing check-purchase filter)
    - `payment_source`: `"tochka"`
    - `tochka_operation_id`: the operationId
    - `price`: 150
    - `item_id`: `"mbti_premium"`
    - `vk_user_id`, `app_id`: from tochka_payments record
  - Updates `tochka_payments` status to "approved"
  - Returns `{success: true, has_purchase: true}`
- If status !== "APPROVED":
  - Returns `{success: false, status: <current_status>}`
- Idempotent: if purchase already exists for this operationId, returns success without creating duplicate

**`POST /goodsshop/admin/api/tochka/refund`** (requires admin auth)
- Input: `{operationId, amount}`
- Calls Tochka refund API
- Updates purchase status to "refund" in purchases table
- Updates tochka_payments status to "refunded"
- Returns `{success: true, isRefunded: true}`

### Database changes

**Add columns to `purchases` table** (via ALTER TABLE, same pattern as existing migrations):
- `payment_source TEXT DEFAULT 'vk'` — either 'vk' or 'tochka'
- `tochka_operation_id TEXT` — Tochka's operation ID (nullable)

**New table `tochka_payments`:**
```sql
CREATE TABLE IF NOT EXISTS tochka_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation_id TEXT NOT NULL UNIQUE,
  vk_user_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  item_id TEXT NOT NULL DEFAULT 'mbti_premium',
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Indexes:**
- `idx_tochka_payments_user` on (vk_user_id)
- `idx_tochka_payments_status` on (status)

Status values: `pending`, `approved`, `declined`, `refunded`

**`/api/check-purchase` — no changes needed.** Tochka purchases use `status: 'chargeable'` in the purchases table, matching the existing filter at server.js:579.

### Pending payment recovery

Add a function `checkPendingTochkaPayments()` that:
- Runs every 5 minutes via `setInterval`
- Queries `tochka_payments` where `status = 'pending'` and `created_at > now - 1 hour`
- For each, checks Tochka API for payment status
- If APPROVED: creates purchase record (same as confirm-payment logic)
- If expired/declined: updates status accordingly
- This catches payments where the user paid but never returned to the app

## Frontend Changes (personalities)

### `src/modules/vk/services/VKPaymentService.js`

Replace `showOrderBox()` method:
- Instead of `VKWebAppShowOrderBox`, call `POST /goodsshop/api/tochka/create-payment` with `{vk_user_id, app_id}`
- Save returned `operationId` to `localStorage` key `tochka_pending_operation`
- Redirect to `paymentLink` via `window.location.href`

### `src/modules/ui/components/PremiumModal.js`

- Update price display to 150 RUB

### New: Payment return handler

On app initialization (in `script.js` or router):
- Check URL for `?payment=success` query param
- If present:
  - Read `operationId` from `localStorage` key `tochka_pending_operation`
  - If no operationId in localStorage, show error and clean URL
  - Call `POST /goodsshop/api/tochka/confirm-payment` with `{operationId}`
  - If confirmed: set premium via `setPremium(true)`, show success toast, clear localStorage key
  - If not yet approved: retry 3 times with 3s delay, then show "Payment is being processed, it may take a few minutes. Your premium will activate automatically."
  - Clean query params from URL after handling

## Error Handling

| Scenario | Handling |
|----------|----------|
| Tochka API down on create | Toast: "Payment temporarily unavailable" |
| Payment not yet APPROVED on confirm | Retry 3x at 3s intervals, then show "processing" message |
| Double confirm attempt | Idempotent — returns success if already confirmed |
| Random operationId in confirm | Rejected — must exist in tochka_payments table |
| User doesn't return after paying | Server-side polling recovers within 5 minutes |
| Double-click "Buy Premium" | Dedup — reuses existing pending payment if <30min old |
| User spoofing on confirm | Server uses stored vk_user_id, ignores request body |

## Security

- JWT key stored server-side only in .env, never exposed to frontend
- All Tochka API calls happen server-side
- `confirm-payment` validates operationId against tochka_payments table
- `confirm-payment` uses stored user identity, not client-provided (prevents spoofing)
- CORS already configured on goodsv2 for the frontend domain
- Admin refund endpoint requires session auth

## Admin Panel

- Tochka purchases appear in existing purchases list (with `payment_source: tochka`)
- Admin refund endpoint: `POST /goodsshop/admin/api/tochka/refund`
- No admin panel UI changes needed initially — purchases table already displayed

## Environment Variables

Existing in `.env` (need to add `TOCHKA_CUSTOMER_CODE` from Tochka dashboard):
```
TOCHKA_API_KEY=<jwt_token>
TOCHKA_CUSTOMER_CODE=<9_digit_code_starting_with_3>
TOCHKA_API_BASE_URL=https://enter.tochka.com/api/v2
```

## Files to Create/Modify

### goodsv2 (backend)
- **Create:** `services/tochka.js` — Tochka API client
- **Modify:** `server.js` — add 3 new endpoints, import tochka service, add pending payment polling
- **Modify:** `database.js` — add tochka_payments table, add columns to purchases, add index

### personalities (frontend)
- **Modify:** `src/modules/vk/services/VKPaymentService.js` — replace VK payment with Tochka flow
- **Modify:** `src/modules/ui/components/PremiumModal.js` — update price to 150 RUB
- **Modify:** `script.js` — add payment return handler
