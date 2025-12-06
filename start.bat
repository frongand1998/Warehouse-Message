@echo off
title Warehouse Message - Desktop App

echo ========================================
echo   Warehouse Message - Electron Desktop
echo ========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version

:: Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [OK] npm found:
npm --version
echo.

:: Install server dependencies if needed
if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install
    cd ..
    echo [OK] Server dependencies installed
)

:: Install client dependencies if needed
if not exist "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install
    cd ..
    echo [OK] Client dependencies installed
)

:: Check for .env file
if not exist "server\.env" (
    echo [WARNING] No .env file found
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env"
        echo [INFO] Created .env from template
        echo [WARNING] Please edit server\.env with your Facebook credentials
    )
)

echo.
echo ========================================
echo Starting Warehouse Message Desktop App
echo ========================================
echo.

:: Start backend server
echo [INFO] Starting backend server on port 5000...
cd server
start /B npm start
cd ..

:: Wait a few seconds for server to start
timeout /t 3 /nobreak >nul

echo.
echo [INFO] Starting Electron desktop app...
echo.
echo ========================================
echo Features Available:
echo   * Ctrl+Shift+V - Show clipboard history
echo   * Ctrl+Shift+W - Toggle window
echo   * System Tray  - Check tray for menu
echo ========================================
echo.

:: Start Electron
cd client
call npm run electron-dev

:: Cleanup
echo.
echo [INFO] Application closed
pause
