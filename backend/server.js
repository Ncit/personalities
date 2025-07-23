require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import modules
const db = require('./config/database');
const vkPaymentRoutes = require('./routes/vkPayment');
const { 
  generalLimiter, 
  corsOptions, 
  errorHandler, 
  requestLogger, 
  securityHeaders 
} = require('./middleware/security');

// Create Express app
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use(generalLimiter);

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

// API Routes
app.use('/api/vk', vkPaymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MBTI Personality Quiz Backend API',
    version: require('./package.json').version,
    endpoints: {
      health: '/health',
      vkPayment: '/api/vk/payment',
      premiumStatus: '/api/vk/premium-status/:vkUserId',
      premiumFeatures: '/api/vk/premium-features',
      user: '/api/vk/user',
      quizResult: '/api/vk/quiz-result'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  db.pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  db.pool.end();
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  db.logger.error('Unhandled Rejection', { reason, promise });
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  db.logger.error('Uncaught Exception', { error });
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database tables
    await db.initializeDatabase();
    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
      
      if (NODE_ENV === 'development') {
        console.log(`🔧 Development mode enabled`);
        console.log(`📝 Logs: ./logs/`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    db.logger.error('Server startup failed', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app; 