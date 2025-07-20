@echo off
echo Starting Ultimate Quiz Web Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm start"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd project && npm run dev"

echo.
echo Application is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul 