import { MobileConfig } from '../config/MobileConfig.js';
import { LoggerManager } from '../../core/LoggerManager.js';

const BACKEND_URL = 'https://nikmobdev.ru/goodsshop/api/rustore';

export class MobilePaymentService {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('MobilePaymentService');
        this._premiumCached = null;
    }

    _getVkUserId() {
        const us = window.mobileBridgeManager?.userService;
        if (us?.isAuthenticated()) {
            const info = us.getUserInfo();
            if (info?.id) return String(info.id);
        }
        try {
            const stored = localStorage.getItem(MobileConfig.STORAGE_KEYS.vkUser);
            if (stored) {
                const p = JSON.parse(stored);
                if (p.id) return String(p.id);
            }
        } catch {}
        return null;
    }

    /**
     * Check premium status from backend on app start.
     */
    async restorePurchases() {
        const vkUserId = this._getVkUserId();
        if (!vkUserId) {
            this.logger.log('No user ID, skipping premium check');
            return;
        }

        try {
            const resp = await fetch(`${BACKEND_URL}/check-premium?vk_user_id=${vkUserId}`);
            const data = await resp.json();
            if (data.premium) {
                this._premiumCached = true;
                localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
                this.logger.log('Premium confirmed from backend');
            } else {
                this._premiumCached = false;
                localStorage.removeItem(MobileConfig.STORAGE_KEYS.premium);
            }
        } catch (error) {
            this.logger.warn('Failed to check premium:', error);
            // Fallback to localStorage
        }
    }

    /**
     * Purchase premium via RuStore Pay SDK.
     * After purchase, verify with backend.
     */
    async purchasePremium() {
        const invoke = window.__TAURI__?.core?.invoke;
        if (!invoke) {
            return { success: false, error: 'Tauri runtime not available' };
        }

        try {
            this.logger.log('Starting RuStore purchase...');
            const result = await invoke('plugin:rustore-pay|purchase_product', {
                productId: MobileConfig.PRODUCTS.premium
            });

            if (result.success) {
                // Verify purchase on backend
                const vkUserId = this._getVkUserId();
                if (vkUserId) {
                    try {
                        await fetch(`${BACKEND_URL}/verify-purchase`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                vk_user_id: vkUserId,
                                product_id: MobileConfig.PRODUCTS.premium,
                                purchase_id: result.purchaseId || '',
                                invoice_id: result.invoiceId || ''
                            })
                        });
                    } catch (e) {
                        this.logger.warn('Backend verify failed, purchase still valid:', e);
                    }
                }

                this._premiumCached = true;
                localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
                this.logger.log('Premium purchased:', result.purchaseId);
            }

            return result;
        } catch (error) {
            this.logger.error('Purchase failed:', error);
            return { success: false, error: error.message || 'Purchase failed' };
        }
    }

    isPremium() {
        if (this._premiumCached !== null) return this._premiumCached;
        return localStorage.getItem(MobileConfig.STORAGE_KEYS.premium) === 'true';
    }
}
