/**
 * Test script for Python ML integration
 */

const { processReturnWithML } = require('./lib/mlPredictionService');

async function testPythonML() {
  console.log('Testing Python ML Integration...\n');

  // Test case 1: New return with no history
  console.log('=== Test 1: New User Return ===');
  const newReturn1 = {
    reason: 'defective',
    description: 'The product arrived broken and does not work',
    price: 49.99,
    imageUrl: 'http://example.com/image.jpg',
    orderId: 'order123',
    productId: 'prod456'
  };

  try {
    const result1 = await processReturnWithML(newReturn1, 'user123');
    console.log('Result:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test case 2: Suspicious return
  console.log('\n=== Test 2: Suspicious Return ===');
  const newReturn2 = {
    reason: 'wrong_color',
    description: 'broken',
    price: 299.99,
    imageUrl: '',
    orderId: 'order789',
    productId: 'prod012'
  };

  try {
    const result2 = await processReturnWithML(newReturn2, 'user456');
    console.log('Result:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n✅ Python ML integration testing completed!');
  console.log('\nExpected Output Format:');
  console.log(`{
  "risk_score": 0.42,
  "risk_level": "HIGH", 
  "prediction": "FRAUD",
  "confidence": 0.58
}`);
}

// Run the test
testPythonML().catch(console.error);
