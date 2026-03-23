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
        const invoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.invoke;
        if (!invoke) {
            this.logger.warn('Tauri runtime not available, skipping purchase restore');
            return;
        }

        try {
            const result = await invoke('plugin:rustore-pay|check_premium_status');
            if (result.premium) {
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
        const invoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.invoke;
        if (!invoke) return null;

        try {
            const products = await invoke('plugin:rustore-pay|get_products');
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
        const invoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.invoke;
        if (!invoke) {
            return { success: false, error: 'Tauri runtime not available' };
        }

        try {
            this.logger.log('Starting RuStore purchase...');
            const result = await invoke('plugin:rustore-pay|purchase_product', {
                productId: MobileConfig.PRODUCTS.premium
            });

            if (result.success) {
                localStorage.setItem(MobileConfig.STORAGE_KEYS.premium, 'true');
                this.logger.log('Premium purchased and confirmed:', result.purchaseId);
            }

            return result;
        } catch (error) {
            this.logger.error('Purchase failed:', error);
            return { success: false, error: error.message || 'Purchase failed' };
        }
    }

    isPremium() {
        return localStorage.getItem(MobileConfig.STORAGE_KEYS.premium) === 'true';
    }
}
