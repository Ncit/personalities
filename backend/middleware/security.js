const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message || 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: message || 'Please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests from this IP'
);

// VK payment endpoint rate limiter (more strict)
const vkPaymentLimiter = createRateLimiter(
  60000, // 1 minute
  10, // 10 requests per minute
  'Too many payment requests'
);

// User endpoints rate limiter
const userLimiter = createRateLimiter(
  300000, // 5 minutes
  50, // 50 requests per 5 minutes
  'Too many user requests'
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'https://vk.com',
      'https://m.vk.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Request validation middleware
const validateVKPayment = [
  body('notification_type')
    .isIn(['get_item', 'order_status_change'])
    .withMessage('Invalid notification type'),
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('sig')
    .isString()
    .isLength({ min: 32 })
    .withMessage('Invalid signature'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

const validateUserData = [
  body('vk_user_id')
    .isInt({ min: 1 })
    .withMessage('Invalid VK user ID'),
  body('username')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Username must be between 1 and 255 characters'),
  body('first_name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('First name must be between 1 and 255 characters'),
  body('last_name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Last name must be between 1 and 255 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

const validateQuizResult = [
  body('vk_user_id')
    .isInt({ min: 1 })
    .withMessage('Invalid VK user ID'),
  body('quiz_type')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Quiz type must be between 1 and 100 characters'),
  body('personality_type')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Personality type must be between 1 and 50 characters'),
  body('scores')
    .isObject()
    .withMessage('Scores must be an object'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS error',
      message: 'Origin not allowed'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Handle database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'Resource already exists'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please authenticate again'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://vk.com"],
      scriptSrc: ["'self'", "https://vk.com", "https://m.vk.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://vk.com", "https://api.vk.com"],
      frameSrc: ["'self'", "https://vk.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = {
  generalLimiter,
  vkPaymentLimiter,
  userLimiter,
  corsOptions,
  validateVKPayment,
  validateUserData,
  validateQuizResult,
  errorHandler,
  requestLogger,
  securityHeaders
}; 