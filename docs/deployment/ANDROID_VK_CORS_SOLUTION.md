# Android VK Mini App CORS Solution

## Problem
You're experiencing CORS/network errors when trying to access `https://nikmobdev.ru/goodsshop/api/check-purchase` from an Android VK Mini App. This is a common issue due to stricter security policies on Android devices.

## Root Cause
Android VK Mini Apps have stricter security policies that can block certain network requests, especially cross-origin requests. The issue is compounded by:
1. Android WebView security restrictions
2. VK Mini App sandbox limitations
3. Network request filtering
4. CORS policy enforcement

## Solution Overview

### 1. Platform-Aware Configuration
- Automatic platform detection (Android, iOS, Web, VK Android, VK iOS, VK Web)
- Platform-specific feature flags
- Android-specific endpoints and timeouts

### 2. Retry Logic with Multiple Endpoints
- Try Android-specific endpoints first
- Fallback to standard endpoints
- Multiple retry attempts with different headers
- Configurable retry delays

### 3. Enhanced Error Handling
- Platform-specific error tracking
- Graceful fallback to localStorage
- Comprehensive error logging
- User-friendly error messages

## Implementation Details

### Platform Detection
```javascript
// Automatic platform detection
const platform = VKConfig.detectPlatform();
// Returns: 'android', 'ios', 'web', 'vk_android', 'vk_ios', 'vk_web'
```

### Android-Specific Configuration
```javascript
// Android-specific features
static ANDROID_FEATURES = {
    userDataSaving: false, // Disabled for Android due to CORS issues
    premiumStatusChecking: false, // Disabled for Android due to CORS issues
    useAlternativeEndpoints: true, // Use Android-specific endpoints
    fallbackToLocalStorage: true, // Fallback to localStorage when network fails
    retryWithDifferentHeaders: true // Retry with different headers if first attempt fails
};
```

### Alternative Endpoints
```javascript
// Android-specific endpoints
static ANDROID_CHECK_PURCHASE_ENDPOINT = '/api/check-purchase-android';
static ANDROID_USER_DATA_ENDPOINT = '/admin/api/users-android';
```

### Retry Configuration
```javascript
// Platform-specific retry config
{
    maxRetries: 3, // More retries for Android
    retryDelay: 2000, // 2 second delay between retries
    useAlternativeEndpoints: true, // Try Android endpoints first
    fallbackToLocalStorage: true // Use localStorage as fallback
}
```

## Network Request Flow

### 1. Platform Detection
```javascript
const platform = VKConfig.detectPlatform();
const retryConfig = VKConfig.getRetryConfig();
```

### 2. Endpoint Selection
```javascript
// For Android platforms, try Android-specific endpoints first
if (isAndroid && retryConfig.useAlternativeEndpoints) {
    endpoints.push(VKConfig.ANDROID_CHECK_PURCHASE_ENDPOINT);
}
endpoints.push(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT);
```

### 3. Retry Logic
```javascript
// Try each endpoint with multiple attempts
for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            const result = await this._makeSingleRequest(endpoint, requestBody, attempt);
            if (result !== null) return result;
        } catch (error) {
            // Log error and continue to next attempt
            if (attempt === retryConfig.maxRetries) break;
            await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));
        }
    }
}
```

### 4. Fallback Strategy
```javascript
// If all network attempts fail, fallback to localStorage
if (retryConfig.fallbackToLocalStorage && requestType === 'premium_status') {
    return this.checkLocalPremiumStatus();
}
```

## Server-Side Requirements

### Nginx Configuration
You need to add Android-specific endpoints to your nginx configuration:

```nginx
# Android-specific endpoints
location /goodsshop/api/check-purchase-android {
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept,X-Platform,X-VK-App' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept,X-Platform,X-VK-App' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
    
    # Your existing proxy_pass configuration
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Backend API Support
Your backend should handle the Android-specific endpoints:
- `/api/check-purchase-android` - Same logic as `/api/check-purchase`
- `/admin/api/users-android` - Same logic as `/admin/api/users`

## Testing

### Use the Test File
Open `test_android_cors_fix.html` to test the solution:

1. **Platform Detection Test**
   - Detect current platform
   - Simulate Android environment
   - Simulate VK Android environment

2. **Configuration Test**
   - Test platform-specific configuration
   - Test endpoint generation
   - Test header generation

3. **Network Request Test**
   - Test premium status checking
   - Test user data saving
   - Test retry logic

4. **Error Handling Test**
   - Test network error handling
   - Test CORS error handling
   - Test timeout error handling

5. **Fallback Test**
   - Test localStorage fallback
   - Test alternative endpoints

### Manual Testing on Android
1. Open your VK Mini App on an Android device
2. Check the browser console for platform detection
3. Monitor network requests in the Network tab
4. Verify that retry logic is working
5. Check that fallback to localStorage works

## Monitoring and Analytics

### Error Tracking
The solution includes comprehensive error tracking:
```javascript
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
```

### Platform Detection Logging
```javascript
// Log platform detection
this.logger.debug('Checking backend premium status with platform:', platform, retryConfig);
```

## Configuration Options

### Enable/Disable Features
```javascript
// In VKConfig.js
static ANDROID_FEATURES = {
    userDataSaving: false, // Set to true to enable
    premiumStatusChecking: false, // Set to true to enable
    useAlternativeEndpoints: true, // Set to false to disable
    fallbackToLocalStorage: true, // Set to false to disable
    retryWithDifferentHeaders: true // Set to false to disable
};
```

### Adjust Timeouts
```javascript
// In VKConfig.js
static TIMEOUTS = {
    apiRequest: 10000,
    androidApiRequest: 15000, // Longer timeout for Android
    retryDelay: 2000 // Delay between retries
};
```

### Configure Retry Logic
```javascript
// In VKConfig.js
static getRetryConfig() {
    if (platform === this.PLATFORMS.ANDROID || 
        platform === this.PLATFORMS.VK_ANDROID) {
        return {
            maxRetries: 3, // Increase for more retries
            retryDelay: this.TIMEOUTS.retryDelay,
            useAlternativeEndpoints: this.ANDROID_FEATURES.useAlternativeEndpoints,
            fallbackToLocalStorage: this.ANDROID_FEATURES.fallbackToLocalStorage
        };
    }
}
```

## Troubleshooting

### Common Issues

1. **Still getting CORS errors**
   - Check that Android-specific endpoints are configured in nginx
   - Verify that backend supports Android endpoints
   - Check that CORS headers include `X-Platform` and `X-VK-App`

2. **Retry logic not working**
   - Check that `maxRetries` is greater than 1
   - Verify that `retryDelay` is not too short
   - Check console logs for retry attempts

3. **Fallback not working**
   - Verify that `fallbackToLocalStorage` is enabled
   - Check that localStorage is available
   - Verify that local premium status check works

4. **Platform detection incorrect**
   - Check user agent string
   - Verify VK Bridge availability
   - Test with different devices

### Debug Commands
```javascript
// Check platform detection
console.log('Platform:', VKConfig.detectPlatform());

// Check configuration
console.log('Retry config:', VKConfig.getRetryConfig());

// Check endpoints
console.log('Endpoints:', {
    standard: VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT),
    android: VKConfig.getAndroidBackendUrl(VKConfig.ANDROID_CHECK_PURCHASE_ENDPOINT)
});

// Check headers
console.log('Headers:', VKConfig.getPlatformHeaders());
```

## Files Modified

### Core Files
- `src/modules/vk/config/VKConfig.js` - Added platform detection and Android-specific configuration
- `src/modules/vk/services/VKUserService.js` - Added retry logic and platform-aware requests

### Test Files
- `test_android_cors_fix.html` - Comprehensive test suite for Android CORS solution

### Documentation
- `ANDROID_VK_CORS_SOLUTION.md` - This guide

## Next Steps

1. **Deploy the updated code** to your VK Mini App
2. **Configure nginx** with Android-specific endpoints
3. **Update your backend** to handle Android endpoints
4. **Test on Android devices** using the test file
5. **Monitor analytics** for Android-specific errors
6. **Adjust configuration** based on real-world usage

The solution provides a robust, platform-aware approach to handling CORS issues in Android VK Mini Apps with comprehensive fallback strategies and detailed monitoring. 