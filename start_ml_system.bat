@echo off
echo Starting ML Campaign Distributor System...
echo.

echo 1. Starting Backend Server...
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo 2. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 3. Testing ML Integration...
node test_ml_integration.js

echo.
echo 4. Starting Frontend...
echo Please run 'npm run dev' in a new terminal to start the frontend
echo.
echo System is ready! Backend server is running on http://localhost:3001
echo.
pause
