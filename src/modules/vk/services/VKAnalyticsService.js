/**
 * VK Analytics Service
 * Handles all VK-related analytics tracking
 */

import { VKConfig } from '../config/VKConfig.js';

export class VKAnalyticsService {
    constructor(logger) {
        this.logger = logger;
        this.events = [];
        this.isEnabled = VKConfig.isFeatureEnabled('analytics');
    }
    
    /**
     * Track VK event with enhanced parameters
     */
    trackEvent(eventName, parameters = {}, options = {}) {
        if (!this.isEnabled) {
            return;
        }
        
        try {
            const enhancedParameters = this.enhanceParameters(parameters, options);
            
            // Log to Firebase Analytics if available
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent(eventName, enhancedParameters);
            }
            
            // Store event locally for debugging
            this.storeEvent(eventName, enhancedParameters);
            
            // Debug logging
            if (window.firebaseAnalyticsDebug) {
                this.logger.debug('🔥 VK Analytics Event:', eventName, enhancedParameters);
            }
            
        } catch (error) {
            this.logger.warn('Failed to track VK event:', error);
        }
    }
    
    /**
     * Track VK-specific events with predefined parameters
     */
    trackVKEvent(eventType, parameters = {}) {
        const eventName = `vk_${eventType}`;
        this.trackEvent(eventName, parameters);
    }
    
    /**
     * Track bridge initialization events
     */
    trackBridgeInit(attempted = true, success = false, error = null) {
        this.trackVKEvent('bridge_init', {
            attempted,
            success,
            bridge_available: typeof window.vkBridge !== 'undefined',
            error_type: error?.error_type || null,
            error_code: error?.error_data?.error_code || null
        });
    }
    
    /**
     * Track user information events
     */
    trackUserInfo(userInfo, success = true, error = null) {
        this.trackVKEvent('user_info', {
            success,
            user_id: userInfo?.id || null,
            has_username: !!userInfo?.screen_name,
            has_photo: !!userInfo?.photo_100,
            error_type: error?.error_type || null,
            error_code: error?.error_data?.error_code || null
        });
    }
    
    /**
     * Track payment events
     */
    trackPayment(productId, success = false, error = null, orderId = null) {
        this.trackVKEvent('payment', {
            product_id: productId,
            success,
            order_id: orderId,
            error_type: error?.error_type || null,
            error_code: error?.error_data?.error_code || null,
            error_reason: error?.error_data?.error_reason || null
        });
    }
    
    /**
     * Track premium status events
     */
    trackPremiumStatus(isPremium, source = 'unknown', error = null) {
        this.trackVKEvent('premium_status', {
            is_premium: isPremium,
            source,
            error_type: error?.error_type || null,
            error_code: error?.error_data?.error_code || null
        });
    }
    
    /**
     * Track user data saving events
     */
    trackUserDataSave(userId, success = false, error = null) {
        this.trackVKEvent('user_data_save', {
            user_id: userId,
            success,
            error_message: error?.message || null,
            error_type: error?.name || null
        });
    }
    
    /**
     * Track quiz events
     */
    trackQuizEvent(eventType, parameters = {}) {
        this.trackVKEvent(`quiz_${eventType}`, {
            ...parameters,
            platform: 'vk'
        });
    }
    
    /**
     * Track sharing events
     */
    trackSharing(personalityType, success = false, error = null) {
        this.trackVKEvent('sharing', {
            personality_type: personalityType,
            success,
            error_type: error?.error_type || null,
            error_code: error?.error_data?.error_code || null
        });
    }
    
    /**
     * Track ad events
     */
    trackAdEvent(adType, action, success = false, error = null) {
        this.trackVKEvent(`ad_${adType}`, {
            action,
            success,
            error_type: error?.error_type || null,
            error_code: error?.error_data?.error_code || null
        });
    }
    
    /**
     * Set VK user properties in Firebase Analytics
     */
    setUserProperties(userInfo) {
        if (!this.isEnabled || !window.firebaseAnalytics || !userInfo) {
            return;
        }
        
        try {
            const userProperties = {
                vk_user_id: userInfo.id?.toString(),
                vk_username: userInfo.screen_name || `user_${userInfo.id}`,
                vk_first_name: userInfo.first_name || '',
                vk_last_name: userInfo.last_name || '',
                vk_has_photo: !!userInfo.photo_100,
                vk_platform: true,
                user_type: 'vk_user'
            };
            
            // Try to set user properties
            if (typeof window.firebaseAnalytics.setUserProperties === 'function') {
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
            
            // Set user ID
            if (typeof window.firebaseAnalytics.setUserId === 'function') {
                window.firebaseAnalytics.setUserId(userInfo.id?.toString());
            } else {
                // Fallback: log user ID as an event
                window.firebaseAnalytics.logEvent('vk_user_id_set', {
                    vk_user_id: userInfo.id?.toString()
                });
            }
            
            // Track user ID setting event
            this.trackVKEvent('user_id_set', {
                user_id: userInfo.id?.toString(),
                username: userInfo.screen_name || `user_${userInfo.id}`,
                has_photo: !!userInfo.photo_100
            });
            
        } catch (error) {
            this.logger.warn('Failed to set VK user properties:', error);
            
            // Track the error
            this.trackVKEvent('user_properties_error', {
                error_message: error.message,
                user_id: userInfo?.id?.toString()
            });
        }
    }
    
    /**
     * Enhance parameters with VK-specific context
     */
    enhanceParameters(parameters, options = {}) {
        const enhanced = {
            ...parameters,
            vk_platform: true,
            timestamp: new Date().toISOString(),
            session_id: this.getSessionId(),
            ...options.context
        };
        
        // Add user info if available
        if (window.vkBridgeManager?.userInfo) {
            enhanced.vk_user_id = window.vkBridgeManager.userInfo.id;
        }
        
        return enhanced;
    }
    
    /**
     * Store event locally for debugging
     */
    storeEvent(eventName, parameters) {
        this.events.push({
            event: eventName,
            parameters,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 events to prevent memory issues
        if (this.events.length > 100) {
            this.events = this.events.slice(-100);
        }
    }
    
    /**
     * Get session ID for analytics
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `vk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return this.sessionId;
    }
    
    /**
     * Get analytics data for debugging
     */
    getAnalyticsData() {
        return {
            isEnabled: this.isEnabled,
            totalEvents: this.events.length,
            events: this.events,
            sessionId: this.getSessionId(),
            lastEvent: this.events[this.events.length - 1]
        };
    }
    
    /**
     * Clear stored events
     */
    clearEvents() {
        this.events = [];
        this.logger.debug('VK Analytics events cleared');
    }
    
    /**
     * Enable/disable analytics
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.trackVKEvent('analytics_toggle', {
            enabled,
            reason: 'user_preference'
        });
    }
} 