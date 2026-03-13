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
    static BOT_USERNAME = 'personalities_check_bot';

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
            tochkaPrice: 150,      // Price in rubles (Tochka)
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
