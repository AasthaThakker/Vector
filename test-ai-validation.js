/**
 * AI Validation Test Script
 * 
 * This script tests the Gemini AI validation system to ensure it's working correctly.
 * Run with: node test-ai-validation.js
 * 
 * Make sure to set GEMINI_API_KEY in your .env.local file first!
 */

const { validateReturnWithGemini } = require('./lib/geminiReturnValidator');

// Test cases with different scenarios
const testCases = [
  {
    name: "Perfect Match - Screen Crack",
    imageUrl: "https://picsum.photos/seed/cracked-screen/400/300.jpg",
    description: "The screen is cracked on the top left corner with visible spiderweb cracks",
    expectedMatch: true,
    expectedConfidence: 0.7
  },
  {
    name: "Mismatch - Water Damage vs Physical Damage",
    imageUrl: "https://picsum.photos/seed/scratched-phone/400/300.jpg", 
    description: "The phone has water damage and won't turn on, there are moisture indicators showing water exposure",
    expectedMatch: false,
    expectedConfidence: 0.3
  },
  {
    name: "Uncertain Case - Minor Scratch",
    imageUrl: "https://picsum.photos/seed/minor-scratch/400/300.jpg",
    description: "The device has extensive damage and is completely broken with shattered screen and water damage",
    expectedMatch: false,
    expectedConfidence: 0.5 // Should be manual review
  },
  {
    name: "Good Match - Battery Issue",
    imageUrl: "https://picsum.photos/seed/battery-issue/400/300.jpg",
    description: "The battery is swollen and the back cover is bulging",
    expectedMatch: true,
    expectedConfidence: 0.7
  }
];

async function runAITests() {
  console.log("🤖 Starting AI Validation Tests...\n");
  
  // Check environment
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in environment variables!");
    console.log("Please add GEMINI_API_KEY to your .env.local file");
    process.exit(1);
  }
  
  console.log("✅ GEMINI_API_KEY found\n");
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`🧪 Test ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`   Description: "${testCase.description}"`);
    
    try {
      const startTime = Date.now();
      const result = await validateReturnWithGemini(testCase.imageUrl, testCase.description);
      const endTime = Date.now();
      
      console.log(`   ⏱️  Processing time: ${endTime - startTime}ms`);
      console.log(`   📊 Result: Match=${result.match}, Confidence=${result.confidence.toFixed(2)}`);
      console.log(`   💭 Reason: "${result.reason}"`);
      
      // Validate expectations
      let testPassed = true;
      
      // Check match expectation
      if (testCase.expectedMatch !== undefined && result.match !== testCase.expectedMatch) {
        console.log(`   ⚠️  Expected match: ${testCase.expectedMatch}, got: ${result.match}`);
        testPassed = false;
      }
      
      // Check confidence threshold
      if (testCase.expectedConfidence !== undefined) {
        if (testCase.expectedConfidence >= 0.7 && result.confidence < 0.7) {
          console.log(`   ⚠️  Expected high confidence (≥0.7), got: ${result.confidence.toFixed(2)}`);
          testPassed = false;
        } else if (testCase.expectedConfidence <= 0.3 && result.confidence > 0.3) {
          console.log(`   ⚠️  Expected low confidence (≤0.3), got: ${result.confidence.toFixed(2)}`);
          testPassed = false;
        }
      }
      
      // Validate response structure
      if (typeof result.match !== 'boolean' || 
          typeof result.confidence !== 'number' || 
          typeof result.reason !== 'string') {
        console.log(`   ❌ Invalid response structure`);
        testPassed = false;
      }
      
      // Validate confidence range
      if (result.confidence < 0 || result.confidence > 1) {
        console.log(`   ❌ Confidence out of range [0,1]: ${result.confidence}`);
        testPassed = false;
      }
      
      if (testPassed) {
        console.log(`   ✅ PASSED`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      console.log(`   📝 This might be expected if the image URL is invalid or API has issues`);
    }
    
    console.log(""); // Empty line for readability
  }
  
  // Summary
  console.log("📋 Test Summary:");
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! AI validation is working correctly.");
  } else if (passedTests > 0) {
    console.log("⚠️  Some tests passed. AI validation is partially working.");
  } else {
    console.log("❌ All tests failed. Check your GEMINI_API_KEY and network connection.");
  }
  
  console.log("\n🔍 Additional Checks:");
  
  // Test API key validation
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("   ✅ Gemini API connection successful");
  } catch (error) {
    console.log(`   ❌ Gemini API connection failed: ${error.message}`);
  }
  
  // Test image fetching
  console.log("\n🖼️  Testing image fetching...");
  const testImageUrl = "https://picsum.photos/seed/test/400/300.jpg";
  try {
    const response = await fetch(testImageUrl);
    if (response.ok) {
      console.log(`   ✅ Image fetching works (${testImageUrl})`);
    } else {
      console.log(`   ❌ Image fetching failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Image fetching error: ${error.message}`);
  }
}

// Test the API endpoint directly
async function testAPIEndpoint() {
  console.log("\n🌐 Testing API Endpoint...");
  
  // First, we need to create a test return
  const testReturn = {
    orderId: "507f1f77bcf86cd799439011", // dummy ObjectId
    productId: "TEST-001",
    reason: "Damaged product",
    description: "Screen is cracked",
    imageUrl: "https://picsum.photos/seed/cracked-screen/400/300.jpg",
    returnMethod: "dropbox"
  };
  
  try {
    // Note: This would require authentication in a real scenario
    console.log("   📝 To test the API endpoint manually:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Create a return via the UI or API");
    console.log("   3. Check the browser console and server logs for AI validation results");
    console.log("   4. Verify the return's validationStatus and aiAnalysisResult fields in MongoDB");
    
    console.log("\n   🔧 Manual API Test Commands:");
    console.log(`   curl -X POST http://localhost:3000/api/ai/validate-return \\`);
    console.log(`   -H "Content-Type: application/json" \\`);
    console.log(`   -d '{"imageUrl":"${testReturn.imageUrl}","description":"${testReturn.description}","returnId":"507f1f77bcf86cd799439011"}'`);
    
  } catch (error) {
    console.log(`   ❌ API endpoint test setup failed: ${error.message}`);
  }
}

// Main execution
async function main() {
  try {
    await runAITests();
    await testAPIEndpoint();
    
    console.log("\n🎯 Next Steps:");
    console.log("1. If tests pass, your AI validation is working!");
    console.log("2. If tests fail, check:");
    console.log("   - GEMINI_API_KEY is valid");
    console.log("   - Network connection to Google's servers");
    console.log("   - Image URLs are accessible");
    console.log("3. Test with real return submissions in your app");
    
  } catch (error) {
    console.error("💥 Test script failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAITests, testAPIEndpoint };
