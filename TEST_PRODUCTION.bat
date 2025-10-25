@echo off
echo ========================================
echo   Testing Production Build
echo ========================================
echo.

echo [1/3] Building for production...
call npm run build

echo.
echo [2/3] Starting production server...
echo.
echo Open your browser to: http://localhost:3000/academy
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
