# VK Premium Status Fix Guide

## Problem: Premium Status Not Working in VK Mini Apps on Android

The user has premium status on the backend, and it works fine in the web version, but premium features are not available in the Android VK Mini App.

## Root Cause Analysis

### Potential Issues
1. **VK Bridge Initialization**: Premium status check might not be running properly
2. **Global Function Availability**: `setPremium` and `updatePremiumUI` functions might not be available when VK Bridge checks premium status
3. **Backend API Call**: The backend premium check might be failing in VK Mini App environment
4. **LocalStorage Synchronization**: Premium status might not be properly stored or retrieved
5. **Timing Issues**: Premium status check might be running before the app is fully initialized

## Solution Implementation

### 1. Enhanced VKBridgeManager Initialization

Updated `VKBridgeManager.js` to ensure premium status is properly checked:

```javascript
// Check premium status (blocking - important for VK Mini Apps)
this.logger.log('Checking premium status for VK Mini App...');
const premiumStatus = await this.userService.checkPremiumStatus();
this.logger.log('Premium status check result:', premiumStatus);

// Force update global premium status
if (typeof window.setPremium === 'function') {
    window.setPremium(premiumStatus);
    this.logger.log('Global premium status updated to:', premiumStatus);
} else {
    this.logger.warn('Global setPremium function not available');
}
```

### 2. Debug Script for Premium Status

Created `debug-premium-status.js` to help identify issues:

```javascript
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
}
```

## Testing the Fix

### 1. Check Premium Status

```javascript
// Check current premium status
console.log(window.debugPremiumStatus.checkStatus());

// Expected output:
{
    localStorageValue: "true" or "false",
    timestamp: "1234567890",
    subscriptionData: "..." or null,
    isVKEnvironment: true,
    isAndroid: true,
    globalFunctions: {
        setPremium: "function",
        updatePremiumUI: "function",
        isPremium: "function"
    },
    vkBridge: {
        available: true,
        manager: true
    }
}
```

### 2. Test Premium Functions

```javascript
// Test premium functions
window.debugPremiumStatus.testFunctions();

// Expected output:
// "Testing premium functions..."
// "window.isPremium() result: true/false"
// "Testing setPremium function..."
// "After setPremium(true): true"
// "updatePremiumUI executed successfully"
```

### 3. Test VK Bridge Premium Status

```javascript
// Test VK Bridge premium status
await window.debugPremiumStatus.testVKBridge();

// Expected output:
// "Testing VK Bridge premium status..."
// "VK Bridge Manager checkPremiumStatus result: true/false"
// "VK Bridge Manager refreshPremiumStatus result: true/false"
```

### 4. Check Backend Premium Status

```javascript
// Check backend premium status
await window.debugPremiumStatus.checkBackend();

// Expected output:
// "Checking backend premium status..."
// "User ID for backend check: 123456"
// "Backend response status: 200"
// "Backend response data: { success: true, has_purchase: true }"
```

### 5. Force Update Premium Status

```javascript
// Force update premium status to true
window.debugPremiumStatus.forceUpdate(true);

// Force update premium status to false
window.debugPremiumStatus.forceUpdate(false);
```

## Debugging Commands

### Check All Premium Status Systems

```javascript
console.log('=== Premium Status Debug ===');
console.log('Current status:', window.debugPremiumStatus.currentStatus);
console.log('LocalStorage value:', localStorage.getItem('mbti_premium'));
console.log('isPremium() result:', window.isPremium());
console.log('VK Bridge Manager:', window.vkBridgeManager);
```

### Test Premium Status Flow

```javascript
// 1. Check current status
const currentStatus = window.debugPremiumStatus.checkStatus();
console.log('Current status:', currentStatus);

// 2. Test functions
window.debugPremiumStatus.testFunctions();

// 3. Test VK Bridge
await window.debugPremiumStatus.testVKBridge();

// 4. Check backend
await window.debugPremiumStatus.checkBackend();

// 5. Force update if needed
if (!currentStatus.localStorageValue || currentStatus.localStorageValue === 'false') {
    window.debugPremiumStatus.forceUpdate(true);
}
```

### Check Console Logs

Look for these messages:
- "Checking premium status for VK Mini App..."
- "Premium status check result: true/false"
- "Global premium status updated to: true/false"
- "VK Bridge Manager checkPremiumStatus result: true/false"

## Common Issues and Solutions

### Issue 1: Premium Status Not Being Checked

**Symptoms:** No console logs about premium status checking

**Solution:**
```javascript
// Check if VK Bridge Manager is initialized
console.log('VK Bridge Manager:', window.vkBridgeManager);

// Manually trigger premium status check
if (window.vkBridgeManager) {
    await window.vkBridgeManager.checkPremiumStatus();
}
```

### Issue 2: Backend API Call Failing

**Symptoms:** Backend premium check returns null or error

**Solution:**
```javascript
// Check backend response manually
await window.debugPremiumStatus.checkBackend();

// Check network tab for failed requests
// Look for requests to https://nikmobdev.ru/goodsshop/api/check-purchase
```

### Issue 3: Global Functions Not Available

**Symptoms:** "Global setPremium function not available" in console

**Solution:**
```javascript
// Check if functions are available
console.log('setPremium available:', typeof window.setPremium);
console.log('updatePremiumUI available:', typeof window.updatePremiumUI);

// Wait for functions to be available
setTimeout(() => {
    if (window.setPremium && window.updatePremiumUI) {
        window.setPremium(true);
        window.updatePremiumUI();
    }
}, 1000);
```

### Issue 4: LocalStorage Not Updated

**Symptoms:** Premium status not persisted in localStorage

**Solution:**
```javascript
// Check localStorage manually
console.log('mbti_premium:', localStorage.getItem('mbti_premium'));
console.log('mbti_premium_timestamp:', localStorage.getItem('mbti_premium_timestamp'));

// Force update localStorage
localStorage.setItem('mbti_premium', 'true');
localStorage.setItem('mbti_premium_timestamp', Date.now().toString());
```

### Issue 5: UI Not Updated

**Symptoms:** Premium status is true but UI still shows premium-locked content

**Solution:**
```javascript
// Force update UI
if (typeof window.updatePremiumUI === 'function') {
    window.updatePremiumUI();
}

// Check premium elements
console.log('Premium elements:', document.querySelectorAll('.premium-locked, .premium-content').length);
```

## Advanced Debugging

### 1. Network Tab Analysis

1. Open Chrome DevTools on Android
2. Go to Network tab
3. Look for requests to `/api/check-purchase`
4. Check response status and data

### 2. Timeline Analysis

1. Open Chrome DevTools
2. Go to Performance tab
3. Record page load
4. Look for VK Bridge initialization and premium status checks

### 3. LocalStorage Analysis

```javascript
// Check all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));

// Check VK-related data
for (let key of Object.keys(localStorage)) {
    if (key.includes('mbti') || key.includes('vk')) {
        console.log(`${key}:`, localStorage.getItem(key));
    }
}
```

### 4. User Agent Analysis

```javascript
// Check user agent for VK app detection
console.log('User Agent:', navigator.userAgent);
console.log('Is VK app:', navigator.userAgent.includes('VK'));
console.log('Is Android:', navigator.userAgent.toLowerCase().includes('android'));
```

## Emergency Procedures

### If Premium Status Still Doesn't Work

1. **Force Enable Premium:**
   ```javascript
   // Force enable premium
   window.debugPremiumStatus.forceUpdate(true);
   
   // Reload page to apply changes
   location.reload();
   ```

2. **Clear and Reset:**
   ```javascript
   // Clear all premium data
   localStorage.removeItem('mbti_premium');
   localStorage.removeItem('mbti_premium_timestamp');
   localStorage.removeItem('mbti_subscription_data');
   
   // Force check again
   if (window.vkBridgeManager) {
       await window.vkBridgeManager.refreshPremiumStatus();
   }
   ```

3. **Manual Backend Check:**
   ```javascript
   // Manually check backend
   const result = await window.debugPremiumStatus.checkBackend();
   console.log('Backend result:', result);
   
   // If backend returns true, force update
   if (result && result.has_purchase) {
       window.debugPremiumStatus.forceUpdate(true);
   }
   ```

4. **Disable VK Bridge Temporarily:**
   ```html
   <!-- Comment out VK Bridge to test web version -->
   <!-- <script src="https://unpkg.com/@vkontakte/vk-bridge@2/dist/browser.min.js"></script> -->
   ```

### Contact Support

If issues persist:
1. Collect console logs
2. Note Android version and VK app version
3. Document exact steps to reproduce
4. Include network tab screenshots
5. Check if issue happens in different VK app versions

## Best Practices

### 1. Premium Status Checking Order
```javascript
// 1. Check localStorage first (fastest)
const localStatus = localStorage.getItem('mbti_premium');

// 2. Check backend if no local data
if (!localStatus) {
    const backendStatus = await checkBackendPremiumStatus();
    if (backendStatus !== null) {
        localStorage.setItem('mbti_premium', backendStatus.toString());
    }
}

// 3. Update global functions
if (typeof window.setPremium === 'function') {
    window.setPremium(localStatus === 'true' || backendStatus === true);
}
```

### 2. Error Handling
```javascript
// Always handle errors in premium status checks
try {
    const premiumStatus = await checkPremiumStatus();
    updatePremiumUI(premiumStatus);
} catch (error) {
    console.error('Premium status check failed:', error);
    // Fallback to false
    updatePremiumUI(false);
}
```

### 3. Regular Monitoring
```javascript
// Check premium status regularly
setInterval(async () => {
    if (window.vkBridgeManager) {
        await window.vkBridgeManager.refreshPremiumStatus();
    }
}, 300000); // Every 5 minutes
```

## Conclusion

The premium status issue in VK Mini Apps on Android is typically caused by:

- **Timing issues** with VK Bridge initialization
- **Global function availability** when premium status is checked
- **Backend API call failures** in VK Mini App environment
- **LocalStorage synchronization** problems

The solution involves:

- **Enhanced VKBridgeManager** with blocking premium status checks
- **Debug script** to identify specific issues
- **Proper error handling** and fallback mechanisms
- **Regular monitoring** of premium status

This ensures that premium status is properly checked and updated in VK Mini Apps on Android, providing users with access to premium features when they have valid subscriptions. 