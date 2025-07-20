#!/bin/bash

echo "Starting Ultimate Quiz Web Application..."
echo

echo "Starting Backend Server..."
cd server && npm start &
BACKEND_PID=$!

echo "Waiting 3 seconds for backend to start..."
sleep 3

echo "Starting Frontend Server..."
cd ../project && npm run dev &
FRONTEND_PID=$!

echo
echo "Application is starting up!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop the servers
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 