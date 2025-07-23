const mysql = require('mysql2/promise');
const winston = require('winston');

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: process.env.LOG_FILE_PATH || './logs/database.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mbti_quiz_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logger.info('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vk_user_id INT UNIQUE NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        photo_url VARCHAR(500),
        is_premium BOOLEAN DEFAULT FALSE,
        premium_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vk_user_id (vk_user_id),
        INDEX idx_premium_status (is_premium, premium_expires_at)
      )
    `);

    // Create purchases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vk_user_id INT NOT NULL,
        item_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'RUB',
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        vk_order_id INT UNIQUE,
        vk_notification_params JSON,
        premium_duration_days INT DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_vk_order_id (vk_order_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create quiz_results table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vk_user_id INT NOT NULL,
        quiz_type VARCHAR(100) NOT NULL,
        personality_type VARCHAR(50),
        scores JSON,
        answers JSON,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_quiz (user_id, quiz_type),
        INDEX idx_vk_user_quiz (vk_user_id, quiz_type)
      )
    `);

    // Create premium_features table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS premium_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feature_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default premium features
    await connection.query(`
      INSERT IGNORE INTO premium_features (feature_name, description) VALUES
      ('detailed_results', 'Detailed personality analysis with explanations'),
      ('multiple_quizzes', 'Access to all specialized personality quizzes'),
      ('pdf_export', 'Export results as PDF report'),
      ('comparison_tools', 'Compare results with friends and family'),
      ('progress_tracking', 'Track your personality development over time'),
      ('expert_insights', 'Professional psychology insights and recommendations')
    `);

    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Get user by VK ID
async function getUserByVkId(vkUserId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE vk_user_id = ?',
      [vkUserId]
    );
    return rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by VK ID:', error);
    throw error;
  }
}

// Create or update user
async function createOrUpdateUser(userData) {
  try {
    const { vk_user_id, username, first_name, last_name, photo_url } = userData;
    
    const [result] = await pool.query(`
      INSERT INTO users (vk_user_id, username, first_name, last_name, photo_url)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        photo_url = VALUES(photo_url),
        updated_at = CURRENT_TIMESTAMP
    `, [vk_user_id, username, first_name, last_name, photo_url]);

    return result.insertId || result.affectedRows;
  } catch (error) {
    logger.error('Error creating/updating user:', error);
    throw error;
  }
}

// Update user premium status
async function updateUserPremiumStatus(userId, isPremium, expiresAt = null) {
  try {
    await pool.query(`
      UPDATE users 
      SET is_premium = ?, premium_expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [isPremium, expiresAt, userId]);
    
    logger.info(`Updated premium status for user ${userId}: ${isPremium}`);
  } catch (error) {
    logger.error('Error updating user premium status:', error);
    throw error;
  }
}

// Create purchase record
async function createPurchase(purchaseData) {
  try {
    const {
      user_id,
      vk_user_id,
      item_id,
      amount,
      currency,
      vk_order_id,
      vk_notification_params,
      premium_duration_days
    } = purchaseData;

    const [result] = await pool.query(`
      INSERT INTO purchases (
        user_id, vk_user_id, item_id, amount, currency, 
        vk_order_id, vk_notification_params, premium_duration_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user_id, vk_user_id, item_id, amount, currency,
      vk_order_id, JSON.stringify(vk_notification_params), premium_duration_days
    ]);

    return result.insertId;
  } catch (error) {
    logger.error('Error creating purchase record:', error);
    throw error;
  }
}

// Update purchase status
async function updatePurchaseStatus(vkOrderId, status) {
  try {
    await pool.query(`
      UPDATE purchases 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE vk_order_id = ?
    `, [status, vkOrderId]);
    
    logger.info(`Updated purchase status for order ${vkOrderId}: ${status}`);
  } catch (error) {
    logger.error('Error updating purchase status:', error);
    throw error;
  }
}

// Get purchase by VK order ID
async function getPurchaseByVkOrderId(vkOrderId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM purchases WHERE vk_order_id = ?',
      [vkOrderId]
    );
    return rows[0] || null;
  } catch (error) {
    logger.error('Error getting purchase by VK order ID:', error);
    throw error;
  }
}

// Save quiz result
async function saveQuizResult(resultData) {
  try {
    const {
      user_id,
      vk_user_id,
      quiz_type,
      personality_type,
      scores,
      answers
    } = resultData;

    const [result] = await pool.query(`
      INSERT INTO quiz_results (
        user_id, vk_user_id, quiz_type, personality_type, scores, answers
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      user_id, vk_user_id, quiz_type, personality_type,
      JSON.stringify(scores), JSON.stringify(answers)
    ]);

    return result.insertId;
  } catch (error) {
    logger.error('Error saving quiz result:', error);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  getUserByVkId,
  createOrUpdateUser,
  updateUserPremiumStatus,
  createPurchase,
  updatePurchaseStatus,
  getPurchaseByVkOrderId,
  saveQuizResult,
  logger
}; 