# Backend API Troubleshooting Guide

## Issue: 400 Bad Request Error - RESOLVED

The premium status check was receiving a `400 Bad Request` error from the backend API. The issue has been identified and resolved.

## Root Cause Identified

The backend API was expecting a **JSON request body** but receiving **query parameters**. The error showed:

```
SyntaxError: Unexpected token '"', """" is not valid JSON
at JSON.parse (<anonymous>)
at createStrictSyntaxError (/Users/nikitaf/development/goodsv2/node_modules/body-parser/lib/types/json.js:169:10)
```

This indicated the backend uses `body-parser` middleware and expects POST requests with JSON body, not GET requests with query parameters.

## Solution Implemented

**Changed from GET with query parameters to POST with JSON body:**

**Before:**
```
GET https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase?user_id=6582162&app_id=53942833&item_id=mbti_premium
```

**After:**
```
POST https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase
Content-Type: application/json

{
  "user_id": "6582162",
  "app_id": "53942833", 
  "item_id": "mbti_premium"
}
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

Based on the resolved implementation, the backend accepts:

**URL**: `https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase`
**Method**: POST
**Headers**:
- `Content-Type: application/json`
- `Accept: application/json`
**Request Body**:
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
  "has_purchase": true,
  "user_id": "6582162",
  "app_id": "53942833",
  "item_id": "mbti_premium",
  "purchase_details": { ... },
  "item_details": { ... }
}
```

## Status: RESOLVED ✅

The 400 Bad Request error has been successfully resolved by changing the request method from GET to POST with JSON body.

## Testing the Fix

You can test the resolved implementation using the debug methods:

```javascript
// Test the new POST implementation
window.vkDebug.debugBackendAPI()

// Check premium status with the fixed implementation
window.vkDebug.checkPremiumStatus()

// Force refresh from backend
window.vkDebug.refreshPremiumStatus()
```

## What Changed

1. **Request Method**: Changed from `GET` to `POST`
2. **Request Format**: Changed from query parameters to JSON body
3. **Headers**: Added proper `Content-Type: application/json`
4. **Error Handling**: Enhanced to provide better debugging information

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