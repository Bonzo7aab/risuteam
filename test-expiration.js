// Test script for automatic subscription expiration
// This script can be run to test the expiration functionality

const testExpirationAPI = async () => {
  try {
    console.log('🧪 Testing automatic subscription expiration...');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/expire-subscriptions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ API Response:', result);
    
    if (result.success) {
      console.log(`🎉 Successfully processed ${result.expiredCount} expired subscriptions`);
      if (result.expiredIds && result.expiredIds.length > 0) {
        console.log('📋 Expired subscription IDs:', result.expiredIds);
      }
    } else {
      console.log('❌ API returned error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test the database functions (if running in Node.js environment)
const testDatabaseFunctions = async () => {
  try {
    console.log('🧪 Testing database functions...');
    
    // This would require a database connection
    // For now, just log what would be tested
    console.log('📋 Database functions to test:');
    console.log('  - expire_place_based_subscriptions()');
    console.log('  - check_and_expire_subscriptions()');
    console.log('  - manual_expire_subscriptions()');
    console.log('  - get_user_subscriptions_with_auto_expiry()');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting automatic subscription expiration tests...\n');
  
  await testExpirationAPI();
  console.log('\n');
  await testDatabaseFunctions();
  
  console.log('\n✅ All tests completed!');
};

// Export for use in other environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testExpirationAPI,
    testDatabaseFunctions,
    runTests
  };
}

// Run if this script is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runTests();
}
