# VK User Data Saving Functionality

## Overview

This document describes the implementation of VK user data saving to the server via the `/admin/api/users` endpoint.

## Features

### 1. Automatic User Data Saving
- When VK user information is retrieved, it's automatically saved to the server
- Saves the following data:
  - `vk_user_id`: VK user ID
  - `app_id`: VK app ID (53942833)
  - `username`: VK username or generated username
  - `first_name`: User's first name
  - `last_name`: User's last name
  - `vk_photo`: User's profile photo URL

### 2. Duplicate Prevention
- Uses localStorage flag `vk_user_data_saved` to prevent duplicate saves
- Once saved, the flag prevents future save attempts in subsequent sessions
- Includes timestamp for tracking when data was saved

### 3. Error Handling
- Non-blocking: User data saving doesn't block app initialization
- Comprehensive error logging and tracking
- Timeout protection (10 seconds)
- Graceful fallback if server is unavailable

## Implementation Details

### API Endpoint
```
POST /goodsshop/admin/api/users
Content-Type: application/json

{
  "vk_user_id": "123456789",
  "app_id": "53942833",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "vk_photo": "https://vk.com/images/camera_200.png"
}
```

### localStorage Keys
- `vk_user_data_saved`: Boolean flag indicating if data was saved
- `vk_user_data_saved_timestamp`: Timestamp when data was saved

### Debug Methods

The following debug methods are available via `window.vkDebug`:

```javascript
// Check if user data has been saved
vkDebug.getUserDataSavedStatus()

// Manually save user data (respects localStorage flag)
vkDebug.saveUserDataToServer()

// Force save user data (ignores localStorage flag)
vkDebug.forceSaveUserDataToServer()

// Clear the saved flag (for testing)
vkDebug.clearUserDataSavedFlag()
```

## Usage Examples

### Check User Data Status
```javascript
const status = vkDebug.getUserDataSavedStatus();
console.log('User data saved:', status.saved);
console.log('Saved at:', new Date(parseInt(status.timestamp)));
console.log('User info:', status.userInfo);
```

### Force Save User Data
```javascript
// Useful for testing or manual data saving
await vkDebug.forceSaveUserDataToServer();
```

### Clear Saved Flag
```javascript
// Useful for testing - allows re-saving
vkDebug.clearUserDataSavedFlag();
```

## Analytics Events

The following Firebase Analytics events are tracked:

- `vk_user_data_save_success`: Successful save
- `vk_user_data_save_error`: Save error
- `vk_user_data_save_skipped`: Skipped due to already saved
- `vk_user_data_save_failed`: Failed due to invalid data
- `vk_user_data_force_save_success`: Force save successful
- `vk_user_data_force_save_error`: Force save error

## Error Handling

### Network Errors
- 10-second timeout
- Automatic retry not implemented (manual retry available)
- Non-blocking error handling

### Server Errors
- HTTP status code logging
- Response body logging for debugging
- Graceful degradation

### Validation Errors
- Checks for valid user ID
- Validates required fields
- Logs validation failures

## Security Considerations

- User data is sent over HTTPS
- No sensitive data is stored locally
- Server-side validation should be implemented
- Rate limiting should be considered on the server

## Testing

### Manual Testing
1. Open browser console
2. Check current status: `vkDebug.getUserDataSavedStatus()`
3. Clear flag: `vkDebug.clearUserDataSavedFlag()`
4. Force save: `vkDebug.forceSaveUserDataToServer()`
5. Verify flag is set: `vkDebug.getUserDataSavedStatus()`

### Automated Testing
- Check localStorage for saved flag
- Verify API calls are made only once per user
- Test error scenarios (network failure, server error)
- Verify analytics events are fired correctly 