@echo off
echo ==============================================
echo   AMAS / VISION COMMERCE - Local Env Launcher
echo ==============================================
echo.
echo [1/3] Installing Dependencies...
call npm install
echo.
echo [2/3] Building Vision Frontend...
call npm run build
echo.
echo [3/3] Starting Full-Stack Server...
echo.
echo   > App running at: http://localhost:3000
echo   > Opening browser...
start http://localhost:3000
call npm run server
pause
