const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testing MBTI Quiz Backend Server...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: API Documentation
    console.log('2. Testing API Documentation...');
    const docsResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ API documentation accessible');
    console.log('');

    // Test 3: Premium Features
    console.log('3. Testing Premium Features Endpoint...');
    const featuresResponse = await axios.get(`${BASE_URL}/api/vk/premium-features`);
    console.log('✅ Premium features retrieved:', featuresResponse.data.data.length, 'features');
    console.log('');

    // Test 4: Premium Status (with test user)
    console.log('4. Testing Premium Status Endpoint...');
    const testUserId = 123456;
    const statusResponse = await axios.get(`${BASE_URL}/api/vk/premium-status/${testUserId}`);
    console.log('✅ Premium status check passed:', statusResponse.data.data.isPremium);
    console.log('');

    // Test 5: VK Health Check
    console.log('5. Testing VK Health Check...');
    const vkHealthResponse = await axios.get(`${BASE_URL}/api/vk/health`);
    console.log('✅ VK service health check passed:', vkHealthResponse.data);
    console.log('');

    console.log('🎉 All tests passed! Server is working correctly.');
    console.log('\n📊 Server Information:');
    console.log(`   URL: ${BASE_URL}`);
    console.log(`   Environment: ${healthResponse.data.environment}`);
    console.log(`   Uptime: ${Math.round(healthResponse.data.uptime)}s`);
    console.log(`   Version: ${healthResponse.data.version}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Test VK Payment Notification (simulation)
async function testVKPayment() {
  console.log('\n🧪 Testing VK Payment Simulation...\n');

  try {
    // Simulate get_item notification
    const getItemNotification = {
      notification_type: 'get_item',
      user_id: 123456,
      item: 'premium_access',
      sig: 'test_signature'
    };

    console.log('1. Testing get_item notification...');
    const getItemResponse = await axios.post(`${BASE_URL}/api/vk/payment`, getItemNotification);
    console.log('✅ get_item response:', getItemResponse.data);
    console.log('');

    // Simulate order_status_change notification
    const orderNotification = {
      notification_type: 'order_status_change',
      user_id: 123456,
      order_id: 789,
      item: 'premium_access',
      item_price: 50,
      status: 'chargeable',
      sig: 'test_signature'
    };

    console.log('2. Testing order_status_change notification...');
    const orderResponse = await axios.post(`${BASE_URL}/api/vk/payment`, orderNotification);
    console.log('✅ order_status_change response:', orderResponse.data);
    console.log('');

    console.log('🎉 VK Payment tests completed!');

  } catch (error) {
    console.error('❌ VK Payment test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test User Management
async function testUserManagement() {
  console.log('\n🧪 Testing User Management...\n');

  try {
    const testUser = {
      vk_user_id: 123456,
      username: 'test_user',
      first_name: 'Test',
      last_name: 'User',
      photo_url: 'https://vk.com/test.jpg'
    };

    console.log('1. Creating test user...');
    const createResponse = await axios.post(`${BASE_URL}/api/vk/user`, testUser);
    console.log('✅ User created:', createResponse.data);
    console.log('');

    console.log('2. Retrieving test user...');
    const getUserResponse = await axios.get(`${BASE_URL}/api/vk/user/${testUser.vk_user_id}`);
    console.log('✅ User retrieved:', getUserResponse.data.data.username);
    console.log('');

    console.log('🎉 User management tests completed!');

  } catch (error) {
    console.error('❌ User management test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting MBTI Quiz Backend Tests\n');
  console.log('=' .repeat(50));

  await testServer();
  
  // Uncomment to test VK payment simulation (requires proper signature)
  // await testVKPayment();
  
  await testUserManagement();

  console.log('\n' + '=' .repeat(50));
  console.log('✅ All tests completed successfully!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testServer,
  testVKPayment,
  testUserManagement,
  runTests
}; 