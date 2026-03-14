# Tauri v2 Mobile Flavor — Design Spec

**Date:** 2026-03-14
**Status:** Draft
**Goal:** Wrap the existing Vite web app in Tauri v2 for Android, publish to RuStore. New `mobile` flavor with VK ID OAuth (for user identity) and RuStore Pay SDK (for payments).

---

## 1. Architecture Overview

```
┌──────────────────────────────────┐
│   Existing Vite Web App          │
│   (flavor: 'mobile')             │
├──────────────────────────────────┤
│   Tauri v2 WebView (wry)         │
├────────────┬─────────────────────┤
│   Rust     │   Kotlin Plugins    │
│   bridge   │   - RuStore Pay SDK │
│            │   - VK ID OAuth     │
└────────────┴─────────────────────┘
          Android APK → RuStore
```

### Communication Flow

```
JS (window.__TAURI__.invoke)
  → Rust command (src-tauri/src/*.rs)
    → JNI → Kotlin plugin
      → Native SDK (RuStore Pay / VK ID)
        → Result back up the chain → JS callback
```

## 2. Flavor: `mobile`

### Detection

```js
// PlatformDetector.js — add before VK Bridge check
if (window.__TAURI__) {
    this._flavor = 'mobile';
}
```

`window.__TAURI__` is injected automatically by Tauri runtime.

### Feature Matrix

| Feature          | mobile           | tg              | vk              | web             |
|------------------|------------------|-----------------|-----------------|-----------------|
| Detection        | `__TAURI__`      | TG WebApp SDK   | VK Bridge       | default         |
| Auth             | Anonymous + VK ID| TG WebApp       | VK Bridge       | VK OAuth        |
| Payment          | RuStore Pay SDK  | TG Stars/Tochka | VK Pay/Votes    | Tochka          |
| Premium price    | RuStore Console  | 75 Stars/150₽   | 40 votes        | 280₽            |
| Locale           | navigator.language| TG lang_code   | ru              | browser          |
| Sharing          | Android Intent   | TG share        | VK share        | Web Share API   |
| Analytics        | Firebase         | Firebase        | Firebase        | Firebase        |
| Ads              | None             | None            | VK Ads          | None            |

### Auth Behavior

- App opens → user is **anonymous**, can take quizzes freely
- VK ID OAuth only triggered when user taps "Buy Premium"
- After VK auth, user ID stored locally for purchase linking
- VK auth uses system browser redirect (Tauri `shell:open`) → deep link callback

### Auth Flow

```
1. User taps "Buy Premium"
2. If not authenticated:
   a. Open VK ID OAuth URL in system browser
      https://id.vk.com/authorize?client_id=XXX&redirect_uri=personadev://auth&...
   b. User authorizes in browser
   c. VK redirects to deep link: personadev://auth?code=XXX
   d. Tauri captures deep link (onNewIntent)
   e. Kotlin plugin exchanges code for token
   f. Token + user info passed to JS
   g. Stored in localStorage
3. Proceed to purchase flow
```

## 3. RuStore Pay SDK Integration

### Product Configuration

- **Product ID:** `premium` (configured in RuStore Console)
- **Type:** Non-consumable (one-time purchase, permanent unlock)
- **Payment methods:** SBP, bank card, SberPay, T-Pay, mobile balance (all handled by RuStore)

### Purchase Flow

```
1. User taps "Buy Premium" → authenticated (see auth flow above)
2. JS calls: window.__TAURI__.invoke('purchase_product', { productId: 'premium' })
3. Rust command → Kotlin plugin → RuStore Pay SDK
4. RuStore shows native payment sheet
   - User selects: SBP / Card / SberPay / T-Pay / Mobile balance
   - Confirms payment in bank app or enters card
5. RuStore SDK callback:
   - Success → Kotlin confirms purchase → Rust → JS
   - JS sets premium in localStorage + shows success
   - Cancelled → JS shows "Purchase cancelled"
   - Error → JS shows error message
```

### Tauri Plugin: `tauri-plugin-rustore-pay`

**Rust side (commands exposed to JS):**

```rust
#[tauri::command]
async fn get_products(app: AppHandle) -> Result<Vec<Product>, String>

#[tauri::command]
async fn purchase_product(app: AppHandle, product_id: String) -> Result<PurchaseResult, String>

#[tauri::command]
async fn get_purchases(app: AppHandle) -> Result<Vec<Purchase>, String>

#[tauri::command]
async fn confirm_purchase(app: AppHandle, purchase_id: String) -> Result<(), String>
```

**Kotlin side:**

```kotlin
@TauriPlugin
class RuStorePayPlugin(activity: Activity) : Plugin(activity) {

    @Command
    fun getProducts(invoke: Invoke) { ... }

    @Command
    fun purchaseProduct(invoke: Invoke) { ... }

    @Command
    fun getPurchases(invoke: Invoke) { ... }

    @Command
    fun confirmPurchase(invoke: Invoke) { ... }
}
```

**Dependencies (Android):**

```gradle
implementation 'ru.rustore.sdk:pay:latest'
```

### Purchase Verification (on app start)

```
1. App starts
2. JS calls: window.__TAURI__.invoke('get_purchases')
3. Check for active non-consumable 'premium' purchase
4. If found → set premium in localStorage
5. This handles: reinstalls, cache clears, device changes
```

## 4. Tauri Plugin: `tauri-plugin-vk-auth`

**Rust side:**

```rust
#[tauri::command]
async fn start_vk_auth(app: AppHandle) -> Result<(), String>
// Opens VK OAuth URL in system browser

#[tauri::command]
async fn get_vk_user(app: AppHandle) -> Result<Option<VkUser>, String>
// Returns cached VK user info or None
```

**Kotlin side:**

```kotlin
@TauriPlugin
class VkAuthPlugin(activity: Activity) : Plugin(activity) {

    @Command
    fun startVkAuth(invoke: Invoke) {
        // Build VK ID OAuth URL
        // Open in system browser via Intent
    }

    override fun onNewIntent(intent: Intent) {
        // Capture personadev://auth?code=XXX
        // Exchange code for token
        // Cache user info
        // Trigger JS event
    }
}
```

## 5. Web App Changes

### New Files

```
src/modules/mobile/
├── MobileBridgeManager.js      # Bridge manager for mobile flavor
├── config/
│   └── MobileConfig.js         # Feature flags, product IDs
└── services/
    ├── MobilePaymentService.js  # Calls Tauri commands for RuStore
    └── MobileUserService.js     # VK ID OAuth via Tauri commands
```

### MobileBridgeManager.js

```js
export class MobileBridgeManager {
    constructor() {
        this.paymentService = new MobilePaymentService();
        this.userService = new MobileUserService();
    }

    async init() {
        // Check existing purchases on startup
        await this.paymentService.restorePurchases();
        // Set locale from device
        const lang = navigator.language?.startsWith('ru') ? 'ru' : 'en';
        localizationManager.setLocale(lang);
    }

    isMobileEnvironment() {
        return !!window.__TAURI__;
    }
}
```

### MobilePaymentService.js

```js
export class MobilePaymentService {
    async purchasePremium() {
        const result = await window.__TAURI__.invoke('purchase_product', {
            productId: 'premium'
        });
        if (result.success) {
            localStorage.setItem('mobile_premium', 'true');
            await window.__TAURI__.invoke('confirm_purchase', {
                purchaseId: result.purchaseId
            });
        }
        return result;
    }

    async restorePurchases() {
        const purchases = await window.__TAURI__.invoke('get_purchases');
        const premium = purchases.find(p => p.productId === 'premium' && p.state === 'CONFIRMED');
        if (premium) {
            localStorage.setItem('mobile_premium', 'true');
        }
    }
}
```

### MobileConfig.js

```js
export const MobileConfig = {
    APP_ID: 'ru.nikmobdev.personadev',
    VK_APP_ID: '<your-vk-app-id>',
    DEEP_LINK_SCHEME: 'personadev',

    PRODUCTS: {
        premium: 'premium'
    },

    FEATURES: {
        analytics: true,
        payment: true,
        sharing: true,
        ads: false,
        haptics: false,
    }
};
```

### PlatformDetector.js Changes

```js
// Add to getFlavor():
if (window.__TAURI__) {
    this._flavor = 'mobile';
    return this._flavor;
}
// Add convenience method:
static isMobile() {
    return PlatformDetector.getFlavor() === 'mobile';
}
```

### script.js Changes

```js
// Import
import { MobileBridgeManager } from './src/modules/mobile/MobileBridgeManager.js';

// In initialization:
if (flavor === 'mobile') {
    const mobileManager = new MobileBridgeManager();
    await mobileManager.init();
    window.mobileBridgeManager = mobileManager;
}

// In isUserAuthenticated():
if (flavor === 'mobile') {
    return window.mobileBridgeManager?.userService?.isAuthenticated() ?? false;
}

// In premium check:
if (flavor === 'mobile') {
    return localStorage.getItem('mobile_premium') === 'true';
}
```

### Locale Keys to Add

```js
// en.js / ru.js
premium: {
    // ... existing keys ...
    buttonMobile: 'Get Premium',        // en
    buttonMobile: 'Получить Премиум',   // ru
    priceMobile: '',  // Price comes from RuStore dynamically
},
auth: {
    // ... existing keys ...
    loginVkMobile: 'Sign in with VK',
    loginVkMobileDesc: 'Required for purchase',
}
```

## 6. Tauri Project Setup

### Directory Structure

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── build.rs
├── src/
│   ├── main.rs
│   └── lib.rs
├── plugins/
│   ├── tauri-plugin-rustore-pay/
│   │   ├── Cargo.toml
│   │   ├── src/lib.rs
│   │   └── android/
│   │       ├── build.gradle.kts
│   │       └── src/main/kotlin/.../RuStorePayPlugin.kt
│   └── tauri-plugin-vk-auth/
│       ├── Cargo.toml
│       ├── src/lib.rs
│       └── android/
│           ├── build.gradle.kts
│           └── src/main/kotlin/.../VkAuthPlugin.kt
└── gen/
    └── android/           # Auto-generated by `tauri android init`
```

### tauri.conf.json (key parts)

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
    "security": {
      "dangerousRemoteDomainIpcAccess": [
        { "domain": "nikmobdev.ru", "enableTauriAPI": false }
      ]
    }
  },
  "bundle": {
    "active": true,
    "targets": "all"
  },
  "plugins": {}
}
```

### Prerequisites (dev machine)

- Rust toolchain (`rustup`)
- Android SDK + NDK
- Java JDK 17+
- Tauri CLI: `cargo install tauri-cli@^2`

### Build Commands

```bash
# Dev
cargo tauri android dev

# Build APK
cargo tauri android build

# Build signed AAB (for RuStore)
cargo tauri android build --aab
```

## 7. RuStore Console Setup

1. Register at https://console.rustore.ru
2. Create app: `ru.nikmobdev.personadev`
3. Add product:
   - ID: `premium`
   - Type: Non-consumable
   - Price: Set in RuStore Console (e.g., 150 ₽)
   - Name: "Premium Access" / "Премиум доступ"
4. Upload signed AAB
5. Fill metadata (screenshots, description, age rating)
6. Submit for review

## 8. Deep Link Configuration

### AndroidManifest.xml (in Tauri Android project)

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="personadev" android:host="auth" />
</intent-filter>
```

## 9. What Stays the Same

- All quiz logic, scoring, type calculations
- All UI screens and components
- Firebase analytics
- Localization system (en/ru)
- All existing data files (QuizData, InsightsData, etc.)
- CSS/styling

## 10. Testing Plan

1. **Unit:** Tauri commands return expected shapes
2. **Integration:** JS → Rust → Kotlin → mock RuStore SDK
3. **E2E on device:**
   - App launches, detects `mobile` flavor
   - Locale set from device language
   - Quiz flow works end-to-end
   - VK auth opens browser, deep link returns
   - RuStore purchase flow completes
   - Premium persists across app restart
   - Purchase restore works after reinstall

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| RuStore SDK not available in Tauri WebView | SDK runs in Kotlin native layer, not WebView |
| Deep link not captured by Tauri | Test early; fallback to polling/manual token entry |
| RuStore review rejection | Follow all RuStore guidelines; no GMS dependency |
| VK ID OAuth rate limits | Cache tokens, refresh only when expired |
| Tauri v2 mobile stability | Pin Tauri version; test on multiple Android versions |
