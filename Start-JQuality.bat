@echo off
title J Quality Cleaning - Website
echo.
echo ============================================
echo   J Quality Cleaning - Local Preview
echo ============================================
echo.
echo Starting local server on port 8090...
echo Visit: http://localhost:8090
echo.
echo Press Ctrl+C to stop the server.
echo.
python -m http.server 8090 --directory "%~dp0"
pause
