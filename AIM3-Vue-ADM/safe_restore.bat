@echo off
setlocal

set /p latest=<backups\latest.txt
set source_dir=backups\%latest%

if "%latest%"=="" (
    echo [ERROR] No checkpoint found in backups\latest.txt.
    pause
    exit /b 1
)

echo [WARNING] Restoring from latest checkpoint: %latest%
echo [WARNING] This will OVERWRITE existing src, backend, scripts, and other root files.
echo [WARNING] All changes made after the checkpoint will be lost!
set /p confirm=Type 'YES' to confirm: 

if /i not "%confirm%"=="YES" (
    echo [ABORTED] Restoration cancelled.
    pause
    exit /b 0
)

:: Restore folders using robocopy (MIRroring)
echo [RESTORE] Restoring src...
robocopy %source_dir%\src src /MIR /NJH /NJS /NDL /NC /NS > nul
echo [RESTORE] Restoring backend...
robocopy %source_dir%\backend backend /MIR /NJH /NJS /NDL /NC /NS > nul
echo [RESTORE] Restoring scripts...
robocopy %source_dir%\scripts scripts /MIR /NJH /NJS /NDL /NC /NS > nul
echo [RESTORE] Restoring contracts...
robocopy %source_dir%\contracts contracts /MIR /NJH /NJS /NDL /NC /NS > nul
if exist %source_dir%\memory_engine (
    echo [RESTORE] Restoring memory_engine...
    robocopy %source_dir%\memory_engine memory_engine /MIR /NJH /NJS /NDL /NC /NS > nul
)

:: Restore specific root files
echo [RESTORE] Restoring root files...
copy %source_dir%\.env .env > nul
copy %source_dir%\package.json package.json > nul
copy %source_dir%\vite.config.js vite.config.js > nul
copy %source_dir%\main.py main.py > nul
copy %source_dir%\amane_safety.py amane_safety.py > nul
copy %source_dir%\socratic_broadcaster.py socratic_broadcaster.py > nul

echo [SUCCESS] System restored to: %latest%
pause
