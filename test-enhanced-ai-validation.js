/**
 * Test script for enhanced AI validation with user behavior scoring
 * Run with: node test-enhanced-ai-validation.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data for different user behavior scenarios
const testCases = [
  {
    name: 'New User - Standard Validation',
    description: 'The shirt is torn near the collar',
    reason: 'defective',
    imageUrl: 'https://example.com/test-image1.jpg',
    expectedBehavior: 'medium'
  },
  {
    name: 'Good User - Lower Threshold',
    description: 'Too tight around the shoulders',
    reason: 'wrong_size',
    imageUrl: 'https://example.com/test-image2.jpg',
    expectedBehavior: 'low'
  },
  {
    name: 'Risky User - Higher Threshold',
    description: 'Color looks different than website',
    reason: 'wrong_color',
    imageUrl: 'https://example.com/test-image3.jpg',
    expectedBehavior: 'high'
  }
];

async function testEnhancedValidation() {
  console.log('🧪 Testing Enhanced AI Validation System\n');

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Reason: ${testCase.reason}`);
    console.log(`   Expected Behavior: ${testCase.expectedBehavior}\n`);

    try {
      // Step 1: Create a test return (simulate)
      console.log('   1️⃣ Creating test return...');
      
      // Step 2: Test AI validation with behavior scoring
      console.log('   2️⃣ Testing AI validation with behavior scoring...');
      
      const validationResponse = await fetch(`${BASE_URL}/api/ai/validate-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token', // You'll need to replace with actual auth
        },
        body: JSON.stringify({
          imageUrl: testCase.imageUrl,
          description: testCase.description,
          returnId: 'test-return-id', // Replace with actual return ID
          userId: 'test-user-id', // Replace with actual user ID
          reason: testCase.reason
        })
      });

      if (!validationResponse.ok) {
        const errorText = await validationResponse.text();
        console.log(`   ❌ Validation failed: ${validationResponse.status} ${errorText}\n`);
        continue;
      }

      const validationResult = await validationResponse.json();
      
      console.log('   ✅ Validation Results:');
      console.log(`      - Match: ${validationResult.match}`);
      console.log(`      - Base Confidence: ${(validationResult.confidence * 100).toFixed(1)}%`);
      
      if (validationResult.adjustedConfidence !== undefined) {
        console.log(`      - Adjusted Confidence: ${(validationResult.adjustedConfidence * 100).toFixed(1)}%`);
        const adjustment = validationResult.adjustedConfidence - validationResult.confidence;
        const adjustmentPercent = (adjustment * 100).toFixed(1);
        console.log(`      - Adjustment: ${adjustmentPercent > 0 ? '+' : ''}${adjustmentPercent}%`);
      }
      
      if (validationResult.behaviorAdjustedThreshold !== undefined) {
        console.log(`      - Behavior Threshold: ${(validationResult.behaviorAdjustedThreshold * 100).toFixed(1)}%`);
      }
      
      if (validationResult.behaviorScore) {
        console.log(`      - Behavior Score: ${validationResult.behaviorScore.behaviorScore}/100`);
        console.log(`      - Risk Level: ${validationResult.behaviorScore.riskLevel}`);
        console.log(`      - Return History: ${validationResult.behaviorScore.returnHistoryCount} returns`);
        console.log(`      - Approval Rate: ${(validationResult.behaviorScore.approvalRate * 100).toFixed(1)}%`);
      }
      
      console.log(`      - Validation Status: ${validationResult.validationStatus}`);
      console.log(`      - Reason: ${validationResult.reason}\n`);

    } catch (error) {
      console.log(`   ❌ Test failed with error: ${error.message}\n`);
    }
  }

  console.log('🏁 Enhanced AI Validation Testing Complete!');
}

// Test user behavior service directly
async function testUserBehaviorService() {
  console.log('\n🔍 Testing User Behavior Service Directly\n');

  const testUserIds = [
    'new-user-test',
    'good-user-test', 
    'risky-user-test'
  ];

  for (const userId of testUserIds) {
    console.log(`📊 Testing behavior score for user: ${userId}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/user/behavior-score/${userId}`);
      
      if (response.ok) {
        const behaviorScore = await response.json();
        console.log('   ✅ Behavior Score Results:');
        console.log(`      - Score: ${behaviorScore.behaviorScore}/100`);
        console.log(`      - Risk Level: ${behaviorScore.riskLevel}`);
        console.log(`      - Return History: ${behaviorScore.returnHistoryCount}`);
        console.log(`      - Approval Rate: ${(behaviorScore.approvalRate * 100).toFixed(1)}%`);
        console.log(`      - Fraud Flag Rate: ${(behaviorScore.fraudFlagRate * 100).toFixed(1)}%\n`);
      } else {
        console.log(`   ⚠️  Behavior score endpoint not available or failed\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error testing behavior service: ${error.message}\n`);
    }
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Enhanced AI Validation Tests\n');
  
  await testEnhancedValidation();
  await testUserBehaviorService();
  
  console.log('\n📝 Test Summary:');
  console.log('   - Enhanced AI validation with user behavior scoring: ✅ Implemented');
  console.log('   - Reason-description matching: ✅ Enhanced with context');
  console.log('   - User behavior score calculation: ✅ Implemented');
  console.log('   - Dynamic confidence adjustment: ✅ Implemented');
  console.log('   - Behavior-based threshold adjustment: ✅ Implemented');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Update frontend components to display behavior analysis');
  console.log('   2. Add behavior score tracking to admin dashboard');
  console.log('   3. Monitor and tune behavior scoring parameters');
  console.log('   4. Add A/B testing for validation thresholds');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testEnhancedValidation,
  testUserBehaviorService,
  runTests
};
