# VK Payment Integration Troubleshooting Guide

## 🚨 Error Code 13: "Order error"

This error occurs when there's an issue with the VK App payment configuration. Here's how to fix it:

## 🔧 **Step 1: VK App Configuration**

### 1.1 VK Developer Portal Setup

1. **Go to [VK Developer Portal](https://vk.com/dev)**
2. **Select your app** (ID: `oLd3CLhJvflwT0iUYxda`)
3. **Navigate to "Payments" section**

### 1.2 Payment Settings Configuration

**Required Settings:**
- ✅ **Enable payments**: Turn on payment functionality
- ✅ **Notification URL**: `https://javelin-hopeful-goshawk.ngrok-free.app/api/vk/payment`
- ✅ **Secure Key**: `0608558a0608558a0608558a12053f4fbb006080608558a6e76f392ad072b077d0f03c2`
- ✅ **API Version**: `5.131`

### 1.3 Item Configuration

**Create the premium item:**
```json
{
  "item_id": "premium_access",
  "title": "Premium Access",
  "price": 50,
  "description": "Premium features for 30 days",
  "photo_url": "https://your-domain.com/assets/premium-icon.png"
}
```

## 🔧 **Step 2: Backend Server Setup**

### 2.1 Database Setup

```bash
# Create MySQL database
mysql -u nikita -p
CREATE DATABASE mbti_quiz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Start Backend Server

```bash
cd backend
npm install
npm start
```

### 2.3 Test Backend

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test VK payment endpoint
curl -X POST http://localhost:3001/api/vk/payment \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "get_item",
    "user_id": 123456,
    "item": "premium_access",
    "sig": "test_signature"
  }'
```

## 🔧 **Step 3: Frontend Integration**

### 3.1 Updated VK Bridge Implementation

The VKBridgeManager has been updated with:
- ✅ Better error handling
- ✅ Premium status checking
- ✅ Backend integration
- ✅ User-friendly error messages

### 3.2 Testing the Integration

1. **Open your app in VK**
2. **Try to purchase premium**
3. **Check browser console for detailed logs**

## 🚨 **Common Issues & Solutions**

### Issue 1: Error Code 13 - Order Configuration
**Solution:**
- Verify VK App payment settings
- Check notification URL is accessible
- Ensure item_id matches backend configuration

### Issue 2: Database Connection Failed
**Solution:**
```bash
# Check MySQL is running
brew services list | grep mysql

# Start MySQL if needed
brew services start mysql

# Test connection
mysql -u nikita -p -e "SELECT 1;"
```

### Issue 3: CORS Errors
**Solution:**
- Update CORS_ORIGIN in backend .env
- Add your domain to VK App allowed origins

### Issue 4: Signature Verification Failed
**Solution:**
- Verify VK_SECURE_KEY matches VK App settings
- Check notification parameters format

## 🧪 **Testing Without VK Payments**

### Development Mode

If you can't configure VK payments immediately, you can test in development mode:

```javascript
// In VKBridgeManager.js, add development mode
async showOrderBox() {
    if (!this.bridge) {
        // Development mode - simulate successful payment
        console.log('Development mode: Simulating payment success');
        return { success: true, status: 'success' };
    }
    
    // ... rest of the code
}
```

### Mock Payment Testing

```javascript
// Test payment flow without VK
async testPaymentFlow() {
    const userInfo = await this.getUserInfo();
    if (userInfo && userInfo.id) {
        // Simulate payment success
        await this.updateUserInBackend(userInfo);
        await this.showNotification('Test: Premium activated!');
        return { success: true, premiumActivated: true };
    }
}
```

## 📋 **Checklist for VK Payment Setup**

### VK App Configuration
- [ ] App ID configured correctly
- [ ] Secure key matches backend
- [ ] Payment functionality enabled
- [ ] Notification URL set
- [ ] Item configured in VK
- [ ] Domain added to allowed origins

### Backend Configuration
- [ ] Database created and accessible
- [ ] Environment variables set
- [ ] Server running on correct port
- [ ] Health endpoint responding
- [ ] VK payment endpoint working

### Frontend Configuration
- [ ] VK Bridge initialized
- [ ] Error handling implemented
- [ ] Premium status checking working
- [ ] User feedback implemented

## 🔍 **Debugging Steps**

### 1. Check VK App Status
```bash
# Test VK App configuration
curl "https://api.vk.com/method/apps.get?app_id=oLd3CLhJvflwT0iUYxda&v=5.131"
```

### 2. Test Backend Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Premium features
curl http://localhost:3001/api/vk/premium-features

# Premium status
curl http://localhost:3001/api/vk/premium-status/123456
```

### 3. Monitor Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Database logs
tail -f backend/logs/database.log
```

## 🆘 **Getting Help**

If you're still experiencing issues:

1. **Check VK Developer Documentation**: https://vk.com/dev/payments
2. **Verify App Configuration**: Ensure all settings match
3. **Test with VK Test Environment**: Use VK's sandbox for testing
4. **Contact VK Support**: For app-specific issues

## 📞 **Support Information**

- **VK App ID**: `oLd3CLhJvflwT0iUYxda`
- **Backend URL**: `https://javelin-hopeful-goshawk.ngrok-free.app`
- **Payment Endpoint**: `/api/vk/payment`
- **Database**: `mbti_quiz_db`

---

**Note**: The error code 13 is typically resolved by properly configuring the VK App payment settings. Make sure all the above steps are completed before testing the payment flow. 