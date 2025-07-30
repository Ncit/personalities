// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
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
  } catch (error) {
  logger.warn('Firebase Analytics initialization failed:', error);
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
        } catch (error) {
        logger.warn('Failed to log analytics event:', error);
      }
    }
  },

  // Set user ID for analytics
  setUserId: (userId) => {
    if (analytics) {
      try {
        setUserId(analytics, userId);
        } catch (error) {
        logger.warn('Failed to set analytics user ID:', error);
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
    const parameters = {};
    if (quizType) parameters.quiz_type = quizType;
    if (questionNumber) parameters.question_number = questionNumber;
    
    this.logEvent(`quiz_${action}`, parameters);
  },

  // Log error events
  logError: (error, context = {}) => {
    this.logEvent('app_error', {
      error_message: error.message || error.toString(),
      error_stack: error.stack,
      ...context
    });
  },

  // Log page views
  logPageView: (pageName) => {
    this.logEvent('page_view', { page_name: pageName });
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