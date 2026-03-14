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

    isPremium() {
        return localStorage.getItem(MobileConfig.STORAGE_KEYS.premium) === 'true';
    }
}
