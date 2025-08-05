/**
 * VK User Service
 * Handles user information, data saving, and premium status management
 */

import { VKConfig } from '../config/VKConfig.js';

export class VKUserService {
    constructor(bridge, logger, analytics, errorHandler) {
        this.bridge = bridge;
        this.logger = logger;
        this.analytics = analytics;
        this.errorHandler = errorHandler;
        this.userInfo = null;
        this.isEnabled = VKConfig.isFeatureEnabled('userDataSaving');
    }
    
    /**
     * Get user information from VK
     */
    async getUserInfo() {
        if (!this.bridge) {
            this.analytics.trackUserInfo(null, false, { error_type: 'bridge_unavailable' });
            return null;
        }
        
        try {
            this.analytics.trackUserInfo(null, false, null, { action: 'attempted' });
            
            const result = await this.bridge.send('VKWebAppGetUserInfo');
            this.userInfo = result;
            
            this.analytics.trackUserInfo(result, true);
            this.analytics.setUserProperties(result);
            
            // Save user data to server (non-blocking)
            if (this.isEnabled) {
                this.saveUserDataToServer(result).catch(error => {
                    this.logger.warn('Failed to save user data to server (non-blocking):', error);
                });
            }
            
            return result;
            
        } catch (error) {
            this.logger.error('Error getting user info:', error);
            
            this.analytics.trackUserInfo(null, false, error);
            
            return null;
        }
    }
    
    /**
     * Save VK user data to server
     */
    async saveUserDataToServer(userInfo) {
        if (!this.isEnabled) {
            this.logger.debug('User data saving is disabled');
            return;
        }
        
        // Check if user data has already been saved
        const userDataSaved = localStorage.getItem(VKConfig.getStorageKey('userDataSaved'));
        if (userDataSaved === 'true') {
            this.logger.debug('User data already saved to server, skipping');
            this.analytics.trackUserDataSave(userInfo.id, true, null, { reason: 'already_saved' });
            return;
        }
        
        if (!userInfo || !userInfo.id) {
            this.logger.warn('No valid user info available for saving to server');
            this.analytics.trackUserDataSave(null, false, { error_type: 'no_valid_user_info' });
            return;
        }
        
        try {
            this.logger.debug('Saving user data to server:', {
                user_id: userInfo.id,
                username: userInfo.screen_name,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                has_photo: !!userInfo.photo_100
            });
            
            const userData = {
                vk_user_id: userInfo.id,
                app_id: VKConfig.VK_APP_ID,
                username: userInfo.screen_name || `user_${userInfo.id}`,
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                vk_photo: userInfo.photo_100 || userInfo.photo_200 || userInfo.photo_max || ''
            };
            
            const url = VKConfig.getBackendUrl(VKConfig.BACKEND_USER_DATA_ENDPOINT);
            
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), VKConfig.getTimeout('userDataSave'));
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            this.logger.debug('Server response status:', response.status, response.statusText);
            
            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorData = await response.text();
                    errorDetails = errorData;
                } catch (e) {
                    errorDetails = 'Could not read error response';
                }
                
                throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
            }
            
            const data = await response.json();
            
            this.logger.debug('Server response data:', data);
            
            if (data.success || response.status === 200 || response.status === 201) {
                // Mark user data as saved in localStorage
                localStorage.setItem(VKConfig.getStorageKey('userDataSaved'), 'true');
                localStorage.setItem(VKConfig.getStorageKey('userDataSavedTimestamp'), Date.now().toString());
                
                this.logger.log('User data successfully saved to server');
                
                this.analytics.trackUserDataSave(userInfo.id, true, null, { server_response: data });
                
                return data;
            } else {
                throw new Error(`Server returned error: ${JSON.stringify(data)}`);
            }
            
        } catch (error) {
            this.logger.error('Error saving user data to server:', error);
            
            this.analytics.trackUserDataSave(userInfo.id, false, error, { url });
            
            throw error;
        }
    }
    
    /**
     * Force save user data to server (ignores localStorage flag)
     */
    async forceSaveUserDataToServer(userInfo) {
        if (!userInfo || !userInfo.id) {
            this.logger.warn('No valid user info available for force saving to server');
            this.analytics.trackUserDataSave(null, false, { error_type: 'no_valid_user_info' }, { action: 'force_save' });
            return;
        }
        
        this.logger.log('Force saving user data to server (ignoring localStorage flag)');
        
        try {
            // Temporarily remove the saved flag to allow saving
            const wasSaved = localStorage.getItem(VKConfig.getStorageKey('userDataSaved')) === 'true';
            if (wasSaved) {
                localStorage.removeItem(VKConfig.getStorageKey('userDataSaved'));
                localStorage.removeItem(VKConfig.getStorageKey('userDataSavedTimestamp'));
            }
            
            const result = await this.saveUserDataToServer(userInfo);
            
            this.analytics.trackUserDataSave(userInfo.id, true, null, { 
                action: 'force_save',
                was_previously_saved: wasSaved 
            });
            
            return result;
            
        } catch (error) {
            this.logger.error('Error force saving user data to server:', error);
            
            this.analytics.trackUserDataSave(userInfo.id, false, error, { action: 'force_save' });
            
            throw error;
        }
    }
    
    /**
     * Check premium status from local storage and backend
     */
    async checkPremiumStatus() {
        this.logger.log('checkPremiumStatus() called');
        
        this.analytics.trackPremiumStatus(null, 'unknown', null, { action: 'attempted' });
        
        try {
            // First, check local storage
            const localPremiumStatus = this.checkLocalPremiumStatus();
            
            if (localPremiumStatus !== null) {
                alert('Premium status found in localStorage:');
                this.logger.log('Premium status found in localStorage:', localPremiumStatus, '- skipping backend request');
                
                this.analytics.trackPremiumStatus(localPremiumStatus, 'local_storage');
                
                // Update global premium status
                this.updateGlobalPremiumStatus(localPremiumStatus);
                return localPremiumStatus;
            }
            
            this.logger.log('No local premium status found, checking backend...');
            
            // Only check backend if no premium status found in localStorage
            if (this.userInfo?.id) {

                const backendPremiumStatus = await this.checkBackendPremiumStatus();
                
                if (backendPremiumStatus !== null) {
                    alert('not premium null');
                    // Store the result in local storage
                    this.storePremiumStatus(backendPremiumStatus);
                    
                    // Update global premium status
                    this.updateGlobalPremiumStatus(backendPremiumStatus);
                    
                    this.analytics.trackPremiumStatus(backendPremiumStatus, 'backend', null, { user_id: this.userInfo.id });
                    
                    return backendPremiumStatus;
                } else {
                alert('premium null');
                }
            }
            
            // If we can't determine premium status, assume not premium
            this.logger.log('Could not determine premium status, defaulting to false');
            
            this.analytics.trackPremiumStatus(false, 'unknown', null, { user_id: this.userInfo?.id });
            
            return false;
            
        } catch (error) {
            this.logger.error('Error checking premium status:', error);
            
            this.analytics.trackPremiumStatus(false, 'error', error, { user_id: this.userInfo?.id });
            
            return false;
        }
    }
    
    /**
     * Refresh premium status - checks localStorage first, then backend if needed
     */
    async refreshPremiumStatus() {
        this.logger.log('refreshPremiumStatus() called');
        
        // First check localStorage
        const localPremiumStatus = this.checkLocalPremiumStatus();
        
        if (localPremiumStatus !== null) {
            this.logger.log('Premium status found in localStorage:', localPremiumStatus, '- skipping backend request');
            
            this.analytics.trackPremiumStatus(localPremiumStatus, 'local_storage', null, { action: 'refresh' });
            
            // Update global premium status
            this.updateGlobalPremiumStatus(localPremiumStatus);
            return localPremiumStatus;
        }
        
        // Only check backend if no premium status found in localStorage
        if (this.userInfo?.id) {
            this.logger.log('No local premium status found, checking backend...');
            
            const backendPremiumStatus = await this.checkBackendPremiumStatus();
            
            if (backendPremiumStatus !== null) {
                // Store the result in local storage
                this.storePremiumStatus(backendPremiumStatus);
                
                // Update global premium status
                this.updateGlobalPremiumStatus(backendPremiumStatus);
                
                this.analytics.trackPremiumStatus(backendPremiumStatus, 'backend', null, { 
                    action: 'refresh',
                    user_id: this.userInfo.id 
                });
                
                return backendPremiumStatus;
            }
        }
        
        // If we can't determine premium status, assume not premium
        this.logger.log('Could not determine premium status, defaulting to false');
        
        this.analytics.trackPremiumStatus(false, 'unknown', null, { 
            action: 'refresh',
            user_id: this.userInfo?.id 
        });
        
        return false;
    }
    
    /**
     * Check premium status in local storage
     */
    checkLocalPremiumStatus() {
        try {
            const premiumFlag = localStorage.getItem(VKConfig.getStorageKey('premiumStatus'));
            const premiumTimestamp = localStorage.getItem(VKConfig.getStorageKey('premiumTimestamp'));
            const subscriptionData = localStorage.getItem(VKConfig.getStorageKey('subscriptionData'));
            
            this.logger.debug('Checking local premium status:', {
                mbti_premium: premiumFlag,
                mbti_premium_timestamp: premiumTimestamp,
                mbti_subscription_data: subscriptionData
            });
            
            if (premiumFlag === 'true') {
                this.logger.debug('Premium flag found in localStorage: true');
                return true;
            }
            
            // Check for subscription data
            if (subscriptionData) {
                const subscription = JSON.parse(subscriptionData);
                if (subscription && subscription.isActive) {
                    this.logger.debug('Active subscription found in localStorage:', subscription);
                    return true;
                }
            }
            
            this.logger.debug('No premium data found in localStorage');
            return null; // No local data found
            
        } catch (error) {
            this.logger.error('Error reading premium status from localStorage:', error);
            return null;
        }
    }
    
    /**
     * Check premium status from backend API
     */
    async checkBackendPremiumStatus() {
        if (!this.userInfo?.id) {
            this.logger.debug('No user ID available for backend premium check');
            return null;
        }
        
        try {
            const url = VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT);
            
            const requestBody = {
                user_id: this.userInfo.id,
                app_id: VKConfig.VK_APP_ID,
                item_id: 'mbti_premium'
            };
            
            this.logger.debug('Checking backend premium status:', {
                url: url,
                method: 'POST',
                body: requestBody
            });
            
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), VKConfig.getTimeout('apiRequest'));
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            this.logger.debug('Backend response status:', response.status, response.statusText);
            
            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorData = await response.text();
                    errorDetails = errorData;
                } catch (e) {
                    errorDetails = 'Could not read error response';
                }
                
                throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
            }
            
            const data = await response.json();
            
            this.logger.debug('Backend premium status response:', data);
            
            if (data.success && typeof data.has_purchase === 'boolean') {
                return data.has_purchase;
            } else {
                throw new Error(`Invalid response format from backend: ${JSON.stringify(data)}`);
            }
            
        } catch (error) {
            this.logger.error('Error checking backend premium status:', error);
            
            this.analytics.trackPremiumStatus(false, 'backend_error', error, { 
                user_id: this.userInfo?.id,
                url: VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT)
            });
            
            return null;
        }
    }
    
    /**
     * Store premium status in local storage
     */
    storePremiumStatus(isPremium) {
        this.logger.log('storePremiumStatus() called with:', isPremium);
        try {
            localStorage.setItem(VKConfig.getStorageKey('premiumStatus'), isPremium.toString());
            
            // Also store timestamp for cache invalidation
            localStorage.setItem(VKConfig.getStorageKey('premiumTimestamp'), Date.now().toString());
            
            this.logger.log('Premium status stored in localStorage:', isPremium);
            this.logger.debug('Current localStorage after storing:', {
                mbti_premium: localStorage.getItem(VKConfig.getStorageKey('premiumStatus')),
                mbti_premium_timestamp: localStorage.getItem(VKConfig.getStorageKey('premiumTimestamp'))
            });
        } catch (error) {
            this.logger.error('Error storing premium status:', error);
        }
    }
    
    /**
     * Update global premium status
     */
    updateGlobalPremiumStatus(isPremium) {
        this.logger.log('updateGlobalPremiumStatus() called with:', isPremium);
        
        const updateFunctions = () => {
            try {
                // Update global premium state
                if (window.setPremium) {
                    this.logger.log('Calling window.setPremium with:', isPremium);
                    window.setPremium(isPremium);
                } else {
                    this.logger.warn('window.setPremium still not found');
                }
                
                // Update UI if available
                if (window.updatePremiumUI) {
                    this.logger.log('Calling window.updatePremiumUI()');
                    window.updatePremiumUI();
                } else {
                    this.logger.warn('window.updatePremiumUI still not found');
                }
                
                this.logger.log('Global premium status updated:', isPremium);
            } catch (error) {
                this.logger.error('Error updating global premium status:', error);
            }
        };
        
        // Try immediately first
        if (window.setPremium && window.updatePremiumUI) {
            updateFunctions();
        } else {
            // Wait for functions to be available
            this.waitForGlobalFunctions(updateFunctions);
        }
    }
    
    /**
     * Wait for global functions to be available
     */
    waitForGlobalFunctions(callback, maxAttempts = 10) {
        let attempts = 0;
        
        const checkFunctions = () => {
            attempts++;
            this.logger.debug(`Checking for global functions (attempt ${attempts}/${maxAttempts})`);
            
            if (window.setPremium && window.updatePremiumUI) {
                this.logger.log('Global functions found, executing callback');
                callback();
            } else if (attempts < maxAttempts) {
                this.logger.debug('Global functions not ready, retrying in 200ms...');
                setTimeout(checkFunctions, 200);
            } else {
                this.logger.warn('Global functions not available after maximum attempts');
            }
        };
        
        checkFunctions();
    }
    
    /**
     * Get user data
     */
    getUserData() {
        return this.userInfo;
    }
    
    /**
     * Get user service status
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            bridgeAvailable: !!this.bridge,
            userInfo: !!this.userInfo,
            userId: this.userInfo?.id
        };
    }
} 