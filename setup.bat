@echo off
echo.
echo  =============================================
echo   SentinelX -- Setup Script (Windows)
echo  =============================================
echo.

echo [1/5] Checking Python...
python --version || (echo Python not found! Install from https://python.org && exit /b 1)

echo [2/5] Checking Node.js...
node --version || (echo Node.js not found! Install from https://nodejs.org && exit /b 1)

echo [3/5] Installing Python dependencies...
pip install -r requirements.txt

echo [4/5] Installing frontend dependencies...
cd frontend
npm install
cd ..

echo [5/5] Installing Electron dependencies...
npm install

echo.
echo  Setup Complete!
echo.
echo  HOW TO RUN:
echo.
echo  Terminal 1 (Backend):
echo    cd backend
echo    uvicorn main:app --port 8000 --reload
echo.
echo  Terminal 2 (Frontend):
echo    cd frontend
echo    npm start
echo.
echo  Demo password: sentinel123
echo.
pause
