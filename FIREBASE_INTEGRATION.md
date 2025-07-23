# Firebase Analytics & Crashlytics Integration

This document describes the Firebase Analytics and Crashlytics integration for the MBTI Personality Quiz web application.

## Overview

The application now includes Firebase Analytics for user behavior tracking and Firebase Performance for performance monitoring. Since Firebase Crashlytics is not available for web applications, we've implemented a custom error logging system that sends error data to Firebase Analytics.

## Configuration

### Firebase Configuration
The Firebase configuration is stored in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB773kQHk-jLJeSwYhCluXXk1r6CEOuR8A",
  authDomain: "nikitaproject-b0a52.firebaseapp.com",
  projectId: "nikitaproject-b0a52",
  storageBucket: "nikitaproject-b0a52.firebasestorage.app",
  messagingSenderId: "188919966813",
  appId: "1:188919966813:web:748cc6a6354d672173f1b4",
  measurementId: "G-TZ5LN0BB9L"
};
```

## Features

### 1. Firebase Analytics
- **Page Views**: Automatically tracks page views with metadata
- **Custom Events**: Tracks user interactions and quiz events
- **User Properties**: Can set user properties for segmentation
- **Event Parameters**: Rich event data for detailed analytics

### 2. Error Logging (Crashlytics Alternative)
- **JavaScript Errors**: Catches and logs all JavaScript errors
- **Promise Rejections**: Handles unhandled promise rejections
- **Custom Error Context**: Provides additional context for debugging
- **Error Stack Traces**: Includes full stack traces when available

### 3. Performance Monitoring
- **Page Load Performance**: Tracks page load times
- **Custom Performance Events**: Can track specific performance metrics
- **Performance Data**: Available in Firebase Console

## Tracked Events

### Quiz Events
- `quiz_started`: When a user starts a quiz
  - Parameters: `quiz_type`, `question_count`
- `quiz_completed`: When a user completes a quiz
  - Parameters: `personality_type`, `quiz_type`, `question_count`, `is_premium`
- `premium_quiz_started`: When a premium quiz is started
  - Parameters: `quiz_type`, `is_premium`

### User Interaction Events
- `premium_unlock_attempted`: When user attempts to unlock premium
  - Parameters: `app_state`, `vk_environment`
- `user_interaction`: Generic user interaction tracking
  - Parameters: `action`, `details`

### Analytics Events
- `analytics_charts_created`: When analytics charts are generated
  - Parameters: `personality_type`, `quiz_type`

### Error Events
- `app_error`: When any error occurs
  - Parameters: `error_message`, `error_stack`, `error_type`, `context`

### System Events
- `app_initialized`: When the application initializes
  - Parameters: `app_version`, `quiz_type`
- `page_view`: When a page is viewed
  - Parameters: `page_title`, `page_location`

## Implementation Details

### 1. Firebase Configuration (`src/config/firebase.js`)
- Centralized Firebase configuration
- Analytics helper functions
- Performance monitoring setup
- Error logging initialization

### 2. Main Application Integration (`src/main.js`)
- Firebase initialization during app startup
- Global error handlers
- Event tracking for key user actions

### 3. Analytics Engine Integration (`src/modules/analytics/AnalyticsEngine.js`)
- Enhanced with Firebase Analytics tracking
- Event tracking methods
- Quiz completion tracking

### 4. HTML Integration (`index.html`)
- Firebase SDK loaded via CDN
- Global Firebase Analytics object
- Automatic page view tracking

### 5. Script Integration (`script.js`)
- Event tracking for quiz interactions
- Premium feature usage tracking
- Error logging for user actions

## Usage Examples

### Logging Custom Events
```javascript
// Using the Firebase Analytics helper
firebaseAnalytics.logEvent('custom_event', {
    parameter1: 'value1',
    parameter2: 'value2'
});

// Using the global object (fallback)
window.firebaseAnalytics.logEvent('custom_event', {
    parameter1: 'value1'
});
```

### Logging Errors
```javascript
try {
    // Some code that might fail
} catch (error) {
    firebaseAnalytics.logError(error, {
        context: 'specific_function',
        additional_data: 'value'
    });
}
```

### Setting User Properties
```javascript
firebaseAnalytics.setUserProperties({
    user_type: 'premium',
    quiz_preference: 'leadership'
});
```

## Testing

### Test File
Use `test_firebase.html` to test the Firebase integration:

1. Open the test file in a browser
2. Click the test buttons to verify:
   - Analytics event logging
   - Error logging
   - Page view tracking

### Console Verification
Check the browser console for:
- Firebase initialization messages
- Event logging confirmations
- Error logging confirmations

## Firebase Console

### Analytics Dashboard
- **Events**: View all tracked events
- **User Properties**: Analyze user segments
- **Audiences**: Create user audiences
- **Conversions**: Track conversion funnels

### Performance Dashboard
- **Page Load Times**: Monitor page performance
- **Custom Traces**: View custom performance metrics
- **Network Requests**: Analyze network performance

### Error Analysis
Since we're using Analytics for error logging:
- **Events**: Filter by `app_error` events
- **Parameters**: Analyze error types and contexts
- **User Impact**: Track error frequency and user impact

## Best Practices

### 1. Event Naming
- Use descriptive, consistent event names
- Follow the pattern: `category_action`
- Examples: `quiz_started`, `premium_unlocked`, `error_occurred`

### 2. Parameter Usage
- Keep parameters consistent across similar events
- Use meaningful parameter names
- Avoid sensitive data in parameters

### 3. Error Logging
- Log errors with sufficient context
- Include stack traces when available
- Categorize errors by type and context

### 4. Performance
- Don't log too many events (rate limiting)
- Use batch logging for high-frequency events
- Monitor Firebase quotas and limits

## Troubleshooting

### Common Issues

1. **Analytics Not Initializing**
   - Check Firebase configuration
   - Verify network connectivity
   - Check browser console for errors

2. **Events Not Appearing**
   - Wait 24-48 hours for data to appear
   - Check Firebase Console filters
   - Verify event parameters

3. **Performance Issues**
   - Monitor Firebase SDK size
   - Check for excessive event logging
   - Review network requests

### Debug Mode
Enable debug mode by adding this to the console:
```javascript
localStorage.setItem('firebase_analytics_debug', 'true');
```

## Security Considerations

1. **API Key Exposure**: The Firebase API key is public and safe to expose in client-side code
2. **Data Privacy**: Ensure no personally identifiable information is logged
3. **GDPR Compliance**: Consider user consent for analytics tracking
4. **Data Retention**: Review Firebase data retention policies

## Future Enhancements

1. **Real-time Analytics**: Implement real-time dashboard
2. **Advanced Segmentation**: Create user segments based on behavior
3. **A/B Testing**: Integrate Firebase A/B Testing
4. **Predictive Analytics**: Use Firebase ML for user behavior prediction
5. **Enhanced Error Tracking**: Implement more sophisticated error categorization

## Support

For Firebase-related issues:
1. Check Firebase Console for configuration
2. Review Firebase documentation
3. Check browser console for errors
4. Use the test file to verify functionality 