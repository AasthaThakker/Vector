#!/bin/bash

# Simple AI Validation Test Script
# This script tests the AI validation system using curl commands

echo "🤖 AI Validation Test Script"
echo "============================"

# Check if server is running
echo "1. Checking if development server is running..."
if curl -s http://localhost:3000/api/test-ai > /dev/null 2>&1; then
    echo "✅ Development server is running"
else
    echo "❌ Development server is not running"
    echo "Please start it with: npm run dev"
    exit 1
fi

# Test basic Gemini connectivity
echo ""
echo "2. Testing Gemini API connectivity..."
HEALTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/test-ai)
HEALTH_SUCCESS=$(echo "$HEALTH_RESPONSE" | grep -o '"success":true')

if [ -n "$HEALTH_SUCCESS" ]; then
    echo "✅ Gemini API is working"
    echo "   Response: $(echo "$HEALTH_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Gemini API test failed"
    echo "   Response: $HEALTH_RESPONSE"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if GEMINI_API_KEY is set in .env.local"
    echo "   2. Verify the API key is valid"
    echo "   3. Check network connection"
    exit 1
fi

# Run full AI validation tests
echo ""
echo "3. Running AI validation tests..."
TEST_RESPONSE=$(curl -s http://localhost:3000/api/test-ai)
TEST_SUCCESS=$(echo "$TEST_RESPONSE" | grep -o '"success":true')

if [ -n "$TEST_SUCCESS" ]; then
    echo "✅ AI validation tests completed"
    
    # Extract test results
    TOTAL_TESTS=$(echo "$TEST_RESPONSE" | grep -o '"totalTests":[0-9]*' | cut -d':' -f2)
    PASSED_TESTS=$(echo "$TEST_RESPONSE" | grep -o '"passedTests":[0-9]*' | cut -d':' -f2)
    SUCCESS_RATE=$(echo "$TEST_RESPONSE" | grep -o '"successRate":"[^"]*"' | cut -d'"' -f4)
    
    echo "   📊 Results: $PASSED_TESTS/$TOTAL_TESTS tests passed ($SUCCESS_RATE)"
    
    if [ "$PASSED_TESTS" -eq "$TOTAL_TESTS" ]; then
        echo "   🎉 All tests passed! AI validation is working correctly."
    else
        echo "   ⚠️  Some tests failed. Check the detailed results below."
        echo ""
        echo "📋 Detailed Results:"
        echo "$TEST_RESPONSE" | grep -o '"name":"[^"]*","description":"[^"]*","status":"[^"]*","passed":[^,]*' | while read -r line; do
            NAME=$(echo "$line" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
            STATUS=$(echo "$line" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            PASSED=$(echo "$line" | grep -o '"passed":[^,]*' | cut -d':' -f2)
            
            if [ "$PASSED" = "true" ]; then
                echo "   ✅ $NAME - $STATUS"
            else
                echo "   ❌ $NAME - $STATUS"
            fi
        done
    fi
else
    echo "❌ AI validation tests failed"
    echo "   Response: $TEST_RESPONSE"
fi

echo ""
echo "4. Testing image fetching..."
TEST_IMAGE="https://picsum.photos/seed/test/400/300.jpg"
if curl -s -f "$TEST_IMAGE" > /dev/null 2>&1; then
    echo "✅ Image fetching works"
else
    echo "❌ Image fetching failed"
    echo "   This might affect AI validation performance"
fi

echo ""
echo "🎯 Test Summary"
echo "============="
echo "If all tests passed, your AI validation system is ready!"
echo ""
echo "Next steps:"
echo "1. Test with real return submissions in your app"
echo "2. Monitor the browser console and server logs"
echo "3. Check MongoDB for validation results"
echo ""
echo "For manual testing, create a return with an image and description,"
echo "then check the return's validationStatus and aiAnalysisResult fields."
