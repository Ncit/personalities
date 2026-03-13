# Tochka Payment Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace VK native payments with Tochka Bank internet acquiring for premium purchases (150 RUB), keeping VK ID as user identifier.

**Architecture:** Node.js backend (goodsv2) proxies all Tochka API calls using JWT auth. Frontend redirects users to Tochka payment page, then confirms payment on return. Server-side polling catches payments where users don't return.

**Tech Stack:** Express.js, SQLite3, node-fetch, Vite (frontend)

**Spec:** `docs/superpowers/specs/2026-03-13-tochka-payment-integration-design.md`

**Two codebases:**
- Backend: `/Users/nikitaf/development/projects/goodsv2`
- Frontend: `/Users/nikitaf/development/projects/personalities`

---

## Chunk 1: Backend — Tochka API Client & Database

### Task 1: Database schema — add tochka_payments table and purchases columns

**Files:**
- Modify: `/Users/nikitaf/development/projects/goodsv2/database.js:10-109` (init method)

- [ ] **Step 1: Add tochka_payments table and new columns to database.js init()**

In `database.js`, inside `this.db.serialize(() => { ... })` block (after the logs indexes at line 108), add:

```javascript
            // Tochka payments tracking table
            this.db.run(`
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
            `);

            // Tochka payments indexes
            this.db.run('CREATE INDEX IF NOT EXISTS idx_tochka_payments_user ON tochka_payments(vk_user_id)');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_tochka_payments_status ON tochka_payments(status)');

            // Add payment_source and tochka_operation_id columns to purchases table
            ['payment_source', 'tochka_operation_id'].forEach(column => {
                this.db.run(`ALTER TABLE purchases ADD COLUMN ${column} TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error(`Error adding ${column} column:`, err);
                    }
                });
            });
```

- [ ] **Step 2: Add tochka_payments DB methods to database.js**

Add these methods to the Database class before the `close()` method (before line 886):

```javascript
    // Tochka payments management
    async createTochkaPayment(paymentData) {
        return new Promise((resolve, reject) => {
            const { operation_id, vk_user_id, app_id, item_id, amount, payment_link } = paymentData;
            this.db.run(`
                INSERT INTO tochka_payments (operation_id, vk_user_id, app_id, item_id, amount, status, payment_link)
                VALUES (?, ?, ?, ?, ?, 'pending', ?)
            `, [operation_id, vk_user_id, app_id, item_id || 'mbti_premium', amount, payment_link], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    }

    async getTochkaPayment(operation_id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM tochka_payments WHERE operation_id = ?',
                [operation_id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async getPendingTochkaPaymentForUser(vk_user_id, maxAgeMinutes = 30) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM tochka_payments
                 WHERE vk_user_id = ? AND status = 'pending'
                 AND created_at >= datetime('now', '-' || ? || ' minutes')
                 ORDER BY created_at DESC LIMIT 1`,
                [vk_user_id, maxAgeMinutes],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async updateTochkaPaymentStatus(operation_id, status) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE tochka_payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE operation_id = ?',
                [status, operation_id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    }

    async getPendingTochkaPayments(maxAgeHours = 1) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM tochka_payments
                 WHERE status = 'pending'
                 AND created_at >= datetime('now', '-' || ? || ' hours')
                 ORDER BY created_at ASC`,
                [maxAgeHours],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }
```

- [ ] **Step 3: Test database changes locally**

Run: `cd /Users/nikitaf/development/projects/goodsv2 && node -e "const Database = require('./database'); const db = new Database(); setTimeout(() => { db.db.all('PRAGMA table_info(tochka_payments)', (e,r) => { console.log('tochka_payments columns:', r); db.close(); }); }, 1000);"`

Expected: Table columns printed (id, operation_id, vk_user_id, app_id, item_id, amount, status, payment_link, created_at, updated_at)

- [ ] **Step 4: Commit**

```bash
cd /Users/nikitaf/development/projects/goodsv2
git add database.js
git commit -m "feat: add tochka_payments table and DB methods for Tochka acquiring"
```

---

### Task 2: Tochka API client service

**Files:**
- Create: `/Users/nikitaf/development/projects/goodsv2/services/tochka.js`

- [ ] **Step 1: Create services directory and tochka.js**

```javascript
/**
 * Tochka Bank Acquiring API Client
 * Docs: https://enter.tochka.com/doc/v2/redoc/tag/acquiring
 *
 * Auth: Bearer JWT token
 * Base URL: https://enter.tochka.com/api/v2
 * Amount format: rubles (not kopeks), e.g. "150" = 150 RUB
 */

class TochkaClient {
    constructor({ apiKey, customerCode, baseUrl }) {
        if (!apiKey) throw new Error('TOCHKA_API_KEY is required');
        if (!customerCode) throw new Error('TOCHKA_CUSTOMER_CODE is required');
        this.apiKey = apiKey;
        this.customerCode = customerCode;
        this.baseUrl = (baseUrl || 'https://enter.tochka.com/api/v2').replace(/\/$/, '');
    }

    async _request(method, path, body = null) {
        const url = `${this.baseUrl}${path}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(`Tochka API returned non-JSON: ${response.status} ${text.substring(0, 200)}`);
        }

        if (!response.ok) {
            const errorMsg = data.message || data.error || JSON.stringify(data);
            throw new Error(`Tochka API error ${response.status}: ${errorMsg}`);
        }

        return data;
    }

    /**
     * Create a payment link
     * @param {object} params
     * @param {string} params.amount - Amount in rubles, e.g. "150"
     * @param {string} params.purpose - Payment description
     * @param {string[]} params.paymentMode - ["sbp", "card"]
     * @param {string} params.redirectUrl - URL to redirect after payment
     * @returns {Promise<{paymentLink: string, operationId: string}>}
     */
    async createPayment({ amount, purpose, paymentMode, redirectUrl }) {
        const result = await this._request('POST', '/acquiring/v1.0/payments', {
            data: {
                customerCode: this.customerCode,
                amount: String(amount),
                purpose: purpose,
                paymentMode: paymentMode
            },
            redirectUrl: redirectUrl
        });

        const paymentData = result.data || result;
        return {
            paymentLink: paymentData.paymentLink,
            operationId: paymentData.operationId,
            raw: paymentData
        };
    }

    /**
     * Check payment status
     * @param {string} operationId
     * @returns {Promise<{status: string, amount: number, ...}>}
     */
    async checkPaymentStatus(operationId) {
        const result = await this._request('GET', `/acquiring/v1.0/payments/${operationId}`);
        return result.data || result;
    }

    /**
     * Refund a payment
     * @param {string} operationId
     * @param {string} amount - Amount to refund in rubles
     * @returns {Promise<{isRefunded: boolean}>}
     */
    async refundPayment(operationId, amount) {
        const result = await this._request('POST', `/acquiring/v1.0/payments/${operationId}/refund`, {
            data: {
                amount: String(amount)
            }
        });
        return result.data || result;
    }
}

module.exports = TochkaClient;
```

- [ ] **Step 2: Verify the module loads without errors**

Run: `cd /Users/nikitaf/development/projects/goodsv2 && node -e "const T = require('./services/tochka'); const t = new T({apiKey:'test', customerCode:'123456789', baseUrl:'http://localhost'}); console.log('TochkaClient created OK');"`

Expected: "TochkaClient created OK"

- [ ] **Step 3: Commit**

```bash
cd /Users/nikitaf/development/projects/goodsv2
git add services/tochka.js
git commit -m "feat: add Tochka Bank acquiring API client"
```

---

### Task 3: Add Tochka endpoints to server.js

**Files:**
- Modify: `/Users/nikitaf/development/projects/goodsv2/server.js`

- [ ] **Step 1: Add TochkaClient import and initialization at top of server.js**

After line 9 (`const Database = require('./database');`), add:

```javascript
const TochkaClient = require('./services/tochka');
```

After the `const db = new Database();` line (find it with grep), add:

```javascript
// Initialize Tochka client (if credentials available)
let tochkaClient = null;
if (process.env.TOCHKA_API_KEY && process.env.TOCHKA_CUSTOMER_CODE) {
    tochkaClient = new TochkaClient({
        apiKey: process.env.TOCHKA_API_KEY,
        customerCode: process.env.TOCHKA_CUSTOMER_CODE,
        baseUrl: process.env.TOCHKA_API_BASE_URL
    });
    console.log('Tochka client initialized');
} else {
    console.warn('Tochka credentials not configured - payment endpoints will be disabled');
}
```

- [ ] **Step 2: Add create-payment endpoint**

Before the `app.listen` line (line 2346), add:

```javascript
// ===== TOCHKA PAYMENT ENDPOINTS =====

// Create a Tochka payment link
app.post(['/api/tochka/create-payment', '/goodsshop/api/tochka/create-payment'], async (request, response) => {
    if (!tochkaClient) {
        return response.status(503).json({ success: false, message: 'Payment service not configured' });
    }

    try {
        const { vk_user_id, app_id } = request.body;
        if (!vk_user_id || !app_id) {
            return response.status(400).json({ success: false, message: 'vk_user_id and app_id are required' });
        }

        // Dedup: check for existing pending payment for this user (within 30 min)
        const existing = await db.getPendingTochkaPaymentForUser(vk_user_id, 30);
        if (existing) {
            addServerLog('info', `Reusing existing Tochka payment for user ${vk_user_id}`, { operation_id: existing.operation_id });
            return response.json({
                success: true,
                paymentLink: existing.payment_link,
                operationId: existing.operation_id
            });
        }

        const result = await tochkaClient.createPayment({
            amount: '150',
            purpose: 'Premium PersonaDev',
            paymentMode: ['sbp', 'card'],
            redirectUrl: 'https://nikmobdev.ru/personadev/?payment=success'
        });

        // Store pending payment
        await db.createTochkaPayment({
            operation_id: result.operationId,
            vk_user_id,
            app_id,
            item_id: 'mbti_premium',
            amount: 150,
            payment_link: result.paymentLink
        });

        addServerLog('success', `Tochka payment created for user ${vk_user_id}`, {
            operation_id: result.operationId,
            amount: 150
        });

        return response.json({
            success: true,
            paymentLink: result.paymentLink,
            operationId: result.operationId
        });
    } catch (error) {
        addServerLog('error', 'Tochka create-payment failed', { error: error.message });
        return response.status(500).json({ success: false, message: 'Payment creation failed' });
    }
});

// Confirm a Tochka payment (called by frontend after redirect)
app.post(['/api/tochka/confirm-payment', '/goodsshop/api/tochka/confirm-payment'], async (request, response) => {
    if (!tochkaClient) {
        return response.status(503).json({ success: false, message: 'Payment service not configured' });
    }

    try {
        const { operationId } = request.body;
        if (!operationId) {
            return response.status(400).json({ success: false, message: 'operationId is required' });
        }

        // Look up the pending payment
        const tochkaPayment = await db.getTochkaPayment(operationId);
        if (!tochkaPayment) {
            return response.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Already confirmed? Return success (idempotent)
        if (tochkaPayment.status === 'approved') {
            return response.json({ success: true, has_purchase: true });
        }

        // Check Tochka API for actual payment status
        const paymentStatus = await tochkaClient.checkPaymentStatus(operationId);
        const status = paymentStatus.status;

        if (status === 'APPROVED') {
            // Create purchase record in main purchases table
            const vkOrderId = `tochka_${operationId}`;
            const existingPurchase = await db.getPurchase(vkOrderId);

            if (!existingPurchase) {
                await db.createPurchase({
                    vk_order_id: vkOrderId,
                    app_order_id: `tochka_${Date.now()}`,
                    vk_user_id: tochkaPayment.vk_user_id,
                    app_id: tochkaPayment.app_id,
                    item_id: tochkaPayment.item_id,
                    price: tochkaPayment.amount,
                    status: 'chargeable',
                    notification_type: 'tochka_payment',
                    receiver_id: null,
                    lang: 'ru_RU'
                });
            }

            await db.updateTochkaPaymentStatus(operationId, 'approved');

            addServerLog('success', `Tochka payment confirmed for user ${tochkaPayment.vk_user_id}`, {
                operation_id: operationId,
                amount: tochkaPayment.amount
            });

            return response.json({ success: true, has_purchase: true });
        } else {
            return response.json({ success: false, status: status });
        }
    } catch (error) {
        addServerLog('error', 'Tochka confirm-payment failed', { error: error.message });
        return response.status(500).json({ success: false, message: 'Payment confirmation failed' });
    }
});

// Admin: Refund a Tochka payment (requires auth)
app.post('/goodsshop/admin/api/tochka/refund', requireAuth, async (request, response) => {
    if (!tochkaClient) {
        return response.status(503).json({ success: false, message: 'Payment service not configured' });
    }

    try {
        const { operationId, amount } = request.body;
        if (!operationId) {
            return response.status(400).json({ success: false, message: 'operationId is required' });
        }

        const tochkaPayment = await db.getTochkaPayment(operationId);
        if (!tochkaPayment) {
            return response.status(404).json({ success: false, message: 'Tochka payment not found' });
        }

        const refundAmount = amount || tochkaPayment.amount;
        const result = await tochkaClient.refundPayment(operationId, refundAmount);

        // Update purchase status
        const vkOrderId = `tochka_${operationId}`;
        await db.updatePurchaseStatus(vkOrderId, 'refund');
        await db.updateTochkaPaymentStatus(operationId, 'refunded');

        addServerLog('success', `Tochka refund processed for operation ${operationId}`, {
            amount: refundAmount,
            result
        });

        return response.json({ success: true, isRefunded: true });
    } catch (error) {
        addServerLog('error', 'Tochka refund failed', { error: error.message });
        return response.status(500).json({ success: false, message: 'Refund failed' });
    }
});

// ===== TOCHKA PENDING PAYMENT POLLING =====
// Check pending payments every 5 minutes
if (tochkaClient) {
    setInterval(async () => {
        try {
            const pendingPayments = await db.getPendingTochkaPayments(1);
            for (const payment of pendingPayments) {
                try {
                    const status = await tochkaClient.checkPaymentStatus(payment.operation_id);
                    if (status.status === 'APPROVED') {
                        const vkOrderId = `tochka_${payment.operation_id}`;
                        const existingPurchase = await db.getPurchase(vkOrderId);

                        if (!existingPurchase) {
                            await db.createPurchase({
                                vk_order_id: vkOrderId,
                                app_order_id: `tochka_${Date.now()}`,
                                vk_user_id: payment.vk_user_id,
                                app_id: payment.app_id,
                                item_id: payment.item_id,
                                price: payment.amount,
                                status: 'chargeable',
                                notification_type: 'tochka_payment',
                                receiver_id: null,
                                lang: 'ru_RU'
                            });
                        }

                        await db.updateTochkaPaymentStatus(payment.operation_id, 'approved');
                        addServerLog('success', `Tochka payment auto-confirmed for user ${payment.vk_user_id}`, {
                            operation_id: payment.operation_id
                        });
                    } else if (status.status === 'DECLINED' || status.status === 'CANCELLED') {
                        await db.updateTochkaPaymentStatus(payment.operation_id, 'declined');
                    }
                } catch (err) {
                    // Log but don't stop processing other payments
                    console.error(`Error checking Tochka payment ${payment.operation_id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error in Tochka pending payment polling:', err.message);
        }
    }, 5 * 60 * 1000); // 5 minutes
}
```

- [ ] **Step 3: Verify server starts without errors**

Run: `cd /Users/nikitaf/development/projects/goodsv2 && timeout 5 node server.js 2>&1 || true`

Expected: "VK Payment Server running on port 3001" and "Tochka client initialized" (or warning if no env vars)

- [ ] **Step 4: Commit**

```bash
cd /Users/nikitaf/development/projects/goodsv2
git add server.js
git commit -m "feat: add Tochka payment endpoints and pending payment polling"
```

---

### Task 4: Update .env with TOCHKA_CUSTOMER_CODE

**Files:**
- Modify: `/Users/nikitaf/development/projects/goodsv2/.env`

- [ ] **Step 1: Check if TOCHKA_CUSTOMER_CODE already exists in .env**

Run: `grep TOCHKA_CUSTOMER_CODE /Users/nikitaf/development/projects/goodsv2/.env`

If it doesn't exist, ask the user for their 9-digit customer code (starts with 3, found via Tochka API `GET /open-banking/{api_version}/customers`). Add it to `.env`:

```
TOCHKA_CUSTOMER_CODE=<value_from_user>
```

**IMPORTANT:** Do NOT commit .env files. This step is manual configuration only.

---

## Chunk 2: Frontend — Payment Flow

### Task 5: Add Tochka payment endpoint to VKConfig

**Files:**
- Modify: `/Users/nikitaf/development/projects/personalities/src/modules/vk/config/VKConfig.js:8-10`

- [ ] **Step 1: Add Tochka endpoint constants**

After line 10 (`static BACKEND_USER_DATA_ENDPOINT = '/admin/api/users';`), add:

```javascript
    static TOCHKA_CREATE_PAYMENT_ENDPOINT = '/api/tochka/create-payment';
    static TOCHKA_CONFIRM_PAYMENT_ENDPOINT = '/api/tochka/confirm-payment';
```

- [ ] **Step 2: Update price in PAYMENT_CONFIG**

Replace line 31 (`price: 40, // Price in kopecks`) with:

```javascript
            price: 150, // Price in rubles (Tochka acquiring)
```

- [ ] **Step 3: Commit**

```bash
cd /Users/nikitaf/development/projects/personalities
git add src/modules/vk/config/VKConfig.js
git commit -m "feat: add Tochka payment endpoint config and update price to 150 RUB"
```

---

### Task 6: Update PremiumModal price and payment flow

**Files:**
- Modify: `/Users/nikitaf/development/projects/personalities/src/modules/ui/components/PremiumModal.js`

- [ ] **Step 1: Update price display and payment logic**

Replace line 39:
```javascript
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Обработка…' : 'Открыть Премиум — 280 ₽'}
```

With:
```javascript
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Обработка…' : 'Открыть Премиум — 150 ₽'}
```

- [ ] **Step 2: Replace VK payment logic with Tochka redirect**

Replace the `_bind()` method (lines 50-88) with:

```javascript
  _bind() {
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) router.closeOverlay();
    });

    this.el.querySelector('#premium-buy')?.addEventListener('click', async () => {
      this.state = 'processing';
      this.errorMessage = '';
      this.render();

      try {
        // Get VK user ID
        let vkUserId = null;
        let appId = '53942833';

        if (window.vkBridgeManager && window.vkBridgeManager.userService) {
          const userInfo = window.vkBridgeManager.userService.getUserInfo();
          if (userInfo) vkUserId = String(userInfo.id);
        }

        if (!vkUserId) {
          // Try localStorage fallback
          try {
            const localData = localStorage.getItem('vk_user_data_local');
            if (localData) {
              const parsed = JSON.parse(localData);
              vkUserId = String(parsed.id);
            }
          } catch {}
        }

        if (!vkUserId) {
          throw new Error('User not identified');
        }

        // Call backend to create Tochka payment
        const backendUrl = 'https://nikmobdev.ru/goodsshop/api/tochka/create-payment';
        const resp = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vk_user_id: vkUserId, app_id: appId })
        });

        const data = await resp.json();
        if (!data.success || !data.paymentLink) {
          throw new Error(data.message || 'Failed to create payment');
        }

        // Save operationId for confirmation after redirect
        localStorage.setItem('tochka_pending_operation', data.operationId);

        // Redirect to Tochka payment page
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
  }
```

- [ ] **Step 3: Commit**

```bash
cd /Users/nikitaf/development/projects/personalities
git add src/modules/ui/components/PremiumModal.js
git commit -m "feat: replace VK payment with Tochka acquiring in PremiumModal"
```

---

### Task 7: Add payment return handler to script.js

**Files:**
- Modify: `/Users/nikitaf/development/projects/personalities/script.js`

- [ ] **Step 1: Add payment confirmation function**

Before the first `document.addEventListener('DOMContentLoaded'` at line 3139, add:

```javascript
/**
 * Handle return from Tochka payment page.
 * Checks URL for ?payment=success, reads operationId from localStorage,
 * confirms payment with backend, and activates premium.
 */
async function handleTochkaPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') !== 'success') return;

    const operationId = localStorage.getItem('tochka_pending_operation');

    // Clean URL params regardless of outcome
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);

    if (!operationId) {
        logger.warn('Payment return detected but no operationId in localStorage');
        return;
    }

    logger.log('Confirming Tochka payment, operationId:', operationId);

    const backendUrl = 'https://nikmobdev.ru/goodsshop/api/tochka/confirm-payment';
    const maxRetries = 3;
    const retryDelay = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const resp = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationId })
            });
            const data = await resp.json();

            if (data.success && data.has_purchase) {
                localStorage.removeItem('tochka_pending_operation');
                setPremium(true);

                // Show success toast
                const container = document.getElementById('toast-container');
                if (container) {
                    const toast = document.createElement('div');
                    toast.className = 'toast toast--success';
                    toast.textContent = 'Премиум разблокирован!';
                    container.appendChild(toast);
                    setTimeout(() => toast.remove(), 5000);
                }

                logger.log('Tochka payment confirmed successfully');
                return;
            }

            // Not yet approved — wait and retry
            if (attempt < maxRetries) {
                logger.log(`Payment not yet confirmed (status: ${data.status}), retrying in ${retryDelay}ms... (${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        } catch (error) {
            logger.error(`Payment confirmation attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    // All retries exhausted — show processing message
    logger.warn('Payment confirmation retries exhausted');
    const container = document.getElementById('toast-container');
    if (container) {
        const toast = document.createElement('div');
        toast.className = 'toast toast--info';
        toast.textContent = 'Платёж обрабатывается. Премиум активируется автоматически в течение нескольких минут.';
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 10000);
    }
}
```

- [ ] **Step 2: Call the handler on DOMContentLoaded**

In the first `DOMContentLoaded` handler (line 3139), after `checkExistingUserAuth();` (line 3144), add:

```javascript
    // Handle return from Tochka payment
    handleTochkaPaymentReturn();
```

- [ ] **Step 3: Commit**

```bash
cd /Users/nikitaf/development/projects/personalities
git add script.js
git commit -m "feat: add Tochka payment return handler on app load"
```

---

## Chunk 3: End-to-End Verification

### Task 8: Local testing & deployment

- [ ] **Step 1: Start goodsv2 server locally and verify endpoints respond**

Run: `cd /Users/nikitaf/development/projects/goodsv2 && node server.js &`

Then test the create-payment endpoint (will fail with Tochka API since we're not using real credentials locally, but should not crash):

Run: `curl -X POST http://localhost:3001/api/tochka/create-payment -H 'Content-Type: application/json' -d '{"vk_user_id":"12345","app_id":"53942833"}'`

Expected: Either `{success: true, paymentLink: ..., operationId: ...}` (if real credentials configured) or `{success: false, message: "Payment creation failed"}` (if credentials not configured or Tochka rejects). Should NOT be a 500 crash.

- [ ] **Step 2: Test confirm-payment with non-existent operationId**

Run: `curl -X POST http://localhost:3001/api/tochka/confirm-payment -H 'Content-Type: application/json' -d '{"operationId":"nonexistent"}'`

Expected: `{"success":false,"message":"Payment not found"}` with 404 status

- [ ] **Step 3: Build frontend and verify no build errors**

Run: `cd /Users/nikitaf/development/projects/personalities && npm run build`

Expected: Build completes without errors

- [ ] **Step 4: Deploy backend to server**

Run: `cd /Users/nikitaf/development/projects/goodsv2 && npm run deploy`

Verify the Tochka endpoints are accessible at production URL.

- [ ] **Step 5: Deploy frontend**

Run: `cd /Users/nikitaf/development/projects/personalities && npm run deploy`

- [ ] **Step 6: End-to-end test in production**

Open the app, click "Buy Premium", verify:
1. Payment link is created
2. Redirect to Tochka payment page works
3. After payment, redirect back confirms and activates premium

---

## Summary of all files changed

### Backend (`/Users/nikitaf/development/projects/goodsv2`)
| Action | File | Purpose |
|--------|------|---------|
| Modify | `database.js` | Add tochka_payments table, indexes, CRUD methods |
| Create | `services/tochka.js` | Tochka API client (create/check/refund) |
| Modify | `server.js` | Add 3 endpoints + polling interval |
| Manual | `.env` | Add TOCHKA_CUSTOMER_CODE (not committed) |

### Frontend (`/Users/nikitaf/development/projects/personalities`)
| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/modules/vk/config/VKConfig.js` | Add Tochka endpoint URLs, update price |
| Modify | `src/modules/ui/components/PremiumModal.js` | Replace VK payment with Tochka redirect |
| Modify | `script.js` | Add payment return handler |
