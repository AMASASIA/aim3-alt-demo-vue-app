@echo off
echo ==========================================
echo   AIM3 SYSTEM HEALTH & BALANCE CHECK
echo ==========================================
node scripts/balance-check.cjs
echo.
echo Press any key to exit...
pause > nul
