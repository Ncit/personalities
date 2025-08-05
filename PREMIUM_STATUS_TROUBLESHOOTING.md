# Premium Status Troubleshooting Guide

## Issue Description
Purchase exists on backend but is not being recognized by Android VK Mini App.

**Purchase Details:**
- **Order**: 2261201
- **User**: 6582162  
- **Item**: mbti_premium
- **App**: 53942833
- **Date**: 05.08.2025, 21:03:47

## Debug Steps

### 1. Check Current Premium Status
Open browser console in the VK Mini App and run:

```javascript
// Check current premium status
window.vkDebug.checkPremiumStatus().then(result => {
    console.log('Premium Status:', result);
});

// Get detailed debug information
window.vkDebug.debugPremiumStatus().then(debugInfo => {
    console.log('Debug Info:', debugInfo);
});
```

### 2. Verify User ID Match
Check if the user ID in the app matches the purchase:

```javascript
// Get current user info
const userInfo = window.vkDebug.getUserInfo();
console.log('Current User ID:', userInfo?.id);
console.log('Expected User ID:', 6582162);
console.log('Match:', userInfo?.id === 6582162);
```

### 3. Clear Premium Cache
If there's cached data preventing the backend check:

```javascript
// Clear premium cache
window.vkDebug.clearPremiumCache();

// Refresh premium status
window.vkDebug.refreshPremiumStatus().then(result => {
    console.log('Refreshed Premium Status:', result);
});
```

### 4. Check Backend Response
Monitor the network request to see what the backend returns:

```javascript
// Enhanced debug with full backend response
window.vkDebug.debugPremiumStatus().then(debugInfo => {
    console.log('Backend Check Details:', debugInfo.backendCheck);
});
```

## Potential Issues and Solutions

### Issue 1: User ID Mismatch
**Problem**: The user ID in the app doesn't match the purchase user ID.

**Solution**: 
- Verify the user is logged in with the correct VK account
- Check if the purchase was made with a different account

### Issue 2: Backend API Response Format
**Problem**: Backend returns unexpected response format.

**Expected Response**:
```json
{
  "success": true,
  "has_purchase": true
}
```

**Check**: Look at the `debugInfo.backendCheck.raw_response` to see actual response.

### Issue 3: Cached Data
**Problem**: Old cached data prevents backend check.

**Solution**: 
```javascript
window.vkDebug.clearPremiumCache();
window.vkDebug.refreshPremiumStatus();
```

### Issue 4: Network/Timeout Issues
**Problem**: Backend request fails or times out.

**Check**: Look for errors in `debugInfo.errors` array.

### Issue 5: App ID Mismatch
**Problem**: App ID in request doesn't match purchase.

**Expected**: App ID should be `53942833` (matches your purchase)

## Backend API Endpoint

**URL**: `https://nikmobdev.ru/goodsshop/api/check-purchase`

**Request**:
```json
{
  "user_id": "6582162",
  "app_id": "53942833", 
  "item_id": "mbti_premium"
}
```

**Expected Response**:
```json
{
  "success": true,
  "has_purchase": true
}
```

## Manual Testing Commands

Run these commands in browser console to test step by step:

```javascript
// 1. Check current state
console.log('=== Step 1: Current State ===');
window.vkDebug.getUserInfo().then(info => console.log('User Info:', info));
window.vkDebug.checkPremiumStatus().then(status => console.log('Premium Status:', status));

// 2. Clear cache and retry
console.log('=== Step 2: Clear Cache ===');
window.vkDebug.clearPremiumCache();
window.vkDebug.refreshPremiumStatus().then(status => console.log('New Premium Status:', status));

// 3. Get detailed debug info
console.log('=== Step 3: Detailed Debug ===');
window.vkDebug.debugPremiumStatus().then(debug => console.log('Full Debug Info:', debug));
```

## Expected Debug Output

For a successful premium check, you should see:

```javascript
{
  timestamp: "2025-01-XX...",
  userInfo: {
    id: 6582162,  // Should match purchase user ID
    // ... other user info
  },
  localStorage: {
    premiumStatus: null,  // Should be null initially
    // ... other localStorage data
  },
  backendCheck: {
    success: true,
    has_purchase: true,  // Should be true for your purchase
    raw_response: {
      success: true,
      has_purchase: true
    },
    request_info: {
      user_id: 6582162,
      app_id: "53942833",
      item_id: "mbti_premium"
    }
  },
  errors: []  // Should be empty
}
```

## Next Steps

1. Run the debug commands above
2. Check the console output for any errors
3. Verify the user ID matches your purchase (6582162)
4. Check if the backend returns the expected response format
5. If issues persist, check the backend logs for the API request

## Contact Information

If the issue persists after following these steps, please provide:
- Console output from debug commands
- Network tab showing the backend API request/response
- Backend logs for the `/api/check-purchase` endpoint 