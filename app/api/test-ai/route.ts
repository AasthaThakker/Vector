import { NextRequest, NextResponse } from "next/server";
import { validateReturnWithGemini } from "@/lib/geminiReturnValidator";

// Test cases for AI validation
const testCases = [
  {
    name: "Perfect Match - Screen Crack",
    imageUrl: "https://picsum.photos/seed/cracked-screen/400/300.jpg",
    description: "The screen is cracked on the top left corner with visible spiderweb cracks",
    expectedMatch: true
  },
  {
    name: "Mismatch - Water Damage vs Physical Damage",
    imageUrl: "https://picsum.photos/seed/scratched-phone/400/300.jpg", 
    description: "The phone has water damage and won't turn on, there are moisture indicators showing water exposure",
    expectedMatch: false
  },
  {
    name: "Uncertain Case - Minor Scratch",
    imageUrl: "https://picsum.photos/seed/minor-scratch/400/300.jpg",
    description: "The device has extensive damage and is completely broken with shattered screen and water damage",
    expectedMatch: false // Should be manual review due to uncertainty
  }
];

export async function GET() {
  console.log("🤖 Starting AI Validation Test...");
  
  const results = [];
  
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      error: "GEMINI_API_KEY not configured",
      message: "Please add GEMINI_API_KEY to your .env.local file",
      tests: []
    }, { status: 500 });
  }
  
  for (const testCase of testCases) {
    console.log(`🧪 Testing: ${testCase.name}`);
    
    try {
      const startTime = Date.now();
      const result = await validateReturnWithGemini(testCase.imageUrl, testCase.description);
      const endTime = Date.now();
      
      console.log(`   ⏱️  Processing time: ${endTime - startTime}ms`);
      console.log(`   📊 Result: Match=${result.match}, Confidence=${result.confidence.toFixed(2)}`);
      
      const testResult = {
        name: testCase.name,
        description: testCase.description,
        imageUrl: testCase.imageUrl,
        expectedMatch: testCase.expectedMatch,
        actualResult: result,
        processingTime: endTime - startTime,
        passed: result.match === testCase.expectedMatch,
        status: "success"
      };
      
      results.push(testResult);
      console.log(`   ✅ Result: Match=${result.match}, Confidence=${result.confidence.toFixed(2)}, Time=${endTime - startTime}ms`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${(error as Error).message}`);
      
      results.push({
        name: testCase.name,
        description: testCase.description,
        imageUrl: testCase.imageUrl,
        expectedMatch: testCase.expectedMatch,
        error: (error as Error).message,
        status: "error",
        passed: false
      });
    }
  }
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log(`📋 Summary: ${passedTests}/${totalTests} tests passed (${successRate.toFixed(1)}%)`);
  
  return NextResponse.json({
    success: true,
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: successRate.toFixed(1) + "%"
    },
    tests: results,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
}

// Simple health check endpoint
export async function POST() {
  try {
    // Test basic Gemini API connectivity
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-robotics-er-1.5-preview" });
    
    // Simple text-only test
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({
      success: true,
      message: "Gemini API is working",
      testResponse: text.substring(0, 100) + "...",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
