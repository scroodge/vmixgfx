@echo off
REM Setup script to create a new Python 3.10 virtual environment for Windows
REM Usage: setup_env.bat

echo ============================================================
echo vMix Score Control - Python 3.10 Environment Setup
echo ============================================================
echo.

REM Check if Python 3.10 is available
echo [1/5] Checking Python 3.10 installation...

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10 from https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYTHON_VERSION=%%v
echo Python version: %PYTHON_VERSION%

REM Check if it's Python 3.10
echo %PYTHON_VERSION% | findstr /R "^3\.10" >nul
if errorlevel 1 (
    echo WARNING: Python 3.10 is recommended
    echo Current version: %PYTHON_VERSION%
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" (
        echo Setup cancelled
        pause
        exit /b 1
    )
)

echo.
cd backend
if errorlevel 1 (
    echo ERROR: Cannot find backend directory
    pause
    exit /b 1
)

REM Remove old venv if exists
echo [2/5] Removing old virtual environment...
if exist venv (
    rmdir /s /q venv
    echo Old environment removed
) else (
    echo No existing virtual environment found
)

REM Create new virtual environment
echo [3/5] Creating new Python 3.10 virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Virtual environment created
echo.

REM Activate virtual environment
echo [4/5] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install dependencies
echo [5/5] Installing dependencies from requirements.txt...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Environment setup complete!
echo ============================================================
echo.
echo Virtual environment location: backend\venv
echo.
echo To activate the environment:
echo   cd backend
echo   venv\Scripts\activate
echo.
echo To deactivate:
echo   deactivate
echo.
echo To run the server:
echo   python main.py
echo   or
echo   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
pause
