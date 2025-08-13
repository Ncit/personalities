/**
 * VK Bridge Manager - Refactored
 * Main orchestrator for VK Mini Apps integration using modular services
 */

import { LoggerManager } from '../core/LoggerManager.js';
import { VKConfig } from './config/VKConfig.js';
import { VKErrorHandler } from './utils/VKErrorHandler.js';
import { VKAnalyticsService } from './services/VKAnalyticsService.js';
import { VKPaymentService } from './services/VKPaymentService.js';
import { VKUserService } from './services/VKUserService.js';
import localizationManager from '../../locales/LocalizationManager.js';

export class VKBridgeManager {
    constructor() {
        this.bridge = null;
        this.isVKPlatform = false;
        
        // Initialize logger
        this.logger = new LoggerManager().createModuleLogger('VKBridgeManager');
        
        // Initialize services
        this.errorHandler = new VKErrorHandler(this.logger);
        this.analytics = new VKAnalyticsService(this.logger);
        
        // Initialize user and payment services after bridge is available
        this.userService = null;
        this.paymentService = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize VK Bridge
     */
    async init() {
        try {
            this.analytics.trackBridgeInit(true, false);
            
            // Check if VK Bridge is available
            if (typeof window.vkBridge !== 'undefined') {
                this.bridge = window.vkBridge;
                // Send ready event
                this.bridge.send('VKWebAppInit');
                this.isVKPlatform = true;
                
                this.analytics.trackVKEvent('environment_detected');
                
                // Initialize services that depend on bridge
                this.userService = new VKUserService(this.bridge, this.logger, this.analytics, this.errorHandler);
                this.paymentService = new VKPaymentService(this.bridge, this.logger, this.analytics, this.errorHandler);
                
                // Apply VK-specific styles
                this.applyVKStyles();
                
                // Subscribe to bridge events
                this.bridge.subscribe(({ detail: { type, data } }) => {
                    this.handleBridgeEvent(type, data);
                });

                this.analytics.trackVKEvent('app_initialized');
                
                // Get user info
                await this.userService.getUserInfo();
                
                // Check premium status (non-blocking)
                this.userService.checkPremiumStatus().catch(error => {
                    if (window.showAppAlert) {
                        window.showAppAlert('Premium status check failed (non-blocking)');
                    } else {
                        alert('Premium status check failed (non-blocking)');
                    }
                    this.logger.warn('Premium status check failed (non-blocking):', error);
                });
                
                // Configure app appearance (non-blocking)
                this.configureAppearance().catch(error => {
                    this.logger.warn('VK Appearance configuration failed (non-blocking):', error);
                });
                
                this.analytics.trackBridgeInit(true, true);
                this.debugVKEnvironment();
                this.exposeDebugMethods();
                
            } else {
                this.isVKPlatform = false;
                this.analytics.trackVKEvent('standalone_mode');
                this.debugVKEnvironment();
            }
        } catch (error) {
            this.logger.error('Error initializing VK Bridge:', error);
            this.isVKPlatform = false;
            this.analytics.trackBridgeInit(true, false, error);
        }
    }

    /**
     * Apply VK-specific styles
     */
    applyVKStyles() {
        document.body.classList.add('vk-platform');
        this.loadVKStyles();
        this.applyVKMetaTags();
    }

    /**
     * Load VK-specific styles
     */
    loadVKStyles() {
        // VK styles are now imported in the main script and included in the build
        // No need to dynamically load them
        this.logger.log('VK styles are already included in the build');
    }

    /**
     * Apply VK-specific meta tags
     */
    applyVKMetaTags() {
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
     * Handle bridge events
     */
    handleBridgeEvent(type, data) {
        this.analytics.trackVKEvent('bridge_event', {
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
            case 'VKWebAppShowOrderBoxResult':
                this.analytics.trackVKEvent('order_box_result_received', {
                    success: data.success,
                    order_id: data.order_id,
                    request_id: data.request_id
                });
                break;
            default:
                this.analytics.trackVKEvent('unhandled_bridge_event', {
                    event_type: type,
                    event_data: JSON.stringify(data)
                });
        }
    }

    /**
     * Configure app appearance
     */
    async configureAppearance() {
        this.analytics.trackVKEvent('appearance_config_attempted', {
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        if (!this.isVKFeatureSupported('appearance')) {
            this.analytics.trackVKEvent('appearance_config_fallback', {
                reason: 'feature_not_supported'
            });
            return;
        }
        
        try {
            await this.bridge.send('VKWebAppSetViewSettings', {
                status_bar_style: 'light'
            });
            
            this.analytics.trackVKEvent('appearance_config_success');
            
        } catch (error) {
            try {
                await this.bridge.send('VKWebAppSetViewSettings', {});
                this.analytics.trackVKEvent('appearance_config_success_minimal');
            } catch (secondError) {
                const errorResult = this.errorHandler.handleError(secondError, 'configureAppearance');
                
                this.analytics.trackVKEvent('appearance_config_error', {
                    error_type: secondError.error_type,
                    error_code: secondError.error_data?.error_code,
                    error_reason: secondError.error_data?.error_reason,
                    fallback_used: errorResult.fallback
                });
            }
        }
    }

    /**
     * Handle config update
     */
    handleConfigUpdate(data) {
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
        this.userService.userInfo = data;
        this.analytics.trackUserInfo(data, true);
        this.analytics.setUserProperties(data);
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
    async shareResults(personalityType, shareText, shareTitle = 'MBTI Personality Quiz Results') {
        this.analytics.trackSharing(personalityType, false, null, { action: 'attempted' });
        
        if (!this.bridge) {
            this.analytics.trackSharing(personalityType, false, null, { action: 'fallback_native' });
            return this.fallbackShare(shareText, shareTitle);
        }

        try {
            await this.bridge.send('VKWebAppShare', {
                link: window.location.href,
                title: shareTitle,
                text: shareText
            });
            
            this.analytics.trackSharing(personalityType, true);
        } catch (error) {
            const errorResult = this.errorHandler.handleError(error, 'shareResults');
            
            this.analytics.trackSharing(personalityType, false, error);
            
            return this.fallbackShare(shareText, shareTitle);
        }
    }

    /**
     * Fallback sharing method
     */
    fallbackShare(shareText, shareTitle = 'MBTI Personality Quiz Results') {
        if (navigator.share) {
            return navigator.share({
                title: shareTitle,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                const message = localizationManager.get('ui.resultsCopiedAlert');
                this.showNotification(message);
            });
        }
    }

    /**
     * Show notification
     */
    async showNotification(message) {
        this.analytics.trackVKEvent('notification_attempted', {
            message_length: message.length,
            vk_platform: this.isVKPlatform,
            bridge_available: !!this.bridge
        });
        
        this.showCustomNotification(message);
        
        this.analytics.trackVKEvent('notification_success', {
            message_length: message.length,
            method: 'custom_dialog'
        });
    }

    /**
     * Show custom notification dialog
     */
    showCustomNotification(message) {
        let notificationContainer = document.getElementById('custom-notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'custom-notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 10px;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="flex: 1; margin-right: 10px;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Уведомление</div>
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
            </div>
            <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                width: 100%;
                animation: progress 3s linear;
            "></div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        if (!document.getElementById('notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);

        notification.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        });
    }

    /**
     * Show banner ad
     */
    async showBannerAd() {
        this.analytics.trackAdEvent('banner', 'show', false, null, { action: 'attempted' });
        
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppShowBannerAd', {
                    banner_location: 'bottom'
                });
                this.analytics.trackAdEvent('banner', 'show', true);
                return true;
            } else {
                this.analytics.trackAdEvent('banner', 'show', false, null, { reason: 'not_vk_environment' });
                return false;
            }
        } catch (error) {
            this.logger.error('Error showing banner ad:', error);
            this.analytics.trackAdEvent('banner', 'show', false, error);
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
            this.logger.error('Error hiding banner ad:', error);
            return false;
        }
    }

    /**
     * Show interstitial ad
     */
    async showInterstitialAd() {
        this.analytics.trackAdEvent('interstitial', 'show', false, null, { action: 'attempted' });
        
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppShowInterstitialAd');
                this.analytics.trackAdEvent('interstitial', 'show', true);
                return true;
            } else {
                this.analytics.trackAdEvent('interstitial', 'show', false, null, { reason: 'not_vk_environment' });
                return false;
            }
        } catch (error) {
            this.logger.error('Error showing interstitial ad:', error);
            this.analytics.trackAdEvent('interstitial', 'show', false, error);
            return false;
        }
    }

    /**
     * Check if running in VK platform
     */
    isVKEnvironment() {
        if (this.isVKPlatform) {
            this.analytics.trackVKEvent('environment_check', {
                method: 'isVKPlatform_flag',
                result: true
            });
            return true;
        }
        
        const urlIndicators = [
            window.location.hostname.includes('vk.com'),
            window.location.hostname.includes('m.vk.com'),
            window.location.search.includes('vk_'),
            document.referrer.includes('vk.com')
        ];
        
        const hasVKUrlIndicators = urlIndicators.some(indicator => indicator);
        
        this.analytics.trackVKEvent('environment_check', {
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
        
        this.analytics.trackVKEvent('environment_debug', debugInfo);
        return debugInfo;
    }

    /**
     * Track VK-specific quiz events
     */
    trackVKQuizEvent(eventName, parameters = {}) {
        this.analytics.trackQuizEvent(eventName, parameters);
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
            this.logger.error('Error closing app:', error);
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
            this.logger.error('Error expanding app:', error);
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
            this.logger.error('Error resizing app:', error);
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
            this.logger.error('Error setting app header:', error);
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
            this.logger.error('Error showing popup:', error);
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
     * Expose debug methods globally for testing
     */
    exposeDebugMethods() {
        // Ensure services are initialized before exposing debug methods
        if (!this.userService) {
            this.logger.warn('VKUserService not initialized, delaying debug methods exposure');
            // Retry after a short delay
            setTimeout(() => this.exposeDebugMethods(), 1000);
            return;
        }
        window.vkDebug = {
            checkPremiumStatus: () => this.userService?.checkPremiumStatus(),
            refreshPremiumStatus: () => this.userService?.refreshPremiumStatus(),
            getUserInfo: () => this.userService?.getUserData(),
            getLocalUserData: () => this.userService?.getLocalUserData(),
            setUserDataSavingEnabled: (enabled) => this.userService?.setUserDataSavingEnabled(enabled),
            isUserDataSavingEnabled: () => this.userService?.isUserDataSavingEnabled(),
            setPremiumStatusCheckingEnabled: (enabled) => this.userService?.setPremiumStatusCheckingEnabled(enabled),
            isPremiumStatusCheckingEnabled: () => this.userService?.isPremiumStatusCheckingEnabled(),
            testCORS: () => {
                if (!this.userService) {
                    console.error('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    if (window.showAppAlert) { window.showAppAlert('VKUserService not initialized. Please wait for VK Bridge to initialize.'); } else { alert('VKUserService not initialized. Please wait for VK Bridge to initialize.'); }
                    return;
                }
                if (typeof this.userService.testCORS !== 'function') {
                    console.error('testCORS method not available on userService');
                    if (window.showAppAlert) { window.showAppAlert('testCORS method not available on userService'); } else { alert('testCORS method not available on userService'); }
                    return;
                }
                return this.userService.testCORS();
            },
            showCORSStatus: () => {
                if (!this.userService) {
                    console.error('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    if (window.showAppAlert) { window.showAppAlert('VKUserService not initialized. Please wait for VK Bridge to initialize.'); } else { alert('VKUserService not initialized. Please wait for VK Bridge to initialize.'); }
                    return;
                }
                return this.userService.showCORSStatus();
            },
            enableFeaturesForTesting: () => {
                if (!this.userService) {
                    console.error('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    if (window.showAppAlert) { window.showAppAlert('VKUserService not initialized. Please wait for VK Bridge to initialize.'); } else { alert('VKUserService not initialized. Please wait for VK Bridge to initialize.'); }
                    return;
                }
                return this.userService.enableFeaturesForTesting();
            },
            getVKEnvironment: () => this.isVKEnvironment(),
            isUserServiceReady: () => {
                const isReady = !!this.userService;
                console.log('VKUserService ready status:', isReady);
                if (!isReady) {
                    if (window.showAppAlert) { window.showAppAlert('VKUserService is not ready. Please wait for VK Bridge to initialize.'); } else { alert('VKUserService is not ready. Please wait for VK Bridge to initialize.'); }
                }
                return isReady;
            },
            forceExposeDebugMethods: () => {
                console.log('Force exposing debug methods...');
                this.exposeDebugMethods();
                return 'Debug methods exposure triggered';
            },
            saveUserDataToServer: () => {
                if (!this.userService) {
                    console.error('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    alert('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    return;
                }
                return this.userService.saveUserDataToServer(this.userService.getUserData());
            },
            forceSaveUserDataToServer: () => {
                if (!this.userService) {
                    console.error('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    alert('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    return;
                }
                return this.userService.forceSaveUserDataToServer(this.userService.getUserData());
            },
            clearUserDataSavedFlag: () => {
                localStorage.removeItem(VKConfig.getStorageKey('userDataSaved'));
                localStorage.removeItem(VKConfig.getStorageKey('userDataSavedTimestamp'));
                this.logger.log('User data saved flag cleared');
            },
            getUserDataSavedStatus: () => ({
                saved: localStorage.getItem(VKConfig.getStorageKey('userDataSaved')) === 'true',
                timestamp: localStorage.getItem(VKConfig.getStorageKey('userDataSavedTimestamp')),
                userInfo: this.userService?.getUserData()
            }),
            getAnalyticsData: () => this.analytics.getAnalyticsData(),
            getPaymentStatus: () => this.paymentService?.getPaymentStatus(),
            getUserStatus: () => this.userService?.getStatus(),
            testCheckPurchase: () => {
                if (!this.userService) {
                    console.error('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    alert('VKUserService not initialized. Please wait for VK Bridge to initialize.');
                    return;
                }
                return this.userService.testCheckPurchase();
            }
        };
    }

    // Delegate methods to services for backward compatibility
    get userInfo() {
        return this.userService?.getUserData();
    }

    async getUserInfo() {
        return this.userService?.getUserInfo();
    }

    async saveUserDataToServer(userInfo) {
        return this.userService?.saveUserDataToServer(userInfo);
    }

    async forceSaveUserDataToServer(userInfo) {
        return this.userService?.forceSaveUserDataToServer(userInfo);
    }

    async checkPremiumStatus() {
        return this.userService?.checkPremiumStatus();
    }

    async refreshPremiumStatus() {
        return this.userService?.refreshPremiumStatus();
    }

    async showOrderBox(productId, productName) {
        return this.paymentService?.showOrderBox(productId, productName);
    }

    async handleOrderBoxResult(result) {
        return this.paymentService?.handleOrderBoxResult(result);
    }

    async purchaseSubscription(tier) {
        return this.paymentService?.purchaseSubscription(tier);
    }

    getVKAnalyticsData() {
        return this.analytics.getAnalyticsData();
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.vkBridgeManager = new VKBridgeManager();
} 