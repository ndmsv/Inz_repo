@echo off
echo Starting backend...
start cmd /c "cd backend && dotnet run"

echo Starting frontend...
start cmd /c "cd frontend && npm start"

echo The application is starting. Backend and frontend processes are running in separate terminal windows.
pause