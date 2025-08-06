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
        this.isPremiumCheckingEnabled = VKConfig.isFeatureEnabled('premiumStatusChecking');
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
        
        // Check if we're in a browser environment that supports fetch
        if (typeof fetch === 'undefined') {
            this.logger.warn('Fetch API not available, skipping user data save');
            this.analytics.trackUserDataSave(userInfo.id, false, { error_type: 'fetch_not_available' });
            return;
        }
        
        const platform = VKConfig.detectPlatform();
        const retryConfig = VKConfig.getRetryConfig();
        
        this.logger.debug('Saving user data to server with platform:', platform, retryConfig);
        
        const userData = {
            vk_user_id: userInfo.id,
            app_id: VKConfig.VK_APP_ID,
            username: userInfo.screen_name || `user_${userInfo.id}`,
            first_name: userInfo.first_name || '',
            last_name: userInfo.last_name || '',
            vk_photo: userInfo.photo_100 || userInfo.photo_200 || userInfo.photo_max || ''
        };
        
        try {
            const result = await this._makeNetworkRequestWithRetry(
                'user_data',
                userData,
                retryConfig
            );
            
            // Mark user data as saved in localStorage
            localStorage.setItem(VKConfig.getStorageKey('userDataSaved'), 'true');
            localStorage.setItem(VKConfig.getStorageKey('userDataSavedTimestamp'), Date.now().toString());
            
            this.logger.log('User data successfully saved to server');
            
            this.analytics.trackUserDataSave(userInfo.id, true, null, { server_response: result });
            
            return result;
            
        } catch (error) {
            // Handle specific error types
            let errorType = 'unknown_error';
            let errorMessage = error.message || 'Unknown error';
            
            if (error.name === 'AbortError') {
                errorType = 'timeout_error';
                errorMessage = 'Request timed out';
            } else if (error.message && error.message.includes('Failed to fetch')) {
                errorType = 'network_error';
                errorMessage = 'Network error - server may be unreachable or CORS blocked';
            } else if (error.message && error.message.includes('CORS')) {
                errorType = 'cors_error';
                errorMessage = 'CORS policy blocked the request';
            }
            
            this.logger.warn(`User data save failed (${errorType}): ${errorMessage}`, {
                user_id: userInfo.id,
                error: error
            });
            
            // Show alert for CORS and network errors
            if (errorType === 'cors_error' || errorType === 'network_error') {
                alert(`CORS/Network Error: ${errorMessage}\n\nThis is likely due to:\n- CORS policy blocking the request\n- Server being unreachable\n- Network connectivity issues\n\nError Type: ${errorType}`);
            }
            
            this.analytics.trackUserDataSave(userInfo.id, false, { 
                error_type: errorType, 
                error_message: errorMessage 
            });
            
            // Store user data locally as fallback
            try {
                localStorage.setItem(VKConfig.getStorageKey('userDataLocal'), JSON.stringify(userData));
                this.logger.debug('User data stored locally as fallback');
            } catch (localStorageError) {
                this.logger.warn('Failed to store user data locally:', localStorageError);
            }
            
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
                    // Store the result in local storage
                    this.storePremiumStatus(backendPremiumStatus);
                    
                    // Update global premium status
                    this.updateGlobalPremiumStatus(backendPremiumStatus);
                    
                    this.analytics.trackPremiumStatus(backendPremiumStatus, 'backend', null, { user_id: this.userInfo.id });
                    
                    return backendPremiumStatus;
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
        
        // Check if we're in a browser environment that supports fetch
        if (typeof fetch === 'undefined') {
            this.logger.warn('Fetch API not available, skipping backend premium check');
            this.analytics.trackPremiumStatus(false, 'fetch_not_available', null, { 
                user_id: this.userInfo?.id 
            });
            return null;
        }
        
        const platform = VKConfig.detectPlatform();
        const retryConfig = VKConfig.getRetryConfig();
        
        this.logger.debug('Checking backend premium status with platform:', platform, retryConfig);
        
        // Try multiple endpoints and retry logic for Android
        return await this._makeNetworkRequestWithRetry(
            'premium_status',
            { user_id: this.userInfo.id, app_id: VKConfig.VK_APP_ID, item_id: 'mbti_premium' },
            retryConfig
        );
    }
    
    /**
     * Make network request with retry logic for Android platforms
     */
    async _makeNetworkRequestWithRetry(requestType, requestBody, retryConfig) {
        const platform = VKConfig.detectPlatform();
        const isAndroid = platform === VKConfig.PLATFORMS.ANDROID || 
                         platform === VKConfig.PLATFORMS.VK_ANDROID;
        
        // Define endpoints to try
        const endpoints = [];
        
        if (requestType === 'premium_status') {
            if (isAndroid && retryConfig.useAlternativeEndpoints) {
                // Try Android-specific endpoint first
                endpoints.push(VKConfig.ANDROID_CHECK_PURCHASE_ENDPOINT);
            }
            endpoints.push(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT);
        } else if (requestType === 'user_data') {
            if (isAndroid && retryConfig.useAlternativeEndpoints) {
                endpoints.push(VKConfig.ANDROID_USER_DATA_ENDPOINT);
            }
            endpoints.push(VKConfig.BACKEND_USER_DATA_ENDPOINT);
        }
        
        let lastError = null;
        
        // Try each endpoint with retries
        for (const endpoint of endpoints) {
            for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
                try {
                    this.logger.debug(`Attempting ${requestType} request (attempt ${attempt}/${retryConfig.maxRetries}) to endpoint: ${endpoint}`);
                    
                    const result = await this._makeSingleRequest(endpoint, requestBody, attempt);
                    
                    // If successful, return the result
                    if (result !== null) {
                        this.logger.debug(`${requestType} request successful on attempt ${attempt}`);
                        return result;
                    }
                    
                } catch (error) {
                    lastError = error;
                    this.logger.warn(`${requestType} request failed on attempt ${attempt}:`, error);
                    
                    // Track Android-specific errors
                    if (isAndroid) {
                        this.analytics.trackVKEvent(VKConfig.ANALYTICS_EVENTS.androidNetworkError, {
                            request_type: requestType,
                            endpoint: endpoint,
                            attempt: attempt,
                            error_type: error.name,
                            error_message: error.message
                        });
                    }
                    
                    // If this is the last attempt for this endpoint, continue to next endpoint
                    if (attempt === retryConfig.maxRetries) {
                        break;
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));
                }
            }
        }
        
        // All attempts failed, handle fallback
        if (retryConfig.fallbackToLocalStorage && requestType === 'premium_status') {
            this.logger.warn('All network attempts failed, falling back to local storage');
            return this.checkLocalPremiumStatus();
        }
        
        // Re-throw the last error
        throw lastError || new Error(`All ${requestType} requests failed`);
    }
    
    /**
     * Make a single network request
     */
    async _makeSingleRequest(endpoint, requestBody, attempt = 1) {
        const platform = VKConfig.detectPlatform();
        const isAndroid = platform === VKConfig.PLATFORMS.ANDROID || 
                         platform === VKConfig.PLATFORMS.VK_ANDROID;
        
        // Create AbortController for timeout
        const controller = new AbortController();
        let timeoutId = null;
        
        try {
            const url = VKConfig.getPlatformBackendUrl(endpoint);
            const headers = VKConfig.getPlatformHeaders();
            
            // Add attempt-specific headers for Android
            if (isAndroid && attempt > 1) {
                headers['X-Retry-Attempt'] = attempt.toString();
                headers['X-Platform-Version'] = 'android_retry';
            }
            
            this.logger.debug(`Making request to: ${url}`, {
                method: 'POST',
                headers: headers,
                body: requestBody,
                platform: platform,
                attempt: attempt
            });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
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
            
            // Handle different response formats
            if (data.success && typeof data.has_purchase === 'boolean') {
                return data.has_purchase;
            } else if (data.status === 0 && typeof data.has_purchase === 'boolean') {
                // Handle status 0 response format
                this.logger.debug('Received status 0 response, treating as success');
                return data.has_purchase;
            } else if (data.status === 0) {
                // Status 0 but no has_purchase field - assume no purchase
                this.logger.debug('Received status 0 response without has_purchase field, assuming no purchase');
                return false;
            } else if (typeof data.has_purchase === 'boolean') {
                // Has purchase field but no success/status - use the value
                this.logger.debug('Response has has_purchase field, using value:', data.has_purchase);
                return data.has_purchase;
            } else {
                // Log the response for debugging
                this.logger.warn('Unexpected response format from backend:', data);
                alert(`Unexpected response format from backend:\n\nStatus: ${data.status}\nSuccess: ${data.success}\nHas Purchase: ${data.has_purchase}\n\nFull Response: ${JSON.stringify(data, null, 2)}`);
                throw new Error(`Invalid response format from backend: ${JSON.stringify(data)}`);
            }
            
        } catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            // Handle specific error types
            let errorType = 'unknown_error';
            let errorMessage = error.message || 'Unknown error';
            
            if (error.name === 'AbortError') {
                errorType = 'timeout_error';
                errorMessage = 'Request timed out';
            } else if (error.message && error.message.includes('Failed to fetch')) {
                errorType = 'network_error';
                errorMessage = 'Network error - server may be unreachable or CORS blocked';
            } else if (error.message && error.message.includes('CORS')) {
                errorType = 'cors_error';
                errorMessage = 'CORS policy blocked the request';
            }
            
            this.logger.warn(`Backend premium check failed (${errorType}): ${errorMessage}`, {
                url: VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT),
                user_id: this.userInfo?.id,
                error: error
            });
            
            // Show alert for CORS and network errors
            if (errorType === 'cors_error' || errorType === 'network_error') {
                alert(`CORS/Network Error (Premium Check): ${errorMessage}\n\nURL: ${VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT)}\n\nThis is likely due to:\n- CORS policy blocking the request\n- Server being unreachable\n- Network connectivity issues\n\nError Type: ${errorType}`);
            }
            
            this.analytics.trackPremiumStatus(false, errorType, { 
                error_message: errorMessage 
            }, { 
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
    
    /**
     * Get locally stored user data (fallback)
     */
    getLocalUserData() {
        try {
            const localData = localStorage.getItem(VKConfig.getStorageKey('userDataLocal'));
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            this.logger.warn('Error retrieving local user data:', error);
            return null;
        }
    }
    
    /**
     * Enable or disable user data saving
     */
    setUserDataSavingEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.log(`User data saving ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Check if user data saving is enabled
     */
    isUserDataSavingEnabled() {
        return this.isEnabled;
    }
    
    /**
     * Enable or disable premium status checking
     */
    setPremiumStatusCheckingEnabled(enabled) {
        this.isPremiumCheckingEnabled = enabled;
        this.logger.log(`Premium status checking ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Check if premium status checking is enabled
     */
    isPremiumStatusCheckingEnabled() {
        return this.isPremiumCheckingEnabled;
    }
    
    /**
     * Show CORS and network status information
     */
    showCORSStatus() {
        const urls = [
            VKConfig.getBackendUrl(VKConfig.BACKEND_USER_DATA_ENDPOINT),
            VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT)
        ];
        
        const status = {
            userDataSaving: this.isEnabled,
            premiumStatusChecking: this.isPremiumCheckingEnabled,
            fetchAvailable: typeof fetch !== 'undefined',
            urls: urls,
            currentDomain: window.location.origin,
            userAgent: navigator.userAgent
        };
        
        const statusText = `CORS Status:\n\n` +
            `User Data Saving: ${status.userDataSaving ? 'Enabled' : 'Disabled'}\n` +
            `Premium Status Checking: ${status.premiumStatusChecking ? 'Enabled' : 'Disabled'}\n` +
            `Fetch API: ${status.fetchAvailable ? 'Available' : 'Not Available'}\n` +
            `Current Domain: ${status.currentDomain}\n\n` +
            `Backend URLs:\n${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}\n\n` +
            `User Agent: ${status.userAgent.substring(0, 100)}...`;
        
        alert(statusText);
        this.logger.log('CORS Status:', status);
    }
    
    /**
     * Enable both features for testing
     */
    enableFeaturesForTesting() {
        this.setUserDataSavingEnabled(true);
        this.setPremiumStatusCheckingEnabled(true);
        alert('Both user data saving and premium status checking have been enabled for testing.\n\nThis will trigger network requests and may show CORS errors.');
    }
    
    /**
     * Test CORS and network connectivity
     */
    testCORS() {
        const urls = [
            VKConfig.getBackendUrl(VKConfig.BACKEND_USER_DATA_ENDPOINT),
            VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT)
        ];
        
        alert(`Testing CORS for URLs:\n${urls.join('\n')}\n\nCheck console for results.`);
        
        urls.forEach((url, index) => {
            this.logger.log(`Testing CORS for URL ${index + 1}: ${url}`);
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ test: true })
            })
            .then(response => {
                this.logger.log(`✅ CORS test ${index + 1} SUCCESS:`, {
                    url: url,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                });
            })
            .catch(error => {
                this.logger.error(`❌ CORS test ${index + 1} FAILED:`, {
                    url: url,
                    error: error,
                    errorType: error.name,
                    errorMessage: error.message
                });
                
                alert(`CORS Test ${index + 1} Failed:\n\nURL: ${url}\n\nError: ${error.message}\n\nType: ${error.name}`);
            });
        });
    }
    
    /**
     * Test check-purchase endpoint and show response
     */
    async testCheckPurchase() {
        if (!this.userInfo?.id) {
            alert('No user ID available for testing check-purchase endpoint');
            return;
        }
        
        const url = VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT);
        const requestBody = {
            user_id: this.userInfo.id,
            app_id: VKConfig.VK_APP_ID,
            item_id: 'mbti_premium'
        };
        
        alert(`Testing check-purchase endpoint:\n\nURL: ${url}\n\nRequest Body: ${JSON.stringify(requestBody, null, 2)}\n\nCheck console for response.`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            this.logger.log('Check-purchase test response:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            
            alert(`Check-purchase test completed!\n\nHTTP Status: ${response.status} ${response.statusText}\n\nResponse Data:\n${JSON.stringify(data, null, 2)}`);
            
        } catch (error) {
            this.logger.error('Check-purchase test failed:', error);
            alert(`Check-purchase test failed:\n\nError: ${error.message}`);
        }
    }
} 