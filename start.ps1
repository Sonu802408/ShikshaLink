$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting ShikshaLink Full-Stack Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Ensure PATH includes Node.js and MongoDB
$env:Path = "D:\Program Files\nodejs;D:\Microsoft VS Code\bin;" + $env:Path

# 1. MongoDB
$mongoProc = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoProc) {
    Write-Host "[1/3] Starting MongoDB on localhost:27017..." -ForegroundColor Yellow
    Start-Process -FilePath "D:\Microsoft VS Code\bin\mongod.exe" -ArgumentList "--dbpath `"D:\ShikshaLink\data\db`" --port 27017 --bind_ip 127.0.0.1"
    Start-Sleep -Seconds 3
} else {
    Write-Host "[1/3] MongoDB is already running." -ForegroundColor Green
}

# 2. Backend Server
Write-Host "[2/3] Starting Backend API on http://localhost:5000..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList '/k "set PATH=D:\Program Files\nodejs;%PATH% && cd /d D:\ShikshaLink\server && npm run dev"'

Start-Sleep -Seconds 2

# 3. Frontend Client
Write-Host "[3/3] Starting Frontend Client on http://localhost:5173..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList '/k "set PATH=D:\Program Files\nodejs;%PATH% && cd /d D:\ShikshaLink\client && npm run dev"'

Start-Sleep -Seconds 3

# 4. Launch Browser
Write-Host "Launching ShikshaLink in default browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "Done! Services are active." -ForegroundColor Green
