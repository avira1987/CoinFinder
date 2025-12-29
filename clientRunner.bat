@echo off
echo ========================================
echo CoinFinder Client Runner
echo ========================================
echo.

echo [1/4] Checking for Git...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH!
    pause
    exit /b 1
)

echo [2/4] Pulling latest updates from GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo WARNING: Failed to pull from GitHub. Trying master branch...
    git pull origin master
    if %errorlevel% neq 0 (
        echo ERROR: Failed to pull from GitHub!
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [3/4] Installing/Updating dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Build completed successfully!
echo Starting server...
echo ========================================
echo.
call npm run preview

