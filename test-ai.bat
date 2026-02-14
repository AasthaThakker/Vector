@echo off
setlocal enabledelayedexpansion

echo 🤖 AI Validation Test Script
echo ============================

:: Check if server is running
echo 1. Checking if development server is running...
curl -s http://localhost:3000/api/test-ai >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Development server is running
) else (
    echo ❌ Development server is not running
    echo Please start it with: npm run dev
    pause
    exit /b 1
)

:: Test basic Gemini connectivity
echo.
echo 2. Testing Gemini API connectivity...
curl -s -X POST http://localhost:3000/api/test-ai > temp_health.json
findstr /C:"\"success\":true" temp_health.json >nul
if %errorlevel% equ 0 (
    echo ✅ Gemini API is working
    for /f "tokens=4 delims=" %%a in ('findstr /C:"\"message\"" temp_health.json') do echo    Response: %%a
) else (
    echo ❌ Gemini API test failed
    echo    Response:
    type temp_health.json
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Check if GEMINI_API_KEY is set in .env.local
    echo    2. Verify the API key is valid
    echo    3. Check network connection
    del temp_health.json
    pause
    exit /b 1
)
del temp_health.json

:: Run full AI validation tests
echo.
echo 3. Running AI validation tests...
curl -s http://localhost:3000/api/test-ai > temp_tests.json
findstr /C:"\"success\":true" temp_tests.json >nul
if %errorlevel% equ 0 (
    echo ✅ AI validation tests completed
    
    :: Extract test results (simplified for batch)
    for /f "tokens=2 delims=:" %%a in ('findstr /C:"\"totalTests\"" temp_tests.json') do set TOTAL=%%a
    for /f "tokens=2 delims=:" %%a in ('findstr /C:"\"passedTests\"" temp_tests.json') do set PASSED=%%a
    for /f "tokens=4 delims=" %%a in ('findstr /C:"\"successRate\"" temp_tests.json') do set RATE=%%a
    
    echo    📊 Results: !PASSED!/!TOTAL! tests passed (!RATE!)
    
    if !PASSED! equ !TOTAL! (
        echo    🎉 All tests passed! AI validation is working correctly.
    ) else (
        echo    ⚠️  Some tests failed. Check the detailed results below.
        echo.
        echo 📋 Detailed Results:
        echo    Check temp_tests.json for full details
    )
) else (
    echo ❌ AI validation tests failed
    echo    Response:
    type temp_tests.json
)
del temp_tests.json

echo.
echo 4. Testing image fetching...
curl -s -f "https://picsum.photos/seed/test/400/300.jpg" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Image fetching works
) else (
    echo ❌ Image fetching failed
    echo    This might affect AI validation performance
)

echo.
echo 🎯 Test Summary
echo =============
echo If all tests passed, your AI validation system is ready!
echo.
echo Next steps:
echo 1. Test with real return submissions in your app
echo 2. Monitor the browser console and server logs
echo 3. Check MongoDB for validation results
echo.
echo For manual testing, create a return with an image and description,
echo then check the return's validationStatus and aiAnalysisResult fields.

pause
