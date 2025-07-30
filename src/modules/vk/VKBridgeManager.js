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
            // Track VK initialization attempt
            this.trackVKEvent('vk_bridge_init_attempted', {
                bridge_available: typeof window.vkBridge !== 'undefined'
            });
            
            // Check if VK Bridge is available
            if (typeof window.vkBridge !== 'undefined') {
                this.bridge = window.vkBridge;
                this.isVKPlatform = true;
                
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
                // Track VK app initialization
                this.trackVKEvent('vk_app_initialized');
                
                // Get user info
                await this.getUserInfo();
                
                // Configure app appearance (non-blocking)
                this.configureAppearance().catch(error => {
                    // Appearance configuration failed, but don't block initialization
                    if (window.firebaseAnalyticsDebug) {
                        console.log('🔥 VK Appearance configuration failed (non-blocking):', error);
                    }
                });
                
                // Track successful initialization
                this.trackVKEvent('vk_bridge_init_success');
                
                // Debug VK environment
                this.debugVKEnvironment();
            } else {
                this.isVKPlatform = false;
                
                // Track standalone mode
                this.trackVKEvent('vk_standalone_mode');
                
                // Debug VK environment
                this.debugVKEnvironment();
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
                try {
                    if (window.firebaseAnalytics && typeof window.firebaseAnalytics.setUserProperties === 'function') {
                        window.firebaseAnalytics.setUserProperties(userProperties);
                    } else {
                        // Fallback: log user properties as individual events
                        Object.entries(userProperties).forEach(([key, value]) => {
                            window.firebaseAnalytics.logEvent('vk_user_property_set', {
                                property_name: key,
                                property_value: value
                            });
                        });
                    }
                } catch (error) {
                    console.warn('Failed to set user properties, logging as events instead:', error);
                    // Fallback: log user properties as individual events
                    Object.entries(userProperties).forEach(([key, value]) => {
                        window.firebaseAnalytics.logEvent('vk_user_property_set', {
                            property_name: key,
                            property_value: value
                        });
                    });
                }
                
                // Set user ID
                try {
                    if (window.firebaseAnalytics && typeof window.firebaseAnalytics.setUserId === 'function') {
                        window.firebaseAnalytics.setUserId(userInfo.id?.toString());
                    } else {
                        // Fallback: log user ID as an event
                        window.firebaseAnalytics.logEvent('vk_user_id_set', {
                            vk_user_id: userInfo.id?.toString()
                        });
                    }
                } catch (error) {
                    console.warn('Failed to set user ID, logging as event instead:', error);
                    // Fallback: log user ID as an event
                    window.firebaseAnalytics.logEvent('vk_user_id_set', {
                        vk_user_id: userInfo.id?.toString()
                    });
                }
                
                // Track user ID setting event
                this.trackVKEvent('vk_user_id_set', {
                    user_id: userInfo.id?.toString(),
                    username: userInfo.screen_name || `user_${userInfo.id}`,
                    has_photo: !!userInfo.photo_100
                });
                
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
        // Track appearance configuration attempt
        this.trackVKEvent('vk_appearance_config_attempted', {
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        if (!this.isVKFeatureSupported('appearance')) {
            // Track fallback usage
            this.trackVKEvent('vk_appearance_config_fallback', {
                reason: 'feature_not_supported'
            });
            return;
        }
        
        try {
            // Try to configure appearance with minimal settings first
            await this.bridge.send('VKWebAppSetViewSettings', {
                status_bar_style: 'light'
            });
            
            // Track successful configuration
            this.trackVKEvent('vk_appearance_config_success');
            
        } catch (error) {
            // If the first attempt fails, try with even more minimal settings
            try {
                await this.bridge.send('VKWebAppSetViewSettings', {});
                this.trackVKEvent('vk_appearance_config_success_minimal');
            } catch (secondError) {
                // Handle VK error gracefully
                const errorResult = this.handleVKError(secondError, 'configureAppearance');
                
                // Track configuration error
                this.trackVKEvent('vk_appearance_config_error', {
                    error_type: secondError.error_type,
                    error_code: secondError.error_data?.error_code,
                    error_reason: secondError.error_data?.error_reason,
                    fallback_used: errorResult.fallback,
                    first_error: error.error_type,
                    second_error: secondError.error_type
                });
                
                // Log the error details for debugging
                if (window.firebaseAnalyticsDebug) {
                    console.log('🔥 VK Appearance Configuration Error Details:', {
                        first_attempt_error: error,
                        second_attempt_error: secondError,
                        bridge_available: !!this.bridge,
                        is_vk_platform: this.isVKPlatform
                    });
                }
            }
        }
    }

    /**
     * Handle config update
     */
    handleConfigUpdate(data) {
        // Update app theme based on VK theme
        if (data.scheme) {
            document.documentElement.setAttribute('data-theme', data.scheme);
        }
    }

    /**
     * Handle view restrictions
     */
    handleViewRestrictions(data) {
        // Handle any view restrictions from VK
    }

    /**
     * Handle user info
     */
    handleUserInfo(data) {
        this.userInfo = data;
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
            // Handle VK error gracefully
            const errorResult = this.handleVKError(error, 'shareResults');
            
            this.trackVKEvent('vk_share_error', {
                error_message: error.message,
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_reason: error.error_data?.error_reason,
                personality_type: personalityType,
                fallback_used: errorResult.fallback
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
        // Track notification attempt
        this.trackVKEvent('vk_notification_attempted', {
            message_length: message.length,
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        // Additional safety check: ensure we're actually in VK environment
        const isActuallyVK = this.isVKPlatform && this.bridge && this.isVKEnvironment();
        
        if (this.isVKFeatureSupported('snackbar') && isActuallyVK) {
            try {
                await this.bridge.send('VKWebAppShowSnackbar', {
                    text: message
                });
                
                // Track successful notification
                this.trackVKEvent('vk_notification_success', {
                    message_length: message.length
                });
            } catch (error) {
                // Handle VK error gracefully
                const errorResult = this.handleVKError(error, 'showNotification');
                
                // Track notification error
                this.trackVKEvent('vk_notification_error', {
                    error_type: error.error_type,
                    error_code: error.error_data?.error_code,
                    error_reason: error.error_data?.error_reason,
                    message_length: message.length,
                    fallback_used: errorResult.fallback
                });
                
                // Fallback to alert
                alert(message);
            }
        } else {
            // Not in VK environment or bridge not available, use fallback
            const fallbackReason = !this.isVKPlatform ? 'not_vk_platform' : 
                                  !this.bridge ? 'bridge_not_available' : 
                                  !this.isVKEnvironment() ? 'environment_check_failed' : 'feature_not_supported';
            
            alert(message);
            
            // Track fallback usage
            this.trackVKEvent('vk_notification_fallback', {
                reason: fallbackReason,
                is_vk_platform: this.isVKPlatform,
                bridge_available: !!this.bridge,
                is_vk_environment: this.isVKEnvironment(),
                message_length: message.length
            });
        }
    }

    /**
     * Show community widget
     */
    async showCommunityWidget() {
        // Track community widget attempt
        this.trackVKEvent('vk_community_widget_attempted', {
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        if (!this.isVKFeatureSupported('community')) {
            // Track fallback usage
            this.trackVKEvent('vk_community_widget_fallback', {
                reason: 'feature_not_supported'
            });
            return;
        }
        
        try {
            await this.bridge.send('VKWebAppShowCommunityWidgetPreviewBox', {
                group_id: 0, // Replace with your community ID
                type: 'text',
                code: 'return { title: "Join our community!", text: "Connect with others who share your personality type!" };'
            });
            
            // Track successful widget display
            this.trackVKEvent('vk_community_widget_success');
            
        } catch (error) {
            // Handle VK error gracefully
            const errorResult = this.handleVKError(error, 'showCommunityWidget');
            
            // Track widget error
            this.trackVKEvent('vk_community_widget_error', {
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_reason: error.error_data?.error_reason,
                fallback_used: errorResult.fallback
            });
        }
    }

    /**
     * Show story box
     */
    async showStoryBox() {
        // Track story box attempt
        this.trackVKEvent('vk_story_box_attempted', {
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        if (!this.isVKFeatureSupported('story')) {
            // Track fallback usage
            this.trackVKEvent('vk_story_box_fallback', {
                reason: 'feature_not_supported'
            });
            return;
        }
        
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
            
            // Track successful story box display
            this.trackVKEvent('vk_story_box_success');
            
        } catch (error) {
            // Handle VK error gracefully
            const errorResult = this.handleVKError(error, 'showStoryBox');
            
            // Track story box error
            this.trackVKEvent('vk_story_box_error', {
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_reason: error.error_data?.error_reason,
                fallback_used: errorResult.fallback
            });
        }
    }

    /**
     * Get launch parameters
     */
    async getLaunchParams() {
        // Track launch params attempt
        this.trackVKEvent('vk_launch_params_attempted', {
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        if (!this.isVKFeatureSupported('launch_params')) {
            // Track fallback usage
            this.trackVKEvent('vk_launch_params_fallback', {
                reason: 'feature_not_supported'
            });
            return {};
        }
        
        try {
            const result = await this.bridge.send('VKWebAppGetLaunchParams');
            
            // Track successful launch params retrieval
            this.trackVKEvent('vk_launch_params_success');
            
            return result;
        } catch (error) {
            // Handle VK error gracefully
            const errorResult = this.handleVKError(error, 'getLaunchParams');
            
            // Track launch params error
            this.trackVKEvent('vk_launch_params_error', {
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_reason: error.error_data?.error_reason,
                fallback_used: errorResult.fallback
            });
            
            return {};
        }
    }

    /**
     * Check if running in VK platform
     */
    isVKEnvironment() {
        // More strict VK environment detection
        // Primary indicator: isVKPlatform flag (set during initialization)
        if (this.isVKPlatform) {
            this.trackVKEvent('vk_environment_check', {
                method: 'isVKPlatform_flag',
                result: true
            });
            return true;
        }
        
        // Secondary indicators: URL-based detection
        const urlIndicators = [
            window.location.hostname.includes('vk.com'),
            window.location.hostname.includes('m.vk.com'),
            window.location.search.includes('vk_'),
            document.referrer.includes('vk.com')
        ];
        
        const hasVKUrlIndicators = urlIndicators.some(indicator => indicator);
        
        // Track environment check
        this.trackVKEvent('vk_environment_check', {
            method: 'url_indicators',
            is_vk_platform: this.isVKPlatform,
            bridge_available: typeof window.vkBridge !== 'undefined',
            hostname_contains_vk: window.location.hostname.includes('vk.com'),
            url_has_vk_params: window.location.search.includes('vk_'),
            referrer_contains_vk: document.referrer.includes('vk.com'),
            has_vk_url_indicators: hasVKUrlIndicators,
            final_result: hasVKUrlIndicators
        });
        
        return hasVKUrlIndicators;
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
     * Check if a VK feature is supported
     */
    isVKFeatureSupported(feature) {
        const supportedFeatures = {
            snackbar: this.isVKEnvironment() && !!this.bridge,
            payment: this.isVKEnvironment() && !!this.bridge,
            sharing: this.isVKEnvironment() && !!this.bridge,
            ads: this.isVKEnvironment() && !!this.bridge,
            story: this.isVKEnvironment() && !!this.bridge,
            community: this.isVKEnvironment() && !!this.bridge,
            appearance: this.isVKEnvironment() && !!this.bridge && this.isVKMethodSupported('VKWebAppSetViewSettings'),
            launch_params: this.isVKEnvironment() && !!this.bridge
        };
        
        return supportedFeatures[feature] || false;
    }

    /**
     * Check if a specific VK method is supported
     */
    isVKMethodSupported(methodName) {
        if (!this.bridge || !this.bridge.send) {
            return false;
        }
        
        // For now, we'll assume methods are supported if bridge is available
        // In the future, this could be enhanced with a method availability check
        return true;
    }

    /**
     * Debug VK environment status
     */
    debugVKEnvironment() {
        const debugInfo = {
            isVKPlatform: this.isVKPlatform,
            bridgeAvailable: typeof window.vkBridge !== 'undefined',
            hostname: window.location.hostname,
            searchParams: window.location.search,
            referrer: document.referrer,
            isVKEnvironment: this.isVKEnvironment(),
            featureSupport: {
                snackbar: this.isVKFeatureSupported('snackbar'),
                payment: this.isVKFeatureSupported('payment'),
                sharing: this.isVKFeatureSupported('sharing'),
                appearance: this.isVKFeatureSupported('appearance')
            }
        };
        
        // Track debug info
        this.trackVKEvent('vk_environment_debug', debugInfo);
        
        return debugInfo;
    }

    /**
     * Handle VK-specific errors gracefully
     */
    handleVKError(error, context = '') {
        // Only log errors in debug mode or for critical contexts
        const shouldLogError = window.firebaseAnalyticsDebug || 
                              context === 'init' || 
                              context === 'getUserInfo' ||
                              error.error_data?.error_code !== 6; // Don't log unsupported platform errors
        
        if (shouldLogError) {
            console.error(`VK Error in ${context}:`, error);
        }
        
        // Track the error
        this.trackVKEvent('vk_error', {
            context: context,
            error_type: error.error_type,
            error_code: error.error_data?.error_code,
            error_reason: error.error_data?.error_reason,
            error_message: error.message || error.toString(),
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        // Return appropriate fallback based on error type
        if (error.error_data?.error_code === 6) {
            // Unsupported platform error - this is expected in non-VK environments
            return {
                success: false,
                error: 'unsupported_platform',
                message: 'This feature is only available in VK environment',
                fallback: true,
                expected: true
            };
        }
        
        // For client errors in appearance configuration, treat as non-critical
        if (error.error_type === 'client_error' && context === 'configureAppearance') {
            return {
                success: false,
                error: 'appearance_config_failed',
                message: 'Appearance configuration not supported in this VK environment',
                fallback: true,
                non_critical: true
            };
        }
        
        // For order errors (error code 13), provide specific handling
        if (error.error_data?.error_code === 13 && context === 'showOrderBox') {
            return {
                success: false,
                error: 'order_configuration_error',
                message: 'Payment configuration error. Please contact support.',
                fallback: true,
                order_error: true,
                error_code: 13
            };
        }
        
        return {
            success: false,
            error: 'vk_error',
            message: error.error_data?.error_reason || error.message || 'VK operation failed',
            fallback: true
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
                this.trackVKEvent('vk_banner_ad_shown');
                return true;
            } else {
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
                return true;
            } else {
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
                this.trackVKEvent('vk_interstitial_ad_shown');
                return true;
            } else {
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
     * Show VK order box for premium purchase
     */
    async showOrderBox(productId = 'mbti_premium', productName = 'MBTI премиум') {
        // Track order box attempt
        this.trackVKEvent('vk_order_box_attempted', {
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge,
            product_id: productId,
            product_name: productName
        });
        
        if (!this.isVKFeatureSupported('payment')) {
            // Track fallback usage
            this.trackVKEvent('vk_order_box_fallback', {
                reason: 'payment_not_supported',
                product_id: productId
            });
            
            // Return fallback result
            return {
                success: false,
                error: 'payment_not_supported',
                message: 'Payment is not supported in this environment',
                fallback: true
            };
        }
        
        try {
            const result = await this.bridge.send('VKWebAppShowOrderBox', {
                type: 'item',
                item: productId,
                title: productName,
                description: 'Доступ к премиум-функциям',
                photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTMyIDEyQzIxLjUgMTIgMTMgMjAuNSAxMyAzMUMxMyA0MS41IDIxLjUgNTAgMzIgNTBDNDIuNSA1MCA1MSA0MS41IDUxIDMxQzUxIDIwLjUgNDIuNSAxMiAzMiAxMloiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTI4IDI0SDM2VjQwSDI4VjI0WiIgZmlsbD0iIzAwMCIvPgo8cGF0aCBkPSJNMjQgMjhIMzZWMzJIMjRWMjhaIiBmaWxsPSIjMDAwIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMDAwIj40MDwvdGV4dD4KPC9zdmc+', // Replace with your icon URL
                price: 40, // Price in kopecks (1.99 RUB)
                discount: 0, // Discount percentage
                currency: 'Голоса'
            });
            
            // Track successful order box display
            this.trackVKEvent('vk_order_box_success', {
                product_id: productId,
                order_id: result.order_id,
                status: result.status
            });
            
            return {
                success: true,
                order_id: result.order_id,
                status: result.status,
                product_id: productId
            };
            
        } catch (error) {
            // Handle VK error gracefully
            const errorResult = this.handleVKError(error, 'showOrderBox');
            
            // Track order box error
            this.trackVKEvent('vk_order_box_error', {
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_reason: error.error_data?.error_reason,
                product_id: productId,
                fallback_used: errorResult.fallback
            });
            
            // Log detailed error information in debug mode
            if (window.firebaseAnalyticsDebug) {
                console.log('🔥 VK Order Box Error Details:', {
                    error: error,
                    error_code: error.error_data?.error_code,
                    error_reason: error.error_data?.error_reason,
                    product_id: productId,
                    product_name: productName,
                    bridge_available: !!this.bridge,
                    is_vk_platform: this.isVKPlatform
                });
            }
            
            return errorResult;
        }
    }

    /**
     * Handle order box result and process payment
     */
    async handleOrderBoxResult(result) {
        if (result.success && result.status === 'success') {
            // Payment successful
            this.trackVKEvent('vk_payment_successful', {
                order_id: result.order_id,
                product_id: result.product_id
            });
            
            return {
                success: true,
                message: 'Payment successful! Premium access activated.',
                order_id: result.order_id
            };
        } else if (result.status === 'cancel') {
            // User cancelled the payment
            this.trackVKEvent('vk_payment_cancelled', {
                product_id: result.product_id
            });
            
            return {
                success: false,
                message: 'Payment was cancelled by user.',
                cancelled: true
            };
        } else {
            // Payment failed
            this.trackVKEvent('vk_payment_failed', {
                status: result.status,
                product_id: result.product_id
            });
            
            return {
                success: false,
                message: 'Payment failed. Please try again.',
                error: result.status
            };
        }
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.vkBridgeManager = new VKBridgeManager();
} 