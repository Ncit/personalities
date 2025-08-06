/**
 * VK Configuration Module
 * Centralized configuration for VK Mini Apps integration
 */

export class VKConfig {
    // Backend API configuration
    static BACKEND_BASE_URL = 'https://nikmobdev.ru/goodsshop';
    static BACKEND_CHECK_PURCHASE_ENDPOINT = '/api/check-purchase';
    static BACKEND_USER_DATA_ENDPOINT = '/admin/api/users';
    
    // VK App configuration
    static VK_APP_ID = '53942833';
    
    // Payment configuration
    static PAYMENT_CONFIG = {
        defaultProduct: {
            id: 'mbti_premium',
            name: 'MBTI премиум',
            description: 'Доступ к премиум-функциям',
            price: 40, // Price in kopecks
            currency: 'Голоса',
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTMyIDEyQzIxLjUgMTIgMTMgMjAuNSAxMyAzMUMxMyA0MS41IDIxLjUgNTAgMzIgNTBDNDIuNSA1MCA1MSA0MS41IDUxIDMxQzUxIDIwLjUgNDIuNSAxMiAzMiAxMloiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTI4IDI0SDM2VjQwSDI4VjI0WiIgZmlsbD0iIzAwMCIvPgo8cGF0aCBkPSJNMjQgMjhIMzZWMzJIMjRWMjhaIiBmaWxsPSIjMDAwIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMDAwIj40MDwvdGV4dD4KPC9zdmc+'
        },
        subscriptions: {
            monthly: {
                id: 'premium_monthly',
                name: 'Premium Monthly',
                price: 199,
                description: 'Premium access for 1 month'
            },
            yearly: {
                id: 'premium_yearly',
                name: 'Premium Yearly',
                price: 1990,
                description: 'Premium access for 1 year (save 17%)'
            },
            lifetime: {
                id: 'premium_lifetime',
                name: 'Premium Lifetime',
                price: 4990,
                description: 'Lifetime premium access'
            }
        }
    };
    
    // Feature flags
    static FEATURES = {
        analytics: true,
        userDataSaving: false, // Disabled by default to prevent network errors
        premiumStatusChecking: true,
        payment: true,
        sharing: true,
        ads: true,
        appearance: true
    };
    
    // Timeout configurations
    static TIMEOUTS = {
        apiRequest: 10000,
        bridgeInit: 5000,
        userDataSave: 15000
    };
    
    // Local storage keys
    static STORAGE_KEYS = {
        premiumStatus: 'mbti_premium',
        premiumTimestamp: 'mbti_premium_timestamp',
        subscriptionData: 'mbti_subscription_data',
        userDataSaved: 'vk_user_data_saved',
        userDataSavedTimestamp: 'vk_user_data_saved_timestamp',
        userDataLocal: 'vk_user_data_local'
    };
    
    // Analytics event names
    static ANALYTICS_EVENTS = {
        bridgeInit: 'vk_bridge_init',
        userInfoRetrieved: 'vk_user_info_retrieved',
        paymentAttempted: 'vk_payment_attempted',
        paymentSuccess: 'vk_payment_success',
        paymentError: 'vk_payment_error',
        premiumStatusCheck: 'vk_premium_status_check',
        userDataSave: 'vk_user_data_save'
    };
    
    // Error codes mapping
    static ERROR_CODES = {
        UNSUPPORTED_PLATFORM: 6,
        ORDER_CONFIGURATION_ERROR: 13,
        CLIENT_ERROR: 'client_error',
        NETWORK_ERROR: 'network_error'
    };
    
    /**
     * Get payment configuration for a specific product
     */
    static getPaymentConfig(productId = 'mbti_premium') {
        // Check subscriptions first
        for (const [key, config] of Object.entries(this.PAYMENT_CONFIG.subscriptions)) {
            if (config.id === productId) {
                return config;
            }
        }
        
        // Return default product if not found
        return this.PAYMENT_CONFIG.defaultProduct;
    }
    
    /**
     * Get backend URL for a specific endpoint
     */
    static getBackendUrl(endpoint) {
        return `${this.BACKEND_BASE_URL}${endpoint}`;
    }
    
    /**
     * Check if a feature is enabled
     */
    static isFeatureEnabled(feature) {
        return this.FEATURES[feature] === true;
    }
    
    /**
     * Get timeout value for a specific operation
     */
    static getTimeout(operation) {
        return this.TIMEOUTS[operation] || this.TIMEOUTS.apiRequest;
    }
    
    /**
     * Get storage key for a specific data type
     */
    static getStorageKey(dataType) {
        return this.STORAGE_KEYS[dataType];
    }
} 