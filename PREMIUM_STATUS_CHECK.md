# Premium Status Check Implementation

## Overview

The premium status check system automatically verifies a user's premium status when the app initializes. It uses a two-tier approach: first checking local storage for cached data, then falling back to the backend API if no local data is found.

## Implementation Details

### 1. Automatic Check on App Initialization

The premium status check is automatically triggered during VK Bridge initialization:

```javascript
// In VKBridgeManager.init()
// Check premium status (non-blocking)
this.checkPremiumStatus().catch(error => {
    if (window.firebaseAnalyticsDebug) {
        console.log('🔥 Premium status check failed (non-blocking):', error);
    }
});
```

### 2. Two-Tier Check System

#### **Tier 1: Local Storage Check**
- Checks for `mbti_premium` flag in localStorage
- Checks for `mbti_subscription_data` with `isActive: true`
- Returns cached status if available

#### **Tier 2: Backend API Check**
- Makes HTTP request to: `https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase`
- Parameters: `user_id`, `app_id=53942833`, `item_id=mbti_premium`
- Stores result in localStorage for future use

### 3. API Response Format

The backend API returns the following JSON structure:

```json
{
  "success": true,
  "has_purchase": true,
  "user_id": "6582162",
  "app_id": "53942833",
  "item_id": "mbti_premium",
  "purchase_details": {
    "total_purchased": 1,
    "total_refunded": 0,
    "net_purchases": 1,
    "latest_purchase": {
      "order_id": "2259359",
      "app_order_id": "1732864567890",
      "price": 40,
      "purchase_date": "2024-01-15T10:30:00.000Z",
      "status": "chargeable"
    }
  },
  "item_details": {
    "title": {
      "ru_RU": "MBTI Premium - Расширенный анализ личности",
      "en_US": "MBTI Premium - Extended Personality Analysis"
    },
    "price": 40,
    "description": {
      "ru_RU": "Получите детальный анализ вашего типа личности MBTI с персональными рекомендациями",
      "en_US": "Get a detailed analysis of your MBTI personality type with personal recommendations"
    }
  }
}
```

### 4. Key Methods

#### **`checkPremiumStatus()`**
Main method that orchestrates the premium status check:
- Checks local storage first
- Falls back to backend API if needed
- Updates global premium state
- Tracks analytics events

#### **`checkLocalPremiumStatus()`**
Checks localStorage for cached premium status:
- Returns `true` if premium is cached
- Returns `null` if no cache found
- Handles JSON parsing errors gracefully

#### **`checkBackendPremiumStatus()`**
Makes HTTP request to backend API:
- Uses user ID from VK user info
- 10-second timeout
- Validates response format
- Returns boolean or null on error

#### **`storePremiumStatus(isPremium)`**
Caches premium status in localStorage:
- Stores boolean flag
- Stores timestamp for cache invalidation
- Handles storage errors gracefully

#### **`updateGlobalPremiumStatus(isPremium)`**
Updates app-wide premium state:
- Calls `window.setPremium(isPremium)`
- Calls `window.updatePremiumUI()`
- Logs debug information

#### **`refreshPremiumStatus()`**
Manually refreshes premium status:
- Clears local cache
- Forces backend API check
- Updates global state
- Useful for testing or manual refresh

### 5. Analytics Tracking

The system tracks various events for monitoring:

- `premium_status_check_attempted`
- `premium_status_from_local_storage`
- `premium_status_from_backend`
- `premium_status_unknown`
- `premium_status_check_error`
- `premium_status_backend_error`
- `premium_status_refresh_attempted`
- `premium_status_refresh_success`
- `premium_status_refresh_error`

### 6. Error Handling

- **Network Errors**: Gracefully handled, returns `false` (not premium)
- **Invalid Responses**: Logged and handled as errors
- **Storage Errors**: Logged but don't block functionality
- **Missing User ID**: Skips backend check, assumes not premium

### 7. Performance Considerations

- **Non-blocking**: Premium check doesn't block app initialization
- **Caching**: Results cached in localStorage to reduce API calls
- **Timeout**: 10-second timeout prevents hanging requests
- **Fallback**: Always defaults to `false` (not premium) on errors

### 8. Usage Examples

#### **Automatic Check (Default)**
```javascript
// Automatically called during VK Bridge initialization
// No manual intervention required
```

#### **Manual Refresh**
```javascript
// Force refresh from backend
const isPremium = await vkBridgeManager.refreshPremiumStatus();
```

#### **Check Current Status**
```javascript
// Check current premium status
const isPremium = await vkBridgeManager.checkPremiumStatus();
```

### 9. Configuration

The system uses the following configuration:

- **Backend URL**: `https://user6582162-sejkta2h.tunnel.vk-apps.com/api/check-purchase`
- **App ID**: `53942833`
- **Item ID**: `mbti_premium`
- **Timeout**: 10 seconds
- **Cache Keys**: `mbti_premium`, `mbti_premium_timestamp`

### 10. Debug Mode

When Firebase Analytics debug mode is enabled, the system logs:
- Backend API requests and responses
- Local storage operations
- Global state updates
- Error details

## Benefits

1. **Automatic**: No user intervention required
2. **Fast**: Local cache provides instant results
3. **Reliable**: Backend verification ensures accuracy
4. **Robust**: Comprehensive error handling
5. **Trackable**: Full analytics coverage
6. **Flexible**: Manual refresh available when needed 