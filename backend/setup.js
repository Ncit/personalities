#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 MBTI Quiz Backend Setup\n');
  console.log('This script will help you configure your backend server.\n');

  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📋 Server Configuration:');
  const port = await question('Port (default: 3000): ') || '3000';
  const nodeEnv = await question('Environment (development/production, default: development): ') || 'development';

  console.log('\n🗄️  Database Configuration:');
  const dbHost = await question('Database host (default: localhost): ') || 'localhost';
  const dbPort = await question('Database port (default: 3306): ') || '3306';
  const dbName = await question('Database name (default: mbti_quiz_db): ') || 'mbti_quiz_db';
  const dbUser = await question('Database user (default: root): ') || 'root';
  const dbPassword = await question('Database password: ');

  console.log('\n🔑 VK API Configuration:');
  const vkAppId = await question('VK App ID: ');
  const vkSecureKey = await question('VK Secure Key: ');
  const vkApiVersion = await question('VK API Version (default: 5.131): ') || '5.131';

  console.log('\n🌐 Security Configuration:');
  const corsOrigin = await question('CORS Origin (e.g., https://your-domain.com): ');
  const premiumPrice = await question('Premium price in RUB (default: 50): ') || '50';
  const premiumDuration = await question('Premium duration in days (default: 30): ') || '30';

  console.log('\n📝 Logging Configuration:');
  const logLevel = await question('Log level (error/warn/info/debug, default: info): ') || 'info';

  // Generate .env content
  const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# Database Configuration
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DB_PORT=${dbPort}

# VK API Configuration
VK_APP_ID=${vkAppId}
VK_SECURE_KEY=${vkSecureKey}
VK_API_VERSION=${vkApiVersion}

# JWT Configuration
JWT_SECRET=${generateRandomString(32)}
JWT_EXPIRES_IN=7d

# Security
CORS_ORIGIN=${corsOrigin}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=${logLevel}
LOG_FILE_PATH=./logs/app.log

# Premium Features Configuration
PREMIUM_PRICE=${premiumPrice}
PREMIUM_DURATION_DAYS=${premiumDuration}
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Configuration saved to .env file');

  // Create logs directory
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ Created logs directory');
  }

  // Create database init directory
  const dbInitDir = path.join(__dirname, 'database', 'init');
  if (!fs.existsSync(dbInitDir)) {
    fs.mkdirSync(dbInitDir, { recursive: true });
    console.log('✅ Created database init directory');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Create MySQL database:');
  console.log(`   CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log('');
  console.log('2. Install dependencies:');
  console.log('   npm install');
  console.log('');
  console.log('3. Start the server:');
  console.log('   npm run dev  # for development');
  console.log('   npm start    # for production');
  console.log('');
  console.log('4. Test the server:');
  console.log('   npm run test:server');
  console.log('');
  console.log('5. Configure VK App:');
  console.log(`   - Set notification URL to: ${corsOrigin}/api/vk/payment`);
  console.log('   - Add your domain to allowed origins');
  console.log('');

  rl.close();
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run setup if this file is executed directly
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup }; 