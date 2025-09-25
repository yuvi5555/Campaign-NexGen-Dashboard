Write-Host "Starting ML Campaign Distributor System..." -ForegroundColor Green
Write-Host ""

Write-Host "1. Starting Backend Server..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"
Set-Location ..

Write-Host "2. Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "3. Testing ML Integration..." -ForegroundColor Yellow
node test_ml_integration.js

Write-Host ""
Write-Host "4. Starting Frontend..." -ForegroundColor Yellow
Write-Host "Please run 'npm run dev' in a new terminal to start the frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "System is ready! Backend server is running on http://localhost:3001" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
