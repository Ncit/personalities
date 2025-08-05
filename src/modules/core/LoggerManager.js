/**
 * Logger Manager
 * Provides configurable logging with individual enable/disable options for each log level
 * Supports console.log, console.warn, console.error, and custom log levels
 */

export class LoggerManager {
    constructor(config = {}) {
        // Detect development mode
        const isDevelopment = this.isDevelopmentMode();
        
        // Default configuration
        this.config = {
            enabled: true,
            levels: {
                log: isDevelopment,
                warn: isDevelopment,
                error: true, // Always enabled
                debug: isDevelopment,
                info: isDevelopment,
                trace: false
            },
            prefix: '🔥',
            timestamp: false,
            ...config
        };

        // Bind methods to preserve context
        this.log = this.log.bind(this);
        this.warn = this.warn.bind(this);
        this.error = this.error.bind(this);
        this.debug = this.debug.bind(this);
        this.info = this.info.bind(this);
        this.trace = this.trace.bind(this);
    }

    /**
     * Detect if we're in development mode
     */
    isDevelopmentMode() {
        // Check for development indicators
        return (
            // window.location.hostname === 'localhost' ||
            // window.location.hostname === '127.0.0.1' ||
            // window.location.hostname.includes('dev') ||
            // window.location.hostname.includes('staging') ||
            // window.location.search.includes('debug=true') ||
            // window.location.search.includes('dev=true') ||
            window.firebaseAnalyticsDebug === true 
            // ||
            // window.localStorage.getItem('debug_mode') === 'true'
        );
    }

    /**
     * Enable or disable all logging
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.log('Logger enabled:', enabled);
    }

    /**
     * Enable or disable specific log level
     */
    setLevelEnabled(level, enabled) {
        if (this.config.levels.hasOwnProperty(level)) {
            // Prevent disabling error level in development mode
            if (level === 'error' && this.isDevelopmentMode()) {
                this.warn(`Cannot disable 'error' level in development mode`);
                return;
            }
            
            this.config.levels[level] = enabled;
            this.log(`Log level '${level}' ${enabled ? 'enabled' : 'disabled'}`);
        } else {
            this.warn(`Unknown log level: ${level}`);
        }
    }

    /**
     * Enable or disable multiple log levels at once
     */
    setLevels(levels) {
        Object.entries(levels).forEach(([level, enabled]) => {
            // Prevent disabling error level in development mode
            if (level === 'error' && this.isDevelopmentMode() && !enabled) {
                this.warn(`Cannot disable 'error' level in development mode`);
                return;
            }
            this.setLevelEnabled(level, enabled);
        });
    }

    /**
     * Set custom prefix for log messages
     */
    setPrefix(prefix) {
        this.config.prefix = prefix;
    }

    /**
     * Enable or disable timestamps
     */
    setTimestamp(enabled) {
        this.config.timestamp = enabled;
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Check if a specific log level is enabled
     */
    isLevelEnabled(level) {
        return this.config.enabled && this.config.levels[level] === true;
    }

    /**
     * Format message with prefix and timestamp
     */
    formatMessage(level, ...args) {
        const parts = [];

        // Add prefix if configured
        if (this.config.prefix) {
            parts.push(this.config.prefix);
        }

        // Add timestamp if enabled
        if (this.config.timestamp) {
            parts.push(`[${new Date().toISOString()}]`);
        }

        // Add level indicator for non-standard levels
        if (!['log', 'warn', 'error'].includes(level)) {
            parts.push(`[${level.toUpperCase()}]`);
        }

        return parts.length > 0 ? [...parts, ...args] : args;
    }

    /**
     * Log message if logging is enabled
     */
    log(...args) {
        if (this.isLevelEnabled('log')) {
            console.log(...this.formatMessage('log', ...args));
        }
    }

    /**
     * Warn message if warning is enabled
     */
    warn(...args) {
        if (this.isLevelEnabled('warn')) {
            console.warn(...this.formatMessage('warn', ...args));
        }
    }

    /**
     * Error message if error logging is enabled
     */
    error(...args) {
        if (this.isLevelEnabled('error')) {
            console.error(...this.formatMessage('error', ...args));
        }
    }

    /**
     * Debug message if debug logging is enabled
     */
    debug(...args) {
        if (this.isLevelEnabled('debug')) {
            console.log(...this.formatMessage('debug', ...args));
        }
    }

    /**
     * Info message if info logging is enabled
     */
    info(...args) {
        if (this.isLevelEnabled('info')) {
            console.log(...this.formatMessage('info', ...args));
        }
    }

    /**
     * Trace message if trace logging is enabled
     */
    trace(...args) {
        if (this.isLevelEnabled('trace')) {
            console.trace(...this.formatMessage('trace', ...args));
        }
    }

    /**
     * Group messages if console.group is available
     */
    group(label, callback) {
        if (this.config.enabled && console.group) {
            console.group(label);
            try {
                callback();
            } finally {
                console.groupEnd();
            }
        } else {
            callback();
        }
    }

    /**
     * Group collapsed messages if console.groupCollapsed is available
     */
    groupCollapsed(label, callback) {
        if (this.config.enabled && console.groupCollapsed) {
            console.groupCollapsed(label);
            try {
                callback();
            } finally {
                console.groupEnd();
            }
        } else {
            callback();
        }
    }

    /**
     * Table output if console.table is available
     */
    table(data, columns) {
        if (this.config.enabled && console.table) {
            console.table(data, columns);
        } else {
            this.log('Table data:', data);
        }
    }

    /**
     * Time measurement if console.time is available
     */
    time(label) {
        if (this.config.enabled && console.time) {
            console.time(label);
        }
    }

    /**
     * End time measurement if console.timeEnd is available
     */
    timeEnd(label) {
        if (this.config.enabled && console.timeEnd) {
            console.timeEnd(label);
        }
    }

    /**
     * Clear console if console.clear is available
     */
    clear() {
        if (this.config.enabled && console.clear) {
            console.clear();
        }
    }

    /**
     * Create a child logger with inherited configuration
     */
    createChild(config = {}) {
        return new LoggerManager({
            ...this.config,
            ...config
        });
    }

    /**
     * Create a logger for a specific module
     */
    createModuleLogger(moduleName, config = {}) {
        const moduleConfig = {
            ...config,
            prefix: `${this.config.prefix} [${moduleName}]`
        };
        return new LoggerManager(moduleConfig);
    }

    /**
     * Enable Firebase Analytics debug mode
     */
    enableFirebaseDebug() {
        this.setLevels({
            log: true,
            warn: true,
            error: true, // Always enabled
            debug: true,
            info: true,
            trace: false
        });
        this.setPrefix('🔥');
        this.setTimestamp(false);
        this.log('Firebase Analytics debug mode enabled');
    }

    /**
     * Disable all logging except errors
     */
    enableProductionMode() {
        this.setLevels({
            log: false,
            warn: false,
            error: true, // Always enabled
            debug: false,
            info: false,
            trace: false
        });
        this.setPrefix('');
        this.setTimestamp(false);
        this.log('Production mode enabled - only errors will be logged');
    }

    /**
     * Enable verbose logging for development
     */
    enableVerboseMode() {
        this.setLevels({
            log: true,
            warn: true,
            error: true, // Always enabled
            debug: true,
            info: true,
            trace: true
        });
        this.setPrefix('🔥');
        this.setTimestamp(true);
        this.log('Verbose logging enabled for development');
    }

    /**
     * Force enable all levels (for debugging)
     */
    forceEnableAll() {
        this.setLevels({
            log: true,
            warn: true,
            error: true,
            debug: true,
            info: true,
            trace: true
        });
        this.log('All log levels force enabled');
    }

    /**
     * Reset to default configuration based on environment
     */
    resetToDefault() {
        const isDevelopment = this.isDevelopmentMode();
        this.setLevels({
            log: isDevelopment,
            warn: isDevelopment,
            error: true, // Always enabled
            debug: isDevelopment,
            info: isDevelopment,
            trace: false
        });
        this.setPrefix('🔥');
        this.setTimestamp(false);
        this.log(`Reset to default configuration (development: ${isDevelopment})`);
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    // Initialize with environment-aware configuration
    const initialConfig = {
        enabled: true,
        levels: {
            log: true, // Will be set based on environment
            warn: true, // Will be set based on environment
            error: true, // Always enabled
            debug: true, // Will be set based on environment
            info: true, // Will be set based on environment
            trace: false
        },
        prefix: '🔥',
        timestamp: false
    };

    window.logger = new LoggerManager(initialConfig);
    
    // Expose debug methods globally
    window.loggerDebug = {
        enableFirebaseDebug: () => window.logger.enableFirebaseDebug(),
        enableProductionMode: () => window.logger.enableProductionMode(),
        enableVerboseMode: () => window.logger.enableVerboseMode(),
        forceEnableAll: () => window.logger.forceEnableAll(),
        resetToDefault: () => window.logger.resetToDefault(),
        setLevelEnabled: (level, enabled) => window.logger.setLevelEnabled(level, enabled),
        getConfig: () => window.logger.getConfig(),
        isDevelopmentMode: () => window.logger.isDevelopmentMode()
    };
} 