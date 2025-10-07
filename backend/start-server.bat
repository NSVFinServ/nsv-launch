@echo off
echo Starting NSV Backend Server...
echo.

REM Check if port 5000 is in use
netstat -ano | findstr :5000 >nul
if %errorlevel% == 0 (
    echo Port 5000 is already in use. Killing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
)

echo Starting server on port 5000...
npm start
