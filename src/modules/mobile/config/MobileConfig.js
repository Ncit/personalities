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
