# Eruda Debug Console Guide

## Overview
Eruda is a mobile web debugging tool that provides a comprehensive debugging interface for Android WebView and mobile browsers. It's now integrated into the MBTI Quiz application to help with debugging async/await issues and other mobile-specific problems.

## Features

### 🔧 **Core Debugging Tools**
- **Console**: View logs, errors, and debug information
- **Elements**: Inspect and modify DOM elements
- **Network**: Monitor network requests and responses
- **Resources**: View localStorage, sessionStorage, and cookies
- **Info**: Display device and browser information
- **Snippets**: Run custom JavaScript code

### 🎯 **Custom Tools Added**
- **VK Bridge Test**: Test VK Bridge functionality
- **Async/Await Test**: Verify async/await compatibility
- **Performance Monitor**: Check memory usage and performance metrics

## How to Access

### 1. **Automatic Activation**
Eruda automatically activates in these environments:
- Localhost development (`localhost`, `127.0.0.1`)
- Ngrok tunnels
- When `debug=true` is in the URL
- When enabled via localStorage

### 2. **Manual Activation**
- **Button**: Click "Debug Console" button in the header
- **Keyboard**: Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
- **URL Parameter**: Add `?debug=true` to the URL
- **Console Command**: Run `window.erudaDebugger.toggle()`

### 3. **Permanent Activation**
```javascript
// Enable permanently
window.erudaDebugger.enable();

// Disable permanently
window.erudaDebugger.disable();
```

## Usage Examples

### 🔍 **Basic Debugging**
```javascript
// Open Eruda console
window.erudaDebugger.toggle();

// Check if Eruda is available
console.log('Eruda available:', !!window.eruda);

// View environment information
window.erudaDebugger.logEnvironmentInfo();
```

### 🧪 **Testing Async/Await**
```javascript
// Test basic async/await functionality
async function testAsync() {
    try {
        const result = await Promise.resolve('Test successful');
        console.log('✅ Async/await works:', result);
    } catch (error) {
        console.error('❌ Async/await failed:', error);
    }
}

testAsync();
```

### 🔗 **Testing VK Bridge**
```javascript
// Test VK Bridge availability
console.log('VK Bridge:', !!window.vkBridge);

// Test VK Bridge methods
if (window.vkBridge) {
    window.vkBridge.send('VKWebAppGetUserInfo')
        .then(result => console.log('VK Bridge test:', result))
        .catch(error => console.error('VK Bridge error:', error));
}
```

### 📊 **Performance Monitoring**
```javascript
// Check memory usage
if (performance.memory) {
    console.log('Memory:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
    });
}

// Check page load time
const timing = performance.timing;
if (timing) {
    console.log('Load time:', timing.loadEventEnd - timing.navigationStart + 'ms');
}
```

## Debug Utilities

### 🛠️ **Global Debug Functions**
```javascript
// Basic logging
debug.log('Info message');
debug.error('Error message');
debug.warn('Warning message');
debug.info('Information message');

// Specialized logging
debug.vk('getUserInfo', { userId: 123 });
debug.payment('purchase', { productId: 'premium' });
debug.user('login', { method: 'vk' });
debug.quiz('start', { type: 'mbti' });

// Performance logging
debug.perf('API call', 150.5);

// Async operation logging
debug.async('fetchUserData', fetch('/api/user'));
```

### 🔄 **Function Wrapping**
```javascript
// Wrap a function for debugging
const debugFunction = debug.wrap('myFunction', async (param) => {
    // Your function logic here
    return result;
});

// Use the wrapped function
const result = await debugFunction('test');
```

## Configuration

### ⚙️ **URL Parameters**
- `?debug=true` - Enable debug mode
- `?logLevel=debug` - Set log level (error, warn, info, debug)

### 💾 **LocalStorage Settings**
```javascript
// Enable debug mode
localStorage.setItem('debug_enabled', 'true');

// Set log level
localStorage.setItem('debug_log_level', 'debug');

// Enable Eruda
localStorage.setItem('eruda_debug_enabled', 'true');
```

## Troubleshooting

### 🚫 **Eruda Not Loading**
1. Check if the CDN is accessible
2. Verify JavaScript is enabled
3. Check for console errors
4. Try manual loading: `window.erudaDebugger.loadEruda()`

### 🔧 **Async/Await Issues**
1. Use the "Test Async/Await" snippet in Eruda
2. Check browser compatibility
3. Verify polyfills are loaded
4. Test with simple Promise operations

### 📱 **Android WebView Issues**
1. Check WebView version
2. Verify JavaScript is enabled
3. Test with different Android versions
4. Use Eruda's environment info tool

## Best Practices

### 📝 **Logging**
- Use appropriate log levels
- Include relevant context
- Avoid logging sensitive data
- Use structured logging for complex objects

### 🔍 **Debugging Workflow**
1. Enable Eruda console
2. Reproduce the issue
3. Check console for errors
4. Use network tab for API issues
5. Use elements tab for DOM issues
6. Use snippets for custom testing

### 🎯 **Performance**
- Monitor memory usage
- Check network requests
- Profile slow operations
- Use performance timing

## Advanced Features

### 🎨 **Custom Styling**
Eruda can be customized with CSS:
```css
.eruda-container {
    font-family: 'Your Font', sans-serif;
}
.eruda-tab {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 🔌 **Custom Plugins**
Add custom debugging tools:
```javascript
const customTool = eruda.get('snippets');
customTool.add('Custom Test', () => {
    // Your custom debugging code
    console.log('Custom test executed');
});
```

### 📊 **Integration with VK Bridge**
```javascript
// Monitor VK Bridge calls
const originalSend = window.vkBridge.send;
window.vkBridge.send = function(method, params) {
    debug.vk(method, params);
    return originalSend.call(this, method, params);
};
```

## Security Considerations

### 🛡️ **Production Use**
- Eruda is automatically disabled in production
- Debug information should not contain sensitive data
- Consider removing debug code for production builds

### 🔒 **Data Protection**
- Avoid logging user credentials
- Be careful with localStorage debugging
- Don't expose internal API endpoints

## Support

### 📚 **Resources**
- [Eruda Documentation](https://github.com/liriliri/eruda)
- [VK Bridge Documentation](https://vk.com/dev/bridge_docs)
- [Android WebView Documentation](https://developer.android.com/guide/webapps/webview)

### 🐛 **Common Issues**
- **Eruda not showing**: Check if it's enabled and not blocked by ad blockers
- **Async/await not working**: Verify browser compatibility and polyfills
- **VK Bridge errors**: Check if running in VK environment
- **Performance issues**: Monitor memory usage and network requests

## Quick Reference

### 🚀 **Quick Start**
1. Add `?debug=true` to URL
2. Click "Debug Console" button
3. Use console tab for logs
4. Use snippets for custom tests

### ⌨️ **Keyboard Shortcuts**
- `Ctrl+Shift+D` - Toggle Eruda
- `Ctrl+Shift+I` - Open browser dev tools (if available)

### 🔧 **Common Commands**
```javascript
// Toggle Eruda
window.erudaDebugger.toggle();

// Enable debug mode
debug.enable();

// Test async/await
debug.async('test', Promise.resolve('success'));

// Get debug info
debug.info();
``` 