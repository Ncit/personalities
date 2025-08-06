/**
 * Debug Utilities
 * Helper functions for debugging throughout the application
 */

class DebugUtils {
    constructor() {
        this.isEnabled = this.shouldEnableDebug();
        this.logLevel = this.getLogLevel();
        this.prefix = '[MBTI Debug]';
    }

    /**
     * Determine if debug mode should be enabled
     */
    shouldEnableDebug() {
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('ngrok') ||
            window.location.search.includes('debug=true') ||
            localStorage.getItem('debug_enabled') === 'true'
        );
    }

    /**
     * Get log level from URL params or localStorage
     */
    getLogLevel() {
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('logLevel') || localStorage.getItem('debug_log_level') || 'info';
        return ['error', 'warn', 'info', 'debug'].includes(level) ? level : 'info';
    }

    /**
     * Log with level checking
     */
    log(level, message, ...args) {
        if (!this.isEnabled) return;

        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        if (levels[level] <= levels[this.logLevel]) {
            const timestamp = new Date().toISOString();
            const logMessage = `${this.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            switch (level) {
                case 'error':
                    console.error(logMessage, ...args);
                    break;
                case 'warn':
                    console.warn(logMessage, ...args);
                    break;
                case 'info':
                    console.info(logMessage, ...args);
                    break;
                case 'debug':
                    console.debug(logMessage, ...args);
                    break;
            }
        }
    }

    /**
     * Log error
     */
    error(message, ...args) {
        this.log('error', message, ...args);
    }

    /**
     * Log warning
     */
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    /**
     * Log info
     */
    info(message, ...args) {
        this.log('info', message, ...args);
    }

    /**
     * Log debug
     */
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    /**
     * Log async operation
     */
    logAsync(operation, promise) {
        const startTime = performance.now();
        this.info(`Starting async operation: ${operation}`);
        
        return promise
            .then(result => {
                const duration = performance.now() - startTime;
                this.info(`✅ Async operation completed: ${operation} (${duration.toFixed(2)}ms)`, result);
                return result;
            })
            .catch(error => {
                const duration = performance.now() - startTime;
                this.error(`❌ Async operation failed: ${operation} (${duration.toFixed(2)}ms)`, error);
                throw error;
            });
    }

    /**
     * Log VK Bridge operations
     */
    logVKBridge(method, params = {}) {
        this.info(`VK Bridge: ${method}`, params);
    }

    /**
     * Log payment operations
     */
    logPayment(operation, data = {}) {
        this.info(`Payment: ${operation}`, data);
    }

    /**
     * Log user operations
     */
    logUser(operation, data = {}) {
        this.info(`User: ${operation}`, data);
    }

    /**
     * Log quiz operations
     */
    logQuiz(operation, data = {}) {
        this.info(`Quiz: ${operation}`, data);
    }

    /**
     * Log performance metrics
     */
    logPerformance(operation, duration) {
        this.info(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
    }

    /**
     * Create a debug wrapper for functions
     */
    wrapFunction(name, fn) {
        return (...args) => {
            const startTime = performance.now();
            this.debug(`Calling function: ${name}`, args);
            
            return Promise.resolve(fn(...args))
                .then(result => {
                    const duration = performance.now() - startTime;
                    this.debug(`✅ Function completed: ${name} (${duration.toFixed(2)}ms)`, result);
                    return result;
                })
                .catch(error => {
                    const duration = performance.now() - startTime;
                    this.error(`❌ Function failed: ${name} (${duration.toFixed(2)}ms)`, error);
                    throw error;
                });
        };
    }

    /**
     * Enable debug mode
     */
    enable() {
        this.isEnabled = true;
        localStorage.setItem('debug_enabled', 'true');
        this.info('Debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disable() {
        this.isEnabled = false;
        localStorage.removeItem('debug_enabled');
        this.info('Debug mode disabled');
    }

    /**
     * Set log level
     */
    setLogLevel(level) {
        this.logLevel = level;
        localStorage.setItem('debug_log_level', level);
        this.info(`Log level set to: ${level}`);
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            enabled: this.isEnabled,
            logLevel: this.logLevel,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Export debug info to console
     */
    exportDebugInfo() {
        console.group('🐛 Debug Information');
        const info = this.getDebugInfo();
        Object.entries(info).forEach(([key, value]) => {
            console.log(`${key}:`, value);
        });
        console.groupEnd();
    }

    /**
     * Test Eruda functionality
     */
    testEruda() {
        console.log('🧪 Testing Eruda functionality...');
        
        // Test if Eruda is available
        const erudaAvailable = typeof eruda !== 'undefined';
        console.log('Eruda available:', erudaAvailable);
        
        if (erudaAvailable) {
            // Test if Eruda is initialized
            const erudaInitialized = eruda.get && eruda.get().container;
            console.log('Eruda initialized:', erudaInitialized);
            
            // Test if Eruda is visible
            const erudaVisible = eruda.get && eruda.get().container && 
                                eruda.get().container.style.display !== 'none';
            console.log('Eruda visible:', erudaVisible);
            
            // Test Eruda methods
            try {
                const methods = Object.keys(eruda);
                console.log('Eruda methods:', methods);
                
                // Test show/hide
                if (eruda.show && eruda.hide) {
                    console.log('✅ Eruda show/hide methods available');
                }
                
                // Test plugins
                if (eruda.get) {
                    const plugins = ['console', 'elements', 'network', 'resources', 'info', 'snippets'];
                    plugins.forEach(plugin => {
                        try {
                            const pluginInstance = eruda.get(plugin);
                            console.log(`✅ Plugin ${plugin}:`, !!pluginInstance);
                        } catch (e) {
                            console.log(`❌ Plugin ${plugin}:`, false);
                        }
                    });
                }
                
            } catch (error) {
                console.error('❌ Error testing Eruda methods:', error);
            }
        } else {
            console.error('❌ Eruda not available');
        }
        
        return {
            available: erudaAvailable,
            initialized: erudaAvailable && eruda.get && eruda.get().container,
            visible: erudaAvailable && eruda.get && eruda.get().container && 
                    eruda.get().container.style.display !== 'none'
        };
    }
}

// Create global instance
const debugUtils = new DebugUtils();

// Expose globally
window.debugUtils = debugUtils;

// Add to window for easy access
window.debug = {
    log: (...args) => debugUtils.log('info', ...args),
    error: (...args) => debugUtils.error(...args),
    warn: (...args) => debugUtils.warn(...args),
    info: (...args) => debugUtils.info(...args),
    debug: (...args) => debugUtils.debug(...args),
    async: (...args) => debugUtils.logAsync(...args),
    vk: (...args) => debugUtils.logVKBridge(...args),
    payment: (...args) => debugUtils.logPayment(...args),
    user: (...args) => debugUtils.logUser(...args),
    quiz: (...args) => debugUtils.logQuiz(...args),
    perf: (...args) => debugUtils.logPerformance(...args),
    wrap: (...args) => debugUtils.wrapFunction(...args),
    enable: () => debugUtils.enable(),
    disable: () => debugUtils.disable(),
    setLevel: (level) => debugUtils.setLogLevel(level),
    info: () => debugUtils.exportDebugInfo(),
    testEruda: () => debugUtils.testEruda()
};

export default debugUtils; 