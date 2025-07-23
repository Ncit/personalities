# VK Analytics Integration with Firebase

This document describes the comprehensive VK (VKontakte) analytics integration that tracks all VK events and user information in Firebase Analytics.

## Overview

The VK Bridge Manager has been enhanced with comprehensive Firebase Analytics tracking for all VK Mini Apps events, user interactions, and platform-specific functionality.

## VK Events Tracked

### 1. Bridge Initialization Events
- `vk_bridge_init_attempted`: When VK Bridge initialization is attempted
- `vk_environment_detected`: When VK environment is successfully detected
- `vk_app_initialized`: When VK app is initialized
- `vk_bridge_init_success`: When VK Bridge initialization succeeds
- `vk_standalone_mode`: When running in standalone mode (not VK)
- `vk_bridge_init_error`: When VK Bridge initialization fails

### 2. User Information Events
- `vk_get_user_info_attempted`: When attempting to get user info
- `vk_user_info_retrieved`: When user info is successfully retrieved
- `vk_user_info_received`: When user info is received via bridge event
- `vk_get_user_info_failed`: When getting user info fails
- `vk_get_user_info_error`: When getting user info encounters an error

### 3. Bridge Events
- `vk_bridge_event`: All bridge events with type and data
- `vk_unhandled_bridge_event`: Unhandled bridge events

### 4. Payment Events
- `vk_payment_attempted`: When payment is attempted
- `vk_payment_development_mode`: When payment succeeds in development mode
- `vk_payment_already_premium`: When user is already premium
- `vk_premium_status_check_error`: When premium status check fails
- `vk_payment_result`: Payment result (success/failure)
- `vk_payment_error`: Payment error details
- `vk_payment_config_error`: Payment configuration error
- `vk_payment_development_fallback`: Development fallback after error
- `vk_payment_user_denied`: User denied payment
- `vk_payment_unknown_error`: Unknown payment error

### 5. Sharing Events
- `vk_share_attempted`: When sharing is attempted
- `vk_share_fallback_native`: When falling back to native sharing
- `vk_share_success`: When sharing succeeds
- `vk_share_error`: When sharing fails

### 6. Advertisement Events
- `vk_banner_ad_attempted`: When banner ad is attempted
- `vk_banner_ad_shown`: When banner ad is shown
- `vk_banner_ad_not_available`: When banner ad is not available
- `vk_banner_ad_error`: When banner ad fails

- `vk_interstitial_ad_attempted`: When interstitial ad is attempted
- `vk_interstitial_ad_shown`: When interstitial ad is shown
- `vk_interstitial_ad_not_available`: When interstitial ad is not available
- `vk_interstitial_ad_error`: When interstitial ad fails

- `vk_rewarded_ad_attempted`: When rewarded ad is attempted
- `vk_rewarded_ad_result`: Rewarded ad result with reward details
- `vk_rewarded_ad_not_available`: When rewarded ad is not available
- `vk_rewarded_ad_error`: When rewarded ad fails

### 7. Quiz Events (VK-Specific)
- `vk_quiz_started`: When quiz starts in VK environment
- `vk_quiz_premium_started`: When premium quiz starts in VK environment
- `vk_quiz_completed`: When quiz completes in VK environment

## VK User Properties

The following user properties are automatically set in Firebase Analytics when a VK user is detected:

```javascript
{
    vk_user_id: "123456789",
    vk_username: "user_screen_name",
    vk_first_name: "John",
    vk_last_name: "Doe",
    vk_has_photo: true,
    vk_platform: true,
    user_type: "vk_user"
}
```

## Implementation Details

### 1. VK Bridge Manager Enhancement

The `VKBridgeManager` class has been enhanced with:

- **Event Tracking Methods**: `trackVKEvent()` for general VK events
- **User Property Management**: `setVKUserProperties()` for setting user data
- **Quiz-Specific Tracking**: `trackVKQuizEvent()` for quiz-related events
- **Analytics Data Access**: `getVKAnalyticsData()` for debugging

### 2. Firebase Analytics Integration

All VK events are automatically sent to Firebase Analytics with:
- VK platform context
- User ID when available
- Timestamp
- Event-specific parameters

### 3. Error Tracking

VK-specific errors are tracked with detailed context:
- Error messages
- Error types and codes
- User context
- Platform information

## Usage Examples

### Tracking Custom VK Events

```javascript
// In VKBridgeManager
this.trackVKEvent('custom_vk_event', {
    custom_parameter: 'value',
    user_action: 'button_click'
});
```

### Setting VK User Properties

```javascript
// Automatically called when user info is retrieved
this.setVKUserProperties(userInfo);
```

### Tracking Quiz Events in VK

```javascript
// In main application
if (this.vkBridgeManager && this.vkBridgeManager.isVKEnvironment()) {
    this.vkBridgeManager.trackVKQuizEvent('started', {
        quiz_type: 'mbti'
    });
}
```

## Firebase Console Analysis

### VK User Segments

Create user segments based on VK properties:
- `user_type = "vk_user"` - All VK users
- `vk_platform = true` - Users in VK environment
- `vk_has_photo = true` - Users with profile photos

### VK Event Analysis

Analyze VK-specific metrics:
- **Payment Conversion**: `vk_payment_result` events
- **User Engagement**: `vk_quiz_*` events
- **Platform Usage**: `vk_environment_detected` vs `vk_standalone_mode`
- **Error Rates**: `vk_*_error` events

### Custom Reports

Create custom reports for VK-specific insights:
- VK user retention
- Payment success rates
- Quiz completion rates by VK users
- Ad engagement metrics

## Debugging and Testing

### VK Analytics Data Access

```javascript
// Get VK analytics data for debugging
const vkData = vkBridgeManager.getVKAnalyticsData();
console.log('VK Analytics:', vkData);
```

### Event Logging

All VK events are logged to console with detailed information:
```
VK Event tracked: vk_payment_attempted {
    bridge_available: true,
    vk_platform: true,
    vk_user_id: 123456789,
    timestamp: "2024-01-15T10:30:00.000Z"
}
```

### Testing in Development

In development mode, VK events are tracked even when not in VK environment:
- Events are logged with `vk_platform: false`
- User properties are set with test data
- All tracking methods work for testing

## Best Practices

### 1. Event Naming
- Use descriptive, consistent event names
- Prefix VK events with `vk_`
- Use snake_case for event names and parameters

### 2. Parameter Usage
- Include VK context in all events
- Add user ID when available
- Include error details for failure events

### 3. User Privacy
- Don't log sensitive user information
- Use user ID instead of personal data
- Follow VK privacy guidelines

### 4. Performance
- Batch events when possible
- Don't track too frequently
- Monitor Firebase quotas

## Troubleshooting

### Common Issues

1. **Events Not Appearing**
   - Check if VK Bridge is available
   - Verify Firebase Analytics is initialized
   - Check console for error messages

2. **User Properties Not Set**
   - Ensure user info is retrieved successfully
   - Check if Firebase Analytics is available
   - Verify user ID is present

3. **Payment Tracking Issues**
   - Check VK payment configuration
   - Verify error handling is working
   - Test in development mode first

### Debug Mode

Enable debug mode to see all VK events:
```javascript
// In browser console
localStorage.setItem('vk_analytics_debug', 'true');
```

## Future Enhancements

1. **Real-time VK Analytics Dashboard**
2. **VK User Behavior Prediction**
3. **A/B Testing for VK Users**
4. **Advanced VK User Segmentation**
5. **VK-Specific Conversion Funnels**

## Support

For VK analytics issues:
1. Check VK Bridge documentation
2. Review Firebase Analytics setup
3. Check browser console for errors
4. Use debug mode for detailed logging
5. Test in development environment first 