/**
 * Debug Premium Status
 * Helps identify why premium status is not working in VK Mini Apps
 */

(function() {
    'use strict';
    
    console.log('=== Debug Premium Status ===');
    
    // Check current premium status
    function checkPremiumStatus() {
        const localStorageValue = localStorage.getItem('mbti_premium');
        const timestamp = localStorage.getItem('mbti_premium_timestamp');
        const subscriptionData = localStorage.getItem('mbti_subscription_data');
        
        console.log('Current premium status:');
        console.log('- localStorage mbti_premium:', localStorageValue);
        console.log('- localStorage mbti_premium_timestamp:', timestamp);
        console.log('- localStorage mbti_subscription_data:', subscriptionData);
        
        // Check if global functions exist
        console.log('Global functions:');
        console.log('- window.setPremium:', typeof window.setPremium);
        console.log('- window.updatePremiumUI:', typeof window.updatePremiumUI);
        console.log('- window.isPremium:', typeof window.isPremium);
        
        // Check VK Bridge status
        console.log('VK Bridge status:');
        console.log('- window.vkBridge:', typeof window.vkBridge);
        console.log('- window.vkBridgeManager:', typeof window.vkBridgeManager);
        
        // Check if we're in VK environment
        const isVKEnvironment = window.location.hostname.includes('vk.com') || 
                               window.location.hostname.includes('vk.ru') ||
                               window.location.search.includes('vk_') ||
                               document.referrer.includes('vk.com') ||
                               document.referrer.includes('vk.ru') ||
                               typeof window.vkBridge !== 'undefined';
        
        console.log('- Is VK environment:', isVKEnvironment);
        
        // Check user agent
        console.log('User agent:', navigator.userAgent);
        console.log('- Is Android:', navigator.userAgent.toLowerCase().includes('android'));
        
        return {
            localStorageValue,
            timestamp,
            subscriptionData,
            isVKEnvironment,
            isAndroid: navigator.userAgent.toLowerCase().includes('android'),
            globalFunctions: {
                setPremium: typeof window.setPremium,
                updatePremiumUI: typeof window.updatePremiumUI,
                isPremium: typeof window.isPremium
            },
            vkBridge: {
                available: typeof window.vkBridge !== 'undefined',
                manager: typeof window.vkBridgeManager !== 'undefined'
            }
        };
    }
    
    // Test premium status functions
    function testPremiumFunctions() {
        console.log('Testing premium functions...');
        
        // Test isPremium function
        if (typeof window.isPremium === 'function') {
            const currentStatus = window.isPremium();
            console.log('window.isPremium() result:', currentStatus);
        }
        
        // Test setPremium function
        if (typeof window.setPremium === 'function') {
            console.log('Testing setPremium function...');
            const originalValue = localStorage.getItem('mbti_premium');
            
            // Set to true
            window.setPremium(true);
            console.log('After setPremium(true):', localStorage.getItem('mbti_premium'));
            
            // Set back to original
            if (originalValue) {
                window.setPremium(originalValue === 'true' || originalValue === '1');
            } else {
                window.setPremium(false);
            }
            console.log('After restoring original value:', localStorage.getItem('mbti_premium'));
        }
        
        // Test updatePremiumUI function
        if (typeof window.updatePremiumUI === 'function') {
            console.log('Testing updatePremiumUI function...');
            try {
                window.updatePremiumUI();
                console.log('updatePremiumUI executed successfully');
            } catch (error) {
                console.error('Error executing updatePremiumUI:', error);
            }
        }
    }
    
    // Test VK Bridge premium status
    async function testVKBridgePremiumStatus() {
        console.log('Testing VK Bridge premium status...');
        
        if (window.vkBridgeManager && typeof window.vkBridgeManager.checkPremiumStatus === 'function') {
            try {
                const result = await window.vkBridgeManager.checkPremiumStatus();
                console.log('VK Bridge Manager checkPremiumStatus result:', result);
            } catch (error) {
                console.error('Error checking VK Bridge premium status:', error);
            }
        }
        
        if (window.vkBridgeManager && typeof window.vkBridgeManager.refreshPremiumStatus === 'function') {
            try {
                const result = await window.vkBridgeManager.refreshPremiumStatus();
                console.log('VK Bridge Manager refreshPremiumStatus result:', result);
            } catch (error) {
                console.error('Error refreshing VK Bridge premium status:', error);
            }
        }
    }
    
    // Check backend premium status
    async function checkBackendPremiumStatus() {
        console.log('Checking backend premium status...');
        
        // Get user ID from VK Bridge Manager
        let userId = null;
        if (window.vkBridgeManager && window.vkBridgeManager.userInfo) {
            userId = window.vkBridgeManager.userInfo.id;
        }
        
        if (!userId) {
            console.log('No user ID available for backend check');
            return;
        }
        
        console.log('User ID for backend check:', userId);
        
        try {
            const response = await fetch('https://nikmobdev.ru/goodsshop/api/check-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    app_id: '53942833',
                    item_id: 'mbti_premium'
                })
            });
            
            console.log('Backend response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend response data:', data);
                return data;
            } else {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
            }
        } catch (error) {
            console.error('Error checking backend premium status:', error);
        }
    }
    
    // Force update premium status
    function forceUpdatePremiumStatus(isPremium) {
        console.log('Force updating premium status to:', isPremium);
        
        // Update localStorage
        localStorage.setItem('mbti_premium', isPremium.toString());
        localStorage.setItem('mbti_premium_timestamp', Date.now().toString());
        
        // Update global functions if available
        if (typeof window.setPremium === 'function') {
            window.setPremium(isPremium);
        }
        
        if (typeof window.updatePremiumUI === 'function') {
            window.updatePremiumUI();
        }
        
        console.log('Premium status force updated');
    }
    
    // Run initial check
    const status = checkPremiumStatus();
    
    // Expose debugging functions
    window.debugPremiumStatus = {
        checkStatus: checkPremiumStatus,
        testFunctions: testPremiumFunctions,
        testVKBridge: testVKBridgePremiumStatus,
        checkBackend: checkBackendPremiumStatus,
        forceUpdate: forceUpdatePremiumStatus,
        currentStatus: status
    };
    
    console.log('Debug functions exposed as window.debugPremiumStatus');
    console.log('=== End Debug Premium Status ===');
    
    // Auto-run tests after a delay to ensure everything is loaded
    setTimeout(() => {
        console.log('Auto-running premium status tests...');
        testPremiumFunctions();
        testVKBridgePremiumStatus();
    }, 2000);
    
})(); 