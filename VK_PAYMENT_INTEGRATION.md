# VK Payment Integration Documentation

## Overview

This document describes the VK payment integration implementation for the MBTI Personality Quiz application. The system includes both client-side payment logic and a server for handling VK payment notifications.

## Architecture

### Components

1. **Client-Side Payment Logic** (`src/modules/vk/VKBridgeManager.js`)
   - VK payment order box integration
   - Payment result handling
   - User premium status management
   - Backend communication

2. **Payment Server** (`server.js`)
   - VK payment notification handling
   - Premium user management
   - User information storage
   - API endpoints for client communication

3. **Main Application Integration** (`src/main.js`, `script.js`)
   - Premium unlocking logic
   - Payment flow integration
   - User experience management

## Server Setup

### Installation

```bash
# Install server dependencies
npm install express cors

# Start the server
node server.js
```

### Server Endpoints

#### Health Check
```
GET /health
```
Returns server status and premium user count.

#### Premium Status Check
```
GET /api/vk/premium-status/:userId
```
Returns premium status for a specific VK user.

#### VK Payment Notification
```
POST /api/vk/payment-notification
```
Handles VK payment notifications and activates premium for users.

#### User Information Update
```
POST /api/vk/user
```
Updates user information in the backend.

#### Manual Premium Activation
```
POST /api/vk/activate-premium/:userId
```
Manually activates premium for a user (for testing).

#### Premium Users List
```
GET /api/vk/premium-users
```
Returns list of all premium users (for debugging).

## Client-Side Implementation

### VK Bridge Manager Methods

#### `showOrderBox()`
Displays the VK payment order box for premium features.

**Features:**
- Checks if user is already premium
- Handles VK environment detection
- Provides development mode fallback
- Comprehensive error handling
- Firebase Analytics tracking

**Usage:**
```javascript
const result = await vkBridgeManager.showOrderBox();
if (result.success) {
    // Payment successful
}
```

#### `handlePaymentResult(result)`
Processes payment results and updates user status.

**Features:**
- Updates user information in backend
- Verifies premium activation
- Handles payment success/failure
- User notification

#### `updateUserInBackend(userInfo)`
Updates user information in the backend server.

#### `manuallyActivatePremium()`
Manually activates premium for the current user (for testing).

### Payment Flow

1. **User clicks "Unlock Premium"**
2. **Check if in VK environment**
   - If yes: Show VK payment order box
   - If no: Activate premium directly (development mode)

3. **VK Payment Process**
   - Display order box with premium item
   - User completes payment
   - VK sends notification to server
   - Server activates premium for user

4. **Premium Activation**
   - Update user status in backend
   - Verify premium activation
   - Show success notification
   - Unlock premium features

## VK Payment Configuration

### Required VK App Settings

1. **Payment Configuration**
   - Enable payments in VK App settings
   - Configure payment items (premium_access)
   - Set up payment notification URL

2. **Notification URL**
   ```
   https://your-domain.com/api/vk/payment-notification
   ```

3. **Payment Item Configuration**
   ```json
   {
     "item_id": "premium_access",
     "title": "Premium Access",
     "price": 99,
     "currency": "RUB"
   }
   ```

### Environment Variables

```bash
# VK App Secret (for signature verification)
VK_APP_SECRET=your_vk_app_secret_here

# Server port
PORT=3000
```

## Testing

### Test Page
Access `test_vk_payment.html` to test the payment integration:

- **Server Health Check**: Verify server is running
- **Payment Flow Test**: Simulate VK payment process
- **Manual Activation**: Test premium activation
- **User Management**: Check and manage premium users

### Development Mode
When running outside VK environment:
- Payment is simulated automatically
- Premium features unlock immediately
- No actual payment processing

### Testing Commands

```bash
# Check server health
curl http://localhost:3000/health

# Check premium status for user
curl http://localhost:3000/api/vk/premium-status/123456

# Manually activate premium
curl -X POST http://localhost:3000/api/vk/activate-premium/123456

# Get all premium users
curl http://localhost:3000/api/vk/premium-users
```

## Error Handling

### VK Payment Errors

| Error Code | Description | Handling |
|------------|-------------|----------|
| 13 | Order configuration error | Show admin contact message |
| 14 | User denied payment | Show cancellation message |
| Other | Unknown payment error | Show generic error message |

### Server Errors

- **Connection errors**: Fallback to development mode
- **Payment notification errors**: Log and continue
- **User update errors**: Continue without user data

### Client-Side Fallbacks

1. **VK Bridge unavailable**: Use development mode
2. **Server unavailable**: Use localStorage premium
3. **Payment failed**: Show error and retry option

## Analytics Integration

### Firebase Analytics Events

- `vk_payment_attempted`: Payment initiated
- `vk_payment_result`: Payment completed
- `vk_payment_error`: Payment failed
- `vk_payment_already_premium`: User already premium
- `vk_premium_manually_activated`: Manual activation

### Event Parameters

```javascript
{
  vk_platform: true,
  vk_user_id: 123456,
  success: true,
  status: 'success',
  error_type: 'client_error',
  error_code: 13
}
```

## Security Considerations

### Signature Verification
The server includes commented signature verification code:

```javascript
// Verify signature (in production, implement proper signature verification)
// const expectedSign = crypto
//     .createHmac('sha256', VK_APP_SECRET)
//     .update(`${notification_type}${user_id}${item_id}${status}${amount}${currency}`)
//     .digest('hex');
```

### Production Deployment
1. **Enable signature verification**
2. **Use HTTPS for all endpoints**
3. **Implement rate limiting**
4. **Add proper error logging**
5. **Use database for user storage**

## Deployment

### Local Development
```bash
# Start server
node server.js

# Start frontend
npm run dev
```

### Production Deployment
1. **Deploy server** to your hosting provider
2. **Update VK App settings** with production notification URL
3. **Configure environment variables**
4. **Enable signature verification**
5. **Set up monitoring and logging**

## Troubleshooting

### Common Issues

1. **Payment not working in VK**
   - Check VK App payment configuration
   - Verify notification URL is accessible
   - Check server logs for errors

2. **Premium not activating**
   - Check server health
   - Verify user ID in backend
   - Check payment notification logs

3. **Development mode issues**
   - Ensure server is running on localhost:3000
   - Check CORS configuration
   - Verify API endpoints

### Debug Commands

```bash
# Check server logs
tail -f server.log

# Test API endpoints
curl -v http://localhost:3000/health

# Check premium users
curl http://localhost:3000/api/vk/premium-users
```

## API Reference

### Server Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-29T04:58:41.593Z",
  "premiumUsersCount": 0
}
```

#### Premium Status
```http
GET /api/vk/premium-status/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isPremium": true,
    "userId": "123456",
    "activatedAt": "2025-07-29T04:58:41.593Z"
  }
}
```

#### Payment Notification
```http
POST /api/vk/payment-notification
```

**Request Body:**
```json
{
  "notification_type": "get_item",
  "user_id": 123456,
  "item_id": "premium_access",
  "status": "ok",
  "amount": 99,
  "currency": "RUB",
  "sign": "signature_hash"
}
```

#### Manual Activation
```http
POST /api/vk/activate-premium/:userId
```

**Response:**
```json
{
  "success": true,
  "message": "Premium activated for user 123456",
  "data": {
    "isPremium": true,
    "userId": "123456",
    "activatedAt": "2025-07-29T04:58:41.593Z"
  }
}
```

## Conclusion

The VK payment integration provides a complete solution for premium feature monetization in VK Mini Apps. The system includes:

- ✅ **Complete payment flow** from client to server
- ✅ **Robust error handling** and fallbacks
- ✅ **Development mode** for testing
- ✅ **Analytics integration** for tracking
- ✅ **Comprehensive testing tools**
- ✅ **Production-ready architecture**

The implementation is designed to work seamlessly in both VK environment and standalone mode, providing a smooth user experience across all platforms. 