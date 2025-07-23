/**
 * VK Bridge Manager
 * Handles VK Mini Apps integration and platform-specific functionality
 * Enhanced with Firebase Analytics tracking
 */

export class VKBridgeManager {
    constructor() {
        this.bridge = null;
        this.isVKPlatform = false;
        this.userInfo = null;
        this.vkEvents = [];
        this.init();
    }

    /**
     * Initialize VK Bridge
     */
    async init() {
        try {
            console.log('Initializing VK Bridge Manager...');
            console.log('VK Bridge available:', typeof window.vkBridge !== 'undefined');
            
            // Track VK initialization attempt
            this.trackVKEvent('vk_bridge_init_attempted', {
                bridge_available: typeof window.vkBridge !== 'undefined'
            });
            
            // Check if VK Bridge is available
            if (typeof window.vkBridge !== 'undefined') {
                this.bridge = window.vkBridge;
                this.isVKPlatform = true;
                
                console.log('VK Bridge detected - running in VK environment');
                
                // Track successful VK detection
                this.trackVKEvent('vk_environment_detected');
                
                // Apply VK-specific styles
                this.applyVKStyles();
                
                // Subscribe to bridge events
                this.bridge.subscribe(({ detail: { type, data } }) => {
                    this.handleBridgeEvent(type, data);
                });

                // Send ready event
                await this.bridge.send('VKWebAppInit');
                console.log('VKWebAppInit sent');
                
                // Track VK app initialization
                this.trackVKEvent('vk_app_initialized');
                
                // Get user info
                await this.getUserInfo();
                
                // Configure app appearance
                await this.configureAppearance();
                
                console.log('VK Bridge initialized successfully');
                
                // Track successful initialization
                this.trackVKEvent('vk_bridge_init_success');
            } else {
                console.log('VK Bridge not available - running in standalone mode');
                this.isVKPlatform = false;
                
                // Track standalone mode
                this.trackVKEvent('vk_standalone_mode');
            }
        } catch (error) {
            console.error('Error initializing VK Bridge:', error);
            this.isVKPlatform = false;
            
            // Track initialization error
            this.trackVKEvent('vk_bridge_init_error', {
                error_message: error.message,
                error_stack: error.stack
            });
        }
    }

    /**
     * Apply VK-specific styles
     */
    applyVKStyles() {
        // Add VK platform class to body
        document.body.classList.add('vk-platform');
        
        // Load VK-specific CSS
        this.loadVKStyles();
        
        // Apply VK-specific meta tags
        this.applyVKMetaTags();
    }

    /**
     * Load VK-specific styles
     */
    loadVKStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './src/modules/vk/vk-styles.css';
        document.head.appendChild(link);
    }

    /**
     * Apply VK-specific meta tags
     */
    applyVKMetaTags() {
        // Add VK-specific meta tags
        const metaTags = [
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
            { name: 'format-detection', content: 'telephone=no' },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
        ];

        metaTags.forEach(tag => {
            let meta = document.querySelector(`meta[name="${tag.name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = tag.name;
                document.head.appendChild(meta);
            }
            meta.content = tag.content;
        });
    }

    /**
     * Track VK events to Firebase Analytics
     */
    trackVKEvent(eventName, parameters = {}) {
        try {
            // Add VK-specific context
            const enhancedParameters = {
                ...parameters,
                vk_platform: this.isVKPlatform,
                vk_user_id: this.userInfo?.id || null,
                timestamp: new Date().toISOString()
            };
            
            // Log to Firebase Analytics if available
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent(eventName, enhancedParameters);
            }
            
            // Store event locally for debugging
            this.vkEvents.push({
                event: eventName,
                parameters: enhancedParameters,
                timestamp: new Date().toISOString()
            });
            
            console.log('VK Event tracked:', eventName, enhancedParameters);
        } catch (error) {
            console.warn('Failed to track VK event:', error);
        }
    }

    /**
     * Set VK user properties in Firebase Analytics
     */
    setVKUserProperties(userInfo) {
        try {
            if (window.firebaseAnalytics && userInfo) {
                const userProperties = {
                    vk_user_id: userInfo.id?.toString(),
                    vk_username: userInfo.screen_name || `user_${userInfo.id}`,
                    vk_first_name: userInfo.first_name || '',
                    vk_last_name: userInfo.last_name || '',
                    vk_has_photo: !!userInfo.photo_100,
                    vk_platform: this.isVKPlatform,
                    user_type: 'vk_user'
                };
                
                // Set user properties
                window.firebaseAnalytics.setUserProperties(userProperties);
                
                // Set user ID
                window.firebaseAnalytics.setUserId(userInfo.id?.toString());
                
                // Track user ID setting event
                this.trackVKEvent('vk_user_id_set', {
                    user_id: userInfo.id?.toString(),
                    username: userInfo.screen_name || `user_${userInfo.id}`,
                    has_photo: !!userInfo.photo_100
                });
                
                console.log('VK User properties set:', userProperties);
                console.log('VK User ID saved to Firebase Analytics:', userInfo.id);
            }
        } catch (error) {
            console.warn('Failed to set VK user properties:', error);
            
            // Track the error
            this.trackVKEvent('vk_user_properties_error', {
                error_message: error.message,
                user_id: userInfo?.id?.toString()
            });
        }
    }

    /**
     * Handle bridge events
     */
    handleBridgeEvent(type, data) {
        // Track all bridge events
        this.trackVKEvent('vk_bridge_event', {
            event_type: type,
            event_data: JSON.stringify(data)
        });
        
        switch (type) {
            case 'VKWebAppUpdateConfig':
                this.handleConfigUpdate(data);
                break;
            case 'VKWebAppViewRestrictions':
                this.handleViewRestrictions(data);
                break;
            case 'VKWebAppGetUserInfoResult':
                this.handleUserInfo(data);
                break;
            case 'VKWebAppGetLaunchParamsResult':
                this.handleLaunchParams(data);
                break;
            default:
                console.log('Unhandled bridge event:', type, data);
                this.trackVKEvent('vk_unhandled_bridge_event', {
                    event_type: type,
                    event_data: JSON.stringify(data)
                });
        }
    }

    /**
     * Get user information
     */
    async getUserInfo() {
        if (!this.bridge) {
            this.trackVKEvent('vk_get_user_info_failed', {
                reason: 'bridge_not_available'
            });
            return null;
        }
        
        try {
            this.trackVKEvent('vk_get_user_info_attempted');
            
            const result = await this.bridge.send('VKWebAppGetUserInfo');
            this.userInfo = result;
            
            // Track successful user info retrieval
            this.trackVKEvent('vk_user_info_retrieved', {
                user_id: result.id,
                has_username: !!result.screen_name,
                has_photo: !!result.photo_100
            });
            
            // Set user properties in Firebase Analytics
            this.setVKUserProperties(result);
            
            return result;
        } catch (error) {
            console.error('Error getting user info:', error);
            
            this.trackVKEvent('vk_get_user_info_error', {
                error_message: error.message,
                error_type: error.error_type || 'unknown'
            });
            
            return null;
        }
    }

    /**
     * Configure app appearance
     */
    async configureAppearance() {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppSetViewSettings', {
                status_bar_style: 'light',
                action_bar_color: '#667eea',
                navigation_bar_color: '#667eea'
            });
        } catch (error) {
            console.error('Error configuring appearance:', error);
        }
    }

    /**
     * Handle config update
     */
    handleConfigUpdate(data) {
        console.log('App config updated:', data);
        // Update app theme based on VK theme
        if (data.scheme) {
            document.documentElement.setAttribute('data-theme', data.scheme);
        }
    }

    /**
     * Handle view restrictions
     */
    handleViewRestrictions(data) {
        console.log('View restrictions:', data);
        // Handle any view restrictions from VK
    }

    /**
     * Handle user info
     */
    handleUserInfo(data) {
        this.userInfo = data;
        console.log('User info received:', data);
        
        // Track user info received via bridge event
        this.trackVKEvent('vk_user_info_received', {
            user_id: data.id,
            has_username: !!data.screen_name,
            has_photo: !!data.photo_100
        });
        
        // Set user properties in Firebase Analytics
        this.setVKUserProperties(data);
    }

    /**
     * Handle launch parameters
     */
    handleLaunchParams(data) {
        console.log('Launch params:', data);
        // Handle launch parameters from VK
    }

    /**
     * Share results using VK sharing
     */
    async shareResults(personalityType, shareText) {
        this.trackVKEvent('vk_share_attempted', {
            personality_type: personalityType,
            bridge_available: !!this.bridge
        });
        
        if (!this.bridge) {
            // Fallback to native sharing
            this.trackVKEvent('vk_share_fallback_native');
            return this.fallbackShare(shareText);
        }

        try {
            await this.bridge.send('VKWebAppShare', {
                link: window.location.href,
                title: 'MBTI Personality Quiz Results',
                text: shareText
            });
            
            this.trackVKEvent('vk_share_success', {
                personality_type: personalityType
            });
        } catch (error) {
            console.error('Error sharing via VK:', error);
            
            this.trackVKEvent('vk_share_error', {
                error_message: error.message,
                personality_type: personalityType
            });
            
            return this.fallbackShare(shareText);
        }
    }

    /**
     * Fallback sharing method
     */
    fallbackShare(shareText) {
        if (navigator.share) {
            return navigator.share({
                title: 'MBTI Personality Quiz Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Results copied to clipboard!');
            });
        }
    }

    /**
     * Show notification
     */
    async showNotification(message) {
        if (this.bridge) {
            try {
                await this.bridge.send('VKWebAppShowSnackbar', {
                    text: message
                });
                    } catch (error) {
            console.error('Error showing snackbar:', error);
            alert(message);
        }
        } else {
            alert(message);
        }
    }

    /**
     * Show community widget
     */
    async showCommunityWidget() {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppShowCommunityWidgetPreviewBox', {
                group_id: 0, // Replace with your community ID
                type: 'text',
                code: 'return { title: "Join our community!", text: "Connect with others who share your personality type!" };'
            });
        } catch (error) {
            console.error('Error showing community widget:', error);
        }
    }

    /**
     * Show order box for premium features
     */
    async showOrderBox() {
        this.trackVKEvent('vk_payment_attempted', {
            bridge_available: !!this.bridge,
            vk_platform: this.isVKPlatform
        });
        
        // Development mode - simulate payment if not in VK environment
        if (!this.bridge || !this.isVKPlatform) {
            console.log('Development mode: Simulating payment success');
            await this.showNotification('Режим разработки: Премиум активирован!');
            
            this.trackVKEvent('vk_payment_development_mode', {
                success: true
            });
            
            return { success: true, status: 'success', developmentMode: true };
        }
        
        try {
            // First, check if the user is already premium
            const userInfo = await this.getUserInfo();
            if (userInfo && userInfo.id) {
                // Check premium status from backend
                try {
                    const response = await fetch(`https://javelin-hopeful-goshawk.ngrok-free.app/api/vk/premium-status/${userInfo.id}`);
                    const premiumData = await response.json();
                    
                    if (premiumData.success && premiumData.data.isPremium) {
                        // User is already premium
                        await this.showNotification('У вас уже есть премиум доступ!');
                        
                        this.trackVKEvent('vk_payment_already_premium', {
                            user_id: userInfo.id
                        });
                        
                        return { success: true, alreadyPremium: true };
                    }
                } catch (error) {
                    console.warn('Could not check premium status:', error);
                    this.trackVKEvent('vk_premium_status_check_error', {
                        error_message: error.message
                    });
                }
            }

            // Show order box with proper configuration
            const result = await this.bridge.send('VKWebAppShowOrderBox', {
                type: 'item',
                item: 'premium_access'
            });
            
            console.log('Order box result:', result);
            
            // Track payment result
            this.trackVKEvent('vk_payment_result', {
                success: result.status === 'success',
                status: result.status,
                user_id: userInfo?.id
            });
            
            return result;
        } catch (error) {
            console.error('Error showing order box:', error);
            
            // Track payment error
            this.trackVKEvent('vk_payment_error', {
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_message: error.message
            });
            
            // Handle specific VK errors
            if (error.error_type === 'client_error') {
                switch (error.error_data?.error_code) {
                    case 13:
                        console.error('Order configuration error. Please check VK App settings.');
                        await this.showNotification('Ошибка настройки платежей. Обратитесь к администратору.');
                        
                        this.trackVKEvent('vk_payment_config_error');
                        
                        // In development, simulate success after error
                        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
                            console.log('Development mode: Simulating payment success after error');
                            await this.showNotification('Режим разработки: Премиум активирован!');
                            
                            this.trackVKEvent('vk_payment_development_fallback');
                            
                            return { success: true, status: 'success', developmentMode: true };
                        }
                        break;
                    case 14:
                        console.error('User denied payment');
                        await this.showNotification('Платеж был отменен.');
                        
                        this.trackVKEvent('vk_payment_user_denied');
                        break;
                    default:
                        console.error('VK payment error:', error.error_data);
                        await this.showNotification('Ошибка платежа. Попробуйте позже.');
                        
                        this.trackVKEvent('vk_payment_unknown_error', {
                            error_code: error.error_data?.error_code
                        });
                }
            }
            
            return { success: false, error };
        }
    }

    /**
     * Handle payment result and update user status
     */
    async handlePaymentResult(result) {
        try {
            if (result && result.status === 'success') {
                // Payment successful, update user status
                const userInfo = await this.getUserInfo();
                if (userInfo && userInfo.id) {
                    // Update user in backend
                    await this.updateUserInBackend(userInfo);
                    
                    // Check premium status again
                    const response = await fetch(`https://javelin-hopeful-goshawk.ngrok-free.app/api/vk/premium-status/${userInfo.id}`);
                    const premiumData = await response.json();
                    
                    if (premiumData.success && premiumData.data.isPremium) {
                        await this.showNotification('Премиум доступ активирован!');
                        return { success: true, premiumActivated: true };
                    }
                }
            }
            return { success: false };
        } catch (error) {
            console.error('Error handling payment result:', error);
            return { success: false, error };
        }
    }

    /**
     * Update user information in backend
     */
    async updateUserInBackend(userInfo) {
        try {
            const response = await fetch('https://javelin-hopeful-goshawk.ngrok-free.app/api/vk/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vk_user_id: userInfo.id,
                    username: userInfo.screen_name || `user_${userInfo.id}`,
                    first_name: userInfo.first_name || '',
                    last_name: userInfo.last_name || '',
                    photo_url: userInfo.photo_100 || ''
                })
            });
            
            const result = await response.json();
            console.log('User updated in backend:', result);
            return result;
        } catch (error) {
            console.error('Error updating user in backend:', error);
            return null;
        }
    }

    /**
     * Test payment flow without VK (for development)
     */
    async testPaymentFlow() {
        try {
            console.log('Testing payment flow in development mode...');
            
            // Simulate user info
            const testUserInfo = {
                id: 123456,
                screen_name: 'test_user',
                first_name: 'Test',
                last_name: 'User',
                photo_100: 'https://vk.com/test.jpg'
            };
            
            // Update user in backend
            await this.updateUserInBackend(testUserInfo);
            
            // Simulate premium activation
            await this.showNotification('Тест: Премиум доступ активирован!');
            
            return { success: true, premiumActivated: true, testMode: true };
        } catch (error) {
            console.error('Error in test payment flow:', error);
            return { success: false, error };
        }
    }

    /**
     * Force premium activation (for testing)
     */
    async forcePremiumActivation() {
        try {
            const userInfo = await this.getUserInfo();
            if (userInfo && userInfo.id) {
                await this.updateUserInBackend(userInfo);
                await this.showNotification('Премиум доступ принудительно активирован!');
                return { success: true, premiumActivated: true };
            }
            return { success: false, error: 'No user info' };
        } catch (error) {
            console.error('Error forcing premium activation:', error);
            return { success: false, error };
        }
    }

    /**
     * Show story box
     */
    async showStoryBox() {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppShowStoryBox', {
                background_type: 'image',
                url: 'https://your-domain.com/story-background.jpg',
                attachment: {
                    type: 'photo',
                    owner_id: 0, // Replace with your community ID
                    id: 0 // Replace with photo ID
                }
            });
        } catch (error) {
            console.error('Error showing story box:', error);
        }
    }

    /**
     * Get launch parameters
     */
    async getLaunchParams() {
        if (!this.bridge) return {};
        
        try {
            const result = await this.bridge.send('VKWebAppGetLaunchParams');
            return result;
        } catch (error) {
            console.error('Error getting launch params:', error);
            return {};
        }
    }

    /**
     * Check if running in VK platform
     */
    isVKEnvironment() {
        return this.isVKPlatform;
    }

    /**
     * Get user info
     */
    getUserData() {
        return this.userInfo;
    }

    /**
     * Get VK analytics data
     */
    getVKAnalyticsData() {
        return {
            isVKPlatform: this.isVKPlatform,
            userInfo: this.userInfo,
            events: this.vkEvents,
            totalEvents: this.vkEvents.length,
            lastEvent: this.vkEvents[this.vkEvents.length - 1]
        };
    }

    /**
     * Track VK-specific quiz events
     */
    trackVKQuizEvent(eventName, parameters = {}) {
        const enhancedParameters = {
            ...parameters,
            platform: 'vk',
            user_id: this.userInfo?.id || null
        };
        
        this.trackVKEvent(`vk_quiz_${eventName}`, enhancedParameters);
    }

    /**
     * Close VK app
     */
    async closeApp() {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppClose', {
                status: 'success'
            });
        } catch (error) {
            console.error('Error closing app:', error);
        }
    }

    /**
     * Expand VK app
     */
    async expandApp() {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppExpand');
        } catch (error) {
            console.error('Error expanding app:', error);
        }
    }

    /**
     * Resize VK app
     */
    async resizeApp(width, height) {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppResizeWindow', {
                width: width,
                height: height
            });
        } catch (error) {
            console.error('Error resizing app:', error);
        }
    }

    /**
     * Set app header
     */
    async setAppHeader(title, color = '#667eea') {
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppSetViewSettings', {
                status_bar_style: 'light',
                action_bar_color: color,
                navigation_bar_color: color
            });
        } catch (error) {
            console.error('Error setting app header:', error);
        }
    }

    /**
     * Show popup
     */
    async showPopup(title, message, buttons = []) {
        if (!this.bridge) {
            return confirm(message);
        }
        
        try {
            const result = await this.bridge.send('VKWebAppShowPopup', {
                title: title,
                message: message,
                buttons: buttons
            });
            return result;
        } catch (error) {
            console.error('Error showing popup:', error);
            return confirm(message);
        }
    }

    /**
     * Show confirmation dialog
     */
    async showConfirm(title, message) {
        return this.showPopup(title, message, [
            { type: 'cancel', text: 'Cancel' },
            { type: 'default', text: 'OK' }
        ]);
    }

    /**
     * Show alert dialog
     */
    async showAlert(title, message) {
        return this.showPopup(title, message, [
            { type: 'default', text: 'OK' }
        ]);
    }

    /**
     * Show banner ad
     */
    async showBannerAd() {
        this.trackVKEvent('vk_banner_ad_attempted', {
            bridge_available: !!this.bridge,
            vk_platform: this.isVKPlatform
        });
        
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppShowBannerAd', {
                    banner_location: 'bottom'
                });
                console.log('Banner ad shown');
                
                this.trackVKEvent('vk_banner_ad_shown');
                return true;
            } else {
                console.log('Banner ad not available - not in VK environment');
                
                this.trackVKEvent('vk_banner_ad_not_available', {
                    reason: 'not_vk_environment'
                });
                return false;
            }
        } catch (error) {
            console.error('Error showing banner ad:', error);
            
            this.trackVKEvent('vk_banner_ad_error', {
                error_message: error.message
            });
            return false;
        }
    }

    /**
     * Hide banner ad
     */
    async hideBannerAd() {
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppHideBannerAd');
                console.log('Banner ad hidden');
                return true;
            } else {
                console.log('Banner ad hide not available - not in VK environment');
                return false;
            }
        } catch (error) {
            console.error('Error hiding banner ad:', error);
            return false;
        }
    }

    /**
     * Show interstitial ad
     */
    async showInterstitialAd() {
        this.trackVKEvent('vk_interstitial_ad_attempted', {
            bridge_available: !!this.bridge,
            vk_platform: this.isVKPlatform
        });
        
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppShowInterstitialAd');
                console.log('Interstitial ad shown');
                
                this.trackVKEvent('vk_interstitial_ad_shown');
                return true;
            } else {
                console.log('Interstitial ad not available - not in VK environment');
                
                this.trackVKEvent('vk_interstitial_ad_not_available', {
                    reason: 'not_vk_environment'
                });
                return false;
            }
        } catch (error) {
            console.error('Error showing interstitial ad:', error);
            
            this.trackVKEvent('vk_interstitial_ad_error', {
                error_message: error.message
            });
            return false;
        }
    }

    /**
     * Show rewarded ad
     */
    async showRewardedAd() {
        this.trackVKEvent('vk_rewarded_ad_attempted', {
            bridge_available: !!this.bridge,
            vk_platform: this.isVKPlatform
        });
        
        try {
            if (this.bridge && this.isVKPlatform) {
                const result = await this.bridge.send('VKWebAppShowRewardedAd');
                console.log('Rewarded ad result:', result);
                
                this.trackVKEvent('vk_rewarded_ad_result', {
                    result: result.result,
                    reward_type: result.reward_type,
                    reward_amount: result.reward_amount
                });
                
                return result;
            } else {
                console.log('Rewarded ad not available - not in VK environment');
                
                this.trackVKEvent('vk_rewarded_ad_not_available', {
                    reason: 'not_vk_environment'
                });
                
                return { result: 'not_available' };
            }
        } catch (error) {
            console.error('Error showing rewarded ad:', error);
            
            this.trackVKEvent('vk_rewarded_ad_error', {
                error_message: error.message
            });
            
            return { result: 'error', error: error.message };
        }
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.vkBridgeManager = new VKBridgeManager();
} 