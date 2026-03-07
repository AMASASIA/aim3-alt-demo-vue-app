@echo off
setlocal

:: Get ISO-like timestamp for folder name (YYYYMMDD_HHMMSS)
for /f "tokens=2 delims==" %%i in ('wmic OS Get localdatetime /value') do set datetime=%%i
set timestamp=%datetime:~0,8%_%datetime:~8,6%
set backup_dir=backups\%timestamp%

echo [SAFETY] Creating checkpoint: %timestamp%
mkdir %backup_dir%

:: Back up key source and config directories
echo [SAFETY] Copying src...
robocopy src %backup_dir%\src /E /NJH /NJS /NDL /NC /NS > nul
echo [SAFETY] Copying backend...
robocopy backend %backup_dir%\backend /E /NJH /NJS /NDL /NC /NS > nul
echo [SAFETY] Copying scripts...
robocopy scripts %backup_dir%\scripts /E /NJH /NJS /NDL /NC /NS > nul
echo [SAFETY] Copying contracts...
robocopy contracts %backup_dir%\contracts /E /NJH /NJS /NDL /NC /NS > nul
echo [SAFETY] Copying memory_engine...
if exist memory_engine robocopy memory_engine %backup_dir%\memory_engine /E /NJH /NJS /NDL /NC /NS > nul

:: Back up specific root files
copy .env %backup_dir%\.env > nul
copy package.json %backup_dir%\package.json > nul
copy vite.config.js %backup_dir%\vite.config.js > nul
copy main.py %backup_dir%\main.py > nul
copy amane_safety.py %backup_dir%\amane_safety.py > nul
copy socratic_broadcaster.py %backup_dir%\socratic_broadcaster.py > nul

:: Save record of latest
echo %timestamp% > backups\latest.txt

echo [SUCCESS] Checkpoint saved: %backup_dir%
echo [INFO] Run 'safe_restore.bat' to revert everything from this point.
pause
