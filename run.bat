@echo off
echo Building project...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Build completed successfully!
echo Starting server...
echo.
call npm run preview

