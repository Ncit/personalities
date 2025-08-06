/**
 * Eruda Console Configuration
 * Mobile web debugging tool for Android WebView and mobile browsers
 */

class ErudaDebugger {
    constructor() {
        this.isInitialized = false;
        this.isEnabled = false;
        this.config = {
            // Enable Eruda in development or when debug flag is set
            autoInit: this.shouldAutoInit(),
            // Show Eruda button in production (can be toggled)
            showInProduction: false,
            // Custom plugins to load
            plugins: ['console', 'elements', 'network', 'resources', 'info', 'snippets'],
            // Custom settings
            settings: {
                theme: 'auto', // 'auto', 'light', 'dark'
                position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
                size: 'medium' // 'small', 'medium', 'large'
            }
        };
    }

    /**
     * Determine if Eruda should auto-initialize
     */
    shouldAutoInit() {
        // Enable in development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('ngrok')) {
            return true;
        }
        
        // Enable if debug flag is set in URL
        if (window.location.search.includes('debug=true')) {
            return true;
        }
        
        // Enable if debug flag is set in localStorage
        if (localStorage.getItem('eruda_debug_enabled') === 'true') {
            return true;
        }
        
        // Enable if user agent indicates it's a development environment
        if (navigator.userAgent.includes('Chrome DevTools') || 
            navigator.userAgent.includes('Firefox Developer Tools')) {
            return true;
        }
        
        return false;
    }

    /**
     * Initialize Eruda with custom configuration
     */
    init() {
        if (this.isInitialized) {
            console.warn('Eruda is already initialized');
            return;
        }

        try {
            // Check if Eruda is available
            if (typeof eruda === 'undefined') {
                console.warn('Eruda not loaded, attempting to load from CDN');
                this.loadEruda();
                return;
            }

            // Initialize Eruda
            eruda.init({
                autoScale: true,
                useShadowDom: true,
                defaults: {
                    displaySize: 50,
                    transparency: 0.9,
                    theme: this.config.settings.theme
                }
            });

            // Load plugins
            this.loadPlugins();

            // Customize appearance
            this.customizeAppearance();

            // Add custom tools
            this.addCustomTools();

            this.isInitialized = true;
            this.isEnabled = true;

            console.log('✅ Eruda debugger initialized successfully');
            
            // Log environment info
            this.logEnvironmentInfo();

        } catch (error) {
            console.error('❌ Failed to initialize Eruda:', error);
        }
    }

    /**
     * Load Eruda from CDN if not already loaded
     */
    loadEruda() {
        const script = document.createElement('script');
        script.src = '//cdn.jsdelivr.net/npm/eruda';
        script.onload = () => {
            console.log('Eruda loaded from CDN');
            this.init();
        };
        script.onerror = () => {
            console.error('Failed to load Eruda from CDN');
        };
        document.head.appendChild(script);
    }

    /**
     * Load Eruda plugins
     */
    loadPlugins() {
        if (!eruda) return;

        this.config.plugins.forEach(pluginName => {
            try {
                switch (pluginName) {
                    case 'console':
                        eruda.get('console').show();
                        break;
                    case 'elements':
                        eruda.get('elements').show();
                        break;
                    case 'network':
                        eruda.get('network').show();
                        break;
                    case 'resources':
                        eruda.get('resources').show();
                        break;
                    case 'info':
                        eruda.get('info').show();
                        break;
                    case 'snippets':
                        eruda.get('snippets').show();
                        break;
                }
            } catch (error) {
                console.warn(`Failed to load Eruda plugin: ${pluginName}`, error);
            }
        });
    }

    /**
     * Customize Eruda appearance
     */
    customizeAppearance() {
        if (!eruda) return;

        // Set position
        const container = eruda.get().container;
        if (container) {
            container.style.position = 'fixed';
            container.style.zIndex = '999999';
        }

        // Add custom CSS
        this.addCustomCSS();
    }

    /**
     * Add custom CSS for Eruda
     */
    addCustomCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .eruda-container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            .eruda-tab {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            }
            .eruda-tab.active {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Add custom debugging tools
     */
    addCustomTools() {
        if (!eruda) return;

        // Add VK Bridge debugging tool
        this.addVKBridgeTool();

        // Add Async/Await testing tool
        this.addAsyncAwaitTool();

        // Add Performance monitoring tool
        this.addPerformanceTool();
    }

    /**
     * Add VK Bridge debugging tool
     */
    addVKBridgeTool() {
        if (!eruda || !window.vkBridge) return;

        const vkTool = eruda.get('snippets');
        if (vkTool) {
            vkTool.add('VK Bridge Test', () => {
                console.log('Testing VK Bridge...');
                
                // Test VK Bridge availability
                console.log('VK Bridge available:', !!window.vkBridge);
                
                // Test VK Bridge methods
                if (window.vkBridge) {
                    console.log('VK Bridge methods:', Object.keys(window.vkBridge));
                    
                    // Test send method
                    window.vkBridge.send('VKWebAppGetUserInfo')
                        .then(result => {
                            console.log('VK Bridge test result:', result);
                        })
                        .catch(error => {
                            console.error('VK Bridge test error:', error);
                        });
                }
            });
        }
    }

    /**
     * Add Async/Await testing tool
     */
    addAsyncAwaitTool() {
        if (!eruda) return;

        const asyncTool = eruda.get('snippets');
        if (asyncTool) {
            asyncTool.add('Test Async/Await', async () => {
                console.log('Testing async/await functionality...');
                
                try {
                    // Test basic async/await
                    const result = await Promise.resolve('Async/Await works!');
                    console.log('✅ Basic async/await:', result);
                    
                    // Test with delay
                    const delayedResult = await new Promise(resolve => {
                        setTimeout(() => resolve('Delayed async/await works!'), 1000);
                    });
                    console.log('✅ Delayed async/await:', delayedResult);
                    
                    // Test error handling
                    try {
                        await Promise.reject(new Error('Test error'));
                    } catch (error) {
                        console.log('✅ Error handling works:', error.message);
                    }
                    
                } catch (error) {
                    console.error('❌ Async/await test failed:', error);
                }
            });
        }
    }

    /**
     * Add Performance monitoring tool
     */
    addPerformanceTool() {
        if (!eruda) return;

        const perfTool = eruda.get('snippets');
        if (perfTool) {
            perfTool.add('Performance Monitor', () => {
                console.log('=== Performance Information ===');
                
                // Memory usage
                if (performance.memory) {
                    console.log('Memory Usage:', {
                        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
                    });
                }
                
                // Navigation timing
                const timing = performance.timing;
                if (timing) {
                    console.log('Page Load Time:', timing.loadEventEnd - timing.navigationStart + 'ms');
                    console.log('DOM Ready Time:', timing.domContentLoadedEventEnd - timing.navigationStart + 'ms');
                }
                
                // User agent
                console.log('User Agent:', navigator.userAgent);
                
                // Screen info
                console.log('Screen:', {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight
                });
            });
        }
    }

    /**
     * Log environment information
     */
    logEnvironmentInfo() {
        console.group('🌍 Environment Information');
        console.log('URL:', window.location.href);
        console.log('User Agent:', navigator.userAgent);
        console.log('Platform:', navigator.platform);
        console.log('Language:', navigator.language);
        console.log('Cookie Enabled:', navigator.cookieEnabled);
        console.log('Online:', navigator.onLine);
        console.log('Screen:', `${screen.width}x${screen.height}`);
        console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
        console.log('Local Storage:', typeof localStorage !== 'undefined' ? 'Available' : 'Not Available');
        console.log('Session Storage:', typeof sessionStorage !== 'undefined' ? 'Available' : 'Not Available');
        console.log('IndexedDB:', typeof indexedDB !== 'undefined' ? 'Available' : 'Not Available');
        console.log('Service Worker:', 'serviceWorker' in navigator ? 'Available' : 'Not Available');
        console.log('WebSocket:', typeof WebSocket !== 'undefined' ? 'Available' : 'Not Available');
        console.log('Fetch:', typeof fetch !== 'undefined' ? 'Available' : 'Not Available');
        console.log('Promise:', typeof Promise !== 'undefined' ? 'Available' : 'Not Available');
        console.log('Async/Await:', (() => {
            try {
                // Test async/await without eval
                const testAsync = async () => {};
                return typeof testAsync === 'function' ? 'Available' : 'Not Available';
            } catch (e) {
                return 'Not Available';
            }
        })());
        console.groupEnd();
    }

    /**
     * Toggle Eruda visibility
     */
    toggle() {
        if (!eruda) {
            this.init();
            return;
        }

        if (this.isEnabled) {
            eruda.hide();
            this.isEnabled = false;
            console.log('Eruda hidden');
        } else {
            eruda.show();
            this.isEnabled = true;
            console.log('Eruda shown');
        }
    }

    /**
     * Enable Eruda permanently
     */
    enable() {
        localStorage.setItem('eruda_debug_enabled', 'true');
        if (!this.isInitialized) {
            this.init();
        } else {
            eruda.show();
            this.isEnabled = true;
        }
        console.log('Eruda enabled permanently');
    }

    /**
     * Disable Eruda permanently
     */
    disable() {
        localStorage.removeItem('eruda_debug_enabled');
        if (eruda) {
            eruda.hide();
            this.isEnabled = false;
        }
        console.log('Eruda disabled permanently');
    }

    /**
     * Destroy Eruda
     */
    destroy() {
        if (eruda) {
            eruda.destroy();
        }
        this.isInitialized = false;
        this.isEnabled = false;
        console.log('Eruda destroyed');
    }
}

// Create global instance
const erudaDebugger = new ErudaDebugger();

// Auto-initialize if configured
if (erudaDebugger.config.autoInit) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            erudaDebugger.init();
        });
    } else {
        erudaDebugger.init();
    }
}

// Expose globally for manual control
window.erudaDebugger = erudaDebugger;

// Add keyboard shortcut for toggling (Ctrl+Shift+D)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        erudaDebugger.toggle();
    }
});

export default erudaDebugger; 