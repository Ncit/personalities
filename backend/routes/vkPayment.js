const express = require('express');
const router = express.Router();
const vkPaymentService = require('../services/vkPaymentService');
const db = require('../config/database');
const { 
  vkPaymentLimiter, 
  userLimiter, 
  validateVKPayment, 
  validateUserData,
  validateQuizResult 
} = require('../middleware/security');

/**
 * VK Payment Notification Endpoint
 * Handles VK payment notifications for premium purchases
 */
router.post('/payment', 
  vkPaymentLimiter,
  validateVKPayment,
  async (req, res) => {
    try {
      const notification = req.body;
      const result = await vkPaymentService.processNotification(notification);
      
      res.json(result);
    } catch (error) {
      db.logger.error('Error in VK payment endpoint:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to process payment notification'
      });
    }
  }
);

/**
 * Get Premium Status
 * Check if user has active premium subscription
 */
router.get('/premium-status/:vkUserId', 
  userLimiter,
  async (req, res) => {
    try {
      const vkUserId = parseInt(req.params.vkUserId);
      
      if (!vkUserId || vkUserId <= 0) {
        return res.status(400).json({
          error: 'Invalid VK user ID'
        });
      }

      const premiumStatus = await vkPaymentService.checkPremiumStatus(vkUserId);
      
      res.json({
        success: true,
        data: premiumStatus
      });
    } catch (error) {
      db.logger.error('Error checking premium status:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check premium status'
      });
    }
  }
);

/**
 * Get Premium Features
 * Returns list of available premium features
 */
router.get('/premium-features', 
  userLimiter,
  (req, res) => {
    try {
      const features = vkPaymentService.getPremiumFeatures();
      
      res.json({
        success: true,
        data: features
      });
    } catch (error) {
      db.logger.error('Error getting premium features:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get premium features'
      });
    }
  }
);

/**
 * Create or Update User
 * Creates or updates user information from VK
 */
router.post('/user', 
  userLimiter,
  validateUserData,
  async (req, res) => {
    try {
      const userData = req.body;
      const userId = await db.createOrUpdateUser(userData);
      
      res.json({
        success: true,
        data: { userId }
      });
    } catch (error) {
      db.logger.error('Error creating/updating user:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create/update user'
      });
    }
  }
);

/**
 * Get User Information
 * Retrieves user information by VK user ID
 */
router.get('/user/:vkUserId', 
  userLimiter,
  async (req, res) => {
    try {
      const vkUserId = parseInt(req.params.vkUserId);
      
      if (!vkUserId || vkUserId <= 0) {
        return res.status(400).json({
          error: 'Invalid VK user ID'
        });
      }

      const user = await db.getUserByVkId(vkUserId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Remove sensitive information
      const { password, ...userData } = user;
      
      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      db.logger.error('Error getting user:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get user information'
      });
    }
  }
);

/**
 * Save Quiz Result
 * Saves quiz results for a user
 */
router.post('/quiz-result', 
  userLimiter,
  validateQuizResult,
  async (req, res) => {
    try {
      const { vk_user_id, quiz_type, personality_type, scores, answers } = req.body;
      
      // Get or create user
      let user = await db.getUserByVkId(vk_user_id);
      if (!user) {
        await db.createOrUpdateUser({
          vk_user_id,
          username: `user_${vk_user_id}`,
          first_name: 'User',
          last_name: '',
          photo_url: ''
        });
        user = await db.getUserByVkId(vk_user_id);
      }

      const resultId = await db.saveQuizResult({
        user_id: user.id,
        vk_user_id,
        quiz_type,
        personality_type,
        scores,
        answers
      });

      res.json({
        success: true,
        data: { resultId }
      });
    } catch (error) {
      db.logger.error('Error saving quiz result:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to save quiz result'
      });
    }
  }
);

/**
 * Get User Quiz Results
 * Retrieves quiz results for a user
 */
router.get('/quiz-results/:vkUserId', 
  userLimiter,
  async (req, res) => {
    try {
      const vkUserId = parseInt(req.params.vkUserId);
      const quizType = req.query.quiz_type;
      
      if (!vkUserId || vkUserId <= 0) {
        return res.status(400).json({
          error: 'Invalid VK user ID'
        });
      }

      const user = await db.getUserByVkId(vkUserId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      let query = `
        SELECT * FROM quiz_results 
        WHERE user_id = ? 
        ORDER BY completed_at DESC
      `;
      let params = [user.id];

      if (quizType) {
        query = query.replace('WHERE user_id = ?', 'WHERE user_id = ? AND quiz_type = ?');
        params.push(quizType);
      }

      const [results] = await db.pool.query(query, params);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      db.logger.error('Error getting quiz results:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get quiz results'
      });
    }
  }
);

/**
 * Health Check Endpoint
 * Simple health check for monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VK Payment Service'
  });
});

module.exports = router; 