/**
 * Test Script for Stripe Checkout Integration
 * 
 * This script tests the new checkout-based upgrade flow
 * Run with: node test-checkout-integration.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_TOKEN = 'your-test-user-token'; // Replace with actual test token
const TEST_PLAN_ID = 'standard_monthly_individual'; // Replace with actual plan ID

// Test scenarios
const testScenarios = [
  {
    name: 'Preview Upgrade (Trial)',
    endpoint: '/subscription/preview-upgrade',
    method: 'GET',
    params: { identifier: TEST_PLAN_ID },
    expectedFields: ['success', 'type', 'invoice', 'checkoutRequired']
  },
  {
    name: 'Create Upgrade Checkout (Trial)',
    endpoint: '/subscription/create-upgrade-checkout',
    method: 'POST',
    data: { identifier: TEST_PLAN_ID },
    expectedFields: ['success', 'checkoutUrl', 'type', 'message']
  }
];

async function runTest(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📍 Endpoint: ${testCase.method} ${testCase.endpoint}`);
    
    const config = {
      method: testCase.method,
      url: `${BASE_URL}${testCase.endpoint}`,
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (testCase.method === 'GET' && testCase.params) {
      config.params = testCase.params;
    } else if (testCase.method === 'POST' && testCase.data) {
      config.data = testCase.data;
    }

    const response = await axios(config);
    
    console.log('✅ Response received');
    console.log('📊 Status:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
    // Validate expected fields
    const missingFields = testCase.expectedFields.filter(field => !(field in response.data));
    if (missingFields.length > 0) {
      console.log('❌ Missing expected fields:', missingFields);
      return false;
    }
    
    // Validate checkout URL format (for checkout endpoints)
    if (testCase.endpoint.includes('checkout') && response.data.checkoutUrl) {
      if (!response.data.checkoutUrl.startsWith('https://checkout.stripe.com/')) {
        console.log('❌ Invalid checkout URL format');
        return false;
      }
    }
    
    console.log('✅ Test passed');
    return true;
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log('📄 Error response:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Stripe Checkout Integration Tests');
  console.log('=' .repeat(50));
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (const testCase of testScenarios) {
    const passed = await runTest(testCase);
    if (passed) passedTests++;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Checkout integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
}

// Manual test functions
async function testPreviewUpgrade() {
  console.log('\n🔍 Testing Preview Upgrade...');
  try {
    const response = await axios.get(`${BASE_URL}/subscription/preview-upgrade`, {
      params: { identifier: TEST_PLAN_ID },
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`
      }
    });
    
    console.log('Preview Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.invoice?.checkoutRequired) {
      console.log('✅ Checkout required flag is set correctly');
    } else {
      console.log('⚠️ Checkout required flag not set');
    }
    
  } catch (error) {
    console.log('❌ Preview test failed:', error.response?.data || error.message);
  }
}

async function testCreateCheckout() {
  console.log('\n🔍 Testing Create Checkout...');
  try {
    const response = await axios.post(`${BASE_URL}/subscription/create-upgrade-checkout`, {
      identifier: TEST_PLAN_ID
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Checkout Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.checkoutUrl) {
      console.log('✅ Checkout URL generated successfully');
      console.log('🔗 URL:', response.data.checkoutUrl);
    } else {
      console.log('❌ No checkout URL in response');
    }
    
  } catch (error) {
    console.log('❌ Checkout test failed:', error.response?.data || error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('📋 Test Configuration:');
  console.log('   Base URL:', BASE_URL);
  console.log('   Test Plan ID:', TEST_PLAN_ID);
  console.log('   User Token:', TEST_USER_TOKEN ? 'Set' : 'Not set');
  
  if (!TEST_USER_TOKEN || TEST_USER_TOKEN === 'your-test-user-token') {
    console.log('\n⚠️ Please set a valid TEST_USER_TOKEN before running tests');
    console.log('   You can get a test token by logging in through your frontend');
    process.exit(1);
  }
  
  // Run individual tests for debugging
  if (process.argv.includes('--preview')) {
    testPreviewUpgrade();
  } else if (process.argv.includes('--checkout')) {
    testCreateCheckout();
  } else {
    // Run all tests
    runAllTests();
  }
}

module.exports = {
  runAllTests,
  testPreviewUpgrade,
  testCreateCheckout
};
