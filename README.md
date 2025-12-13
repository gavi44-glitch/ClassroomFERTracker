
# ClassroomFERTracker - Setup & Run


# 1️⃣ Clone repository
git clone https://github.com/gavi44-glitch/ClassroomFERTracker.git

# 2️⃣ Create virtual environment

## Windows PowerShell
python -m venv .emotion
.\emotion\Scripts\Activate.ps1

## Windows CMD
python -m venv .emotion
.\emotion\Scripts\activate.bat

## macOS / Linux
python3 -m venv .emotion
source .emotion/bin/activate

## Conda (optional)
conda create -n emotion python=3.8
conda activate emotion

# 3️⃣ Install Python dependencies
pip install -r requirements.txt

# 4️⃣ Install frontend dependencies (React)
cd emotion-recognition
npm install

# 5️⃣ Start backend API
cd ../server
uvicorn main:app --reload
# Backend default: http://127.0.0.1:8000

# 6️⃣ Start frontend (React app)
cd ../emotion-recognition
npm start
# Frontend default: http://localhost:3000
