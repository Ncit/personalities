# Tauri v2 Mobile Flavor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing Vite personality quiz app in Tauri v2 for Android with a new `mobile` flavor, RuStore Pay SDK for payments, and VK ID OAuth for user identity.

**Architecture:** New `mobile` flavor detected via `window.__TAURI__`. Two Tauri Kotlin plugins handle native Android APIs (RuStore Pay SDK + VK ID OAuth). Web app gets a new `MobileBridgeManager` following the existing TG bridge pattern. JS communicates with native layer via `window.__TAURI__.invoke()`.

**Tech Stack:** Tauri v2, Rust, Kotlin, RuStore Pay SDK, VK ID SDK, Vite (existing)

**Spec:** `docs/superpowers/specs/2026-03-14-tauri-mobile-flavor-design.md`

---

## File Structure

### New files to create

```
src-tauri/
├── Cargo.toml                          # Tauri app + plugin deps
├── tauri.conf.json                     # App config, identifier, build paths
├── build.rs                            # Tauri build script (generated)
├── src/
│   ├── main.rs                         # Android entry point
│   └── lib.rs                          # Plugin registration, command routing
├── plugins/
│   ├── tauri-plugin-rustore-pay/
│   │   ├── Cargo.toml
│   │   ├── src/lib.rs                  # Rust commands: get_products, purchase_product, get_purchases, confirm_purchase
│   │   ├── android/
│   │   │   ├── build.gradle.kts        # RuStore Pay SDK dependency
│   │   │   └── src/main/kotlin/ru/nikmobdev/personadev/rustore/
│   │   │       └── RuStorePayPlugin.kt # Kotlin plugin wrapping RuStore Pay SDK
│   │   └── build.rs
│   └── tauri-plugin-vk-auth/
│       ├── Cargo.toml
│       ├── src/lib.rs                  # Rust commands: start_vk_auth, get_vk_user
│       ├── android/
│       │   ├── build.gradle.kts
│       │   └── src/main/kotlin/ru/nikmobdev/personadev/vkauth/
│       │       └── VkAuthPlugin.kt     # Kotlin plugin for VK ID OAuth + deep link
│       └── build.rs

src/modules/mobile/
├── MobileBridgeManager.js              # Bridge manager (follows TG pattern)
├── config/
│   └── MobileConfig.js                 # Feature flags, product IDs, endpoints
└── services/
    ├── MobilePaymentService.js         # Calls Tauri commands for RuStore billing
    └── MobileUserService.js            # VK ID OAuth via Tauri commands
```

### Existing files to modify

```
src/modules/platform/PlatformDetector.js  # Add 'mobile' flavor detection + isMobile()
script.js                                  # Add mobile import, init branch, auth/premium/pricing
src/locales/en.js                          # Add mobile-specific locale keys
src/locales/ru.js                          # Add mobile-specific locale keys
vite.config.js                             # Exclude src-tauri from build
```

---

## Chunk 1: Tauri Project Scaffold

### Task 1: Install prerequisites and initialize Tauri

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`

- [ ] **Step 1: Install Tauri CLI**

```bash
cargo install tauri-cli@^2
```

Expected: `tauri-cli` binary available as `cargo tauri`

- [ ] **Step 2: Initialize Tauri in the project**

Run from project root:

```bash
cargo tauri init
```

When prompted:
- App name: `PersonaDev`
- Window title: `PersonaDev`
- Dev server URL: `http://localhost:3001`
- Frontend dist: `../dist`
- Frontend dev command: `npm run dev`
- Frontend build command: `npm run build`

Expected: `src-tauri/` directory created with Cargo.toml, tauri.conf.json, build.rs, src/main.rs, src/lib.rs

- [ ] **Step 3: Update tauri.conf.json with app config**

Edit `src-tauri/tauri.conf.json` to set:

```json
{
  "productName": "PersonaDev",
  "identifier": "ru.nikmobdev.personadev",
  "build": {
    "devUrl": "http://localhost:3001",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": true,
    "windows": [
      {
        "title": "PersonaDev",
        "fullscreen": false,
        "resizable": true,
        "width": 400,
        "height": 800
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 4: Initialize Android target**

```bash
cargo tauri android init
```

Expected: `src-tauri/gen/android/` directory created with Android project structure

- [ ] **Step 5: Verify Tauri builds the web app**

```bash
npm run build && cargo tauri android build --debug
```

Expected: Debug APK generated at `src-tauri/gen/android/app/build/outputs/apk/`

- [ ] **Step 6: Commit scaffold**

```bash
git add src-tauri/
git commit -m "feat: initialize Tauri v2 project for Android"
```

---

### Task 2: Add mobile flavor detection to PlatformDetector

**Files:**
- Modify: `src/modules/platform/PlatformDetector.js`

- [ ] **Step 1: Add mobile detection before VK Bridge check**

In `src/modules/platform/PlatformDetector.js`, add after the `?flavor=vk` check (after line 39) and before the VK Bridge check (line 42):

```js
        // 3.5 Explicit ?flavor=mobile (dev/testing)
        if (params.get('flavor') === 'mobile') {
            this._flavor = 'mobile';
            return this._flavor;
        }

        // 3.6 Tauri runtime detected
        if (window.__TAURI__) {
            this._flavor = 'mobile';
            return this._flavor;
        }
```

- [ ] **Step 2: Add isMobile() convenience method**

After the `isVK()` method (line 70), add:

```js
    /** Convenience: true when flavor is 'mobile'. */
    static isMobile() {
        return this.getFlavor() === 'mobile';
    }
```

- [ ] **Step 3: Verify detection works in browser**

Open `http://localhost:3001/?flavor=mobile` — the app should load without errors. Check console: `PlatformDetector.getFlavor()` should return `'mobile'`.

- [ ] **Step 4: Commit**

```bash
git add src/modules/platform/PlatformDetector.js
git commit -m "feat: add mobile flavor detection to PlatformDetector"
```

---

## Chunk 2: Mobile Web Modules (Config, Services, Bridge Manager)

### Task 3: Create MobileConfig

**Files:**
- Create: `src/modules/mobile/config/MobileConfig.js`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/modules/mobile/config src/modules/mobile/services
```

- [ ] **Step 2: Write MobileConfig.js**

Create `src/modules/mobile/config/MobileConfig.js`:

```js
export class MobileConfig {
    // App identifiers
    static APP_ID = 'ru.nikmobdev.personadev';
    static DEEP_LINK_SCHEME = 'personadev';

    // RuStore product IDs
    static PRODUCTS = {
        premium: 'premium'
    };

    // Feature flags
    static FEATURES = {
        analytics: true,
        payment: true,
        sharing: true,
        ads: false,
        haptics: false,
    };

    // Storage keys
    static STORAGE_KEYS = {
        premium: 'mobile_premium',
        vkUser: 'mobile_vk_user',
        vkToken: 'mobile_vk_token',
    };

    // Timeouts (ms)
    static TIMEOUTS = {
        purchase: 120000,
        auth: 60000,
    };

    static isFeatureEnabled(feature) {
        return this.FEATURES[feature] ?? false;
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/mobile/config/MobileConfig.js
git commit -m "feat: add MobileConfig with feature flags and product IDs"
```

---

### Task 4: Create MobileUserService

**Files:**
- Create: `src/modules/mobile/services/MobileUserService.js`

- [ ] **Step 1: Write MobileUserService.js**

Create `src/modules/mobile/services/MobileUserService.js`:

```js
import { MobileConfig } from '../config/MobileConfig.js';
import { LoggerManager } from '../../core/LoggerManager.js';

export class MobileUserService {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('MobileUserService');
        this._userInfo = null;
        this._loadFromStorage();
    }

    _loadFromStorage() {
        try {
            const stored = localStorage.getItem(MobileConfig.STORAGE_KEYS.vkUser);
            if (stored) {
                this._userInfo = JSON.parse(stored);
            }
        } catch (e) {
            this.logger.warn('Failed to load VK user from storage:', e);
        }
    }

    _saveToStorage() {
        try {
            if (this._userInfo) {
                localStorage.setItem(
                    MobileConfig.STORAGE_KEYS.vkUser,
                    JSON.stringify(this._userInfo)
                );
            }
        } catch (e) {
            this.logger.warn('Failed to save VK user to storage:', e);
        }
    }

    isAuthenticated() {
        return this._userInfo !== null;
    }

    getUserInfo() {
        return this._userInfo;
    }

    getUserName() {
        if (!this._userInfo) return null;
        return `${this._userInfo.first_name || ''} ${this._userInfo.last_name || ''}`.trim();
    }

    getUserId() {
        return this._userInfo?.id || null;
    }

    /**
     * Start VK ID OAuth flow via Tauri plugin.
     * Opens system browser, waits for deep link callback.
     * Returns user info on success.
     */
    async authenticate() {
        if (!window.__TAURI__) {
            throw new Error('Tauri runtime not available');
        }

        try {
            this.logger.log('Starting VK auth flow...');
            await window.__TAURI__.invoke('start_vk_auth');

            // The Kotlin plugin handles the deep link callback and
            // resolves the auth. We listen for the event.
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('VK auth timeout'));
                }, MobileConfig.TIMEOUTS.auth);

                // Listen for auth result from Tauri plugin event
                const unlisten = window.__TAURI__.event.listen('vk-auth-result', (event) => {
                    clearTimeout(timeout);
                    unlisten.then(fn => fn());

                    if (event.payload.success) {
                        this._userInfo = event.payload.user;
                        this._saveToStorage();
                        this.logger.log('VK auth successful:', this._userInfo.id);
                        resolve(this._userInfo);
                    } else {
                        reject(new Error(event.payload.error || 'VK auth failed'));
                    }
                });
            });
        } catch (error) {
            this.logger.error('VK auth failed:', error);
            throw error;
        }
    }

    logout() {
        this._userInfo = null;
        localStorage.removeItem(MobileConfig.STORAGE_KEYS.vkUser);
        localStorage.removeItem(MobileConfig.STORAGE_KEYS.vkToken);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/mobile/services/MobileUserService.js
git commit -m "feat: add MobileUserService for VK ID OAuth"
```

---

### Task 5: Create MobilePaymentService

**Files:**
- Create: `src/modules/mobile/services/MobilePaymentService.js`

- [ ] **Step 1: Write MobilePaymentService.js**

Create `src/modules/mobile/services/MobilePaymentService.js`:

```js
import { MobileConfig } from '../config/MobileConfig.js';
import { LoggerManager } from '../../core/LoggerManager.js';

export class MobilePaymentService {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('MobilePaymentService');
    }

    /**
     * Check for existing purchases on app start.
     * Restores premium if a confirmed purchase exists in RuStore.
     */
    async restorePurchases() {
        if (!window.__TAURI__) {
            this.logger.warn('Tauri runtime not available, skipping purchase restore');
            return;
        }

        try {
            const purchases = await window.__TAURI__.invoke('get_purchases');
            const premium = purchases.find(
                p => p.productId === MobileConfig.PRODUCTS.premium && p.state === 'CONFIRMED'
            );
            if (premium) {
                localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
                this.logger.log('Premium restored from RuStore purchases');
            }
        } catch (error) {
            this.logger.warn('Failed to restore purchases:', error);
        }
    }

    /**
     * Get product info from RuStore (price, title, etc.)
     */
    async getProductInfo() {
        if (!window.__TAURI__) return null;

        try {
            const products = await window.__TAURI__.invoke('get_products');
            return products.find(p => p.productId === MobileConfig.PRODUCTS.premium) || null;
        } catch (error) {
            this.logger.warn('Failed to get products:', error);
            return null;
        }
    }

    /**
     * Purchase premium via RuStore Pay SDK.
     * Returns { success: boolean, purchaseId?: string, error?: string }
     */
    async purchasePremium() {
        if (!window.__TAURI__) {
            return { success: false, error: 'Tauri runtime not available' };
        }

        try {
            this.logger.log('Starting RuStore purchase...');
            const result = await window.__TAURI__.invoke('purchase_product', {
                productId: MobileConfig.PRODUCTS.premium
            });

            if (result.success) {
                // Confirm the purchase with RuStore
                await window.__TAURI__.invoke('confirm_purchase', {
                    purchaseId: result.purchaseId
                });
                localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
                this.logger.log('Premium purchased and confirmed:', result.purchaseId);
            }

            return result;
        } catch (error) {
            this.logger.error('Purchase failed:', error);
            return { success: false, error: error.message || 'Purchase failed' };
        }
    }

    /**
     * Check if premium is active (localStorage check).
     */
    isPremium() {
        return localStorage.getItem(MobileConfig.STORAGE_KEYS.premium) === 'true';
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/mobile/services/MobilePaymentService.js
git commit -m "feat: add MobilePaymentService for RuStore billing"
```

---

### Task 6: Create MobileBridgeManager

**Files:**
- Create: `src/modules/mobile/MobileBridgeManager.js`

- [ ] **Step 1: Write MobileBridgeManager.js**

Create `src/modules/mobile/MobileBridgeManager.js`:

```js
import { MobilePaymentService } from './services/MobilePaymentService.js';
import { MobileUserService } from './services/MobileUserService.js';
import { MobileConfig } from './config/MobileConfig.js';
import { PlatformDetector } from '../platform/PlatformDetector.js';
import { LoggerManager } from '../core/LoggerManager.js';
import localizationManager from '../../locales/LocalizationManager.js';

export class MobileBridgeManager {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('MobileBridgeManager');
        this.paymentService = new MobilePaymentService();
        this.userService = new MobileUserService();
        this.isMobilePlatform = false;
    }

    async init() {
        try {
            if (!window.__TAURI__) {
                this.logger.warn('Tauri runtime not available');
                return;
            }

            this.isMobilePlatform = true;
            PlatformDetector.setManager(this);

            // Set locale from device language
            const lang = navigator.language?.startsWith('ru') ? 'ru' : 'en';
            localizationManager.setLocale(lang);
            this.logger.log('Locale set to:', lang);

            // Restore purchases (non-blocking)
            this.paymentService.restorePurchases().catch(err => {
                this.logger.warn('Purchase restore failed:', err);
            });

            this.logger.log('MobileBridgeManager initialized');
        } catch (error) {
            this.logger.error('MobileBridgeManager init failed:', error);
        }
    }

    isMobileEnvironment() {
        return this.isMobilePlatform;
    }

    // Cross-compat methods (match TG/VK bridge interface)
    isTGEnvironment() { return false; }
    isVKEnvironment() { return false; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/mobile/MobileBridgeManager.js
git commit -m "feat: add MobileBridgeManager following TG bridge pattern"
```

---

## Chunk 3: Wire Mobile Flavor into script.js

### Task 7: Add mobile flavor to script.js initialization

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add MobileBridgeManager import**

At the top of `script.js`, after the TGBridgeManager import (line ~17), add:

```js
import { MobileBridgeManager } from './src/modules/mobile/MobileBridgeManager.js';
```

- [ ] **Step 2: Add mobile initialization branch**

In the initialization section (~line 3250), after `const flavor = PlatformDetector.getFlavor();` and the web locale init, add a mobile branch before the TG check:

```js
if (flavor === 'mobile') {
    try {
        const mobileManager = new MobileBridgeManager();
        window.mobileBridgeManager = mobileManager;
        await mobileManager.init();
        logger.log('Mobile Bridge Manager initialized');
    } catch (error) {
        logger.error('Mobile Bridge Manager init failed:', error);
        window.mobileBridgeManager = null;
    }
} else if (flavor === 'tg') {
```

(Change the existing `if (flavor === 'tg')` to `else if`)

- [ ] **Step 3: Add mobile auth check to isUserAuthenticated()**

In the `isUserAuthenticated()` function (~line 201), add a mobile branch:

```js
function isUserAuthenticated() {
    const flavor = PlatformDetector.getFlavor();

    if (flavor === 'mobile') {
        return window.mobileBridgeManager?.userService?.isAuthenticated() ?? false;
    } else if (flavor === 'vk') {
        return vkBridgeManager && vkBridgeManager.isVKEnvironment();
    } else if (flavor === 'tg') {
        return window.tgBridgeManager && window.tgBridgeManager.isTGEnvironment();
    } else {
        return window.userInfo && window.userInfo.authorized;
    }
}
```

- [ ] **Step 4: Add mobile premium check to isPremium()**

In the `isPremium()` function (~line 1738), add at the top:

```js
function isPremium() {
    // Mobile: check RuStore purchase status
    if (PlatformDetector.isMobile()) {
        return localStorage.getItem('mobile_premium') === 'true';
    }

    // Check if VK bridge manager is available...
    // (rest of existing code)
```

- [ ] **Step 5: Add mobile pricing to updatePricing()**

In `updatePricing()` (~line 243), add mobile price:

```js
function updatePricing() {
    const flavor = PlatformDetector.getFlavor();

    const webPrice = localizationManager.get('pricing.rubles', { count: 280 });
    const vkPrice = localizationManager.get('pricing.votes', { count: 40 });
    const tgPrice = '⭐ 75 Stars';
    const mobilePrice = localizationManager.get('premium.buttonMobile');

    const price = flavor === 'mobile' ? mobilePrice
        : flavor === 'vk' ? vkPrice
        : flavor === 'tg' ? tgPrice
        : webPrice;
    // ... rest unchanged
```

- [ ] **Step 6: Verify web build still works**

```bash
npm run build
```

Expected: Build succeeds without errors.

- [ ] **Step 7: Commit**

```bash
git add script.js
git commit -m "feat: wire mobile flavor into script.js init, auth, premium, and pricing"
```

---

### Task 8: Add mobile locale keys

**Files:**
- Modify: `src/locales/en.js`
- Modify: `src/locales/ru.js`

- [ ] **Step 1: Add keys to en.js**

In the `premium` section of `src/locales/en.js`, add:

```js
    buttonMobile: 'Get Premium',
    priceMobile: '',  // Dynamic from RuStore
```

In the `auth` section, add:

```js
    loginVkMobile: 'Sign in with VK',
    loginVkMobileDesc: 'Required for purchase',
```

- [ ] **Step 2: Add keys to ru.js**

In the `premium` section of `src/locales/ru.js`, add:

```js
    buttonMobile: 'Получить Премиум',
    priceMobile: '',
```

In the `auth` section, add:

```js
    loginVkMobile: 'Войти через VK',
    loginVkMobileDesc: 'Необходимо для покупки',
```

- [ ] **Step 3: Commit**

```bash
git add src/locales/en.js src/locales/ru.js
git commit -m "feat: add mobile-specific locale keys for premium and auth"
```

---

## Chunk 4: Tauri RuStore Pay Plugin

### Task 9: Create tauri-plugin-rustore-pay Rust side

**Files:**
- Create: `src-tauri/plugins/tauri-plugin-rustore-pay/Cargo.toml`
- Create: `src-tauri/plugins/tauri-plugin-rustore-pay/src/lib.rs`
- Create: `src-tauri/plugins/tauri-plugin-rustore-pay/build.rs`

- [ ] **Step 1: Create plugin directory**

```bash
mkdir -p src-tauri/plugins/tauri-plugin-rustore-pay/src
mkdir -p src-tauri/plugins/tauri-plugin-rustore-pay/android/src/main/kotlin/ru/nikmobdev/personadev/rustore
```

- [ ] **Step 2: Write Cargo.toml**

Create `src-tauri/plugins/tauri-plugin-rustore-pay/Cargo.toml`:

```toml
[package]
name = "tauri-plugin-rustore-pay"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["wry"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
log = "0.4"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[lib]
name = "tauri_plugin_rustore_pay"
crate-type = ["lib", "cdylib", "staticlib"]
```

- [ ] **Step 3: Write build.rs**

Create `src-tauri/plugins/tauri-plugin-rustore-pay/build.rs`:

```rust
const COMMANDS: &[&str] = &["get_products", "purchase_product", "get_purchases", "confirm_purchase"];

fn main() {
    tauri_build::mobile::PluginBuilder::new()
        .android_path("android")
        .commands(COMMANDS)
        .build();
}
```

- [ ] **Step 4: Write src/lib.rs**

Create `src-tauri/plugins/tauri-plugin-rustore-pay/src/lib.rs`:

```rust
use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub product_id: String,
    pub title: String,
    pub price: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PurchaseResult {
    pub success: bool,
    pub purchase_id: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Purchase {
    pub product_id: String,
    pub purchase_id: String,
    pub state: String,
}

#[cfg(target_os = "android")]
mod mobile {
    use super::*;
    use tauri::plugin::PluginHandle;

    pub fn get_products<R: Runtime>(handle: &PluginHandle<R>) -> Result<Vec<Product>, String> {
        handle
            .run_mobile_plugin("getProducts", ())
            .map_err(|e| e.to_string())
    }

    pub fn purchase_product<R: Runtime>(
        handle: &PluginHandle<R>,
        product_id: String,
    ) -> Result<PurchaseResult, String> {
        handle
            .run_mobile_plugin("purchaseProduct", serde_json::json!({ "productId": product_id }))
            .map_err(|e| e.to_string())
    }

    pub fn get_purchases<R: Runtime>(handle: &PluginHandle<R>) -> Result<Vec<Purchase>, String> {
        handle
            .run_mobile_plugin("getPurchases", ())
            .map_err(|e| e.to_string())
    }

    pub fn confirm_purchase<R: Runtime>(
        handle: &PluginHandle<R>,
        purchase_id: String,
    ) -> Result<(), String> {
        handle
            .run_mobile_plugin("confirmPurchase", serde_json::json!({ "purchaseId": purchase_id }))
            .map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn get_products<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<Product>, String> {
    #[cfg(target_os = "android")]
    {
        let handle = app.plugin_handle::<R>("rustore-pay").map_err(|e| e.to_string())?;
        mobile::get_products(&handle)
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Ok(vec![Product {
            product_id: "premium".to_string(),
            title: "Premium".to_string(),
            price: "150 ₽".to_string(),
        }])
    }
}

#[tauri::command]
async fn purchase_product<R: Runtime>(
    app: tauri::AppHandle<R>,
    product_id: String,
) -> Result<PurchaseResult, String> {
    #[cfg(target_os = "android")]
    {
        let handle = app.plugin_handle::<R>("rustore-pay").map_err(|e| e.to_string())?;
        mobile::purchase_product(&handle, product_id)
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (app, product_id);
        Ok(PurchaseResult {
            success: true,
            purchase_id: Some("mock-purchase-id".to_string()),
            error: None,
        })
    }
}

#[tauri::command]
async fn get_purchases<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<Purchase>, String> {
    #[cfg(target_os = "android")]
    {
        let handle = app.plugin_handle::<R>("rustore-pay").map_err(|e| e.to_string())?;
        mobile::get_purchases(&handle)
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Ok(vec![])
    }
}

#[tauri::command]
async fn confirm_purchase<R: Runtime>(
    app: tauri::AppHandle<R>,
    purchase_id: String,
) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let handle = app.plugin_handle::<R>("rustore-pay").map_err(|e| e.to_string())?;
        mobile::confirm_purchase(&handle, purchase_id)
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (app, purchase_id);
        Ok(())
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("rustore-pay")
        .invoke_handler(tauri::generate_handler![
            get_products,
            purchase_product,
            get_purchases,
            confirm_purchase,
        ])
        .build()
}
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/plugins/tauri-plugin-rustore-pay/
git commit -m "feat: add tauri-plugin-rustore-pay Rust scaffolding"
```

---

### Task 10: Create RuStore Pay Kotlin plugin

**Files:**
- Create: `src-tauri/plugins/tauri-plugin-rustore-pay/android/build.gradle.kts`
- Create: `src-tauri/plugins/tauri-plugin-rustore-pay/android/src/main/kotlin/ru/nikmobdev/personadev/rustore/RuStorePayPlugin.kt`

- [ ] **Step 1: Write build.gradle.kts**

Create `src-tauri/plugins/tauri-plugin-rustore-pay/android/build.gradle.kts`:

```kotlin
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ru.nikmobdev.personadev.rustore"
    compileSdk = 34

    defaultConfig {
        minSdk = 24
        targetSdk = 34
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("ru.rustore.sdk:pay:latest")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

- [ ] **Step 2: Write RuStorePayPlugin.kt**

Create `src-tauri/plugins/tauri-plugin-rustore-pay/android/src/main/kotlin/ru/nikmobdev/personadev/rustore/RuStorePayPlugin.kt`:

```kotlin
package ru.nikmobdev.personadev.rustore

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import ru.rustore.sdk.pay.RuStorePay
import ru.rustore.sdk.pay.model.PaymentResult

@InvokeArg
internal class PurchaseArgs {
    lateinit var productId: String
}

@InvokeArg
internal class ConfirmArgs {
    lateinit var purchaseId: String
}

@TauriPlugin
class RuStorePayPlugin(private val activity: Activity) : Plugin(activity) {

    override fun load(webView: android.webkit.WebView) {
        super.load(webView)
        // Initialize RuStore Pay SDK
        RuStorePay.init(
            application = activity.application,
            consoleApplicationId = "ru.nikmobdev.personadev",
            deeplinkScheme = "personadev"
        )
    }

    @Command
    fun getProducts(invoke: Invoke) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val products = RuStorePay.getProducts(listOf("premium"))
                val result = products.map { product ->
                    mapOf(
                        "productId" to product.productId,
                        "title" to product.title,
                        "price" to product.price
                    )
                }
                invoke.resolve(result)
            } catch (e: Exception) {
                invoke.reject(e.message ?: "Failed to get products")
            }
        }
    }

    @Command
    fun purchaseProduct(invoke: Invoke) {
        val args = invoke.parseArgs(PurchaseArgs::class.java)
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = RuStorePay.purchaseOneStep(
                    productId = args.productId,
                    quantity = 1
                )
                when (result) {
                    is PaymentResult.Success -> {
                        invoke.resolve(mapOf(
                            "success" to true,
                            "purchaseId" to result.purchaseId
                        ))
                    }
                    is PaymentResult.Cancelled -> {
                        invoke.resolve(mapOf(
                            "success" to false,
                            "error" to "cancelled"
                        ))
                    }
                    is PaymentResult.Failure -> {
                        invoke.resolve(mapOf(
                            "success" to false,
                            "error" to (result.errorMessage ?: "Payment failed")
                        ))
                    }
                    else -> {
                        invoke.resolve(mapOf(
                            "success" to false,
                            "error" to "Unknown payment result"
                        ))
                    }
                }
            } catch (e: Exception) {
                invoke.resolve(mapOf(
                    "success" to false,
                    "error" to (e.message ?: "Purchase failed")
                ))
            }
        }
    }

    @Command
    fun getPurchases(invoke: Invoke) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val purchases = RuStorePay.getPurchases()
                val result = purchases.map { purchase ->
                    mapOf(
                        "productId" to purchase.productId,
                        "purchaseId" to purchase.purchaseId,
                        "state" to purchase.purchaseState.name
                    )
                }
                invoke.resolve(result)
            } catch (e: Exception) {
                invoke.reject(e.message ?: "Failed to get purchases")
            }
        }
    }

    @Command
    fun confirmPurchase(invoke: Invoke) {
        val args = invoke.parseArgs(ConfirmArgs::class.java)
        CoroutineScope(Dispatchers.IO).launch {
            try {
                RuStorePay.confirmPurchase(args.purchaseId)
                invoke.resolve(mapOf("success" to true))
            } catch (e: Exception) {
                invoke.reject(e.message ?: "Failed to confirm purchase")
            }
        }
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/plugins/tauri-plugin-rustore-pay/android/
git commit -m "feat: add RuStore Pay Kotlin plugin with purchase flow"
```

---

## Chunk 5: Tauri VK Auth Plugin

### Task 11: Create tauri-plugin-vk-auth Rust side

**Files:**
- Create: `src-tauri/plugins/tauri-plugin-vk-auth/Cargo.toml`
- Create: `src-tauri/plugins/tauri-plugin-vk-auth/src/lib.rs`
- Create: `src-tauri/plugins/tauri-plugin-vk-auth/build.rs`

- [ ] **Step 1: Create plugin directory**

```bash
mkdir -p src-tauri/plugins/tauri-plugin-vk-auth/src
mkdir -p src-tauri/plugins/tauri-plugin-vk-auth/android/src/main/kotlin/ru/nikmobdev/personadev/vkauth
```

- [ ] **Step 2: Write Cargo.toml**

Create `src-tauri/plugins/tauri-plugin-vk-auth/Cargo.toml`:

```toml
[package]
name = "tauri-plugin-vk-auth"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["wry"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
log = "0.4"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[lib]
name = "tauri_plugin_vk_auth"
crate-type = ["lib", "cdylib", "staticlib"]
```

- [ ] **Step 3: Write build.rs**

Create `src-tauri/plugins/tauri-plugin-vk-auth/build.rs`:

```rust
const COMMANDS: &[&str] = &["start_vk_auth", "get_vk_user"];

fn main() {
    tauri_build::mobile::PluginBuilder::new()
        .android_path("android")
        .commands(COMMANDS)
        .build();
}
```

- [ ] **Step 4: Write src/lib.rs**

Create `src-tauri/plugins/tauri-plugin-vk-auth/src/lib.rs`:

```rust
use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VkUser {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub photo_url: Option<String>,
}

#[cfg(target_os = "android")]
mod mobile {
    use super::*;
    use tauri::plugin::PluginHandle;

    pub fn start_vk_auth<R: Runtime>(handle: &PluginHandle<R>) -> Result<(), String> {
        handle
            .run_mobile_plugin::<()>("startVkAuth", ())
            .map_err(|e| e.to_string())
    }

    pub fn get_vk_user<R: Runtime>(handle: &PluginHandle<R>) -> Result<Option<VkUser>, String> {
        handle
            .run_mobile_plugin("getVkUser", ())
            .map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn start_vk_auth<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let handle = app.plugin_handle::<R>("vk-auth").map_err(|e| e.to_string())?;
        mobile::start_vk_auth(&handle)
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Ok(())
    }
}

#[tauri::command]
async fn get_vk_user<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Option<VkUser>, String> {
    #[cfg(target_os = "android")]
    {
        let handle = app.plugin_handle::<R>("vk-auth").map_err(|e| e.to_string())?;
        mobile::get_vk_user(&handle)
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Ok(None)
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("vk-auth")
        .invoke_handler(tauri::generate_handler![start_vk_auth, get_vk_user])
        .build()
}
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/plugins/tauri-plugin-vk-auth/
git commit -m "feat: add tauri-plugin-vk-auth Rust scaffolding"
```

---

### Task 12: Create VK Auth Kotlin plugin

**Files:**
- Create: `src-tauri/plugins/tauri-plugin-vk-auth/android/build.gradle.kts`
- Create: `src-tauri/plugins/tauri-plugin-vk-auth/android/src/main/kotlin/ru/nikmobdev/personadev/vkauth/VkAuthPlugin.kt`

- [ ] **Step 1: Write build.gradle.kts**

Create `src-tauri/plugins/tauri-plugin-vk-auth/android/build.gradle.kts`:

```kotlin
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ru.nikmobdev.personadev.vkauth"
    compileSdk = 34

    defaultConfig {
        minSdk = 24
        targetSdk = 34
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

- [ ] **Step 2: Write VkAuthPlugin.kt**

Create `src-tauri/plugins/tauri-plugin-vk-auth/android/src/main/kotlin/ru/nikmobdev/personadev/vkauth/VkAuthPlugin.kt`:

```kotlin
package ru.nikmobdev.personadev.vkauth

import android.app.Activity
import android.content.Intent
import android.net.Uri
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL

@TauriPlugin
class VkAuthPlugin(private val activity: Activity) : Plugin(activity) {

    private var cachedUser: Map<String, Any?>? = null
    private var pendingAuthInvoke: Invoke? = null

    companion object {
        // TODO: Replace with actual VK App ID
        private const val VK_APP_ID = "YOUR_VK_APP_ID"
        private const val REDIRECT_URI = "personadev://auth"
        private const val VK_AUTH_URL = "https://id.vk.com/authorize"
    }

    @Command
    fun startVkAuth(invoke: Invoke) {
        val authUrl = "$VK_AUTH_URL?" +
            "client_id=$VK_APP_ID" +
            "&redirect_uri=$REDIRECT_URI" +
            "&response_type=code" +
            "&scope=email" +
            "&state=vk_auth"

        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(authUrl))
            activity.startActivity(intent)
            invoke.resolve(mapOf("started" to true))
        } catch (e: Exception) {
            invoke.reject("Failed to open VK auth: ${e.message}")
        }
    }

    @Command
    fun getVkUser(invoke: Invoke) {
        if (cachedUser != null) {
            invoke.resolve(cachedUser)
        } else {
            invoke.resolve(null)
        }
    }

    override fun onNewIntent(intent: Intent) {
        val uri = intent.data ?: return
        if (uri.scheme != "personadev" || uri.host != "auth") return

        val code = uri.getQueryParameter("code") ?: return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Exchange code for token via your backend
                // TODO: Implement token exchange endpoint on your backend
                val tokenUrl = "https://nikmobdev.ru/goodsshop/api/vk/exchange-code?code=$code"
                val connection = URL(tokenUrl).openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                val response = connection.inputStream.bufferedReader().readText()

                // Parse user info from response
                // Expected: { "id": 123, "first_name": "...", "last_name": "...", "photo_url": "..." }
                val json = org.json.JSONObject(response)
                cachedUser = mapOf(
                    "id" to json.getLong("id"),
                    "first_name" to json.getString("first_name"),
                    "last_name" to json.getString("last_name"),
                    "photo_url" to json.optString("photo_url", null)
                )

                // Emit event to JS
                trigger("vk-auth-result", mapOf(
                    "success" to true,
                    "user" to cachedUser
                ))
            } catch (e: Exception) {
                trigger("vk-auth-result", mapOf(
                    "success" to false,
                    "error" to (e.message ?: "Auth failed")
                ))
            }
        }
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/plugins/tauri-plugin-vk-auth/android/
git commit -m "feat: add VK Auth Kotlin plugin with deep link handling"
```

---

## Chunk 6: Register Plugins and Configure Android

### Task 13: Register plugins in Tauri app

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Add plugin dependencies to Cargo.toml**

In `src-tauri/Cargo.toml`, add to `[dependencies]`:

```toml
tauri-plugin-rustore-pay = { path = "plugins/tauri-plugin-rustore-pay" }
tauri-plugin-vk-auth = { path = "plugins/tauri-plugin-vk-auth" }
```

- [ ] **Step 2: Register plugins in lib.rs**

In `src-tauri/src/lib.rs`, register both plugins:

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_rustore_pay::init())
        .plugin(tauri_plugin_vk_auth::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/Cargo.toml src-tauri/src/lib.rs
git commit -m "feat: register RuStore Pay and VK Auth plugins in Tauri app"
```

---

### Task 14: Configure Android deep link and permissions

**Files:**
- Modify: `src-tauri/gen/android/app/src/main/AndroidManifest.xml`

- [ ] **Step 1: Add deep link intent filter**

In the AndroidManifest.xml, inside the main `<activity>` tag, add:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="personadev" android:host="auth" />
</intent-filter>
```

- [ ] **Step 2: Add internet permission (if not present)**

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/gen/android/
git commit -m "feat: configure Android deep link for VK auth and internet permission"
```

---

## Chunk 7: Build and Test

### Task 15: Build and verify on Android

- [ ] **Step 1: Build web frontend**

```bash
npm run build
```

Expected: `dist/` directory created successfully.

- [ ] **Step 2: Build Android debug APK**

```bash
cargo tauri android build --debug
```

Expected: APK at `src-tauri/gen/android/app/build/outputs/apk/universal/release/`

- [ ] **Step 3: Install on device/emulator and test**

```bash
adb install src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

Test checklist:
- App launches in WebView
- `PlatformDetector.getFlavor()` returns `'mobile'` (check console)
- Locale detected from device language
- Quiz flow works end-to-end
- Premium button shows "Get Premium" (not ruble price)

- [ ] **Step 4: Test with ?flavor=mobile in browser (web dev)**

Open `http://localhost:3001/?flavor=mobile` — verify:
- Flavor detected as 'mobile'
- No JS errors in console
- Mobile pricing displayed

- [ ] **Step 5: Build release AAB for RuStore**

```bash
cargo tauri android build --aab
```

Expected: AAB file ready for RuStore upload.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Tauri v2 mobile flavor with RuStore Pay and VK Auth"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Tauri project scaffold | src-tauri/* |
| 2 | PlatformDetector mobile detection | PlatformDetector.js |
| 3 | MobileConfig | MobileConfig.js |
| 4 | MobileUserService (VK OAuth) | MobileUserService.js |
| 5 | MobilePaymentService (RuStore) | MobilePaymentService.js |
| 6 | MobileBridgeManager | MobileBridgeManager.js |
| 7 | Wire into script.js | script.js |
| 8 | Locale keys | en.js, ru.js |
| 9 | RuStore Pay Rust plugin | tauri-plugin-rustore-pay/src/lib.rs |
| 10 | RuStore Pay Kotlin plugin | RuStorePayPlugin.kt |
| 11 | VK Auth Rust plugin | tauri-plugin-vk-auth/src/lib.rs |
| 12 | VK Auth Kotlin plugin | VkAuthPlugin.kt |
| 13 | Register plugins | Cargo.toml, lib.rs |
| 14 | Android manifest config | AndroidManifest.xml |
| 15 | Build and test | - |

### TODOs for later (not in this plan)
- Replace `YOUR_VK_APP_ID` with actual VK app ID
- Implement `/api/vk/exchange-code` backend endpoint
- Set up RuStore Console product (`premium`)
- Generate app signing keystore
- Prepare RuStore listing (screenshots, description, age rating)
- Submit for RuStore review
