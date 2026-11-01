@echo off
setlocal
echo ===================================================
echo Starting ShikshaLink Tutor-Parent Marketplace...
echo ===================================================

set "PATH=D:\Program Files\nodejs;D:\Microsoft VS Code\bin;%PATH%"

echo [1/3] Ensuring MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is already running.
) else (
    echo Starting MongoDB instance on localhost:27017...
    start "ShikshaLink Database (MongoDB)" "D:\Microsoft VS Code\bin\mongod.exe" --dbpath "D:\ShikshaLink\data\db" --port 27017 --bind_ip 127.0.0.1
    ping 127.0.0.1 -n 4 >nul
)

echo [2/3] Launching Backend Server on http://localhost:5000 ...
start "ShikshaLink Backend" cmd /k "cd /d D:\ShikshaLink\server && npm run dev"
ping 127.0.0.1 -n 3 >nul

echo [3/3] Launching Frontend Client on http://localhost:5173 ...
start "ShikshaLink Frontend" cmd /k "cd /d D:\ShikshaLink\client && npm run dev"

echo.
echo Launching browser at http://localhost:5173 ...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo All services started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api/health
echo Demo logins are readily available on the Login page.
echo ===================================================
