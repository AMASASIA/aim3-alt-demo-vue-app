@echo off
setlocal

echo.
echo ========================================
echo AIM3 - Cloud Run Deployment Automator
echo ========================================
echo.

REM --- CONFIGURATION ---
REM Auto-detect project ID if possible
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set DETECTED_PROJECT=%%i
set PROJECT_ID=%DETECTED_PROJECT%
if "%PROJECT_ID%"=="" set PROJECT_ID=aim3-vue-adm

set SERVICE_NAME=aim3-portal
set REGION=us-central1
REM Alternative: us-west1 (common for other services in this project)
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo Configuration:
echo   Project ID:  %PROJECT_ID%
echo   Service:     %SERVICE_NAME%
echo   Region:      %REGION%
echo   Image:       %IMAGE_NAME%
echo.

echo [1/4] Configuring Google Cloud...
call gcloud config set project %PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Failed to set project. Please login via: gcloud auth login
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Building Container Image with Cloud Build...
echo (This is faster than local Docker build)
call gcloud builds submit --tag %IMAGE_NAME% .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Cloud Build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Deploying to Cloud Run...
call gcloud run deploy %SERVICE_NAME% ^
  --image %IMAGE_NAME% ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --cpu 1 ^
  --port 8080 ^
  --set-env-vars NODE_ENV=production

if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Deployment failed.
    pause
    exit /b 1
)

echo.
echo [4/4] Finalizing Deployment...
echo.
echo ========================================
echo ✅ DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.

REM Fetch service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region %REGION% --format="value(status.url)" 2^>nul') do set SERVICE_URL=%%i

echo Service URL: %SERVICE_URL%
echo.
echo ----------------------------------------
echo 🛠️  Next Steps:
echo ----------------------------------------
echo 1. Add this URL to Firebase Authorized Domains:
echo    %SERVICE_URL%
echo    (Path: Firebase Console > Auth > Settings > Authorized Domains)
echo.
echo 2. Verify the application in your browser.
echo ----------------------------------------
echo.

pause
