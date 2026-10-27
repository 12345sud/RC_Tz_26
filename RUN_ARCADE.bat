@echo off
title RC ARCADE (Air Hockey) - Tournament Portal
color 0b
echo =======================================================
echo    ROBOTICS CLUB NITW - ARCADE (AIR HOCKEY) PORTAL
echo =======================================================
echo.
echo Starting Next.js Server with MongoDB Atlas...
echo.

cd /d "D:\RC ARCADE"

:: Open the browser automatically after 3 seconds
start "" http://localhost:3000

:: Start the Next.js server
call npm.cmd run dev

pause
