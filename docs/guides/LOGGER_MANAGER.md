# LoggerManager Documentation

## Overview

The `LoggerManager` class provides configurable logging with individual enable/disable options for each log level. It centralizes logging control and makes it easier to manage debug output across the application.

**Key Feature**: Error logging is always enabled, while other levels are automatically enabled in development mode.

## Features

- **Environment-Aware**: Automatically detects development vs production environment
- **Error-Only in Production**: Only errors are logged in production by default
- **Configurable Log Levels**: Enable/disable individual log levels (log, warn, error, debug, info, trace)
- **Custom Prefixes**: Set custom prefixes for log messages
- **Timestamps**: Optional timestamp support
- **Module Loggers**: Create specialized loggers for different modules
- **Pre-configured Modes**: Firebase debug, production, and verbose modes
- **Console Methods**: Support for console.group, console.table, console.time, etc.

## Environment Detection

The LoggerManager automatically detects development mode based on:

- `localhost` or `127.0.0.1` hostname
- Hostname containing `dev` or `staging`
- URL parameters: `?debug=true` or `?dev=true`
- `window.firebaseAnalyticsDebug === true`
- `localStorage.debug_mode === 'true'`

## Default Behavior

### Development Mode
```javascript
{
    log: true,
    warn: true,
    error: true,    // Always enabled
    debug: true,
    info: true,
    trace: false
}
```

### Production Mode
```javascript
{
    log: false,
    warn: false,
    error: true,    // Always enabled
    debug: false,
    info: false,
    trace: false
}
```

## Basic Usage

### Import and Initialize

```javascript
import { LoggerManager } from './src/modules/core/LoggerManager.js';

// Create a basic logger (automatically detects environment)
const logger = new LoggerManager();

// Create a module-specific logger
const vkLogger = new LoggerManager().createModuleLogger('VKBridgeManager');
```

### Logging Methods

```javascript
// Basic logging
logger.log('This is a log message');      // Only in development
logger.warn('This is a warning');         // Only in development
logger.error('This is an error');         // Always logged
logger.debug('This is debug info');       // Only in development
logger.info('This is info');              // Only in development
logger.trace('This is a trace');          // Disabled by default

// With multiple arguments
logger.log('User action:', { userId: 123, action: 'login' });
```

### Configuration

```javascript
// Enable/disable specific levels
logger.setLevelEnabled('debug', false);
logger.setLevelEnabled('error', true);  // Will warn if trying to disable in dev mode

// Enable/disable multiple levels at once
logger.setLevels({
    log: true,
    warn: true,
    error: true,    // Always enabled
    debug: false,
    info: false,
    trace: false
});

// Set custom prefix
logger.setPrefix('🚀');

// Enable timestamps
logger.setTimestamp(true);
```

## Pre-configured Modes

### Firebase Analytics Debug Mode

```javascript
logger.enableFirebaseDebug();
// Enables: log, warn, error, debug, info
// Disables: trace
// Prefix: '🔥'
// Timestamps: false
```

### Production Mode

```javascript
logger.enableProductionMode();
// Enables: error only
// Disables: log, warn, debug, info, trace
// Prefix: '' (none)
// Timestamps: false
```

### Verbose Mode

```javascript
logger.enableVerboseMode();
// Enables: all levels including trace
// Prefix: '🔥'
// Timestamps: true
```

### Force Enable All (Debugging)

```javascript
logger.forceEnableAll();
// Enables: all levels regardless of environment
// Useful for debugging in production
```

### Reset to Default

```javascript
logger.resetToDefault();
// Resets to environment-appropriate defaults
// Development: most levels enabled
// Production: only errors enabled
```

## Advanced Features

### Module Loggers

```javascript
// Create a logger for a specific module
const vkLogger = logger.createModuleLogger('VKBridgeManager');
// Output: 🔥 [VKBridgeManager] Your message

const quizLogger = logger.createModuleLogger('QuizEngine');
// Output: 🔥 [QuizEngine] Your message
```

### Child Loggers

```javascript
// Create a child logger with inherited configuration
const childLogger = logger.createChild({
    prefix: '🔧',
    timestamp: true
});
```

### Console Methods

```javascript
// Group messages
logger.group('User Actions', () => {
    logger.log('User logged in');
    logger.log('User started quiz');
    logger.log('User completed quiz');
});

// Table output
logger.table([
    { name: 'John', score: 85 },
    { name: 'Jane', score: 92 }
]);

// Time measurement
logger.time('API Request');
// ... API call ...
logger.timeEnd('API Request');
```

## Global Instance

The LoggerManager automatically creates a global instance when running in a browser environment:

```javascript
// Access global logger
window.logger.log('Global message');

// Access debug methods
window.loggerDebug.enableFirebaseDebug();
window.loggerDebug.enableProductionMode();
window.loggerDebug.forceEnableAll();
window.loggerDebug.resetToDefault();
window.loggerDebug.setLevelEnabled('debug', true);
window.loggerDebug.getConfig();
window.loggerDebug.isDevelopmentMode();
```

## Configuration Options

```javascript
const config = {
    enabled: true,                    // Master switch for all logging
    levels: {
        log: true,                    // console.log messages (dev only)
        warn: true,                   // console.warn messages (dev only)
        error: true,                  // console.error messages (always)
        debug: true,                  // Debug messages (dev only)
        info: true,                   // Info messages (dev only)
        trace: false                  // console.trace messages
    },
    prefix: '🔥',                     // Custom prefix for messages
    timestamp: false                  // Include timestamps
};

const logger = new LoggerManager(config);
```

## Integration with VKBridgeManager

The VKBridgeManager has been updated to use LoggerManager:

```javascript
// In VKBridgeManager constructor
this.logger = new LoggerManager().createModuleLogger('VKBridgeManager');

// Usage throughout the class
this.logger.log('Premium status found in localStorage:', isPremium);  // Dev only
this.logger.debug('Checking backend premium status');                // Dev only
this.logger.error('Error checking premium status:', error);          // Always
```

## Best Practices

1. **Use Module Loggers**: Create specific loggers for different modules to keep logs organized
2. **Environment-Aware**: Logger automatically adapts to development/production
3. **Error Priority**: Errors are always logged, other levels are environment-dependent
4. **Avoid Sensitive Data**: Never log passwords, tokens, or other sensitive information
5. **Use Appropriate Levels**: Use `error` for errors, `warn` for warnings, `debug` for debug info
6. **Performance**: Production mode only logs errors, improving performance

## Migration from console.log

Replace direct console calls:

```javascript
// Before
console.log('🔥 Premium status:', isPremium);
console.error('Error:', error);

// After
logger.log('Premium status:', isPremium);  // Only in development
logger.error('Error:', error);             // Always logged
```

## Debug Commands

In the browser console, you can control logging:

```javascript
// Check current environment
window.loggerDebug.isDevelopmentMode();

// Enable Firebase Analytics debug mode
window.loggerDebug.enableFirebaseDebug();

// Enable production mode (errors only)
window.loggerDebug.enableProductionMode();

// Enable verbose mode (all levels)
window.loggerDebug.enableVerboseMode();

// Force enable all levels (for debugging)
window.loggerDebug.forceEnableAll();

// Reset to environment defaults
window.loggerDebug.resetToDefault();

// Check current configuration
window.loggerDebug.getConfig();

// Enable/disable specific levels
window.loggerDebug.setLevelEnabled('debug', true);
```

## Environment Variables

You can control logging behavior with URL parameters or localStorage:

```javascript
// Enable debug mode via URL
// https://yourapp.com?debug=true

// Enable debug mode via localStorage
localStorage.setItem('debug_mode', 'true');

// Enable Firebase Analytics debug
window.firebaseAnalyticsDebug = true;
``` 