# Telegram Mini App Flavor — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Telegram Mini App flavor to the personalities web app, with platform detection, Telegram auth, Telegram Stars + Tochka payments, inline sharing, and Telegram-native UI.

**Architecture:** Dedicated `src/modules/tg/` module mirroring the VK module structure, connected via a thin `PlatformDetector`. Existing VK code is not refactored — only gated behind detection. Backend (`goodsv2`) gets new Telegram routes and a `tg_id` column.

**Tech Stack:** Vanilla JS (ES modules), Telegram WebApp SDK, Express/Node.js backend, SQLite, Telegram Bot API.

**Spec:** `docs/superpowers/specs/2026-03-13-telegram-flavor-design.md`

---

## File Structure

### New Files (Frontend — `personalities/`)

| File | Responsibility |
|------|---------------|
| `src/modules/platform/PlatformDetector.js` | Detect flavor (`'vk'`/`'tg'`/`'web'`), return active manager |
| `src/modules/tg/TGBridgeManager.js` | Telegram orchestrator — init SDK, expose public API, manage services |
| `src/modules/tg/config/TGConfig.js` | Telegram-specific config (bot username, app ID, endpoints, prices, timeouts) |
| `src/modules/tg/services/TGUserService.js` | Read user from `initDataUnsafe`, store in memory |
| `src/modules/tg/services/TGPaymentService.js` | Telegram Stars invoice flow + Tochka delegation |
| `src/modules/tg/services/TGAnalyticsService.js` | Firebase events with `tg_` prefix |
| `src/modules/tg/utils/TGErrorHandler.js` | Error handling for Telegram-specific errors |
| `src/modules/tg/tg-styles.css` | Telegram theme variables, safe areas, sidebar hide, MainButton spacing |

### New Files (Backend — `goodsv2/`)

| File | Responsibility |
|------|---------------|
| `services/telegram.js` | Telegram Bot API client (createInvoiceLink, answerInlineQuery, answerPreCheckoutQuery) |
| `routes/telegram.js` | Express routes: `POST /api/tg/webhook`, `POST /api/tg/create-invoice` |

### Modified Files (Frontend)

| File | Change |
|------|--------|
| `index.html` | Add Telegram WebApp SDK `<script>` tag |
| `script.js` | Import PlatformDetector; replace ~30 `vkBridgeManager` / `isVKFlavor` checks; conditionally init TG or VK manager |
| `src/modules/ui/App.js` | Use PlatformDetector for flavor detection and sidebar logic |
| `src/modules/ui/components/PremiumModal.js` | Platform-aware user ID, payment buttons, pricing |
| `src/modules/ui/screens/HomeScreen.js` | Platform-aware share text, price display |
| `src/modules/vk/VKBridgeManager.js` | Gate auto-instantiation (line 977-978) behind PlatformDetector |

### Modified Files (Backend)

| File | Change |
|------|--------|
| `server.js` | Mount `routes/telegram.js` |
| `database.js` | Migration: `tg_id` column on users, update query methods |

---

## Chunk 1: Platform Detection + Telegram Config + HTML

### Task 1: Create PlatformDetector

**Files:**
- Create: `src/modules/platform/PlatformDetector.js`

- [ ] **Step 1: Create `src/modules/platform/PlatformDetector.js`**

```js
/**
 * PlatformDetector — thin shared entry point for flavor detection.
 * Returns 'vk' | 'tg' | 'web' and the active platform manager.
 */
export class PlatformDetector {
    static _flavor = null;
    static _manager = null;

    /**
     * Detect and cache the current flavor.
     * Priority:
     *   1. Telegram WebApp initData present (non-empty) → 'tg'
     *   2. URL param ?flavor=tg → 'tg'
     *   3. URL param ?flavor=vk → 'vk'
     *   4. VK Bridge environment → 'vk'
     *   5. Default → 'web'
     */
    static getFlavor() {
        if (this._flavor) return this._flavor;

        // 1. Telegram WebApp SDK injected with initData
        if (window.Telegram?.WebApp?.initData?.length > 0) {
            this._flavor = 'tg';
            return this._flavor;
        }

        const params = new URLSearchParams(window.location.search);

        // 2. Explicit ?flavor=tg (dev/testing)
        if (params.get('flavor') === 'tg') {
            this._flavor = 'tg';
            return this._flavor;
        }

        // 3. Explicit ?flavor=vk
        if (params.get('flavor') === 'vk') {
            this._flavor = 'vk';
            return this._flavor;
        }

        // 4. VK Bridge available
        if (typeof window.vkBridge !== 'undefined') {
            this._flavor = 'vk';
            return this._flavor;
        }

        // 5. Default
        this._flavor = 'web';
        return this._flavor;
    }

    /** Register the active platform manager (called by VKBridgeManager or TGBridgeManager). */
    static setManager(manager) {
        this._manager = manager;
    }

    /** Return the active manager (VKBridgeManager | TGBridgeManager | null). */
    static getManager() {
        return this._manager;
    }

    /** Convenience: true when flavor is 'tg'. */
    static isTelegram() {
        return this.getFlavor() === 'tg';
    }

    /** Convenience: true when flavor is 'vk'. */
    static isVK() {
        return this.getFlavor() === 'vk';
    }

    /** Reset cache (useful for tests). */
    static _reset() {
        this._flavor = null;
        this._manager = null;
    }
}
```

- [ ] **Step 2: Verify file loads without errors**

Open `http://localhost:3001/?flavor=tg` in the browser, open DevTools console, and run:
```js
import('/src/modules/platform/PlatformDetector.js').then(m => console.log(m.PlatformDetector.getFlavor()))
```
Expected: `'tg'`

- [ ] **Step 3: Commit**

```bash
git add src/modules/platform/PlatformDetector.js
git commit -m "feat: add PlatformDetector for flavor routing (vk/tg/web)"
```

---

### Task 2: Create TGConfig

**Files:**
- Create: `src/modules/tg/config/TGConfig.js`

- [ ] **Step 1: Create `src/modules/tg/config/TGConfig.js`**

```js
/**
 * Telegram Configuration Module
 * Centralized configuration for Telegram Mini Apps integration.
 * Mirrors VKConfig structure for consistency.
 */
export class TGConfig {
    // Backend API configuration (same base as VK)
    static BACKEND_BASE_URL = 'https://nikmobdev.ru/goodsshop';
    static CHECK_PURCHASE_ENDPOINT = '/api/check-purchase';
    static CREATE_INVOICE_ENDPOINT = '/api/tg/create-invoice';
    static TOCHKA_CREATE_PAYMENT_ENDPOINT = '/api/tochka/create-payment';

    // Telegram Bot configuration
    static BOT_USERNAME = 'PersonaDevBot'; // TODO: update after creating bot via @BotFather

    // App identifier (used in backend user/purchase queries)
    static APP_ID = 'tg_personalities';

    // Payment configuration
    static PAYMENT_CONFIG = {
        defaultProduct: {
            id: 'mbti_premium',
            name: 'Premium Personality Test',
            nameRu: 'Премиум тест личности',
            description: 'Access to premium features',
            descriptionRu: 'Доступ к премиум-функциям',
            starsPrice: 75,        // Price in Telegram Stars
            tochkaPrice: 280,      // Price in rubles (Tochka)
            currency: 'XTR'        // Telegram Stars currency code
        }
    };

    // Feature flags
    static FEATURES = {
        analytics: true,
        payment: true,
        sharing: true,
        haptics: true,
        mainButton: true,
        backButton: true,
        themeSync: true
    };

    // Timeout configurations
    static TIMEOUTS = {
        apiRequest: 10000,
        invoiceCreate: 15000,
        premiumCheck: 10000,
        retryDelay: 2000
    };

    // Local storage keys
    static STORAGE_KEYS = {
        premiumStatus: 'tg_premium',
        premiumTimestamp: 'tg_premium_timestamp',
        userData: 'tg_user_data'
    };

    // Analytics event names
    static ANALYTICS_EVENTS = {
        appInit: 'tg_app_init',
        userInfoRetrieved: 'tg_user_info_retrieved',
        paymentAttempted: 'tg_payment_attempted',
        paymentSuccess: 'tg_payment_success',
        paymentError: 'tg_payment_error',
        premiumStatusCheck: 'tg_premium_status_check',
        shareAttempted: 'tg_share_attempted'
    };

    /** Get the full backend URL for an endpoint. */
    static getBackendUrl(endpoint) {
        return `${this.BACKEND_BASE_URL}${endpoint}`;
    }

    /** Get payment config for a product. */
    static getPaymentConfig(productId = 'mbti_premium') {
        return this.PAYMENT_CONFIG.defaultProduct;
    }

    /** Get the Mini App URL (for sharing). */
    static getMiniAppUrl() {
        return `https://t.me/${this.BOT_USERNAME}`;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/config/TGConfig.js
git commit -m "feat: add TGConfig for Telegram Mini App settings"
```

---

### Task 3: Add Telegram WebApp SDK to index.html

**Files:**
- Modify: `index.html:48-51`

- [ ] **Step 1: Add Telegram SDK script tag and TG styles link**

In `index.html`, after the VK Bridge SDK scripts (line 49-51) and before the environment detection script, add the Telegram WebApp SDK. Also add the TG styles link next to the VK styles link (after line 23).

Add after line 23 (`vk-styles.css`):
```html
    <link rel="stylesheet" href="src/modules/tg/tg-styles.css">
```

Add after line 51 (VK Auth SDK):
```html
    <!-- Telegram Mini App SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
```

- [ ] **Step 2: Update the inline environment detection script**

Replace the inline script at lines 54-57:
```html
    <!-- Environment detection -->
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const isVKFlavor = urlParams.get('flavor') === 'vk';
    </script>
```
With:
```html
    <!-- Environment detection (legacy — PlatformDetector used in modules) -->
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const isVKFlavor = urlParams.get('flavor') === 'vk';
        const isTGFlavor = urlParams.get('flavor') === 'tg' || !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
    </script>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Telegram WebApp SDK and TG styles to index.html"
```

---

### Task 4: Create TG styles

**Files:**
- Create: `src/modules/tg/tg-styles.css`

- [ ] **Step 1: Create `src/modules/tg/tg-styles.css`**

```css
/* Telegram Mini App Styles */

/* Theme color variables — set dynamically by TGBridgeManager from Telegram.WebApp.themeParams */
:root {
    --tg-bg: #ffffff;
    --tg-text: #000000;
    --tg-hint: #999999;
    --tg-link: #2481cc;
    --tg-button: #2481cc;
    --tg-button-text: #ffffff;
    --tg-secondary-bg: #f0f0f0;
}

/* Hide sidebar in Telegram flavor */
[data-flavor="tg"] .sidebar {
    display: none !important;
}

/* Remove sidebar offset for screen container */
[data-flavor="tg"] #screen-container {
    margin-left: 0 !important;
}

/* Safe area handling */
[data-flavor="tg"] {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
}

/* Extra bottom padding when MainButton is visible */
[data-flavor="tg"].tg-main-button-visible {
    padding-bottom: calc(env(safe-area-inset-bottom) + 60px);
}

/* Apply Telegram theme colors */
[data-flavor="tg"] {
    background-color: var(--tg-bg);
    color: var(--tg-text);
}

[data-flavor="tg"] .page-subtitle,
[data-flavor="tg"] .section-label {
    color: var(--tg-hint);
}

/* Hide VK auth container in Telegram */
[data-flavor="tg"] #vkAuthContainer {
    display: none !important;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/tg-styles.css
git commit -m "feat: add Telegram-specific CSS (theme, safe areas, sidebar hide)"
```

---

## Chunk 2: Telegram Services (User, Analytics, Error Handler)

### Task 5: Create TGErrorHandler

**Files:**
- Create: `src/modules/tg/utils/TGErrorHandler.js`

- [ ] **Step 1: Create `src/modules/tg/utils/TGErrorHandler.js`**

```js
/**
 * Telegram-specific error handling.
 */
export class TGErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }

    /** Handle and log an error, returning a user-friendly message. */
    handle(context, error) {
        this.logger.error(`[TG ${context}]`, error);

        if (error?.message?.includes('PAYMENT')) {
            return 'Ошибка оплаты. Попробуйте позже.';
        }
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            return 'Ошибка сети. Проверьте соединение.';
        }
        return 'Произошла ошибка. Попробуйте позже.';
    }

    /** Show a Telegram popup with an error message. */
    showError(message) {
        try {
            if (window.Telegram?.WebApp?.showPopup) {
                window.Telegram.WebApp.showPopup({
                    title: 'Ошибка',
                    message,
                    buttons: [{ type: 'ok' }]
                });
            } else {
                alert(message);
            }
        } catch (e) {
            this.logger.error('Failed to show error popup:', e);
            alert(message);
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/utils/TGErrorHandler.js
git commit -m "feat: add TGErrorHandler for Telegram error handling"
```

---

### Task 6: Create TGUserService

**Files:**
- Create: `src/modules/tg/services/TGUserService.js`

- [ ] **Step 1: Create `src/modules/tg/services/TGUserService.js`**

```js
/**
 * TGUserService — extracts and stores user info from Telegram WebApp initDataUnsafe.
 */
import { TGConfig } from '../config/TGConfig.js';
import localizationManager from '../../../locales/LocalizationManager.js';

export class TGUserService {
    constructor(logger, analytics) {
        this.logger = logger;
        this.analytics = analytics;
        this.userInfo = null;
        this._premiumStatus = false;
    }

    /** Extract user from Telegram initDataUnsafe and store in memory. */
    init() {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!tgUser) {
            this.logger.warn('No Telegram user data available (running outside Telegram?)');
            // Try localStorage fallback for ?flavor=tg dev mode
            this._loadFromStorage();
            return;
        }

        this.userInfo = {
            id: String(tgUser.id),
            first_name: tgUser.first_name || '',
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            photo_url: tgUser.photo_url || '',
            language_code: tgUser.language_code || 'ru'
        };

        // Set locale based on Telegram language
        const lang = this.userInfo.language_code;
        const supportedLang = (lang === 'ru' || lang === 'en') ? lang : 'ru';
        localizationManager.setLocale(supportedLang);

        // Notify app via global handler
        if (typeof window.handleUserInfo === 'function') {
            window.handleUserInfo({
                id: this.userInfo.id,
                first_name: this.userInfo.first_name,
                last_name: this.userInfo.last_name,
                screen_name: this.userInfo.username,
                photo_100: this.userInfo.photo_url,
                user_type: 'tg_user'
            });
        }

        this.analytics.track(TGConfig.ANALYTICS_EVENTS.userInfoRetrieved, {
            user_id: this.userInfo.id,
            language: this.userInfo.language_code
        });

        this.logger.log('TG user initialized:', this.userInfo.id, this.userInfo.first_name);
    }

    /** Return stored user info. */
    getUserInfo() {
        return this.userInfo;
    }

    /** Return Telegram user ID as string. */
    getUserId() {
        return this.userInfo?.id || null;
    }

    /** Return user's language code. */
    getLanguage() {
        return this.userInfo?.language_code || 'ru';
    }

    /** Check premium status from backend. */
    async checkPremiumStatus() {
        const userId = this.getUserId();
        if (!userId) return false;

        try {
            const url = TGConfig.getBackendUrl(TGConfig.CHECK_PURCHASE_ENDPOINT) +
                `?user_id=tg_${userId}&app_id=${TGConfig.APP_ID}&item_id=mbti_premium`;

            const resp = await fetch(url, { signal: AbortSignal.timeout(TGConfig.TIMEOUTS.premiumCheck) });
            const data = await resp.json();

            this._premiumStatus = data.hasPurchased === true;

            // Update global premium state
            if (this._premiumStatus && window.stateManager) {
                window.stateManager.set('isPremium', true);
                localStorage.setItem(TGConfig.STORAGE_KEYS.premiumStatus, 'true');
                localStorage.setItem(TGConfig.STORAGE_KEYS.premiumTimestamp, Date.now().toString());
            }

            this.analytics.track(TGConfig.ANALYTICS_EVENTS.premiumStatusCheck, {
                is_premium: this._premiumStatus
            });

            return this._premiumStatus;
        } catch (error) {
            this.logger.error('Premium status check failed:', error);
            // Fallback to localStorage
            const cached = localStorage.getItem(TGConfig.STORAGE_KEYS.premiumStatus);
            this._premiumStatus = cached === 'true';
            return this._premiumStatus;
        }
    }

    /** Get cached premium status. */
    getPremiumStatus() {
        return this._premiumStatus;
    }

    /** Store premium status (called after successful payment). */
    storePremiumStatus(status) {
        this._premiumStatus = status;
        localStorage.setItem(TGConfig.STORAGE_KEYS.premiumStatus, String(status));
        localStorage.setItem(TGConfig.STORAGE_KEYS.premiumTimestamp, Date.now().toString());
        if (window.stateManager) {
            window.stateManager.set('isPremium', status);
        }
    }

    /** Load user from localStorage (dev mode fallback). */
    _loadFromStorage() {
        try {
            const saved = localStorage.getItem(TGConfig.STORAGE_KEYS.userData);
            if (saved) {
                this.userInfo = JSON.parse(saved);
                this.logger.log('TG user loaded from localStorage (dev mode)');
            }
        } catch (e) {
            this.logger.warn('Failed to load TG user from localStorage:', e);
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/services/TGUserService.js
git commit -m "feat: add TGUserService for Telegram user extraction and premium checks"
```

---

### Task 7: Create TGAnalyticsService

**Files:**
- Create: `src/modules/tg/services/TGAnalyticsService.js`

- [ ] **Step 1: Create `src/modules/tg/services/TGAnalyticsService.js`**

```js
/**
 * TGAnalyticsService — Firebase analytics with tg_ prefix events.
 */
import { firebaseAnalytics } from '../../../config/firebase.js';

export class TGAnalyticsService {
    constructor(logger) {
        this.logger = logger;
    }

    /** Track a named event with optional properties. */
    track(eventName, properties = {}) {
        try {
            if (firebaseAnalytics && firebaseAnalytics.logEvent) {
                firebaseAnalytics.logEvent(eventName, {
                    ...properties,
                    platform: 'telegram'
                });
            }
        } catch (error) {
            this.logger.warn('Analytics track failed:', eventName, error);
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/services/TGAnalyticsService.js
git commit -m "feat: add TGAnalyticsService for Firebase events with Telegram context"
```

---

## Chunk 3: Payment Service + TGBridgeManager

### Task 8: Create TGPaymentService

**Files:**
- Create: `src/modules/tg/services/TGPaymentService.js`

- [ ] **Step 1: Create `src/modules/tg/services/TGPaymentService.js`**

```js
/**
 * TGPaymentService — handles Telegram Stars and Tochka payment flows.
 */
import { TGConfig } from '../config/TGConfig.js';

export class TGPaymentService {
    constructor(logger, analytics, errorHandler) {
        this.logger = logger;
        this.analytics = analytics;
        this.errorHandler = errorHandler;
    }

    /**
     * Open Telegram Stars invoice.
     * 1. Call backend to create invoice link
     * 2. Open invoice via Telegram.WebApp.openInvoice
     * 3. Return result via callback
     */
    async payWithStars(tgUserId) {
        this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentAttempted, {
            method: 'telegram_stars',
            user_id: tgUserId
        });

        const config = TGConfig.getPaymentConfig();
        const url = TGConfig.getBackendUrl(TGConfig.CREATE_INVOICE_ENDPOINT);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tg_user_id: tgUserId,
                product_id: config.id,
                app_id: TGConfig.APP_ID
            }),
            signal: AbortSignal.timeout(TGConfig.TIMEOUTS.invoiceCreate)
        });

        const data = await resp.json();
        if (!data.success || !data.invoiceLink) {
            throw new Error(data.message || 'Failed to create invoice');
        }

        // Open invoice in Telegram
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.openInvoice(data.invoiceLink, (status) => {
                this.logger.log('Invoice status:', status);
                if (status === 'paid') {
                    this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentSuccess, {
                        method: 'telegram_stars',
                        user_id: tgUserId
                    });
                    resolve({ success: true, method: 'stars' });
                } else if (status === 'cancelled') {
                    resolve({ success: false, cancelled: true });
                } else {
                    reject(new Error(`Payment failed with status: ${status}`));
                }
            });
        });
    }

    /**
     * Create Tochka payment (same as web flow but passes tg_user_id).
     * Returns { paymentLink, operationId }.
     */
    async createTochkaPayment(tgUserId) {
        this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentAttempted, {
            method: 'tochka',
            user_id: tgUserId
        });

        const url = TGConfig.getBackendUrl(TGConfig.TOCHKA_CREATE_PAYMENT_ENDPOINT);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vk_user_id: `tg_${tgUserId}`,
                app_id: TGConfig.APP_ID
            }),
            signal: AbortSignal.timeout(TGConfig.TIMEOUTS.apiRequest)
        });

        const data = await resp.json();
        if (!data.success || !data.paymentLink) {
            throw new Error(data.message || 'Failed to create Tochka payment');
        }

        return { paymentLink: data.paymentLink, operationId: data.operationId };
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/services/TGPaymentService.js
git commit -m "feat: add TGPaymentService for Telegram Stars and Tochka payments"
```

---

### Task 9: Create TGBridgeManager

**Files:**
- Create: `src/modules/tg/TGBridgeManager.js`

- [ ] **Step 1: Create `src/modules/tg/TGBridgeManager.js`**

```js
/**
 * TGBridgeManager — main orchestrator for Telegram Mini Apps integration.
 * Exposed as window.tgBridgeManager.
 */
import { LoggerManager } from '../core/LoggerManager.js';
import { TGConfig } from './config/TGConfig.js';
import { TGErrorHandler } from './utils/TGErrorHandler.js';
import { TGAnalyticsService } from './services/TGAnalyticsService.js';
import { TGUserService } from './services/TGUserService.js';
import { TGPaymentService } from './services/TGPaymentService.js';
import { PlatformDetector } from '../platform/PlatformDetector.js';

export class TGBridgeManager {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('TGBridgeManager');
        this.errorHandler = new TGErrorHandler(this.logger);
        this.analytics = new TGAnalyticsService(this.logger);
        this.userService = new TGUserService(this.logger, this.analytics);
        this.paymentService = new TGPaymentService(this.logger, this.analytics, this.errorHandler);
        this.isTG = false;
    }

    /** Initialize Telegram Mini App. */
    async init() {
        try {
            const tgApp = window.Telegram?.WebApp;
            if (!tgApp) {
                this.logger.warn('Telegram WebApp not available');
                return;
            }

            // Signal readiness to Telegram
            tgApp.ready();

            // Expand to full height
            tgApp.expand();

            this.isTG = true;

            // Register with PlatformDetector
            PlatformDetector.setManager(this);

            // Apply theme
            this._applyTheme();

            // Listen for theme changes
            tgApp.onEvent('themeChanged', () => this._applyTheme());

            // Listen for viewport changes
            tgApp.onEvent('viewportChanged', (event) => {
                this.logger.log('Viewport changed, isStateStable:', event.isStateStable);
            });

            // Initialize user service (extracts user from initDataUnsafe)
            this.userService.init();

            // Check premium (non-blocking)
            this.userService.checkPremiumStatus().catch(err => {
                this.logger.warn('Premium check failed (non-blocking):', err);
            });

            this.analytics.track(TGConfig.ANALYTICS_EVENTS.appInit, {
                user_id: this.userService.getUserId()
            });

            this.logger.log('TGBridgeManager initialized');
        } catch (error) {
            this.logger.error('TGBridgeManager init failed:', error);
        }
    }

    /** Returns true when running inside Telegram. */
    isTGEnvironment() {
        return this.isTG;
    }

    /** Returns false — not VK. Used by code that checks `manager.isVKEnvironment()`. */
    isVKEnvironment() {
        return false;
    }

    /** Get user info from TGUserService. */
    getUserInfo() {
        return this.userService.getUserInfo();
    }

    /** Get Telegram user ID as string. */
    getUserId() {
        return this.userService.getUserId();
    }

    /** Check premium status. */
    async checkPremiumStatus() {
        return this.userService.checkPremiumStatus();
    }

    /**
     * Share results via switchInlineQuery.
     * Falls back to openTelegramLink if unavailable.
     */
    shareResults(type, text, title) {
        try {
            const tgApp = window.Telegram?.WebApp;
            if (!tgApp) return;

            this.analytics.track(TGConfig.ANALYTICS_EVENTS.shareAttempted);

            // Replace VK link with Telegram link in text
            const tgText = text?.replace(/https:\/\/vk\.com\/app\d+[_\d]*/g, TGConfig.getMiniAppUrl()) || title || '';

            if (typeof tgApp.switchInlineQuery === 'function') {
                tgApp.switchInlineQuery(tgText, ['users', 'groups', 'channels']);
            } else {
                // Fallback
                const encoded = encodeURIComponent(tgText);
                tgApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(TGConfig.getMiniAppUrl())}&text=${encoded}`);
            }
        } catch (error) {
            this.logger.error('Share failed:', error);
            this.errorHandler.showError('Не удалось поделиться результатом.');
        }
    }

    /**
     * Show payment options.
     * For Russian locale: Stars + Tochka choice.
     * For other locales: Stars only.
     */
    async showOrderBox(productId) {
        const userId = this.userService.getUserId();
        if (!userId) {
            this.errorHandler.showError('Пользователь не определён.');
            return null;
        }

        const lang = this.userService.getLanguage();
        const isRussian = (lang === 'ru');
        const config = TGConfig.getPaymentConfig(productId);

        if (isRussian) {
            // Show choice popup: Stars or Tochka
            return this._showPaymentChoicePopup(userId, config);
        } else {
            // English: Stars only
            return this._payWithStars(userId);
        }
    }

    /** Pay with Telegram Stars directly. */
    async _payWithStars(userId) {
        try {
            const result = await this.paymentService.payWithStars(userId);
            if (result.success) {
                this.userService.storePremiumStatus(true);
                this._restartAppUI();
            }
            return result;
        } catch (error) {
            const msg = this.errorHandler.handle('Stars payment', error);
            this.errorHandler.showError(msg);
            return { success: false };
        }
    }

    /** Show a popup letting user choose Stars or Tochka, then execute chosen flow. */
    _showPaymentChoicePopup(userId, config) {
        return new Promise((resolve) => {
            const tgApp = window.Telegram?.WebApp;
            if (!tgApp?.showPopup) {
                // Fallback: just use Stars
                this._payWithStars(userId).then(resolve);
                return;
            }

            tgApp.showPopup({
                title: 'Способ оплаты',
                message: `Выберите способ оплаты для Премиум:`,
                buttons: [
                    { id: 'stars', type: 'default', text: `⭐ ${config.starsPrice} Stars` },
                    { id: 'tochka', type: 'default', text: `💳 ${config.tochkaPrice} ₽` },
                    { id: 'cancel', type: 'cancel' }
                ]
            }, async (buttonId) => {
                if (buttonId === 'stars') {
                    const result = await this._payWithStars(userId);
                    resolve(result);
                } else if (buttonId === 'tochka') {
                    await this._payWithTochka(userId);
                    resolve({ success: false, pending: true }); // User redirected externally
                } else {
                    resolve({ success: false, cancelled: true });
                }
            });
        });
    }

    /** Initiate Tochka payment — opens external link. */
    async _payWithTochka(userId) {
        try {
            const { paymentLink, operationId } = await this.paymentService.createTochkaPayment(userId);
            localStorage.setItem('tochka_pending_operation', operationId);
            window.Telegram.WebApp.openLink(paymentLink);
        } catch (error) {
            const msg = this.errorHandler.handle('Tochka payment', error);
            this.errorHandler.showError(msg);
        }
    }

    /** Show a notification popup. */
    showNotification(message) {
        try {
            const tgApp = window.Telegram?.WebApp;
            if (tgApp?.showPopup) {
                tgApp.showPopup({ message, buttons: [{ type: 'ok' }] });
            } else {
                alert(message);
            }
        } catch (e) {
            alert(message);
        }
    }

    /** Trigger haptic feedback. */
    haptic(type = 'impact', style = 'light') {
        try {
            const hf = window.Telegram?.WebApp?.HapticFeedback;
            if (!hf) return;
            if (type === 'impact') hf.impactOccurred(style);
            else if (type === 'notification') hf.notificationOccurred(style);
            else if (type === 'selection') hf.selectionChanged();
        } catch (e) {
            // Haptics not supported — ignore
        }
    }

    /** Show/hide the Telegram BackButton. */
    setBackButtonVisible(visible, onClick) {
        const bb = window.Telegram?.WebApp?.BackButton;
        if (!bb) return;
        if (visible) {
            bb.show();
            if (onClick) bb.onClick(onClick);
        } else {
            bb.hide();
        }
    }

    /** Configure and show the Telegram MainButton. */
    setMainButton(text, onClick) {
        const mb = window.Telegram?.WebApp?.MainButton;
        if (!mb) return;
        mb.setText(text);
        mb.onClick(onClick);
        mb.show();
        document.getElementById('app')?.classList.add('tg-main-button-visible');
    }

    /** Hide the Telegram MainButton. */
    hideMainButton() {
        const mb = window.Telegram?.WebApp?.MainButton;
        if (mb) mb.hide();
        document.getElementById('app')?.classList.remove('tg-main-button-visible');
    }

    /** VK-compatible method for tracking events. */
    trackVKEvent(eventName, data = {}) {
        this.analytics.track(`tg_${eventName}`, data);
    }

    /** Alias for VK compat: track quiz events. */
    trackVKQuizEvent(eventName, data = {}) {
        this.analytics.track(`tg_${eventName}`, data);
    }

    /** Restart app UI after premium purchase. */
    _restartAppUI() {
        if (typeof window.updatePremiumUI === 'function') {
            window.updatePremiumUI();
        }
    }

    /** Apply Telegram theme params to CSS variables. */
    _applyTheme() {
        const tp = window.Telegram?.WebApp?.themeParams;
        if (!tp) return;

        const root = document.documentElement.style;
        if (tp.bg_color) root.setProperty('--tg-bg', tp.bg_color);
        if (tp.text_color) root.setProperty('--tg-text', tp.text_color);
        if (tp.hint_color) root.setProperty('--tg-hint', tp.hint_color);
        if (tp.link_color) root.setProperty('--tg-link', tp.link_color);
        if (tp.button_color) root.setProperty('--tg-button', tp.button_color);
        if (tp.button_text_color) root.setProperty('--tg-button-text', tp.button_text_color);
        if (tp.secondary_bg_color) root.setProperty('--tg-secondary-bg', tp.secondary_bg_color);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/tg/TGBridgeManager.js
git commit -m "feat: add TGBridgeManager — Telegram Mini App orchestrator"
```

---

## Chunk 4: Wire Up Frontend — script.js, App.js, VKBridgeManager gate

### Task 10: Gate VKBridgeManager auto-instantiation

**Files:**
- Modify: `src/modules/vk/VKBridgeManager.js:976-979`

- [ ] **Step 1: Replace the unconditional instantiation**

At the bottom of `VKBridgeManager.js` (lines 976-979), replace:
```js
// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.vkBridgeManager = new VKBridgeManager();
}
```
With:
```js
// Create global instance — but NOT in Telegram flavor (PlatformDetector handles routing).
// When imported as a module by script.js, it will be conditionally instantiated there.
// This auto-instantiation is kept only for legacy non-module script tags.
```

**Note:** We remove the auto-instantiation entirely. `script.js` already creates `vkBridgeManager = new VKBridgeManager()` in its DOMContentLoaded handler (line 3220), which is the proper place. The duplicate at the bottom of VKBridgeManager.js causes a double-init.

- [ ] **Step 2: Commit**

```bash
git add src/modules/vk/VKBridgeManager.js
git commit -m "fix: remove VKBridgeManager auto-instantiation to prevent double-init and Telegram conflicts"
```

---

### Task 11: Update App.js to use PlatformDetector

**Files:**
- Modify: `src/modules/ui/App.js:1-34`

- [ ] **Step 1: Replace flavor detection in App.js constructor**

Add import at top of file (after line 16):
```js
import { PlatformDetector } from '../platform/PlatformDetector.js';
```

Replace lines 26-34 (the flavor detection block in constructor):
```js
    // Desktop sidebar (hidden in VK Mini App)
    const isVKFlavor = new URLSearchParams(window.location.search).get('flavor') === 'vk';
    const appEl = document.getElementById('app');
    if (isVKFlavor) {
      appEl.dataset.flavor = 'vk';
    } else {
      this.sidebar = new Sidebar();
      appEl.insertBefore(this.sidebar.getElement(), this.screenContainer);
    }
```
With:
```js
    // Desktop sidebar (hidden in VK and Telegram flavors)
    const flavor = PlatformDetector.getFlavor();
    const appEl = document.getElementById('app');
    if (flavor === 'vk' || flavor === 'tg') {
      appEl.dataset.flavor = flavor;
    } else {
      this.sidebar = new Sidebar();
      appEl.insertBefore(this.sidebar.getElement(), this.screenContainer);
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/ui/App.js
git commit -m "feat: update App.js to use PlatformDetector for flavor detection"
```

---

### Task 12: Update script.js — imports, DOMContentLoaded, and flavor checks

**Files:**
- Modify: `script.js`

This is the largest change. We need to:
1. Import PlatformDetector and TGBridgeManager
2. Update DOMContentLoaded to conditionally init TG or VK
3. Replace key `isVKFlavor` and `vkBridgeManager` checks

- [ ] **Step 1: Add imports**

At the top of `script.js`, after line 16 (`import { VKBridgeManager } ...`), add:
```js
import { PlatformDetector } from './src/modules/platform/PlatformDetector.js';
import { TGBridgeManager } from './src/modules/tg/TGBridgeManager.js';
```

- [ ] **Step 2: Update `handleUserInfo` to be platform-aware**

In `handleUserInfo` (around line 54), replace:
```js
            setUserProperties(firebaseAnalytics, {
                vk_user_id: userInfo.id?.toString(),
                vk_username: userInfo.screen_name || `user_${userInfo.id}`,
                vk_first_name: userInfo.first_name || '',
                vk_last_name: userInfo.last_name || '',
                vk_has_photo: !!userInfo.photo_100,
                user_type: 'vk_user'
            });
```
With:
```js
            const userType = userInfo.user_type || (PlatformDetector.isTelegram() ? 'tg_user' : 'vk_user');
            setUserProperties(firebaseAnalytics, {
                platform_user_id: userInfo.id?.toString(),
                username: userInfo.screen_name || `user_${userInfo.id}`,
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                has_photo: !!(userInfo.photo_100 || userInfo.photo_url),
                user_type: userType
            });
```

- [ ] **Step 3: Update `logEvent` source in `handleUserInfo`**

Around line 75, replace:
```js
                source: 'vk_auth'
```
With:
```js
                source: PlatformDetector.isTelegram() ? 'tg_auth' : 'vk_auth'
```

- [ ] **Step 4: Update `checkExistingUserAuth` (line ~107)**

Replace:
```js
    const isVKFlavor = urlParams.get('flavor') === 'vk';

    // In VK Mini App, don't check localStorage - VK Bridge will handle authentication
    if (isVKFlavor) {
        logger.log('VK Mini App detected - VK Bridge will handle authentication');
        return false; // Let VK Bridge handle authentication
    }
```
With:
```js
    const flavor = PlatformDetector.getFlavor();

    // In VK/TG Mini App, don't check localStorage — platform bridge handles auth
    if (flavor === 'vk' || flavor === 'tg') {
        logger.log(`${flavor.toUpperCase()} Mini App detected — bridge handles authentication`);
        return false;
    }
```

- [ ] **Step 5: Update `isUserAuthenticated` (line ~198)**

Replace:
```js
    const isVKFlavor = urlParams.get('flavor') === 'vk';

    if (isVKFlavor) {
        return vkBridgeManager && vkBridgeManager.isVKEnvironment();
    } else {
        return window.userInfo && window.userInfo.authorized;
    }
```
With:
```js
    const flavor = PlatformDetector.getFlavor();

    if (flavor === 'vk') {
        return vkBridgeManager && vkBridgeManager.isVKEnvironment();
    } else if (flavor === 'tg') {
        return window.tgBridgeManager && window.tgBridgeManager.isTGEnvironment();
    } else {
        return window.userInfo && window.userInfo.authorized;
    }
```

- [ ] **Step 6: Update `updatePricing` (line ~243)**

Replace:
```js
    const isVKFlavor = urlParams.get('flavor') === 'vk';

    const webPrice = '280 рублей';
    const vkPrice = '40 голосов';
```
With:
```js
    const flavor = PlatformDetector.getFlavor();

    const webPrice = '280 рублей';
    const vkPrice = '40 голосов';
    const tgPrice = '⭐ 75 Stars';
```

And update the price selection logic to include:
```js
    const price = flavor === 'vk' ? vkPrice : flavor === 'tg' ? tgPrice : webPrice;
```

- [ ] **Step 7: Update DOMContentLoaded (line ~3208)**

Replace lines 3218-3230:
```js
    // Initialize VK Bridge Manager
    try {
        vkBridgeManager = new VKBridgeManager();
        window.vkBridgeManager = vkBridgeManager;

        // Start banner ad timer for non-premium users in VK environment
        if (vkBridgeManager.isVKEnvironment() && !isPremium()) {
            startBannerAdTimer();
        }
    } catch (error) {
        logger.error('VK Bridge Manager not available:', error);
        window.vkBridgeManager = null;
    }
```
With:
```js
    // Initialize platform bridge manager
    const flavor = PlatformDetector.getFlavor();

    if (flavor === 'tg') {
        try {
            const tgManager = new TGBridgeManager();
            window.tgBridgeManager = tgManager;
            await tgManager.init();
            logger.log('Telegram Bridge Manager initialized');
        } catch (error) {
            logger.error('Telegram Bridge Manager init failed:', error);
            window.tgBridgeManager = null;
        }
    } else {
        try {
            vkBridgeManager = new VKBridgeManager();
            window.vkBridgeManager = vkBridgeManager;
            PlatformDetector.setManager(vkBridgeManager);

            // Start banner ad timer for non-premium users in VK environment
            if (vkBridgeManager.isVKEnvironment() && !isPremium()) {
                startBannerAdTimer();
            }
        } catch (error) {
            logger.error('VK Bridge Manager not available:', error);
            window.vkBridgeManager = null;
        }
    }
```

**Note:** The DOMContentLoaded callback needs to become `async` for `await tgManager.init()`. Change `document.addEventListener('DOMContentLoaded', () => {` to `document.addEventListener('DOMContentLoaded', async () => {`.

- [ ] **Step 8: Commit**

```bash
git add script.js
git commit -m "feat: integrate PlatformDetector and TGBridgeManager into script.js"
```

---

## Chunk 5: PremiumModal + HomeScreen platform-awareness

### Task 13: Refactor PremiumModal for platform-aware payments

**Files:**
- Modify: `src/modules/ui/components/PremiumModal.js`

- [ ] **Step 1: Add PlatformDetector import**

At top, add:
```js
import { PlatformDetector } from '../../platform/PlatformDetector.js';
```

- [ ] **Step 2: Replace hardcoded price in render()**

Replace the button text (line 40):
```js
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Обработка…' : 'Открыть Премиум — 150 ₽'}
```
With:
```js
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Обработка…' : this._getButtonText()}
```

- [ ] **Step 3: Add `_getButtonText()` method**

After the `_bind()` method, add:
```js
  _getButtonText() {
    const flavor = PlatformDetector.getFlavor();
    if (flavor === 'tg') return 'Открыть Премиум';
    if (flavor === 'vk') return 'Открыть Премиум — 40 голосов';
    return 'Открыть Премиум — 280 ₽';
  }
```

- [ ] **Step 4: Replace the click handler to use platform manager**

Replace the entire `#premium-buy` click handler (lines 56-145) with:
```js
    this.el.querySelector('#premium-buy')?.addEventListener('click', async () => {
      this.state = 'processing';
      this.errorMessage = '';
      this.render();

      try {
        const manager = PlatformDetector.getManager();
        const flavor = PlatformDetector.getFlavor();

        if (flavor === 'tg' && manager) {
          // Telegram: showOrderBox handles Stars/Tochka choice
          const result = await manager.showOrderBox();
          if (result?.success) {
            router.closeOverlay();
            return;
          } else if (result?.pending) {
            // Tochka redirect — modal stays, user will return
            this.state = 'idle';
            this.render();
            return;
          }
          // Cancelled or failed — reset
          this.state = 'idle';
          this.render();
          return;
        }

        // VK / Web: existing Tochka flow
        let vkUserId = null;
        let appId = '53942833';

        if (window.vkBridgeManager && window.vkBridgeManager.userService) {
          const userInfo = window.vkBridgeManager.userService.getUserInfo();
          if (userInfo && userInfo.id) vkUserId = String(userInfo.id);
        }
        if (!vkUserId && window.userInfo && window.userInfo.id) {
          vkUserId = String(window.userInfo.id);
        }
        if (!vkUserId) {
          try {
            const authData = localStorage.getItem('vk_user_auth');
            if (authData) { const p = JSON.parse(authData); if (p.id) vkUserId = String(p.id); }
          } catch {}
        }
        if (!vkUserId) {
          try {
            const ld = localStorage.getItem('vk_user_data_local');
            if (ld) { const p = JSON.parse(ld); if (p.id) vkUserId = String(p.id); }
          } catch {}
        }
        if (!vkUserId) {
          const urlParams = new URLSearchParams(window.location.search);
          const vid = urlParams.get('vk_user_id');
          if (vid) vkUserId = vid;
        }
        if (!vkUserId) throw new Error('User not identified');

        const backendUrl = 'https://nikmobdev.ru/goodsshop/api/tochka/create-payment';
        const resp = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vk_user_id: vkUserId, app_id: appId })
        });

        const data = await resp.json();
        if (!data.success || !data.paymentLink) throw new Error(data.message || 'Failed to create payment');

        firebaseAnalytics.logEvent('payment_initiated', {
          vk_user_id: vkUserId,
          operation_id: data.operationId,
          payment_method: 'tochka'
        });

        localStorage.setItem('tochka_pending_operation', data.operationId);
        window.location.href = data.paymentLink;
      } catch (error) {
        logger.error('Payment failed:', error);
        this.state = 'error';
        this.errorMessage = error.message === 'User not identified'
          ? 'Не удалось определить пользователя'
          : 'Ошибка оплаты. Попробуйте позже.';
        this.render();
      }
    });
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/PremiumModal.js
git commit -m "feat: refactor PremiumModal for platform-aware payment routing"
```

---

### Task 14: Update HomeScreen for platform-aware sharing and pricing

**Files:**
- Modify: `src/modules/ui/screens/HomeScreen.js:72-157`

- [ ] **Step 1: Add PlatformDetector import**

At top of file, add:
```js
import { PlatformDetector } from '../../platform/PlatformDetector.js';
```

- [ ] **Step 2: Update hardcoded price in premium CTA**

Replace line 77:
```js
        <button class="btn-gold btn-gold--small">150 ₽</button>
```
With:
```js
        <button class="btn-gold btn-gold--small">${PlatformDetector.isTelegram() ? '⭐ 75' : PlatformDetector.isVK() ? '40 гол.' : '280 ₽'}</button>
```

- [ ] **Step 3: Update share click handler**

Replace lines 148-157 (the share text and share call):
```js
      const text = lines.length > 0
        ? '🧠 Мои результаты:\n\n' + lines.join('\n\n') + '\n\nhttps://vk.com/app53942833_6582162'
        : '';
      const title = 'Мои типы личности';
      if (window.vkBridgeManager && window.vkBridgeManager.isVKEnvironment()) {
        window.vkBridgeManager.shareResults(null, text, title);
      } else if (navigator.share) {
        navigator.share({ title, text, url: 'https://vk.ru/app53942833' }).catch(() => {});
      }
```
With:
```js
      const manager = PlatformDetector.getManager();
      const shareUrl = PlatformDetector.isTelegram()
        ? (await import('../../tg/config/TGConfig.js')).TGConfig.getMiniAppUrl()
        : 'https://vk.com/app53942833_6582162';
      const text = lines.length > 0
        ? '🧠 Мои результаты:\n\n' + lines.join('\n\n') + '\n\n' + shareUrl
        : '';
      const title = 'Мои типы личности';

      if (manager && (manager.isTGEnvironment?.() || manager.isVKEnvironment?.())) {
        manager.shareResults(null, text, title);
      } else if (navigator.share) {
        navigator.share({ title, text, url: shareUrl }).catch(() => {});
      }
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/ui/screens/HomeScreen.js
git commit -m "feat: update HomeScreen for platform-aware sharing and pricing"
```

---

## Chunk 6: Backend — Database Migration + Telegram Routes

### Task 15: Add tg_id column to database

**Files:**
- Modify: `goodsv2/database.js`

- [ ] **Step 1: Add tg_id column migration**

In `database.js`, inside the `init()` method, after the `newColumns.forEach(...)` block (around line 47), add:
```js
            // Add tg_id column for Telegram users
            this.db.run(`ALTER TABLE users ADD COLUMN tg_id TEXT`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding tg_id column:', err);
                }
            });

            // Index for Telegram user lookups
            this.db.run('CREATE INDEX IF NOT EXISTS idx_users_tg_app ON users(tg_id, app_id)');
```

- [ ] **Step 2: Update `createOrUpdateUser` to accept tg_id**

After the existing `createOrUpdateUser` method (around line 157), add a new method:
```js
    async createOrUpdateTelegramUser(userData) {
        return new Promise((resolve, reject) => {
            const { tg_id, app_id, first_name, last_name, username, photo_url } = userData;

            // Check if user exists
            this.db.get('SELECT id FROM users WHERE tg_id = ? AND app_id = ?', [tg_id, app_id], (err, row) => {
                if (err) return reject(err);

                if (row) {
                    // Update existing
                    this.db.run(
                        `UPDATE users SET first_name = ?, last_name = ?, username = ?, vk_photo = ? WHERE tg_id = ? AND app_id = ?`,
                        [first_name || '', last_name || '', username || '', photo_url || '', tg_id, app_id],
                        function(err) { err ? reject(err) : resolve({ id: row.id, changes: this.changes }); }
                    );
                } else {
                    // Insert new — vk_user_id can be empty string for Telegram users
                    this.db.run(
                        `INSERT INTO users (vk_user_id, app_id, tg_id, first_name, last_name, username, vk_photo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [`tg_${tg_id}`, app_id, tg_id, first_name || '', last_name || '', username || '', photo_url || ''],
                        function(err) { err ? reject(err) : resolve({ id: this.lastID, changes: this.changes }); }
                    );
                }
            });
        });
    }
```

- [ ] **Step 3: Add method to get user by tg_id**

```js
    async getUserByTgId(tgId, appId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE tg_id = ? AND app_id = ?',
                [tgId, appId],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });
    }
```

- [ ] **Step 4: Add method to get purchases by tg_id**

```js
    async getPurchasesByTgUser(tgId, appId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM purchases WHERE vk_user_id = ? AND app_id = ?',
                [`tg_${tgId}`, appId],
                (err, rows) => err ? reject(err) : resolve(rows || [])
            );
        });
    }
```

- [ ] **Step 5: Commit**

```bash
cd /Users/nikitaf/development/projects/goodsv2 && git add database.js && git commit -m "feat: add tg_id column and Telegram user methods to database"
```

---

### Task 16: Create Telegram Bot API service

**Files:**
- Create: `goodsv2/services/telegram.js`

- [ ] **Step 1: Create `services/telegram.js`**

```js
/**
 * Telegram Bot API client for Personalities app.
 * Handles: invoice creation, pre-checkout answers, inline queries.
 */
const TELEGRAM_API = 'https://api.telegram.org/bot';

class TelegramService {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        if (!this.token) {
            console.warn('TELEGRAM_BOT_TOKEN not set — Telegram features disabled');
        }
    }

    /** Make a Telegram Bot API call. */
    async _call(method, body = {}) {
        const resp = await fetch(`${TELEGRAM_API}${this.token}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
        return data.result;
    }

    /** Create a Stars invoice link. */
    async createInvoiceLink({ title, description, payload, price, currency = 'XTR' }) {
        return this._call('createInvoiceLink', {
            title,
            description,
            payload,
            currency,
            prices: [{ label: title, amount: price }],
            provider_token: '' // Empty for Telegram Stars
        });
    }

    /** Answer pre-checkout query (must respond within 10 seconds). */
    async answerPreCheckoutQuery(preCheckoutQueryId, ok = true, errorMessage = '') {
        return this._call('answerPreCheckoutQuery', {
            pre_checkout_query_id: preCheckoutQueryId,
            ok,
            error_message: errorMessage || undefined
        });
    }

    /** Answer inline query with results. */
    async answerInlineQuery(inlineQueryId, results = [], cacheTime = 300) {
        return this._call('answerInlineQuery', {
            inline_query_id: inlineQueryId,
            results,
            cache_time: cacheTime
        });
    }

    /** Set webhook URL. */
    async setWebhook(url, secretToken = '') {
        return this._call('setWebhook', {
            url,
            secret_token: secretToken || undefined,
            allowed_updates: ['message', 'inline_query', 'pre_checkout_query']
        });
    }
}

module.exports = new TelegramService();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nikitaf/development/projects/goodsv2 && git add services/telegram.js && git commit -m "feat: add Telegram Bot API service (invoices, webhooks, inline queries)"
```

---

### Task 17: Create Telegram routes

**Files:**
- Create: `goodsv2/routes/telegram.js`
- Modify: `goodsv2/server.js`

- [ ] **Step 1: Create `routes/telegram.js`**

```js
const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram');
const Database = require('../database');
const db = new Database();

/**
 * POST /api/tg/create-invoice
 * Creates a Telegram Stars invoice link for premium purchase.
 */
router.post('/create-invoice', async (req, res) => {
    try {
        const { tg_user_id, product_id, app_id } = req.body;

        if (!tg_user_id) {
            return res.status(400).json({ success: false, message: 'tg_user_id required' });
        }

        const invoiceLink = await telegramService.createInvoiceLink({
            title: 'Премиум тест личности',
            description: 'Доступ к премиум-функциям: расширенный анализ, все тесты, аналитика',
            payload: JSON.stringify({ tg_user_id, product_id: product_id || 'mbti_premium', app_id: app_id || 'tg_personalities' }),
            price: 75, // Telegram Stars
            currency: 'XTR'
        });

        res.json({ success: true, invoiceLink });
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/tg/webhook
 * Handles Telegram bot updates: payments and inline queries.
 */
router.post('/webhook', async (req, res) => {
    try {
        // Verify webhook secret if configured
        const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
        if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
            return res.sendStatus(403);
        }

        const update = req.body;

        // Pre-checkout query — must answer within 10 seconds
        if (update.pre_checkout_query) {
            await telegramService.answerPreCheckoutQuery(update.pre_checkout_query.id, true);
            return res.sendStatus(200);
        }

        // Successful payment
        if (update.message?.successful_payment) {
            const payment = update.message.successful_payment;
            const payload = JSON.parse(payment.invoice_payload);
            const tgUserId = payload.tg_user_id || String(update.message.from.id);
            const appId = payload.app_id || 'tg_personalities';
            const productId = payload.product_id || 'mbti_premium';

            // Create/update user
            await db.createOrUpdateTelegramUser({
                tg_id: tgUserId,
                app_id: appId,
                first_name: update.message.from.first_name || '',
                last_name: update.message.from.last_name || '',
                username: update.message.from.username || ''
            });

            // Record purchase
            await db.recordPurchase({
                vk_order_id: `tg_stars_${Date.now()}_${tgUserId}`,
                vk_user_id: `tg_${tgUserId}`,
                app_id: appId,
                item_id: productId,
                price: payment.total_amount,
                status: 'completed',
                notification_type: 'telegram_stars',
                payment_source: 'telegram_stars'
            });

            console.log(`Premium activated for TG user ${tgUserId}`);
            return res.sendStatus(200);
        }

        // Inline query
        if (update.inline_query) {
            const query = update.inline_query;
            const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'PersonaDevBot';

            await telegramService.answerInlineQuery(query.id, [{
                type: 'article',
                id: `personality_${Date.now()}`,
                title: '🧠 Personality Quiz',
                description: query.query || 'Take the MBTI personality quiz!',
                input_message_content: {
                    message_text: query.query
                        ? `${query.query}\n\nTake the quiz: https://t.me/${botUsername}`
                        : `🧠 Take the MBTI personality quiz!\n\nhttps://t.me/${botUsername}`
                },
                reply_markup: {
                    inline_keyboard: [[{
                        text: '🧠 Take the Quiz',
                        url: `https://t.me/${botUsername}`
                    }]]
                }
            }]);

            return res.sendStatus(200);
        }

        // Unhandled update type
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(200); // Always return 200 to Telegram
    }
});

module.exports = router;
```

- [ ] **Step 2: Mount routes in server.js**

In `server.js`, after existing route mounts, add:
```js
// Telegram routes
const telegramRoutes = require('./routes/telegram');
app.use('/api/tg', telegramRoutes);
```

- [ ] **Step 3: Update `/api/check-purchase` to handle `tg_` prefixed user_id**

Find the check-purchase endpoint in `server.js`. Add logic to detect `tg_` prefix:
```js
// In the check-purchase handler, before the DB query:
let userId = req.query.user_id;
let appId = req.query.app_id;

// Check if this is a Telegram user
if (userId && userId.startsWith('tg_')) {
    const tgId = userId.replace('tg_', '');
    const purchases = await db.getPurchasesByTgUser(tgId, appId);
    const hasPurchased = purchases.some(p => p.item_id === req.query.item_id && p.status === 'completed');
    return res.json({ success: true, hasPurchased });
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/nikitaf/development/projects/goodsv2 && git add routes/telegram.js server.js && git commit -m "feat: add Telegram webhook, invoice, and inline query routes"
```

---

## Chunk 7: Smoke Test + Final Verification

### Task 18: Manual smoke test checklist

- [ ] **Step 1: Start dev server**

```bash
cd /Users/nikitaf/development/projects/personalities && npm run dev
```

- [ ] **Step 2: Test web flavor (default)**

Open `http://localhost:3001/`. Verify:
- Sidebar is visible
- No console errors
- Price shows "280 ₽"
- Premium modal shows "280 ₽" button

- [ ] **Step 3: Test VK flavor**

Open `http://localhost:3001/?flavor=vk`. Verify:
- Sidebar is hidden
- `data-flavor="vk"` on `#app`
- No console errors
- VK Bridge manager initialized (check `window.vkBridgeManager`)

- [ ] **Step 4: Test Telegram flavor**

Open `http://localhost:3001/?flavor=tg`. Verify:
- Sidebar is hidden
- `data-flavor="tg"` on `#app`
- No console errors related to Telegram flavor
- TG styles applied (safe area padding)
- `window.tgBridgeManager` exists
- Price shows "⭐ 75 Stars"
- Premium modal opens and shows "Открыть Премиум" button

- [ ] **Step 5: Commit final adjustments if needed**

```bash
git add -A && git commit -m "fix: smoke test adjustments for Telegram flavor"
```

---

### Task 19: Create Telegram Bot (manual)

This task requires manual interaction with @BotFather on Telegram.

- [ ] **Step 1: Create bot via @BotFather**

1. Open @BotFather in Telegram
2. Send `/newbot`
3. Set name: `PersonaDev` (or your preferred name)
4. Set username: `PersonaDevBot` (must end in `Bot`)
5. Copy the bot token

- [ ] **Step 2: Configure bot**

1. `/setinline` — enable inline mode for the bot
2. `/setmenubutton` — set the menu button URL to `https://nikmobdev.ru/personadev/?flavor=tg`
3. `/mybots` → Bot Settings → Payments → enable Telegram Stars

- [ ] **Step 3: Set environment variables on backend**

Add to `goodsv2/.env`:
```
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_BOT_USERNAME=PersonaDevBot
TELEGRAM_WEBHOOK_SECRET=<generate_a_random_string>
```

- [ ] **Step 4: Set webhook**

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nikmobdev.ru/goodsshop/api/tg/webhook", "secret_token": "<SECRET>"}'
```

- [ ] **Step 5: Update TGConfig.js with actual bot username**

If the bot username differs from `PersonaDevBot`, update `TGConfig.js`:
```js
static BOT_USERNAME = 'ActualBotUsername';
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/tg/config/TGConfig.js
git commit -m "chore: update TGConfig with actual bot username"
```
