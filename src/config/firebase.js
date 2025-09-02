// Firebase Configuration - Using CDN imports for consistency
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import { getPerformance } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-performance.js';
import { LoggerManager } from '../modules/core/LoggerManager.js';

// Initialize logger for this module
const logger = new LoggerManager().createModuleLogger('Firebase');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB773kQHk-jLJeSwYhCluXXk1r6CEOuR8A",
  authDomain: "nikitaproject-b0a52.firebaseapp.com",
  projectId: "nikitaproject-b0a52",
  storageBucket: "nikitaproject-b0a52.firebasestorage.app",
  messagingSenderId: "188919966813",
  appId: "1:188919966813:web:748cc6a6354d672173f1b4",
  measurementId: "G-TZ5LN0BB9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analytics = null;
try {
  analytics = getAnalytics(app);
  logger.info('Firebase Analytics initialized successfully');
  } catch (error) {
  logger.warn('Firebase Analytics initialization failed:', error);
  // Try to log error to console as fallback
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('Firebase Analytics failed to initialize:', error.message);
  }
}

// Initialize Performance Monitoring
let performance = null;
try {
  performance = getPerformance(app);
  } catch (error) {
  logger.warn('Firebase Performance initialization failed:', error);
}

// Analytics helper functions
export const firebaseAnalytics = {
  // Log custom events
  logEvent: (eventName, parameters = {}) => {
    if (analytics) {
      try {
        logEvent(analytics, eventName, parameters);
        logger.debug(`Firebase event logged: ${eventName}`);
        } catch (error) {
        logger.warn('Failed to log analytics event:', error);
        // Fallback: log to console
        if (typeof console !== 'undefined' && console.log) {
          console.log(`Analytics Event: ${eventName}`, parameters);
        }
      }
    } else {
      // Fallback when Firebase is not available
      if (typeof console !== 'undefined' && console.log) {
        console.log(`Analytics Event (Firebase unavailable): ${eventName}`, parameters);
      }
    }
  },

  // Set user ID for analytics
  setUserId: (userId) => {
    if (analytics) {
      try {
        setUserId(analytics, userId);
        logger.debug(`Firebase user ID set: ${userId}`);
        } catch (error) {
        logger.warn('Failed to set analytics user ID:', error);
        // Fallback: log to console
        if (typeof console !== 'undefined' && console.log) {
          console.log(`User ID set (Firebase unavailable): ${userId}`);
        }
      }
    } else {
      // Fallback when Firebase is not available
      if (typeof console !== 'undefined' && console.log) {
        console.log(`User ID set (Firebase unavailable): ${userId}`);
      }
    }
  },

  // Set user properties
  setUserProperties: (properties) => {
    if (analytics) {
      try {
        // Check if setUserProperties is available
        if (typeof setUserProperties === 'function') {
          setUserProperties(analytics, properties);
          } else {
          // Fallback: log user properties as custom events
          Object.entries(properties).forEach(([key, value]) => {
            this.logEvent('user_property_set', {
              property_name: key,
              property_value: value
            });
          });
          }
      } catch (error) {
        logger.warn('Failed to set analytics user properties:', error);
        // Fallback: log user properties as custom events
        Object.entries(properties).forEach(([key, value]) => {
          this.logEvent('user_property_set', {
            property_name: key,
            property_value: value
          });
        });
      }
    }
  },

  // Log quiz events
  logQuizEvent: (action, quizType = null, questionNumber = null) => {
    try {
      const parameters = {};
      if (quizType) parameters.quiz_type = quizType;
      if (questionNumber) parameters.question_number = questionNumber;

      this.logEvent(`quiz_${action}`, parameters);
      logger.debug(`Quiz event logged: ${action}`, parameters);
    } catch (error) {
      logger.warn('Failed to log quiz event:', error);
      // Fallback to console
      if (typeof console !== 'undefined' && console.log) {
        console.log(`Quiz Event: ${action}`, { quizType, questionNumber });
      }
    }
  },

  // Log error events
  logError: (error, context = {}) => {
    try {
      this.logEvent('app_error', {
        error_message: error.message || error.toString(),
        error_stack: error.stack,
        ...context
      });
      logger.debug('Error event logged to Firebase');
    } catch (err) {
      logger.warn('Failed to log error event:', err);
      // Fallback to console
      if (typeof console !== 'undefined' && console.error) {
        console.error('App Error:', error, context);
      }
    }
  },

  // Log page views
  logPageView: (pageName) => {
    try {
      this.logEvent('page_view', { page_name: pageName });
      logger.debug(`Page view logged: ${pageName}`);
    } catch (error) {
      logger.warn('Failed to log page view:', error);
      // Fallback to console
      if (typeof console !== 'undefined' && console.log) {
        console.log(`Page View: ${pageName}`);
      }
    }
  }
};

// Performance monitoring helper
export const firebasePerformance = {
  // Get performance instance
  getInstance: () => performance,
  
  // Log custom performance events
  logCustomEvent: (eventName, parameters = {}) => {
    if (performance) {
      try {
        // Note: Custom performance events require additional setup
        } catch (error) {
        logger.warn('Failed to log performance event:', error);
      }
    }
  }
};

// Offline analytics fallback
const offlineAnalyticsQueue = [];
let offlineMode = false;

if (!analytics) {
  offlineMode = true;
  logger.warn('Firebase Analytics unavailable, switching to offline mode');

  // Override analytics functions to store events locally
  Object.keys(firebaseAnalytics).forEach(key => {
    if (typeof firebaseAnalytics[key] === 'function') {
      const originalFn = firebaseAnalytics[key];
      firebaseAnalytics[key] = function(...args) {
        // Store event locally for later sync
        offlineAnalyticsQueue.push({
          function: key,
          args: args,
          timestamp: Date.now()
        });

        // Keep only last 50 offline events
        if (offlineAnalyticsQueue.length > 50) {
          offlineAnalyticsQueue.shift();
        }

        // Try original function (will fallback to console)
        return originalFn.apply(this, args);
      };
    }
  });
}

// Function to sync offline events when Firebase becomes available
export const syncOfflineAnalytics = () => {
  if (!offlineMode && offlineAnalyticsQueue.length > 0) {
    logger.info(`Syncing ${offlineAnalyticsQueue.length} offline analytics events`);

    offlineAnalyticsQueue.forEach(event => {
      try {
        firebaseAnalytics[event.function].apply(firebaseAnalytics, event.args);
      } catch (error) {
        logger.warn('Failed to sync offline event:', error);
      }
    });

    offlineAnalyticsQueue.length = 0;
    offlineMode = false;
  }
};

// Export Firebase app instance
export { app, analytics, performance };

// Global error handler for Crashlytics (web doesn't have native Crashlytics)
export const initializeCrashlytics = () => {
  // Set up global error handler to log to Analytics
  window.addEventListener('error', (event) => {
    firebaseAnalytics.logError(event.error, {
      error_type: 'javascript_error',
      error_filename: event.filename,
      error_lineno: event.lineno,
      error_colno: event.colno
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    firebaseAnalytics.logError(event.reason, {
      error_type: 'unhandled_promise_rejection'
    });
  });

  }; 