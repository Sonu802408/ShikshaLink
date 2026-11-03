@echo off
setlocal
echo ===================================================
echo Starting ShikshaLink with Live Public Tunnel...
echo ===================================================

set "PATH=D:\Program Files\nodejs;D:\Microsoft VS Code\bin;%PATH%"

REM 1. MongoDB
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running.
) else (
    echo [1/3] Starting MongoDB...
    start "ShikshaLink Database (MongoDB)" "D:\Microsoft VS Code\bin\mongod.exe" --dbpath "D:\ShikshaLink\data\db" --port 27017 --bind_ip 127.0.0.1
    ping 127.0.0.1 -n 3 >nul
)

REM 2. Backend
echo [2/3] Starting Backend API...
start "ShikshaLink Backend" cmd /k "cd /d D:\ShikshaLink\server && npm run dev"
ping 127.0.0.1 -n 3 >nul

REM 3. Frontend
echo [3/3] Starting Frontend Client...
start "ShikshaLink Frontend" cmd /k "cd /d D:\ShikshaLink\client && npm run dev"
ping 127.0.0.1 -n 4 >nul

REM 4. Cloudflare Tunnel
echo.
echo ===================================================
echo Launching Live Public HTTPS Tunnel...
echo (Your public link will appear below)
echo ===================================================
"D:\ShikshaLink\cloudflared.exe" tunnel --url http://localhost:5173
pause
