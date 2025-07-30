# Backend API Troubleshooting Guide

## Issue: 400 Bad Request Error

The premium status check is receiving a `400 Bad Request` error from the backend API. This guide provides debugging steps and potential solutions.

## Current Error Details

```
GET https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase?user_id=6582162&app_id=53942833&item_id=mbti_premium 400 (Bad Request)
```

## Debugging Steps

### 1. Enhanced Error Logging

The system now provides enhanced error logging with:
- Detailed request parameters
- Response status and headers
- Error response body content
- Request URL for verification

### 2. Debug Methods Available

The following debug methods are now exposed globally for testing:

```javascript
// Access debug methods in browser console
window.vkDebug.debugBackendAPI()     // Test different parameter combinations
window.vkDebug.checkPremiumStatus()  // Check current premium status
window.vkDebug.refreshPremiumStatus() // Force refresh from backend
window.vkDebug.getUserInfo           // Get current user info
window.vkDebug.getVKEnvironment()    // Check VK environment status
```

### 3. Parameter Testing

The `debugBackendAPI()` method tests different parameter combinations:

1. **Original parameters**: `user_id=6582162&app_id=53942833&item_id=mbti_premium`
2. **Without app_id**: `user_id=6582162&item_id=mbti_premium`
3. **Without item_id**: `user_id=6582162&app_id=53942833`
4. **Only user_id**: `user_id=6582162`
5. **Base URL only**: No parameters

## Potential Issues and Solutions

### Issue 1: Missing Required Parameters

**Symptoms**: 400 error with all parameter combinations
**Possible Causes**:
- Backend expects different parameter names
- Backend requires additional parameters
- Backend expects parameters in different format

**Solutions**:
1. Check backend API documentation for exact parameter requirements
2. Verify parameter names and values
3. Test with different parameter combinations using debug method

### Issue 2: Authentication Required

**Symptoms**: 400 error, backend might expect authentication headers
**Possible Causes**:
- Backend requires API key or token
- Backend expects VK-specific headers
- Backend requires session authentication

**Solutions**:
1. Add authentication headers to request
2. Include VK access token if required
3. Check if backend expects different authentication method

### Issue 3: CORS Issues

**Symptoms**: 400 error in browser, but API might work in other contexts
**Possible Causes**:
- Backend doesn't allow requests from VK domain
- Missing CORS headers
- Backend expects specific origin

**Solutions**:
1. Check backend CORS configuration
2. Verify allowed origins include VK domains
3. Test API directly (not from VK context)

### Issue 4: Parameter Format Issues

**Symptoms**: 400 error with specific parameter combinations
**Possible Causes**:
- Backend expects different data types
- Backend expects URL-encoded parameters
- Backend expects JSON body instead of query parameters

**Solutions**:
1. Check if backend expects POST instead of GET
2. Verify parameter encoding
3. Test with different parameter formats

## Testing Commands

### Run Debug Tests
```javascript
// In browser console
window.vkDebug.debugBackendAPI()
```

### Check Current Status
```javascript
// In browser console
window.vkDebug.checkPremiumStatus()
```

### Force Refresh
```javascript
// In browser console
window.vkDebug.refreshPremiumStatus()
```

## Backend API Requirements

Based on the original specification, the backend should accept:

**URL**: `https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase`
**Method**: GET
**Parameters**:
- `user_id` (string): VK user ID
- `app_id` (string): VK app ID (53942833)
- `item_id` (string): Item identifier (mbti_premium)

**Expected Response**:
```json
{
  "success": true,
  "has_purchase": true,
  "user_id": "6582162",
  "app_id": "53942833",
  "item_id": "mbti_premium",
  "purchase_details": { ... },
  "item_details": { ... }
}
```

## Next Steps

1. **Run Debug Tests**: Use `window.vkDebug.debugBackendAPI()` to test different parameter combinations
2. **Check Backend Logs**: Verify what the backend is receiving and why it's rejecting the request
3. **Verify API Documentation**: Ensure the API endpoint and parameters match the backend implementation
4. **Test Directly**: Try calling the API directly (not from VK context) to isolate the issue

## Fallback Behavior

The system is designed to gracefully handle backend errors:
- Premium status defaults to `false` (not premium) on errors
- Local storage cache is used when available
- Errors are logged for debugging
- App functionality continues normally

## Support Information

If the issue persists:
1. Check backend server logs for detailed error information
2. Verify the API endpoint is accessible and correctly configured
3. Test the API with tools like Postman or curl
4. Ensure the backend is properly handling the expected request format 