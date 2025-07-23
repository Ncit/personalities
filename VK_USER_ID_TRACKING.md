# VK User ID Tracking in Firebase Analytics

This document describes the enhancement to save VK user IDs to Firebase Analytics when users request premium notifications.

## Overview

The `notifyWhenAvailable()` function has been enhanced to automatically save VK user information to Firebase Analytics when users request to be notified about premium features.

## Implementation Details

### 1. Enhanced `notifyWhenAvailable()` Function

The function now includes comprehensive VK user tracking:

```javascript
function notifyWhenAvailable() {
    // Store user's interest in premium
    localStorage.setItem('premiumNotificationRequested', 'true');
    localStorage.setItem('premiumNotificationDate', new Date().toISOString());
    
    // Get VK user information if available
    let vkUserInfo = null;
    if (window.vkBridgeManager && window.vkBridgeManager.isVKEnvironment()) {
        vkUserInfo = window.vkBridgeManager.getUserData();
    }
    
    // Track notification request to Firebase Analytics
    if (window.firebaseAnalytics) {
        const eventParameters = {
            notification_type: 'premium_coming_soon',
            timestamp: new Date().toISOString()
        };
        
        // Add VK user information if available
        if (vkUserInfo && vkUserInfo.id) {
            eventParameters.vk_user_id = vkUserInfo.id.toString();
            eventParameters.vk_username = vkUserInfo.screen_name || `user_${vkUserInfo.id}`;
            eventParameters.vk_platform = true;
            
            // Set user properties for VK users
            window.firebaseAnalytics.setUserProperties({
                vk_user_id: vkUserInfo.id.toString(),
                vk_username: vkUserInfo.screen_name || `user_${vkUserInfo.id}`,
                vk_first_name: vkUserInfo.first_name || '',
                vk_last_name: vkUserInfo.last_name || '',
                vk_has_photo: !!vkUserInfo.photo_100,
                vk_platform: true,
                user_type: 'vk_user',
                premium_notification_requested: true
            });
            
            // Set user ID for VK users
            window.firebaseAnalytics.setUserId(vkUserInfo.id.toString());
            
            console.log('VK User ID saved to Firebase Analytics:', vkUserInfo.id);
        } else {
            eventParameters.vk_platform = false;
            eventParameters.user_type = 'standalone_user';
        }
        
        // Log the notification request event
        window.firebaseAnalytics.logEvent('premium_notification_requested', eventParameters);
        
        console.log('Premium notification request tracked:', eventParameters);
    }
    
    // Track VK-specific event if in VK environment
    if (window.vkBridgeManager && window.vkBridgeManager.isVKEnvironment()) {
        window.vkBridgeManager.trackVKEvent('premium_notification_requested', {
            user_id: vkUserInfo?.id || null,
            notification_type: 'premium_coming_soon'
        });
    }
    
    // Show confirmation message
    alert('Спасибо! Мы уведомим вас, когда премиум функции станут доступны.');
    closePremiumModal();
}
```

### 2. Enhanced VK Bridge Manager

The `setVKUserProperties()` method now includes additional tracking:

```javascript
setVKUserProperties(userInfo) {
    try {
        if (window.firebaseAnalytics && userInfo) {
            const userProperties = {
                vk_user_id: userInfo.id?.toString(),
                vk_username: userInfo.screen_name || `user_${userInfo.id}`,
                vk_first_name: userInfo.first_name || '',
                vk_last_name: userInfo.last_name || '',
                vk_has_photo: !!userInfo.photo_100,
                vk_platform: this.isVKPlatform,
                user_type: 'vk_user'
            };
            
            // Set user properties
            window.firebaseAnalytics.setUserProperties(userProperties);
            
            // Set user ID
            window.firebaseAnalytics.setUserId(userInfo.id?.toString());
            
            // Track user ID setting event
            this.trackVKEvent('vk_user_id_set', {
                user_id: userInfo.id?.toString(),
                username: userInfo.screen_name || `user_${userInfo.id}`,
                has_photo: !!userInfo.photo_100
            });
            
            console.log('VK User properties set:', userProperties);
            console.log('VK User ID saved to Firebase Analytics:', userInfo.id);
        }
    } catch (error) {
        console.warn('Failed to set VK user properties:', error);
        
        // Track the error
        this.trackVKEvent('vk_user_properties_error', {
            error_message: error.message,
            user_id: userInfo?.id?.toString()
        });
    }
}
```

## Events Tracked

### 1. Premium Notification Events
- `premium_notification_requested`: When user requests premium notification
  - Parameters: `notification_type`, `timestamp`, `vk_user_id`, `vk_username`, `vk_platform`
  - User Properties: Complete VK user profile

### 2. VK User ID Events
- `vk_user_id_set`: When VK user ID is set in Firebase Analytics
  - Parameters: `user_id`, `username`, `has_photo`
- `vk_user_properties_error`: When setting user properties fails
  - Parameters: `error_message`, `user_id`

### 3. VK-Specific Events
- `vk_premium_notification_requested`: VK-specific notification request
  - Parameters: `user_id`, `notification_type`

## User Properties Set

When a VK user requests premium notification, the following properties are automatically set:

```javascript
{
    vk_user_id: "123456789",
    vk_username: "user_screen_name",
    vk_first_name: "John",
    vk_last_name: "Doe",
    vk_has_photo: true,
    vk_platform: true,
    user_type: "vk_user",
    premium_notification_requested: true
}
```

## Firebase Console Analysis

### User Segments

Create segments based on VK user properties:
- `user_type = "vk_user"` - All VK users
- `premium_notification_requested = true` - Users who requested premium notification
- `vk_platform = true` - Users in VK environment

### Event Analysis

Track premium notification requests:
- **Conversion Rate**: Users who requested notification vs total users
- **VK vs Standalone**: Compare notification requests by platform
- **User Engagement**: Track subsequent actions after notification request

### User Journey

Analyze the user journey:
1. User opens premium modal
2. User clicks "Notify when available"
3. VK user ID is saved to Firebase Analytics
4. User properties are set for future tracking
5. User can be targeted for premium launch campaigns

## Testing

### Test Function

Use the test function in `test_firebase.html`:

```javascript
function testVKUserID() {
    // Simulate VK user data
    const mockVKUser = {
        id: 123456789,
        screen_name: 'test_vk_user',
        first_name: 'Test',
        last_name: 'User',
        photo_100: 'https://vk.com/test.jpg'
    };
    
    // Test setting user properties
    if (window.firebaseAnalytics) {
        const userProperties = {
            vk_user_id: mockVKUser.id.toString(),
            vk_username: mockVKUser.screen_name,
            vk_first_name: mockVKUser.first_name,
            vk_last_name: mockVKUser.last_name,
            vk_has_photo: !!mockVKUser.photo_100,
            vk_platform: true,
            user_type: 'vk_user'
        };
        
        // Set user properties
        window.firebaseAnalytics.setUserProperties(userProperties);
        
        // Set user ID
        window.firebaseAnalytics.setUserId(mockVKUser.id.toString());
        
        // Log test event
        window.firebaseAnalytics.logEvent('vk_user_test', {
            user_id: mockVKUser.id.toString(),
            test_type: 'user_id_setting'
        });
    }
}
```

### Manual Testing

1. Open the application in VK environment
2. Click "Открыть премиум доступ" button
3. Click "Уведомить когда будет доступно" button
4. Check browser console for VK user ID logging
5. Verify in Firebase Console that user properties are set

## Benefits

### 1. User Identification
- VK users are uniquely identified in Firebase Analytics
- User properties persist across sessions
- Enables personalized analytics and targeting

### 2. Premium Launch Campaigns
- Build audience of users interested in premium features
- Target VK users specifically for premium launch
- Track conversion from notification request to premium purchase

### 3. User Behavior Analysis
- Compare VK vs standalone user behavior
- Analyze premium feature interest by user type
- Track user engagement patterns

### 4. Error Tracking
- Monitor VK user property setting failures
- Debug VK integration issues
- Ensure data quality and completeness

## Best Practices

### 1. Privacy Compliance
- Only store necessary user information
- Follow VK privacy guidelines
- Use user ID instead of personal data in events

### 2. Error Handling
- Graceful fallback when VK Bridge is not available
- Comprehensive error tracking
- Console logging for debugging

### 3. Data Quality
- Validate user data before setting properties
- Use consistent data formats
- Handle missing or invalid user information

### 4. Performance
- Efficient user property setting
- Minimal impact on user experience
- Proper error handling without blocking UI

## Future Enhancements

1. **Premium Launch Notifications**: Send push notifications to users who requested premium
2. **User Segmentation**: Create advanced segments based on VK user behavior
3. **A/B Testing**: Test different premium notification messages
4. **Conversion Tracking**: Track users from notification request to premium purchase
5. **Retention Analysis**: Analyze user retention after premium notification request 