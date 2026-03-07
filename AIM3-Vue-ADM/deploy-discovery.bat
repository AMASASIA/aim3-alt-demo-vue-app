@echo off
REM AIM3 AI Discovery Engine - Deployment Script (Windows)
REM This script deploys the Cloud Function for Instagram/Threads needs extraction

echo.
echo ========================================
echo AIM3 AI Discovery Engine - Deployment
echo ========================================
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: gcloud CLI is not installed
    echo Please install: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Get project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo Error: No project set
    echo Please run: gcloud config set project YOUR_PROJECT_ID
    pause
    exit /b 1
)

echo Project: %PROJECT_ID%
echo.

REM Navigate to function directory
cd backend\functions\discovery
if %ERRORLEVEL% NEQ 0 (
    echo Error: Could not find backend/functions/discovery directory
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

echo.
echo Deploying Cloud Function...
echo    Function: extractInsights
echo    Runtime: nodejs20
echo    Region: us-central1
echo.

gcloud functions deploy extractInsights ^
  --runtime nodejs20 ^
  --trigger-http ^
  --allow-unauthenticated ^
  --region us-central1 ^
  --set-env-vars GOOGLE_CLOUD_PROJECT=%PROJECT_ID% ^
  --memory 512MB ^
  --timeout 60s

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Deployment successful!
    echo ========================================
    echo.
    echo Function URL:
    gcloud functions describe extractInsights --region us-central1 --format="value(httpsTrigger.url)"
    echo.
    echo Next steps:
    echo 1. Copy the Function URL above
    echo 2. Update .env file:
    echo    VITE_DISCOVERY_FUNCTION_URL=^<Function URL^>
    echo 3. Restart your dev server: npm run dev
    echo.
) else (
    echo.
    echo Deployment failed
    echo Please check the error messages above
    pause
    exit /b 1
)

cd ..\..\..
pause
