const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for premium users (in production, use a database)
const premiumUsers = new Map();

// VK App configuration
const VK_APP_SECRET = process.env.VK_APP_SECRET || 'your_vk_app_secret_here';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        premiumUsersCount: premiumUsers.size
    });
});

// Get premium status for a VK user
app.get('/api/vk/premium-status/:userId', (req, res) => {
    const userId = req.params.userId;
    const isPremium = premiumUsers.has(userId);
    
    res.json({
        success: true,
        data: {
            isPremium,
            userId,
            activatedAt: isPremium ? premiumUsers.get(userId) : null
        }
    });
});

// VK payment notification endpoint
app.post('/api/vk/payment-notification', (req, res) => {
    try {
        const { 
            notification_type, 
            user_id, 
            item_id, 
            status, 
            amount, 
            currency,
            sign 
        } = req.body;

        console.log('VK Payment Notification received:', {
            notification_type,
            user_id,
            item_id,
            status,
            amount,
            currency,
            timestamp: new Date().toISOString()
        });

        // Verify signature (in production, implement proper signature verification)
        // const expectedSign = crypto
        //     .createHmac('sha256', VK_APP_SECRET)
        //     .update(`${notification_type}${user_id}${item_id}${status}${amount}${currency}`)
        //     .digest('hex');
        
        // if (sign !== expectedSign) {
        //     console.error('Invalid signature for payment notification');
        //     return res.status(400).json({ error: 'Invalid signature' });
        // }

        // Handle payment notification
        if (notification_type === 'get_item' && status === 'ok') {
            // Payment successful, activate premium for user
            premiumUsers.set(user_id.toString(), {
                activatedAt: new Date().toISOString(),
                itemId: item_id,
                amount,
                currency
            });
            
            console.log(`Premium activated for user ${user_id}`);
            
            res.json({
                success: true,
                data: {
                    item_id,
                    title: 'Premium Access',
                    photo_url: 'https://example.com/premium-icon.png',
                    price: amount,
                    price_str: `${amount} ${currency}`
                }
            });
        } else if (notification_type === 'order_status_change' && status === 'paid') {
            // Order status changed to paid
            premiumUsers.set(user_id.toString(), {
                activatedAt: new Date().toISOString(),
                itemId: item_id,
                amount,
                currency
            });
            
            console.log(`Premium activated for user ${user_id} (order status change)`);
            
            res.json({ success: true });
        } else {
            console.log(`Unhandled notification type: ${notification_type} with status: ${status}`);
            res.json({ success: true });
        }
    } catch (error) {
        console.error('Error processing payment notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user information
app.post('/api/vk/user', (req, res) => {
    try {
        const { vk_user_id, username, first_name, last_name, photo_url } = req.body;
        
        console.log('User info update:', {
            vk_user_id,
            username,
            first_name,
            last_name,
            photo_url
        });
        
        // In a real application, you would store this in a database
        // For now, we'll just log it
        
        res.json({
            success: true,
            message: 'User information updated'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Test endpoint to manually activate premium for a user
app.post('/api/vk/activate-premium/:userId', (req, res) => {
    const userId = req.params.userId;
    
    premiumUsers.set(userId, {
        activatedAt: new Date().toISOString(),
        itemId: 'premium_access',
        amount: 0,
        currency: 'RUB'
    });
    
    console.log(`Premium manually activated for user ${userId}`);
    
    res.json({
        success: true,
        message: `Premium activated for user ${userId}`,
        data: {
            isPremium: true,
            userId,
            activatedAt: premiumUsers.get(userId)
        }
    });
});

// Get all premium users (for debugging)
app.get('/api/vk/premium-users', (req, res) => {
    const users = Array.from(premiumUsers.entries()).map(([userId, data]) => ({
        userId,
        ...data
    }));
    
    res.json({
        success: true,
        data: users
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VK Payment Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 