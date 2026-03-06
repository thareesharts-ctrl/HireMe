@echo off
echo ===================================================
echo Starting Resume Intelligence - AI ATS App
echo ===================================================

echo Starting Python Backend...
cd backend
start cmd /k "..\.venv\Scripts\python -m pip install -r requirements.txt && ..\.venv\Scripts\python app.py"
cd ..

echo Starting React Frontend...
cd frontend
start cmd /k "npm install && npm run dev"
cd ..

echo Both servers are starting in new windows!
echo Backend API will handle PDF parsing and skill matching on http://localhost:5000
echo Frontend Web App will run on http://localhost:5173
echo Please open your browser to http://localhost:5173
pause
