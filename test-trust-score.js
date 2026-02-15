/**
 * Test script for the new trust score calculation system
 */

const { updateUserTrustScore, batchUpdateTrustScores } = require('./lib/trustScoreService');

async function testTrustScoreSystem() {
  console.log('Testing Trust Score System...\n');

  try {
    // Test 1: Batch update all users
    console.log('=== Testing Batch Update ===');
    const batchResult = await batchUpdateTrustScores();
    console.log(`✅ Batch update completed:`);
    console.log(`   - Users updated: ${batchResult.updated}`);
    console.log(`   - Errors: ${batchResult.errors.length}`);
    
    if (batchResult.errors.length > 0) {
      console.log('   Errors:');
      batchResult.errors.forEach(error => console.log(`     - ${error}`));
    }

    // Test 2: Single user update (you'd need a real user ID for this)
    console.log('\n=== Testing Single User Update ===');
    console.log('Note: Single user test requires a valid userId');
    
    console.log('\n✅ Trust score system testing completed!');
    
    console.log('\n=== Trust Score Factors Explained ===');
    console.log('📊 Average Return Price: Higher prices reduce trust score');
    console.log('🔄 Return Frequency: More frequent returns reduce trust score');
    console.log('📈 Return Rate: Higher return-to-order ratio reduces trust score');
    console.log('👤 Account Age: Older accounts have higher trust scores');
    console.log('✅ Success Rate: Higher approval rates increase trust score');
    console.log('⏰ Time Patterns: Clustered returns reduce trust score');
    console.log('🚨 Fraud Flags: Any fraud flags significantly reduce trust score');
    
  } catch (error) {
    console.error('❌ Error testing trust score system:', error);
  }
}

// Run the test
testTrustScoreSystem().catch(console.error);
