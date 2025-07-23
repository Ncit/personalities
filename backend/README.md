# MBTI Personality Quiz Backend

A production-ready backend server for the MBTI Personality Quiz with VK payment integration.

## 🚀 Features

- **VK Payment Integration**: Secure handling of VK payment notifications
- **Premium User Management**: Track premium subscriptions and access
- **Quiz Results Storage**: Save and retrieve quiz results
- **User Management**: Create and update user profiles
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Logging**: Comprehensive logging with Winston
- **Database**: MySQL with connection pooling and migrations
- **Production Ready**: Error handling, graceful shutdown, and monitoring

## 📋 Prerequisites

- Node.js 16+ 
- MySQL 8.0+
- VK App credentials

## 🛠️ Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp config.env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=mbti_quiz_db
   DB_PORT=3306
   
   # VK API Configuration
   VK_APP_ID=your_vk_app_id
   VK_SECURE_KEY=your_vk_secure_key
   VK_API_VERSION=5.131
   
   # Security
   CORS_ORIGIN=https://your-domain.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Premium Features Configuration
   PREMIUM_PRICE=50
   PREMIUM_DURATION_DAYS=30
   ```

4. **Create MySQL database**:
   ```sql
   CREATE DATABASE mbti_quiz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### With PM2 (recommended for production)
```bash
npm install -g pm2
pm2 start server.js --name "mbti-quiz-backend"
pm2 save
pm2 startup
```

## 📊 API Endpoints

### VK Payment Endpoints

#### `POST /api/vk/payment`
Handles VK payment notifications.

**Request Body**:
```json
{
  "notification_type": "order_status_change",
  "user_id": 123456,
  "order_id": 789,
  "item": "premium_access",
  "item_price": 50,
  "status": "chargeable",
  "sig": "md5_signature"
}
```

**Response**:
```json
{
  "order_id": 789,
  "app_order_id": 1,
  "status": "chargeable"
}
```

#### `GET /api/vk/premium-status/:vkUserId`
Check user's premium status.

**Response**:
```json
{
  "success": true,
  "data": {
    "isPremium": true,
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "userId": 1
  }
}
```

#### `GET /api/vk/premium-features`
Get list of premium features.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "detailed_results",
      "name": "Detailed Results",
      "description": "Get comprehensive personality analysis"
    }
  ]
}
```

### User Management Endpoints

#### `POST /api/vk/user`
Create or update user.

**Request Body**:
```json
{
  "vk_user_id": 123456,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "photo_url": "https://vk.com/photo.jpg"
}
```

#### `GET /api/vk/user/:vkUserId`
Get user information.

### Quiz Results Endpoints

#### `POST /api/vk/quiz-result`
Save quiz result.

**Request Body**:
```json
{
  "vk_user_id": 123456,
  "quiz_type": "mbti",
  "personality_type": "INTJ",
  "scores": {
    "I": 65,
    "N": 70,
    "T": 60,
    "J": 75
  },
  "answers": [1, 2, 3, 4, 5]
}
```

#### `GET /api/vk/quiz-results/:vkUserId`
Get user's quiz results.

**Query Parameters**:
- `quiz_type` (optional): Filter by quiz type

### Health Check

#### `GET /health`
Server health check.

#### `GET /`
API documentation and endpoints list.

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vk_user_id INT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  photo_url VARCHAR(500),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Purchases Table
```sql
CREATE TABLE purchases (
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Quiz Results Table
```sql
CREATE TABLE quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vk_user_id INT NOT NULL,
  quiz_type VARCHAR(100) NOT NULL,
  personality_type VARCHAR(50),
  scores JSON,
  answers JSON,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔒 Security Features

- **Rate Limiting**: Configurable rate limits for different endpoints
- **CORS**: Cross-origin resource sharing with whitelist
- **Input Validation**: Request body validation using express-validator
- **Security Headers**: Helmet.js for security headers
- **Signature Verification**: MD5 signature verification for VK notifications
- **Error Handling**: Comprehensive error handling and logging

## 📝 Logging

Logs are stored in the `logs/` directory:
- `app.log`: Application logs
- `database.log`: Database operation logs

Log levels: `error`, `warn`, `info`, `debug`

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Docker (Recommended)

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t mbti-quiz-backend .
   docker run -p 3000:3000 --env-file .env mbti-quiz-backend
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | "" |
| `DB_NAME` | Database name | mbti_quiz_db |
| `VK_APP_ID` | VK App ID | Required |
| `VK_SECURE_KEY` | VK Secure Key | Required |
| `CORS_ORIGIN` | Allowed origins | Required |
| `PREMIUM_PRICE` | Premium price in RUB | 50 |
| `PREMIUM_DURATION_DAYS` | Premium duration | 30 |

## 🔧 Configuration

### VK App Setup

1. Create a VK App in [VK Developer Portal](https://vk.com/dev)
2. Configure payment settings
3. Set notification URL to: `https://your-domain.com/api/vk/payment`
4. Add your domain to allowed origins

### Database Setup

1. Create MySQL database
2. Configure connection settings in `.env`
3. Run server to auto-create tables

## 📈 Monitoring

- Health check endpoint: `/health`
- Application metrics via Winston logging
- Database connection monitoring
- Error tracking and alerting

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Ensure MySQL is running
   - Verify database exists

2. **VK Payment Not Working**
   - Verify VK App credentials
   - Check notification URL configuration
   - Validate signature verification

3. **CORS Errors**
   - Update `CORS_ORIGIN` in `.env`
   - Add your domain to allowed origins

### Logs

Check logs in `logs/` directory for detailed error information.

## 📄 License

MIT License - see LICENSE file for details. 