/**
 * VK Bridge Manager
 * Handles VK Mini Apps integration and platform-specific functionality
 */



export class VKBridgeManager {
    constructor() {
        this.bridge = null;
        this.isVKPlatform = false;
        this.userInfo = null;
        this.init();
    }

    /**
     * Initialize VK Bridge
     */
    async init() {
        try {
            console.log('Initializing VK Bridge Manager...');
            console.log('VK Bridge available:', typeof window.vkBridge !== 'undefined');
            
            // Check if VK Bridge is available
            if (typeof window.vkBridge !== 'undefined') {
                this.bridge = window.vkBridge;
                this.isVKPlatform = true;
                
                console.log('VK Bridge detected - running in VK environment');
                
                // Apply VK-specific styles
                this.applyVKStyles();
                
                // Subscribe to bridge events
                this.bridge.subscribe(({ detail: { type, data } }) => {
                    this.handleBridgeEvent(type, data);
                });

                // Send ready event
                await this.bridge.send('VKWebAppInit');
                console.log('VKWebAppInit sent');
                
                // Get user info
                await this.getUserInfo();
                
                // Configure app appearance
                await this.configureAppearance();
                
                console.log('VK Bridge initialized successfully');
            } else {
                console.log('VK Bridge not available - running in standalone mode');
                this.isVKPlatform = false;
            }
        } catch (error) {
            console.error('Error initializing VK Bridge:', error);
            this.isVKPlatform = false;
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
     * Handle bridge events
     */
    handleBridgeEvent(type, data) {
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
        }
    }

    /**
     * Get user information
     */
    async getUserInfo() {
        if (!this.bridge) return null;
        
        try {
            const result = await this.bridge.send('VKWebAppGetUserInfo');
            this.userInfo = result;
            return result;
        } catch (error) {
            console.error('Error getting user info:', error);
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
        if (!this.bridge) {
            // Fallback to native sharing
            return this.fallbackShare(shareText);
        }

        try {
            await this.bridge.send('VKWebAppShare', {
                link: window.location.href,
                title: 'MBTI Personality Quiz Results',
                text: shareText
            });
        } catch (error) {
            console.error('Error sharing via VK:', error);
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
        if (!this.bridge) return;
        
        try {
            await this.bridge.send('VKWebAppShowOrderBox', {
                type: 'item',
                item: 'premium_access'
            });
        } catch (error) {
            console.error('Error showing order box:', error);
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
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppShowBannerAd', {
                    banner_location: 'bottom'
                });
                console.log('Banner ad shown');
                return true;
            } else {
                console.log('Banner ad not available - not in VK environment');
                return false;
            }
        } catch (error) {
            console.error('Error showing banner ad:', error);
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
        try {
            if (this.bridge && this.isVKPlatform) {
                await this.bridge.send('VKWebAppShowInterstitialAd');
                console.log('Interstitial ad shown');
                return true;
            } else {
                console.log('Interstitial ad not available - not in VK environment');
                return false;
            }
        } catch (error) {
            console.error('Error showing interstitial ad:', error);
            return false;
        }
    }

    /**
     * Show rewarded ad
     */
    async showRewardedAd() {
        try {
            if (this.bridge && this.isVKPlatform) {
                const result = await this.bridge.send('VKWebAppShowRewardedAd');
                console.log('Rewarded ad result:', result);
                return result;
            } else {
                console.log('Rewarded ad not available - not in VK environment');
                return { result: 'not_available' };
            }
        } catch (error) {
            console.error('Error showing rewarded ad:', error);
            return { result: 'error', error: error.message };
        }
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.vkBridgeManager = new VKBridgeManager();
} 