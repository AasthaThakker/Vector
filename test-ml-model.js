/**
 * Test script for the new local ML prediction service
 */

const { predictWithLocalModel } = require('./lib/mlPredictionService');

async function testMLModel() {
  console.log('Testing Local ML Model...\n');

  // Test cases
  const testCases = [
    {
      name: 'Valid wrong_color case',
      reason: 'wrong_color',
      description: 'The color I received is completely different from what was shown in the picture',
      userHistory: []
    },
    {
      name: 'Invalid wrong_color case',
      reason: 'wrong_color',
      description: 'The item is broken and doesn\'t work at all',
      userHistory: []
    },
    {
      name: 'Valid defective case',
      reason: 'defective',
      description: 'The product arrived broken and doesn\'t turn on',
      userHistory: []
    },
    {
      name: 'Suspicious short description',
      reason: 'defective',
      description: 'broken',
      userHistory: []
    },
    {
      name: 'User with high return history',
      reason: 'wrong_size',
      description: 'This is too tight for me',
      userHistory: [
        { status: 'approved' },
        { status: 'rejected' },
        { status: 'approved' },
        { status: 'rejected' },
        { status: 'rejected' }
      ]
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`Reason: ${testCase.reason}`);
    console.log(`Description: ${testCase.description}`);
    
    try {
      const result = await predictWithLocalModel(
        testCase.reason,
        testCase.description,
        testCase.userHistory
      );
      
      console.log('\nPrediction Result:');
      console.log(`✅ Match: ${result.match}`);
      console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`🚨 Fraud Score: ${(result.fraudScore * 100).toFixed(1)}%`);
      console.log(`⚠️  Risk Level: ${result.riskLevel}`);
      console.log(`📝 Reason: ${result.reason}`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n✅ ML Model testing completed!');
}

// Run the test
testMLModel().catch(console.error);
