# Tochka Payment Integration Design

## Overview

Replace VK native payments (VKWebAppShowOrderBox) with Tochka Bank internet acquiring for premium purchases in the PersonaDev personality quiz app. Price: 150 RUB. Users identified by VK ID.

## Architecture

```
Frontend (VK Mini App)          goodsv2 Server              Tochka API
─────────────────────          ──────────────              ──────────

1. User clicks "Buy Premium"
   POST /api/tochka/create-payment ──►
   {vk_user_id, app_id}           Creates pending record
                                   in tochka_payments
                                   POST /acquiring/v1.0/payments ──►
                                   {customerCode, amount:150,
                                    purpose, paymentMode,
                                    redirectUrl}
                                   ◄── {paymentLink, operationId}
   ◄── {paymentLink}

2. Frontend redirects to paymentLink
   User pays on Tochka page ─────────────────────────────►

3. Tochka redirects to redirectUrl
   ?payment=success&operationId=xxx

4. Frontend detects query params
   POST /api/tochka/confirm-payment ──►
   {operationId, vk_user_id, app_id}
                                   GET /acquiring/v1.0/payments/{operationId} ──►
                                   ◄── {status: "APPROVED"}
                                   Saves purchase in
                                   purchases table
   ◄── {success: true}            (payment_source: tochka)

5. Frontend sets premium status
```

## Backend Changes (goodsv2)

### New file: `services/tochka.js`

Tochka API client class with methods:

- `createPayment(customerCode, amount, purpose, paymentMode, redirectUrl)` — calls `POST {BASE_URL}/acquiring/v1.0/payments` with Bearer JWT auth. Returns `{paymentLink, operationId}`.
- `checkPaymentStatus(operationId)` — calls `GET {BASE_URL}/acquiring/v1.0/payments/{operationId}`. Returns payment data including `status`.
- `refundPayment(operationId, amount)` — calls `POST {BASE_URL}/acquiring/v1.0/payments/{operationId}/refund`. Returns `{isRefunded}`.

Config from environment:
- `TOCHKA_API_KEY` — JWT Bearer token
- `TOCHKA_CUSTOMER_CODE` — 9-digit customer code starting with 3 (from Tochka dashboard)
- `TOCHKA_API_BASE_URL` — `https://enter.tochka.com/api/v2`

### New endpoints in `server.js`

**`POST /api/tochka/create-payment`** (and `/goodsshop/api/tochka/create-payment`)
- Input: `{vk_user_id, app_id}`
- Validates vk_user_id and app_id are present
- Creates payment via Tochka API:
  - `customerCode`: from `TOCHKA_CUSTOMER_CODE` env var
  - `amount`: 150 (hardcoded for now, could be item-based later)
  - `purpose`: "Premium PersonaDev"
  - `paymentMode`: ["sbp", "card"]
  - `redirectUrl`: `https://nikmobdev.ru/personadev/?payment=success`
- Stores pending payment in `tochka_payments` table
- Returns: `{success: true, paymentLink, operationId}`

**`POST /api/tochka/confirm-payment`** (and `/goodsshop/api/tochka/confirm-payment`)
- Input: `{operationId, vk_user_id, app_id}`
- Validates operationId exists in `tochka_payments` table
- Checks Tochka API for payment status
- If status === "APPROVED":
  - Creates purchase record in `purchases` table with `payment_source: 'tochka'`, `tochka_operation_id`
  - Updates `tochka_payments` status to "approved"
  - Returns `{success: true, has_purchase: true}`
- If status !== "APPROVED":
  - Returns `{success: false, status: <current_status>}`
- Idempotent: if purchase already exists for this operationId, returns success without creating duplicate

### Database changes

**Add columns to `purchases` table:**
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

Status values: `pending`, `approved`, `declined`, `refunded`

**`/api/check-purchase` — no changes needed.** Tochka purchases go into the same `purchases` table, so existing check logic works.

## Frontend Changes (personalities)

### `src/modules/vk/services/VKPaymentService.js`

Replace `showOrderBox()` method:
- Instead of `VKWebAppShowOrderBox`, call `POST /goodsshop/api/tochka/create-payment` with `{vk_user_id, app_id}`
- On success, redirect to `paymentLink` via `window.location.href`

### `src/modules/ui/components/PremiumModal.js`

- Update price display to 150 RUB
- Payment button triggers Tochka flow

### New: Payment return handler

On app initialization (in `script.js` or router):
- Check URL for `?payment=success&operationId=xxx` query params
- If present:
  - Call `POST /goodsshop/api/tochka/confirm-payment` with `{operationId, vk_user_id, app_id}`
  - If confirmed: set premium via `setPremium(true)`, show success toast
  - If not yet approved: retry 3 times with 3s delay, then show "processing" message
  - Clean query params from URL after handling

## Error Handling

| Scenario | Handling |
|----------|----------|
| Tochka API down on create | Toast: "Payment temporarily unavailable" |
| Payment not yet APPROVED on confirm | Retry 3x at 3s intervals, then show "processing" message |
| Double confirm attempt | Idempotent — returns success if already confirmed |
| Random operationId in confirm | Rejected — must exist in tochka_payments table |
| User doesn't return after paying | No auto-recovery for now. Could add "restore purchase" later. |

## Security

- JWT key stored server-side only in .env, never exposed to frontend
- All Tochka API calls happen server-side
- `confirm-payment` validates operationId against tochka_payments table
- CORS already configured on goodsv2 for the frontend domain

## Admin Panel

- Tochka purchases appear in existing purchases list (with `payment_source: tochka`)
- Refund button for Tochka purchases calls Tochka refund API via server
- No admin panel UI changes needed initially — purchases table already displayed

## Environment Variables

Existing in `.env` (update `TOCHKA_CUSTOMER_CODE` with actual value from Tochka dashboard):
```
TOCHKA_API_KEY=<jwt_token>
TOCHKA_CUSTOMER_CODE=<9_digit_code_starting_with_3>
TOCHKA_API_BASE_URL=https://enter.tochka.com/api/v2
```

## Files to Create/Modify

### goodsv2 (backend)
- **Create:** `services/tochka.js` — Tochka API client
- **Modify:** `server.js` — add 2 new endpoints + import tochka service
- **Modify:** `database.js` — add tochka_payments table, add columns to purchases

### personalities (frontend)
- **Modify:** `src/modules/vk/services/VKPaymentService.js` — replace VK payment with Tochka flow
- **Modify:** `src/modules/ui/components/PremiumModal.js` — update price to 150 RUB
- **Modify:** `script.js` — add payment return handler
