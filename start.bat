@echo off
setlocal

set "APP_DIR=%~dp0web"
set "PORT=4000"
set "URL=http://localhost:%PORT%"

echo ============================================
echo  RavenDB CDC Demo - starting web app
echo ============================================

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js was not found on PATH. Install it from https://nodejs.org and try again.
    goto :end
)

rem --- Stop any process already listening on the app port ---
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    echo Stopping existing process on port %PORT% - PID %%P
    taskkill /F /PID %%P >nul 2>&1
)

rem --- Install dependencies on first run ---
if not exist "%APP_DIR%\node_modules" (
    echo Installing dependencies, first run only...
    pushd "%APP_DIR%"
    call npm install
    popd
)

rem --- Open the browser once the server responds ---
start "" /B powershell -NoProfile -Command ^
    "$ok = $false; for ($i = 0; $i -lt 30 -and -not $ok; $i++) { try { Invoke-WebRequest -UseBasicParsing -Uri '%URL%/api/health' -TimeoutSec 1 | Out-Null; $ok = $true } catch { Start-Sleep -Milliseconds 500 } }; if ($ok) { Start-Process '%URL%' }"

echo.
echo Starting Node server on %URL% ...
echo Logs will appear below. Press Ctrl+C to stop (you will be asked to confirm).
echo.

pushd "%APP_DIR%"
node server.js
popd

echo.
echo Server stopped.

:end
endlocal
