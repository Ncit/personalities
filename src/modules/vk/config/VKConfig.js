/**
 * VK Configuration Module
 * Centralized configuration for VK Mini Apps integration
 */

export class VKConfig {
    // Backend API configuration
    static BACKEND_BASE_URL = 'https://nikmobdev.ru/goodsshop';
    static BACKEND_CHECK_PURCHASE_ENDPOINT = '/api/check-purchase';
    static BACKEND_USER_DATA_ENDPOINT = '/admin/api/users';
    
    // Alternative endpoints for Android VK Mini Apps
    static ANDROID_BACKEND_BASE_URL = 'https://nikmobdev.ru/goodsshop';
    static ANDROID_CHECK_PURCHASE_ENDPOINT = '/api/check-purchase-android';
    static ANDROID_USER_DATA_ENDPOINT = '/admin/api/users-android';
    
    // VK App configuration
    static VK_APP_ID = '53942833';
    
    // Platform detection
    static PLATFORMS = {
        ANDROID: 'android',
        IOS: 'ios',
        WEB: 'web',
        VK_ANDROID: 'vk_android',
        VK_IOS: 'vk_ios',
        VK_WEB: 'vk_web'
    };
    
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
        premiumStatusChecking: false, // Disabled by default to prevent network errors
        payment: true,
        sharing: true,
        ads: true,
        appearance: true
    };
    
    // Android-specific feature flags
    static ANDROID_FEATURES = {
        analytics: true,
        userDataSaving: false, // Disabled for Android due to CORS issues
        premiumStatusChecking: false, // Disabled for Android due to CORS issues
        payment: true,
        sharing: true,
        ads: true,
        appearance: true,
        useAlternativeEndpoints: false, // Disabled - use local storage only
        fallbackToLocalStorage: true, // Always use localStorage for Android
        retryWithDifferentHeaders: false, // Disabled - no network requests
        useLocalStorageOnly: true, // Force local storage only for Android
        bypassNetworkRequests: true // Skip network requests entirely for Android
    };
    
    // Timeout configurations
    static TIMEOUTS = {
        apiRequest: 10000,
        bridgeInit: 5000,
        userDataSave: 15000,
        androidApiRequest: 15000, // Longer timeout for Android
        retryDelay: 2000 // Delay between retries
    };
    
    // Local storage keys
    static STORAGE_KEYS = {
        premiumStatus: 'mbti_premium',
        premiumTimestamp: 'mbti_premium_timestamp',
        subscriptionData: 'mbti_subscription_data',
        userDataSaved: 'vk_user_data_saved',
        userDataSavedTimestamp: 'vk_user_data_saved_timestamp',
        userDataLocal: 'vk_user_data_local',
        platform: 'vk_platform',
        lastNetworkError: 'vk_last_network_error',
        networkErrorCount: 'vk_network_error_count'
    };
    
    // Analytics event names
    static ANALYTICS_EVENTS = {
        bridgeInit: 'vk_bridge_init',
        userInfoRetrieved: 'vk_user_info_retrieved',
        paymentAttempted: 'vk_payment_attempted',
        paymentSuccess: 'vk_payment_success',
        paymentError: 'vk_payment_error',
        premiumStatusCheck: 'vk_premium_status_check',
        userDataSave: 'vk_user_data_save',
        androidNetworkError: 'vk_android_network_error',
        platformDetected: 'vk_platform_detected'
    };
    
    // Error codes mapping
    static ERROR_CODES = {
        UNSUPPORTED_PLATFORM: 6,
        ORDER_CONFIGURATION_ERROR: 13,
        CLIENT_ERROR: 'client_error',
        NETWORK_ERROR: 'network_error',
        ANDROID_CORS_ERROR: 'android_cors_error',
        ANDROID_NETWORK_ERROR: 'android_network_error'
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
     * Get Android-specific backend URL
     */
    static getAndroidBackendUrl(endpoint) {
        return `${this.ANDROID_BACKEND_BASE_URL}${endpoint}`;
    }
    
    /**
     * Get platform-appropriate backend URL
     */
    static getPlatformBackendUrl(endpoint, platform = null) {
        if (!platform) {
            platform = this.detectPlatform();
        }
        
        // Use Android-specific endpoints for Android platforms
        if (platform === this.PLATFORMS.ANDROID || 
            platform === this.PLATFORMS.VK_ANDROID) {
            return this.getAndroidBackendUrl(endpoint);
        }
        
        return this.getBackendUrl(endpoint);
    }
    
    /**
     * Detect current platform
     */
    static detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isVK = typeof window.vkBridge !== 'undefined';
        
        if (isVK) {
            if (userAgent.includes('android')) {
                return this.PLATFORMS.VK_ANDROID;
            } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return this.PLATFORMS.VK_IOS;
            } else {
                return this.PLATFORMS.VK_WEB;
            }
        } else {
            if (userAgent.includes('android')) {
                return this.PLATFORMS.ANDROID;
            } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return this.PLATFORMS.IOS;
            } else {
                return this.PLATFORMS.WEB;
            }
        }
    }
    
    /**
     * Check if a feature is enabled for current platform
     */
    static isFeatureEnabled(feature) {
        const platform = this.detectPlatform();
        
        // Use Android-specific features for Android platforms
        if (platform === this.PLATFORMS.ANDROID || 
            platform === this.PLATFORMS.VK_ANDROID) {
            return this.ANDROID_FEATURES[feature] === true;
        }
        
        return this.FEATURES[feature] === true;
    }
    
    /**
     * Get timeout value for a specific operation and platform
     */
    static getTimeout(operation) {
        const platform = this.detectPlatform();
        
        // Use Android-specific timeouts for Android platforms
        if ((platform === this.PLATFORMS.ANDROID || 
             platform === this.PLATFORMS.VK_ANDROID) && 
            this.TIMEOUTS[`android${operation.charAt(0).toUpperCase() + operation.slice(1)}`]) {
            return this.TIMEOUTS[`android${operation.charAt(0).toUpperCase() + operation.slice(1)}`];
        }
        
        return this.TIMEOUTS[operation] || this.TIMEOUTS.apiRequest;
    }
    
    /**
     * Get storage key for a specific data type
     */
    static getStorageKey(dataType) {
        return this.STORAGE_KEYS[dataType];
    }
    
    /**
     * Get platform-specific headers for network requests
     */
    static getPlatformHeaders() {
        const platform = this.detectPlatform();
        const baseHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Add platform-specific headers for Android
        if (platform === this.PLATFORMS.ANDROID || 
            platform === this.PLATFORMS.VK_ANDROID) {
            return {
                ...baseHeaders,
                'X-Platform': 'android',
                'X-VK-App': this.VK_APP_ID,
                'User-Agent': navigator.userAgent
            };
        }
        
        return baseHeaders;
    }
    
    /**
     * Get retry configuration for failed requests
     */
    static getRetryConfig() {
        const platform = this.detectPlatform();
        
        if (platform === this.PLATFORMS.ANDROID || 
            platform === this.PLATFORMS.VK_ANDROID) {
            return {
                maxRetries: 3,
                retryDelay: this.TIMEOUTS.retryDelay,
                useAlternativeEndpoints: this.ANDROID_FEATURES.useAlternativeEndpoints,
                fallbackToLocalStorage: this.ANDROID_FEATURES.fallbackToLocalStorage
            };
        }
        
        return {
            maxRetries: 1,
            retryDelay: this.TIMEOUTS.retryDelay,
            useAlternativeEndpoints: false,
            fallbackToLocalStorage: false
        };
    }
} 