# VK Integration - Refactored Architecture

This directory contains the refactored VK Mini Apps integration for the MBTI Personality Quiz application. The new architecture provides better separation of concerns, improved error handling, and enhanced maintainability.

## Architecture Overview

The VK integration has been refactored into a modular architecture with the following components:

```
src/modules/vk/
├── config/
│   └── VKConfig.js              # Centralized configuration
├── services/
│   ├── VKAnalyticsService.js    # Analytics tracking
│   ├── VKPaymentService.js      # Payment processing
│   └── VKUserService.js         # User management
├── utils/
│   └── VKErrorHandler.js        # Error handling
├── VKBridgeManager.js           # Main orchestrator
├── vk-styles.css               # VK-specific styles
└── README.md                   # This file
```

## Components

### 1. VKConfig.js
Centralized configuration management for all VK-related settings.

**Features:**
- Backend API endpoints
- Payment configurations
- Feature flags
- Timeout settings
- Storage keys
- Analytics event names
- Error code mappings

**Usage:**
```javascript
import { VKConfig } from './config/VKConfig.js';

// Get payment configuration
const config = VKConfig.getPaymentConfig('mbti_premium');

// Check if feature is enabled
if (VKConfig.isFeatureEnabled('payment')) {
    // Payment logic
}

// Get backend URL
const url = VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT);
```

### 2. VKErrorHandler.js
Comprehensive error handling with fallback strategies.

**Features:**
- Error categorization and analysis
- Automatic fallback determination
- Context-aware error logging
- Analytics error tracking
- User-friendly error messages

**Usage:**
```javascript
import { VKErrorHandler } from './utils/VKErrorHandler.js';

const errorHandler = new VKErrorHandler(logger);

try {
    // VK operation
} catch (error) {
    const result = errorHandler.handleError(error, 'payment');
    if (result.fallback.available) {
        // Use fallback strategy
    }
}
```

### 3. VKAnalyticsService.js
Dedicated analytics tracking service.

**Features:**
- Event tracking with enhanced parameters
- Session management
- Local event storage for debugging
- User property management
- Firebase Analytics integration

**Usage:**
```javascript
import { VKAnalyticsService } from './services/VKAnalyticsService.js';

const analytics = new VKAnalyticsService(logger);

// Track events
analytics.trackVKEvent('payment_attempted', { product_id: 'premium' });
analytics.trackPayment('mbti_premium', true, null, 'order_123');
analytics.trackUserInfo(userInfo, true);
```

### 4. VKPaymentService.js
Payment processing and subscription management.

**Features:**
- Order box management
- Payment result handling
- Subscription processing
- Payment configuration management
- Error handling with fallbacks

**Usage:**
```javascript
import { VKPaymentService } from './services/VKPaymentService.js';

const paymentService = new VKPaymentService(bridge, logger, analytics, errorHandler);

// Show order box
const orderResult = await paymentService.showOrderBox('mbti_premium');

// Process payment
const paymentResult = await paymentService.handleOrderBoxResult(orderResult);

// Purchase subscription
const subscription = await paymentService.purchaseSubscription('monthly');
```

### 5. VKUserService.js
User information and premium status management.

**Features:**
- User information retrieval
- User data saving to server
- Premium status checking
- Local storage management
- Global premium status updates

**Usage:**
```javascript
import { VKUserService } from './services/VKUserService.js';

const userService = new VKUserService(bridge, logger, analytics, errorHandler);

// Get user info
const userInfo = await userService.getUserInfo();

// Check premium status
const isPremium = await userService.checkPremiumStatus();

// Save user data
await userService.saveUserDataToServer(userInfo);
```

### 6. VKBridgeManager.js
Main orchestrator that coordinates all services.

**Features:**
- Service initialization and coordination
- Bridge event handling
- VK environment detection
- Feature support checking
- Debug method exposure
- Backward compatibility

**Usage:**
```javascript
import { VKBridgeManager } from './VKBridgeManager.js';

const vkManager = new VKBridgeManager();

// Check VK environment
if (vkManager.isVKEnvironment()) {
    // VK-specific logic
}

// Use services through the manager
const userInfo = await vkManager.getUserInfo();
const isPremium = await vkManager.checkPremiumStatus();
```

## Key Improvements

### 1. Separation of Concerns
- Each service has a single responsibility
- Clear interfaces between components
- Easier testing and maintenance

### 2. Enhanced Error Handling
- Centralized error processing
- Automatic fallback strategies
- Context-aware error logging
- Better user experience

### 3. Configuration Management
- All settings in one place
- Easy to modify and extend
- Environment-specific configurations

### 4. Improved Analytics
- Dedicated analytics service
- Better event tracking
- Enhanced debugging capabilities
- Session management

### 5. Better Testing
- Modular architecture enables unit testing
- Mock services for testing
- Clear service boundaries

## Migration Guide

### From Old to New Architecture

**Old way:**
```javascript
// Direct method calls
const userInfo = await vkBridgeManager.getUserInfo();
const isPremium = await vkBridgeManager.checkPremiumStatus();
await vkBridgeManager.showOrderBox();
```

**New way:**
```javascript
// Same interface (backward compatible)
const userInfo = await vkBridgeManager.getUserInfo();
const isPremium = await vkBridgeManager.checkPremiumStatus();
await vkBridgeManager.showOrderBox();

// Or use services directly
const userInfo = await vkBridgeManager.userService.getUserInfo();
const isPremium = await vkBridgeManager.userService.checkPremiumStatus();
await vkBridgeManager.paymentService.showOrderBox();
```

### Configuration Changes

**Old way:**
```javascript
// Hardcoded values
const url = `${VKBridgeManager.BACKEND_BASE_URL}/api/check-purchase`;
```

**New way:**
```javascript
// Centralized configuration
import { VKConfig } from './config/VKConfig.js';
const url = VKConfig.getBackendUrl(VKConfig.BACKEND_CHECK_PURCHASE_ENDPOINT);
```

## Debugging

The refactored architecture provides enhanced debugging capabilities:

```javascript
// Access debug methods
window.vkDebug.getAnalyticsData();
window.vkDebug.getPaymentStatus();
window.vkDebug.getUserStatus();

// Clear user data saved flag
window.vkDebug.clearUserDataSavedFlag();

// Get user data saved status
window.vkDebug.getUserDataSavedStatus();
```

## Error Handling

The new error handling system provides:

1. **Automatic Error Categorization**: Errors are automatically categorized by type and severity
2. **Fallback Strategies**: Automatic fallback determination based on error type
3. **Context-Aware Logging**: Errors are logged with appropriate detail based on context
4. **User-Friendly Messages**: Error messages are translated to user-friendly text

## Testing

Each service can be tested independently:

```javascript
// Test payment service
const mockBridge = { send: jest.fn() };
const mockLogger = { debug: jest.fn(), error: jest.fn() };
const mockAnalytics = { trackPayment: jest.fn() };
const mockErrorHandler = { handleError: jest.fn() };

const paymentService = new VKPaymentService(
    mockBridge, 
    mockLogger, 
    mockAnalytics, 
    mockErrorHandler
);

// Test methods
await paymentService.showOrderBox('test_product');
```

## Future Enhancements

1. **TypeScript Support**: Add TypeScript definitions for better type safety
2. **Plugin Architecture**: Allow custom service implementations
3. **Performance Monitoring**: Add performance tracking for VK operations
4. **Offline Support**: Implement offline capabilities with sync
5. **A/B Testing**: Add A/B testing support for VK features

## Contributing

When contributing to the VK integration:

1. Follow the modular architecture
2. Add appropriate error handling
3. Include analytics tracking
4. Update configuration as needed
5. Add tests for new functionality
6. Update this documentation

## Support

For issues or questions about the VK integration:

1. Check the debug methods for troubleshooting
2. Review the error logs for specific issues
3. Test in both VK and standalone environments
4. Verify configuration settings
5. Check Firebase Analytics for event tracking 