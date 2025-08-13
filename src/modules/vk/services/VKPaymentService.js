/**
 * VK Payment Service
 * Handles VK payment functionality including order boxes and payment processing
 */

import { VKConfig } from '../config/VKConfig.js';

export class VKPaymentService {
    constructor(bridge, logger, analytics, errorHandler) {
        this.bridge = bridge;
        this.logger = logger;
        this.analytics = analytics;
        this.errorHandler = errorHandler;
        this.isEnabled = VKConfig.isFeatureEnabled('payment');
    }
    
    /**
     * Show VK order box for premium purchase
     */
    async showOrderBox(productId = 'mbti_premium', productName = null) {
        if (!this.isEnabled) {
            this.analytics.trackPayment(productId, false, { error_type: 'payment_disabled' });
            return this.errorHandler.handleError(
                { error_type: 'payment_disabled', message: 'Payment is disabled' },
                'showOrderBox'
            );
        }
        
        if (!this.bridge) {
            this.analytics.trackPayment(productId, false, { error_type: 'bridge_unavailable' });
            return this.errorHandler.handleError(
                { error_type: 'bridge_unavailable', message: 'VK Bridge not available' },
                'showOrderBox'
            );
        }
        
        try {
            // On iOS (VK app or Safari), prefer VK Pay for payment
            const platform = VKConfig.detectPlatform();
            const isIOS = platform === VKConfig.PLATFORMS.IOS || platform === VKConfig.PLATFORMS.VK_IOS;
            if (isIOS) {
                const payConfig = VKConfig.getPaymentConfig(productId);
                const vkPayParams = payConfig.vkPayParams;
                if (vkPayParams) {
                    this.logger.debug('Attempting VK Pay on iOS with params:', vkPayParams);
                    try {
                        await this.bridge.send('VKWebAppOpenPayForm', vkPayParams);
                        this.analytics.trackPayment(productId, true, null, null, { method: 'vkpay' });
                        return { success: true, method: 'vkpay' };
                    } catch (vkpayError) {
                        this.logger.warn('VK Pay failed, falling back to OrderBox:', vkpayError);
                    }
                }
            }

            const config = VKConfig.getPaymentConfig(productId);
            const finalProductName = productName || config.name;
            
            this.logger.debug('VK Order Box Request:', {
                product_id: productId,
                product_name: finalProductName,
                config: config
            });
            
            this.analytics.trackPayment(productId, false, null, null, { action: 'attempted' });
            
            const result = await this.bridge.send('VKWebAppShowOrderBox', {
                type: 'item',
                item: productId,
                title: finalProductName,
                description: config.description,
                photo: config.icon,
                price: config.price,
                discount: 0,
                currency: config.currency
            });
            
            this.logger.debug('VK Order Box Response:', result);
            
            this.analytics.trackPayment(productId, true, null, result.order_id, { action: 'success' });
            
            return {
                success: true,
                order_id: result.order_id,
                product_id: productId,
                result: result
            };
            
        } catch (error) {
            this.logger.error('VK Order Box Error:', error);
            
            this.analytics.trackPayment(productId, false, error);
            
            return this.errorHandler.handleError(error, 'showOrderBox', {
                product_id: productId,
                product_name: productName
            });
        }
    }
    
    /**
     * Handle order box result and process payment
     */
    async handleOrderBoxResult(result) {
        this.logger.debug('VK Order Box Result:', result);
        
        if (result.success) {
            // Payment successful
            this.analytics.trackPayment(result.product_id, true, null, result.order_id, { action: 'completed' });
            
            return {
                success: true,
                message: 'Payment successful! Premium access activated.',
                order_id: result.order_id,
                product_id: result.product_id
            };
            
        } else if (result.status === 'cancel' || result.cancelled) {
            // User cancelled the payment
            this.analytics.trackPayment(result.product_id, false, { error_type: 'user_cancelled' });
            
            return {
                success: false,
                message: 'Payment was cancelled by user.',
                cancelled: true,
                product_id: result.product_id
            };
            
        } else {
            // Payment failed
            this.analytics.trackPayment(result.product_id, false, { error_type: 'payment_failed', status: result.status });
            
            return {
                success: false,
                message: 'Payment failed. Please try again.',
                error: result.status || 'unknown_error',
                product_id: result.product_id
            };
        }
    }
    
    /**
     * Process subscription purchase
     */
    async purchaseSubscription(tier = 'monthly') {
        const subscriptionConfigs = VKConfig.PAYMENT_CONFIG.subscriptions;
        const config = subscriptionConfigs[tier];
        
        if (!config) {
            this.logger.error('Invalid subscription tier:', tier);
            return {
                success: false,
                error: 'invalid_tier',
                message: 'Invalid subscription tier'
            };
        }
        
        try {
            // Show VK order box for the selected tier
            const orderResult = await this.showOrderBox(config.id, config.name);
            
            if (orderResult.success) {
                // Process the order result
                const paymentResult = await this.handleOrderBoxResult(orderResult);
                
                if (paymentResult.success) {
                    // Payment successful - save subscription data
                    const subscriptionData = this.createSubscriptionData(tier, config, paymentResult.order_id);
                    this.saveSubscriptionData(subscriptionData);
                    
                    this.analytics.trackVKEvent('subscription_purchased', {
                        tier: tier,
                        price: config.price,
                        currency: 'RUB',
                        order_id: paymentResult.order_id
                    });
                    
                    return {
                        success: true,
                        subscription: subscriptionData,
                        message: `Subscription ${config.name} successfully activated!`
                    };
                    
                } else if (paymentResult.cancelled) {
                    return {
                        success: false,
                        cancelled: true,
                        message: 'Purchase was cancelled'
                    };
                } else {
                    return {
                        success: false,
                        error: paymentResult.error,
                        message: 'Payment failed. Please try again.'
                    };
                }
            } else {
                return orderResult;
            }
            
        } catch (error) {
            this.logger.error('Error during subscription purchase:', error);
            
            this.analytics.trackVKEvent('subscription_purchase_error', {
                tier: tier,
                error_message: error.message
            });
            
            return {
                success: false,
                error: 'purchase_error',
                message: 'Error processing payment'
            };
        }
    }
    
    /**
     * Create subscription data object
     */
    createSubscriptionData(tier, config, orderId) {
        const now = new Date();
        const endDate = this.calculateEndDate(tier, now);
        const nextPayment = tier === 'lifetime' ? null : endDate;
        
        return {
            tier: tier,
            startDate: now.toLocaleDateString(),
            endDate: tier === 'lifetime' ? 'Бессрочно' : endDate.toLocaleDateString(),
            nextPayment: tier === 'lifetime' ? 'Нет' : nextPayment.toLocaleDateString(),
            price: `${config.price / 100} RUB`,
            orderId: orderId,
            isActive: true,
            purchasedAt: now.toISOString()
        };
    }
    
    /**
     * Calculate subscription end date
     */
    calculateEndDate(tier, startDate) {
        switch (tier) {
            case 'monthly':
                return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            case 'yearly':
                return new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
            case 'lifetime':
                return null;
            default:
                return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
    }
    
    /**
     * Save subscription data to localStorage
     */
    saveSubscriptionData(subscriptionData) {
        try {
            localStorage.setItem(VKConfig.getStorageKey('subscriptionData'), JSON.stringify(subscriptionData));
            localStorage.setItem(VKConfig.getStorageKey('premiumStatus'), 'true');
            localStorage.setItem(VKConfig.getStorageKey('premiumTimestamp'), Date.now().toString());
            
            this.logger.debug('Subscription data saved:', subscriptionData);
            
        } catch (error) {
            this.logger.error('Error saving subscription data:', error);
        }
    }
    
    /**
     * Get available subscription tiers
     */
    getAvailableTiers() {
        return Object.keys(VKConfig.PAYMENT_CONFIG.subscriptions);
    }
    
    /**
     * Get subscription configuration
     */
    getSubscriptionConfig(tier) {
        return VKConfig.PAYMENT_CONFIG.subscriptions[tier];
    }
    
    /**
     * Check if payment is supported
     */
    isPaymentSupported() {
        return this.isEnabled && !!this.bridge;
    }
    
    /**
     * Get payment status
     */
    getPaymentStatus() {
        return {
            enabled: this.isEnabled,
            bridgeAvailable: !!this.bridge,
            supported: this.isPaymentSupported()
        };
    }
} 