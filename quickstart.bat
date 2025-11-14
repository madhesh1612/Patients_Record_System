@echo off
REM Quick Start Script for Patient Record Management System (Windows)

echo.
echo ^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@
echo Patient Record Management System - Quick Start
echo ^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@^@
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo X Node.js is not installed. Please install it first.
    pause
    exit /b 1
)

echo.
echo Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo Completed: Dependencies installed!
echo.
echo Next Steps:
echo.
echo 1. Create .env files:
echo    - Copy backend\.env.example to backend\.env
echo    - Copy frontend\.env.example to frontend\.env
echo.
echo 2. Update backend\.env with PostgreSQL credentials
echo.
echo 3. Run database setup in PostgreSQL:
echo    psql -U postgres -d patient_records -f backend/sql/schema.sql
echo.
echo 4. Start the backend server (in new terminal):
echo    cd backend ^&^& npm run dev
echo.
echo 5. Start the frontend (in another new terminal):
echo    cd frontend ^&^& npm run dev
echo.
echo 6. Open http://localhost:5173 in your browser
echo.
echo For more information, see README.md
echo.
pause
