/**
 * Logger Manager
 * Centralized logging system with development-only console output
 */

export class LoggerManager {
    constructor() {
        this.isDevelopment = this.detectDevelopmentMode();
        this.logLevel = this.isDevelopment ? 'debug' : 'error';
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs in memory
    }

    /**
     * Detect if we're in development mode
     */
    detectDevelopmentMode() {
        // Check for development indicators
        const isDev = 
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '3000' ||
            window.location.search.includes('dev=true') ||
            localStorage.getItem('appState') === 'development';
        
        return isDev;
    }

    /**
     * Add log entry to memory
     */
    addLog(level, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            stack: level === 'error' ? new Error().stack : null
        };

        this.logs.push(logEntry);

        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Call console only in development (but not for errors to avoid recursion)
        if (this.isDevelopment && level !== 'error') {
            this.writeToConsole(level, message, data);
        }

        // For errors, we don't call writeToConsole to avoid recursion
        // Errors are already handled by the console.error override
    }

    /**
     * Write to console (development only)
     */
    writeToConsole(level, message, data) {
        // Safety check to prevent circular references
        if (this.isWritingToConsole) {
            return;
        }

        this.isWritingToConsole = true;
        
        try {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            // Use original console methods to avoid recursion
            if (this.originalConsole) {
                switch (level) {
                    case 'error':
                        this.originalConsole.error(prefix, message, data || '');
                        break;
                    case 'warn':
                        this.originalConsole.warn(prefix, message, data || '');
                        break;
                    case 'info':
                        this.originalConsole.info(prefix, message, data || '');
                        break;
                    case 'debug':
                        this.originalConsole.debug(prefix, message, data || '');
                        break;
                    default:
                        this.originalConsole.log(prefix, message, data || '');
                }
            }
        } finally {
            this.isWritingToConsole = false;
        }
    }

    /**
     * Log levels
     */
    error(message, data = null) {
        this.addLog('error', message, data);
    }

    warn(message, data = null) {
        this.addLog('warn', message, data);
    }

    info(message, data = null) {
        this.addLog('info', message, data);
    }

    debug(message, data = null) {
        this.addLog('debug', message, data);
    }

    log(message, data = null) {
        this.addLog('info', message, data);
    }

    /**
     * VK Bridge specific logging
     */
    vkInit(message, data = null) {
        this.addLog('info', `🔧 VK: ${message}`, data);
    }

    vkSuccess(message, data = null) {
        this.addLog('info', `✅ VK: ${message}`, data);
    }

    vkError(message, data = null) {
        this.addLog('error', `❌ VK: ${message}`, data);
    }

    vkInfo(message, data = null) {
        this.addLog('info', `ℹ️ VK: ${message}`, data);
    }

    /**
     * App specific logging
     */
    appInit(message, data = null) {
        this.addLog('info', `🚀 APP: ${message}`, data);
    }

    appSuccess(message, data = null) {
        this.addLog('info', `✅ APP: ${message}`, data);
    }

    appError(message, data = null) {
        this.addLog('error', `❌ APP: ${message}`, data);
    }

    appDebug(message, data = null) {
        this.addLog('debug', `🔍 APP: ${message}`, data);
    }

    /**
     * Quiz specific logging
     */
    quizInfo(message, data = null) {
        this.addLog('info', `📝 QUIZ: ${message}`, data);
    }

    quizDebug(message, data = null) {
        this.addLog('debug', `🔍 QUIZ: ${message}`, data);
    }

    quizError(message, data = null) {
        this.addLog('error', `❌ QUIZ: ${message}`, data);
    }

    /**
     * UI specific logging
     */
    uiInfo(message, data = null) {
        this.addLog('info', `🎨 UI: ${message}`, data);
    }

    uiDebug(message, data = null) {
        this.addLog('debug', `🔍 UI: ${message}`, data);
    }

    uiError(message, data = null) {
        this.addLog('error', `❌ UI: ${message}`, data);
    }

    /**
     * Analytics specific logging
     */
    analyticsInfo(message, data = null) {
        this.addLog('info', `📊 ANALYTICS: ${message}`, data);
    }

    analyticsDebug(message, data = null) {
        this.addLog('debug', `🔍 ANALYTICS: ${message}`, data);
    }

    analyticsError(message, data = null) {
        this.addLog('error', `❌ ANALYTICS: ${message}`, data);
    }

    /**
     * Get all logs
     */
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return this.logs;
    }

    /**
     * Get recent logs
     */
    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Set log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }

    /**
     * Get current log level
     */
    getLogLevel() {
        return this.logLevel;
    }

    /**
     * Check if development mode
     */
    isDevMode() {
        return this.isDevelopment;
    }

    /**
     * Override console methods
     */
    overrideConsole() {
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };

        // Override console methods
        console.log = (...args) => {
            this.addLogDirectly('info', args.join(' '));
            if (this.isDevelopment) {
                originalConsole.log.apply(console, args);
            }
        };

        console.error = (...args) => {
            this.addLogDirectly('error', args.join(' '));
            originalConsole.error.apply(console, args); // Always show errors
        };

        console.warn = (...args) => {
            this.addLogDirectly('warn', args.join(' '));
            if (this.isDevelopment) {
                originalConsole.warn.apply(console, args);
            }
        };

        console.info = (...args) => {
            this.addLogDirectly('info', args.join(' '));
            if (this.isDevelopment) {
                originalConsole.info.apply(console, args);
            }
        };

        console.debug = (...args) => {
            this.addLogDirectly('debug', args.join(' '));
            if (this.isDevelopment) {
                originalConsole.debug.apply(console, args);
            }
        };

        // Store original console for potential restoration
        this.originalConsole = originalConsole;
    }

    /**
     * Add log entry directly without calling console methods
     */
    addLogDirectly(level, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            stack: level === 'error' ? new Error().stack : null
        };

        this.logs.push(logEntry);

        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Call console only in development (but not for errors to avoid recursion)
        if (this.isDevelopment && level !== 'error') {
            this.writeToConsole(level, message, data);
        }
    }

    /**
     * Restore original console methods
     */
    restoreConsole() {
        if (this.originalConsole) {
            console.log = this.originalConsole.log;
            console.error = this.originalConsole.error;
            console.warn = this.originalConsole.warn;
            console.info = this.originalConsole.info;
            console.debug = this.originalConsole.debug;
        }
    }
}

// Create singleton instance
export const loggerManager = new LoggerManager();

// Override console methods
loggerManager.overrideConsole();

// Export for global access
if (typeof window !== 'undefined') {
    window.loggerManager = loggerManager;
} 