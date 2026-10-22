@echo off
echo ===================================================
echo Starting ShikshaLink Tutor-Parent Marketplace...
echo ===================================================

echo [1/2] Launching Backend Server on http://localhost:5000 ...
start "ShikshaLink Backend" cmd /k "cd server && npm run dev"

echo [2/2] Launching Frontend Client on http://localhost:5173 ...
start "ShikshaLink Frontend" cmd /k "cd client && npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api/health
echo Demo logins are readily available on the Login page.
echo ===================================================
pause
