/**
 * VK Error Handler Module
 * Centralized error handling for VK Mini Apps integration
 */

import { VKConfig } from '../config/VKConfig.js';

export class VKErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }
    
    /**
     * Handle VK-specific errors with appropriate fallbacks
     */
    handleError(error, context = '', options = {}) {
        const errorInfo = this.analyzeError(error);
        const fallback = this.determineFallback(errorInfo, context, options);
        
        // Log error based on severity
        this.logError(errorInfo, context, options);
        
        // Track error analytics
        this.trackError(errorInfo, context);
        
        return {
            success: false,
            error: errorInfo.type,
            message: errorInfo.userMessage,
            fallback: fallback,
            details: errorInfo,
            context: context
        };
    }
    
    /**
     * Analyze error and extract relevant information
     */
    analyzeError(error) {
        const errorInfo = {
            original: error,
            type: 'unknown',
            code: null,
            message: error.message || error.toString(),
            userMessage: 'An unexpected error occurred',
            severity: 'medium',
            recoverable: true,
            expected: false
        };
        
        // Handle VK-specific errors
        if (error.error_data) {
            errorInfo.code = error.error_data.error_code;
            errorInfo.reason = error.error_data.error_reason;
            errorInfo.type = error.error_type || 'vk_error';
            
            // Map error codes to user-friendly messages
            switch (errorInfo.code) {
                case VKConfig.ERROR_CODES.UNSUPPORTED_PLATFORM:
                    errorInfo.type = 'unsupported_platform';
                    errorInfo.userMessage = 'This feature is only available in VK environment';
                    errorInfo.severity = 'low';
                    errorInfo.expected = true;
                    break;
                    
                case VKConfig.ERROR_CODES.ORDER_CONFIGURATION_ERROR:
                    errorInfo.type = 'payment_configuration_error';
                    errorInfo.userMessage = 'Payment configuration error. Please contact support.';
                    errorInfo.severity = 'high';
                    errorInfo.recoverable = false;
                    break;
                    
                default:
                    errorInfo.userMessage = errorInfo.reason || 'VK operation failed';
                    break;
            }
        }
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorInfo.type = 'network_error';
            errorInfo.userMessage = 'Network connection error. Please check your internet connection.';
            errorInfo.severity = 'medium';
            errorInfo.recoverable = true;
        }
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
            errorInfo.type = 'timeout_error';
            errorInfo.userMessage = 'Request timed out. Please try again.';
            errorInfo.severity = 'medium';
            errorInfo.recoverable = true;
        }
        
        return errorInfo;
    }
    
    /**
     * Determine appropriate fallback strategy
     */
    determineFallback(errorInfo, context, options) {
        const fallback = {
            available: false,
            method: null,
            data: null
        };
        
        // Determine fallback based on error type and context
        switch (errorInfo.type) {
            case 'unsupported_platform':
                fallback.available = true;
                fallback.method = 'native_fallback';
                break;
                
            case 'network_error':
            case 'timeout_error':
                if (context === 'premium_status_check') {
                    fallback.available = true;
                    fallback.method = 'local_storage';
                    fallback.data = this.getLocalPremiumStatus();
                }
                break;
                
            case 'payment_configuration_error':
                fallback.available = true;
                fallback.method = 'manual_payment';
                break;
        }
        
        return fallback;
    }
    
    /**
     * Log error with appropriate level based on severity
     */
    logError(errorInfo, context, options) {
        const shouldLog = this.shouldLogError(errorInfo, context, options);
        
        if (!shouldLog) return;
        
        const logData = {
            error: errorInfo,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        switch (errorInfo.severity) {
            case 'high':
                this.logger.error(`VK Error in ${context}:`, logData);
                break;
            case 'medium':
                this.logger.warn(`VK Warning in ${context}:`, logData);
                break;
            case 'low':
                this.logger.debug(`VK Info in ${context}:`, logData);
                break;
        }
    }
    
    /**
     * Track error in analytics
     */
    trackError(errorInfo, context) {
        try {
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent('vk_error', {
                    error_type: errorInfo.type,
                    error_code: errorInfo.code,
                    error_context: context,
                    error_severity: errorInfo.severity,
                    error_recoverable: errorInfo.recoverable,
                    error_expected: errorInfo.expected,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (analyticsError) {
            this.logger.warn('Failed to track error in analytics:', analyticsError);
        }
    }
    
    /**
     * Determine if error should be logged
     */
    shouldLogError(errorInfo, context, options) {
        // Don't log expected errors in production
        if (errorInfo.expected && !window.firebaseAnalyticsDebug) {
            return false;
        }
        
        // Don't log unsupported platform errors
        if (errorInfo.type === 'unsupported_platform') {
            return false;
        }
        
        // Always log critical contexts
        const criticalContexts = ['init', 'getUserInfo', 'payment'];
        if (criticalContexts.includes(context)) {
            return true;
        }
        
        // Log based on severity
        return errorInfo.severity !== 'low' || window.firebaseAnalyticsDebug;
    }
    
    /**
     * Get local premium status as fallback
     */
    getLocalPremiumStatus() {
        try {
            const premiumFlag = localStorage.getItem(VKConfig.getStorageKey('premiumStatus'));
            const subscriptionData = localStorage.getItem(VKConfig.getStorageKey('subscriptionData'));
            
            if (premiumFlag === 'true') {
                return { isPremium: true, source: 'local_flag' };
            }
            
            if (subscriptionData) {
                const subscription = JSON.parse(subscriptionData);
                if (subscription && subscription.isActive) {
                    return { isPremium: true, source: 'local_subscription' };
                }
            }
            
            return { isPremium: false, source: 'local_default' };
        } catch (error) {
            this.logger.warn('Error reading local premium status:', error);
            return { isPremium: false, source: 'local_error' };
        }
    }
    
    /**
     * Create user-friendly error message
     */
    createUserMessage(errorInfo, context) {
        const messages = {
            payment: {
                unsupported_platform: 'Payment is not available in this environment',
                payment_configuration_error: 'Payment system is temporarily unavailable',
                network_error: 'Network error. Please check your connection and try again.',
                timeout_error: 'Payment request timed out. Please try again.',
                default: 'Payment failed. Please try again later.'
            },
            user_info: {
                unsupported_platform: 'User information is not available in this environment',
                network_error: 'Unable to load user information. Please try again.',
                default: 'Failed to load user information.'
            },
            premium_status: {
                unsupported_platform: 'Premium status check is not available in this environment',
                network_error: 'Unable to check premium status. Using local data.',
                default: 'Premium status check failed.'
            }
        };
        
        const contextMessages = messages[context] || messages.default || {};
        return contextMessages[errorInfo.type] || contextMessages.default || errorInfo.userMessage;
    }
} 