# Telegram Mini App Flavor — Design Spec

**Date:** 2026-03-13
**Status:** Approved
**Approach:** C — Dedicated `src/modules/tg/` + thin shared PlatformDetector

---

## Overview

Add a Telegram Mini App flavor to the personalities web app alongside the existing VK flavor. Both flavors share the same build artifact and are distinguished at runtime. The Telegram flavor integrates with the Telegram Mini Apps SDK for auth, payments, sharing, and UI.

## Decisions

| Topic | Decision |
|-------|----------|
| Detection | Auto-detect `window.Telegram?.WebApp?.initData` (non-empty) + `?flavor=tg` for dev/testing |
| Payments (RU) | User choice: Telegram Stars or Tochka (rubles) |
| Payments (EN) | Telegram Stars only |
| Auth | Silent — read `initDataUnsafe.user`, no HMAC validation (see security note in Section 3) |
| Sharing | `switchInlineQuery` with fallback to `openTelegramLink` |
| UI | Telegram theme colors, MainButton/BackButton, full height, safe areas, haptics |
| Premium sync | Cross-platform via `goodsv2` backend (shared `users` table with `tg_id`) |
| Bot | New bot to be created via @BotFather |
| Language | Auto-detect from `language_code`, fallback to `ru` |

---

## 1. Platform Detection & Flavor Routing

**New file:** `src/modules/platform/PlatformDetector.js`

```js
// Returns 'vk' | 'tg' | 'web'
PlatformDetector.getFlavor()

// Returns the active manager (VKBridgeManager or TGBridgeManager or null)
PlatformDetector.getManager()
```

**Detection priority:**
1. `window.Telegram?.WebApp?.initData?.length > 0` → `'tg'` (production — initData is non-empty inside Telegram)
2. URL param `?flavor=tg` → `'tg'` (dev/testing override)
3. URL param `?flavor=vk` → `'vk'`
4. VK Bridge environment detected → `'vk'`
5. Default → `'web'`

**Integration points that change:**
- `script.js` — replace all `urlParams.get('flavor') === 'vk'` checks with `PlatformDetector.getFlavor()`. Key functions requiring changes:
  - `DOMContentLoaded` initialization block — conditionally init TGBridgeManager or VKBridgeManager
  - `handleTochkaPaymentReturn` — add Telegram payment return handling
  - `updatePricing` — platform-aware pricing display
  - `handlePremiumPurchase` (around line 1862) — route to TG or VK payment
  - Share logic — platform-aware share text and links
  - Ad timer logic — disable VK ads in Telegram flavor
- `App.js` — same, plus set `appEl.dataset.flavor = 'tg'` for Telegram
- `PremiumModal.js` — use `PlatformDetector.getManager()` instead of checking `window.vkBridgeManager` (see Section 4 for details)
- `HomeScreen.js` — platform-aware share text (replace hardcoded `vk.com/app53942833` with `t.me/botusername`)
- `handleUserInfo` in `script.js` — set `user_type` based on platform (`'tg_user'` / `'vk_user'`)

**VKBridgeManager auto-instantiation fix:**
The last line of `VKBridgeManager.js` unconditionally creates `window.vkBridgeManager = new VKBridgeManager()`. This must be gated behind platform detection so it does not run in Telegram flavor:
```js
// VKBridgeManager.js — change bottom of file
if (PlatformDetector.getFlavor() !== 'tg') {
    window.vkBridgeManager = new VKBridgeManager();
}
```

Existing `window.vkBridgeManager` global stays for backward compatibility when in VK/web. Telegram gets `window.tgBridgeManager`.

---

## 2. Telegram Module Structure

```
src/modules/tg/
├── TGBridgeManager.js          # Main orchestrator, exposed as window.tgBridgeManager
├── config/
│   └── TGConfig.js             # Telegram-specific configuration
├── services/
│   ├── TGUserService.js        # User info from initDataUnsafe
│   ├── TGPaymentService.js     # Telegram Stars + Tochka choice
│   └── TGAnalyticsService.js   # Firebase events with tg_ prefix
├── utils/
│   └── TGErrorHandler.js       # Telegram-specific error handling
└── tg-styles.css               # Telegram theme & safe area styles
```

**TGBridgeManager.js** public API:
- `init()` — `Telegram.WebApp.ready()`, expand, set theme, register BackButton
- `isTGEnvironment()` → `true`
- `getUserInfo()` — returns user from `initDataUnsafe.user`
- `getUserId()` — returns `initDataUnsafe.user.id` as string
- `shareResults(type, text)` — calls `switchInlineQuery`
- `showOrderBox(productId)` — opens payment choice modal (Stars vs Tochka for RU, Stars only for EN)
- `checkPremiumStatus()` — calls backend `/api/check-purchase` with `user_id` (tg user id), `app_id`, `item_id`

**TGConfig.js:**
- Bot username (configurable)
- `APP_ID` — Telegram app identifier (e.g., `'tg_personalities'`)
- Payment config: Stars price + Tochka price
- Backend endpoints (same `goodsv2` base URL)
- Timeout/retry settings

---

## 3. Authentication & User Identity

**Silent auth flow on `TGBridgeManager.init()`:**
1. Read `Telegram.WebApp.initDataUnsafe.user` — `id`, `first_name`, `last_name`, `username`, `photo_url`, `language_code`
2. Store in `TGUserService.userInfo` (in-memory)
3. Call `window.handleUserInfo()` with mapped fields for app compatibility, including `user_type: 'tg_user'`
4. Set locale via `LocalizationManager` based on `language_code` (fallback `ru`)

**Security note on skipping HMAC validation:**
No HMAC validation of `initData`. This is acceptable for the initial launch because:
- Telegram Stars payments are verified server-side via the bot webhook (`successful_payment`), so a forged `tg_user_id` in `create-invoice` only generates an invoice link — actual premium activation only happens when Telegram confirms payment to our webhook.
- Tochka payments are verified server-side via Tochka callback.
- `checkPremiumStatus` is read-only — knowing someone else's `tg_user_id` only reveals whether they have premium, which is low-risk.
- Future improvement: add HMAC validation for defense-in-depth.

**User identity in backend:**

The current `users` table has `vk_user_id TEXT NOT NULL` with `UNIQUE(vk_user_id, app_id)`. To support Telegram users:

1. Make `vk_user_id` nullable: `ALTER TABLE users ALTER COLUMN vk_user_id DROP NOT NULL` (SQLite: recreate table)
2. Add `tg_id TEXT` column (nullable, indexed)
3. Replace `UNIQUE(vk_user_id, app_id)` with two partial unique indexes:
   - `UNIQUE(vk_user_id, app_id) WHERE vk_user_id IS NOT NULL`
   - `UNIQUE(tg_id, app_id) WHERE tg_id IS NOT NULL`
4. Update all DB methods that use `vk_user_id` as key:
   - `createOrUpdateUser` — accept either `vk_user_id` or `tg_id`
   - `getUser` — look up by either ID
   - `saveCompleteUserProfile` — handle Telegram user fields
   - `getPurchasesByUser` — resolve by either ID type

**API call pattern:**
- VK calls: `/api/check-purchase?user_id=123&app_id=53942833&item_id=mbti_premium` (existing)
- Telegram calls: `/api/check-purchase?user_id=tg_456&app_id=tg_personalities&item_id=mbti_premium`

The `user_id` parameter uses a `tg_` prefix to distinguish Telegram users from VK users. Backend resolves accordingly.

---

## 4. Payments

### Payment flow

1. User taps "Get Premium" → `PremiumModal` opens
2. Telegram flavor shows payment options based on locale:
   - **Russian (`ru`):** Two buttons — "Telegram Stars (⭐ X)" and "Card (280 ₽)"
   - **English (`en`):** One button — "Telegram Stars (⭐ X)"
3. User picks one:

### Path A — Telegram Stars

1. Frontend calls `POST /api/tg/create-invoice` with `tg_user_id`, `product_id`
2. Backend creates invoice via Telegram Bot API `createInvoiceLink()`
3. Frontend calls `Telegram.WebApp.openInvoice(invoiceURL, callback)`
4. On `paid` status → backend verifies via bot webhook → marks premium
5. Frontend calls `checkPremiumStatus()` to confirm

### Path B — Tochka (Russian locale only)

1. Same flow as existing web flavor — `POST /api/tochka/create-payment`
2. Request body uses `tg_user_id` instead of `vk_user_id`
3. Opens payment link via `Telegram.WebApp.openLink()` (external browser)
4. User returns → `checkPremiumStatus()` polls backend

### PremiumModal.js refactoring

The current `PremiumModal` is VK-specific. Changes needed:
1. Replace the 5-source VK user ID resolution with `PlatformDetector.getManager().getUserId()`
2. Conditionally render button sets: Stars + Tochka (RU) vs Stars-only (EN) vs VK OrderBox vs Tochka-only (web)
3. Pass `tg_user_id` or `vk_user_id` to backend based on platform
4. Update hardcoded price display ("150 rub") to platform-aware pricing

### HomeScreen.js price display

The hardcoded "150 rub" in the premium CTA button (line 77) must use platform-aware pricing from the active manager's config.

---

## 5. Sharing

1. User finishes quiz → taps "Share"
2. `TGBridgeManager.shareResults()` calls `Telegram.WebApp.switchInlineQuery(text, ['users', 'groups', 'channels'])`
3. Bot handles `inline_query` → responds with `InlineQueryResultArticle` containing personality result card with "Open Mini App" button

**Share text generation** in `HomeScreen.js` (line 149) and `script.js` (around line 1181) currently hardcodes the VK app link (`https://vk.com/app53942833`). These must be platform-aware:
- VK: `https://vk.com/app53942833` (existing)
- Telegram: `https://t.me/{bot_username}` (from TGConfig)

**Bot requirements:**
- Inline mode enabled via @BotFather (`/setinline`)
- Bot backend handles `inline_query` events

**Inline query response format:**
```js
answerInlineQuery(queryId, [{
  type: 'article',
  id: uniqueId,
  title: 'My MBTI type: INTJ',
  description: 'Personality quiz result',
  input_message_content: {
    message_text: 'I got INTJ! Take the quiz: https://t.me/{bot_username}',
  },
  reply_markup: {
    inline_keyboard: [[{
      text: 'Take the Quiz',
      url: 'https://t.me/{bot_username}'
    }]]
  }
}])
```

**Fallback:** If `switchInlineQuery` unavailable → `Telegram.WebApp.openTelegramLink()` with `t.me/share/url?...`

---

## 6. UI Adaptations

### Theme

- Read `Telegram.WebApp.themeParams` (`bg_color`, `text_color`, `hint_color`, `button_color`, `button_text_color`, `secondary_bg_color`)
- Map to CSS custom properties: `--tg-bg`, `--tg-text`, `--tg-button`, etc.
- Apply via `document.documentElement.style.setProperty()`
- Listen to `themeChanged` event for dynamic updates

### Navigation

- `BackButton.show()` / `.hide()` — shown when deeper than home, wired to router back
- `MainButton` — primary CTA per screen ("Start Quiz", "Next Question", "See Results")

### Full height & safe areas

- `Telegram.WebApp.expand()` on init
- CSS safe area insets:
```css
[data-flavor="tg"] {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```
- Listen to `viewportChanged` event (keyboard open/close)

### Other

- Sidebar hidden (same as VK) via `[data-flavor="tg"]` CSS
- Haptic feedback: `HapticFeedback.impactOccurred('light')` on answer selection, `notificationOccurred('success')` on quiz completion

---

## 7. Telegram Bot

**Setup via @BotFather:**
- Create bot
- Configure Mini App URL: `https://nikmobdev.ru/personadev/?flavor=tg`
- Enable inline mode (`/setinline`)
- Set menu button to open Mini App
- Telegram Stars payments — built-in, no external provider needed

**Webhook handler processes:**

| Event | Action |
|-------|--------|
| `pre_checkout_query` | Answer `ok: true` (required by Telegram) |
| `successful_payment` | Mark user premium in DB, store `tg_id` |
| `inline_query` | Return formatted `InlineQueryResultArticle` with quiz result |

---

## 8. Backend Changes (`goodsv2`)

### Database

**`users` table migration:**
1. Make `vk_user_id` nullable (SQLite requires table recreation)
2. Add `tg_id TEXT` column (nullable)
3. Add index: `CREATE INDEX idx_users_tg_app ON users(tg_id, app_id)`
4. Unique constraints: partial indexes on `(vk_user_id, app_id)` and `(tg_id, app_id)`

**`purchases` table:**
- Reuse `vk_user_id` column for Telegram users (store `tg_{tg_user_id}` with prefix) to avoid table recreation
- Add `payment_source` value: `'telegram_stars'` (existing column, alongside `'vk'` and `'tochka'`)

**`tochka_payments` table:**
- Reuse `vk_user_id` column for Telegram users (store `tg_{tg_user_id}` with prefix)

**DB methods to update:**
- `createOrUpdateUser(userData)` — accept `tg_id` or `vk_user_id`
- `getUser(userId, appId)` — resolve by either ID type
- `saveCompleteUserProfile(profileData)` — handle Telegram user fields
- `getPurchasesByUser(userId, appId)` — resolve by either ID type

### New files

```
services/telegram.js    # Telegram Bot API client (createInvoiceLink, answerInlineQuery, answerPreCheckoutQuery)
routes/telegram.js      # Express routes: /api/tg/webhook, /api/tg/create-invoice
```

### Existing changes

- `server.js` — mount `routes/telegram.js`
- `database.js` — migration for schema changes, updated query methods
- `/api/check-purchase` — extend to resolve user by `tg_` prefixed user_id

### Environment variables

- `TELEGRAM_BOT_TOKEN` — bot token from @BotFather
- `TELEGRAM_WEBHOOK_SECRET` — optional secret for webhook verification

### CORS

No changes expected — Mini App runs on `nikmobdev.ru` (already allowed).

---

## 9. HTML Changes

**`index.html`** — add Telegram WebApp SDK:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

This is loaded alongside the existing VK Bridge SDK. Both are lightweight and dormant when not in their respective environments.

---

## Files Changed (Frontend)

| File | Change |
|------|--------|
| `src/modules/platform/PlatformDetector.js` | **New** — flavor detection & manager routing |
| `src/modules/tg/TGBridgeManager.js` | **New** — Telegram orchestrator |
| `src/modules/tg/config/TGConfig.js` | **New** — Telegram config |
| `src/modules/tg/services/TGUserService.js` | **New** — user service |
| `src/modules/tg/services/TGPaymentService.js` | **New** — payment service |
| `src/modules/tg/services/TGAnalyticsService.js` | **New** — analytics service |
| `src/modules/tg/utils/TGErrorHandler.js` | **New** — error handler |
| `src/modules/tg/tg-styles.css` | **New** — Telegram styles |
| `index.html` | Add Telegram WebApp SDK script tag |
| `script.js` | Use `PlatformDetector` in ~30 places, init TGBridgeManager, platform-aware pricing/sharing/ads/auth |
| `src/modules/ui/App.js` | Use `PlatformDetector`, set `data-flavor="tg"` |
| `src/modules/ui/components/PremiumModal.js` | Refactor: platform-aware user ID, payment buttons, pricing |
| `src/modules/ui/screens/HomeScreen.js` | Platform-aware sharing text, price display |
| `src/modules/vk/VKBridgeManager.js` | Gate auto-instantiation behind PlatformDetector |

## Files Changed (Backend — `goodsv2`)

| File | Change |
|------|--------|
| `services/telegram.js` | **New** — Telegram Bot API client |
| `routes/telegram.js` | **New** — webhook + invoice routes |
| `server.js` | Mount telegram routes |
| `database.js` | Schema migration (users nullable vk_user_id, tg_id column), updated query methods |
