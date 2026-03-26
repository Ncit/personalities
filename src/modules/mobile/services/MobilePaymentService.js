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
     * Check premium status on app start.
     * Works without VK login — checks RuStore SDK directly.
     */
    async restorePurchases() {
        // Always check RuStore SDK first (no VK login needed)
        try {
            const invoke = window.__TAURI__?.core?.invoke;
            if (invoke) {
                const status = await invoke('plugin:rustore-pay|check_premium_status');
                this.logger.log('RuStore check result:', JSON.stringify(status));
                if (status?.premium) {
                    this._activatePremium();
                    this.logger.log('Premium restored from RuStore SDK');
                    return;
                }
            }
        } catch (error) {
            this.logger.warn('RuStore SDK check failed:', error);
        }

        // Also check backend if VK user is known
        const vkUserId = this._getVkUserId();
        if (vkUserId) {
            try {
                const resp = await fetch(`${BACKEND_URL}/check-premium?vk_user_id=${vkUserId}`);
                const data = await resp.json();
                if (data.premium) {
                    this._premiumCached = true;
                    localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
                    this.logger.log('Premium confirmed from backend');
                    return;
                }
            } catch (error) {
                this.logger.warn('Backend check failed:', error);
            }
        }

        this._premiumCached = false;
        localStorage.removeItem(MobileConfig.STORAGE_KEYS.premium);
    }

    /**
     * Purchase premium via RuStore Pay SDK.
     */
    async purchasePremium() {
        const invoke = window.__TAURI__?.core?.invoke;
        if (!invoke) {
            return { success: false, error: 'Tauri runtime not available' };
        }

        // Check if already purchased before trying to buy
        try {
            const status = await invoke('plugin:rustore-pay|check_premium_status');
            if (status?.premium) {
                this._activatePremium();
                return { success: true };
            }
        } catch (_) {}

        try {
            this.logger.log('Starting RuStore purchase...');
            const vkUserId = this._getVkUserId();
            const result = await invoke('plugin:rustore-pay|purchase_product', {
                productId: MobileConfig.PRODUCTS.premium,
                developerPayload: vkUserId ? `vk_user_id:${vkUserId}` : ''
            });

            if (result.success) {
                this._activatePremium(result.purchaseId, result.invoiceId);
            }

            return result;
        } catch (error) {
            this.logger.error('Purchase failed:', error);
            // Check if already purchased (error from RuStore)
            try {
                const status = await invoke('plugin:rustore-pay|check_premium_status');
                if (status?.premium) {
                    this._activatePremium();
                    return { success: true };
                }
            } catch (_) {}
            return { success: false, error: error.message || 'Purchase failed' };
        }
    }

    _activatePremium(purchaseId, invoiceId) {
        this._premiumCached = true;
        localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
        const vkUserId = this._getVkUserId();
        if (vkUserId) {
            fetch(`${BACKEND_URL}/verify-purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vk_user_id: vkUserId,
                    product_id: MobileConfig.PRODUCTS.premium,
                    purchase_id: purchaseId || 'restored',
                    invoice_id: invoiceId || 'restored'
                })
            }).catch(() => {});
        }
        this.logger.log('Premium activated:', purchaseId || 'restored');
    }

    isPremium() {
        if (this._premiumCached !== null) return this._premiumCached;
        return localStorage.getItem(MobileConfig.STORAGE_KEYS.premium) === 'true';
    }
}
