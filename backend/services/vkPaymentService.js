const crypto = require('crypto');
const db = require('../config/database');
const logger = db.logger;

class VKPaymentService {
  constructor() {
    this.vkConfig = {
      appId: process.env.VK_APP_ID,
      secureKey: process.env.VK_SECURE_KEY,
      apiVersion: process.env.VK_API_VERSION || '5.131'
    };
    
    this.premiumItems = {
      'premium_access': {
        title: 'Premium Access',
        price: process.env.PREMIUM_PRICE || 50,
        description: 'Premium features for 30 days',
        durationDays: process.env.PREMIUM_DURATION_DAYS || 30
      }
    };
  }

  /**
   * Verify VK notification signature
   */
  verifySignature(notification) {
    try {
      const params = Object.keys(notification)
        .filter(key => key !== 'sig')
        .sort()
        .map(key => `${key}=${notification[key]}`)
        .join('');
      
      const calculatedSig = crypto
        .createHash('md5')
        .update(params + this.vkConfig.secureKey)
        .digest('hex');
      
      const isValid = calculatedSig === notification.sig;
      
      if (!isValid) {
        logger.warn('Invalid VK signature', {
          calculatedSig,
          receivedSig: notification.sig,
          params
        });
      }
      
      return isValid;
    } catch (error) {
      logger.error('Error verifying VK signature:', error);
      return false;
    }
  }

  /**
   * Handle get_item notification
   */
  async handleGetItem(notification) {
    try {
      const itemId = notification.item;
      const item = this.premiumItems[itemId];
      
      if (!item) {
        logger.warn(`Unknown item requested: ${itemId}`);
        return {
          error: 'Unknown item'
        };
      }

      return {
        title: item.title,
        price: item.price,
        description: item.description,
        photo_url: 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png',
        item_id: itemId
      };
    } catch (error) {
      logger.error('Error handling get_item notification:', error);
      throw error;
    }
  }

  /**
   * Handle order_status_change notification
   */
  async handleOrderStatusChange(notification) {
    try {
      const {
        user_id: vkUserId,
        order_id: vkOrderId,
        item,
        item_price,
        status
      } = notification;

      logger.info('Processing order status change', {
        vkUserId,
        vkOrderId,
        item,
        status
      });

      // Check if order already processed
      const existingPurchase = await db.getPurchaseByVkOrderId(vkOrderId);
      if (existingPurchase) {
        logger.info(`Order ${vkOrderId} already processed, status: ${existingPurchase.status}`);
        
        if (existingPurchase.status === 'completed') {
          return {
            order_id: vkOrderId,
            app_order_id: existingPurchase.id,
            status: 'chargeable'
          };
        }
      }

      // Get or create user
      let user = await db.getUserByVkId(vkUserId);
      if (!user) {
        // Create minimal user record
        await db.createOrUpdateUser({
          vk_user_id: vkUserId,
          username: `user_${vkUserId}`,
          first_name: 'User',
          last_name: '',
          photo_url: ''
        });
        user = await db.getUserByVkId(vkUserId);
      }

      const itemConfig = this.premiumItems[item];
      if (!itemConfig) {
        logger.error(`Unknown item in order: ${item}`);
        await db.updatePurchaseStatus(vkOrderId, 'failed');
        return { error: 'Unknown item' };
      }

      if (status === 'chargeable') {
        // Create purchase record
        const purchaseId = await db.createPurchase({
          user_id: user.id,
          vk_user_id: vkUserId,
          item_id: item,
          amount: item_price,
          currency: 'RUB',
          vk_order_id: vkOrderId,
          vk_notification_params: notification,
          premium_duration_days: itemConfig.durationDays
        });

        // Process the payment and grant premium access
        await this.grantPremiumAccess(user.id, itemConfig.durationDays);

        // Update purchase status to completed
        await db.updatePurchaseStatus(vkOrderId, 'completed');

        logger.info(`Premium access granted for user ${user.id}`, {
          purchaseId,
          durationDays: itemConfig.durationDays
        });

        return {
          order_id: vkOrderId,
          app_order_id: purchaseId,
          status: 'chargeable'
        };
      } else if (status === 'canceled') {
        // Handle canceled order
        if (existingPurchase) {
          await db.updatePurchaseStatus(vkOrderId, 'failed');
        }
        return { response: 'ok' };
      }

      return { response: 'ok' };
    } catch (error) {
      logger.error('Error handling order status change:', error);
      throw error;
    }
  }

  /**
   * Grant premium access to user
   */
  async grantPremiumAccess(userId, durationDays) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await db.updateUserPremiumStatus(userId, true, expiresAt);
      
      logger.info(`Premium access granted for user ${userId} until ${expiresAt}`);
    } catch (error) {
      logger.error('Error granting premium access:', error);
      throw error;
    }
  }

  /**
   * Check if user has active premium
   */
  async checkPremiumStatus(vkUserId) {
    try {
      const user = await db.getUserByVkId(vkUserId);
      if (!user) {
        return { isPremium: false, expiresAt: null };
      }

      const isPremium = user.is_premium && 
        (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date());

      return {
        isPremium,
        expiresAt: user.premium_expires_at,
        userId: user.id
      };
    } catch (error) {
      logger.error('Error checking premium status:', error);
      throw error;
    }
  }

  /**
   * Get premium features list
   */
  getPremiumFeatures() {
    return [
      {
        id: 'detailed_results',
        name: 'Detailed Results',
        description: 'Get comprehensive personality analysis with detailed explanations'
      },
      {
        id: 'multiple_quizzes',
        name: 'All Quizzes',
        description: 'Access to all specialized personality assessments'
      },
      {
        id: 'pdf_export',
        name: 'PDF Export',
        description: 'Download your results as a professional PDF report'
      },
      {
        id: 'comparison_tools',
        name: 'Comparison Tools',
        description: 'Compare your results with friends and family'
      },
      {
        id: 'progress_tracking',
        name: 'Progress Tracking',
        description: 'Track your personality development over time'
      },
      {
        id: 'expert_insights',
        name: 'Expert Insights',
        description: 'Professional psychology insights and recommendations'
      }
    ];
  }

  /**
   * Process VK payment notification
   */
  async processNotification(notification) {
    try {
      // Verify signature
      if (!this.verifySignature(notification)) {
        logger.warn('Invalid VK notification signature', { notification });
        return { error: 'Invalid signature' };
      }

      logger.info('Processing VK notification', {
        type: notification.notification_type,
        userId: notification.user_id
      });

      // Handle different notification types
      switch (notification.notification_type) {
        case 'get_item':
          return await this.handleGetItem(notification);
          
        case 'order_status_change':
          return await this.handleOrderStatusChange(notification);
          
        default:
          logger.warn(`Unknown notification type: ${notification.notification_type}`);
          return { response: 'ok' };
      }
    } catch (error) {
      logger.error('Error processing VK notification:', error);
      throw error;
    }
  }
}

module.exports = new VKPaymentService(); 