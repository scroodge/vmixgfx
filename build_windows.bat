@echo off
REM Build script for Windows to create a single executable file
REM This script builds the vMix Score Control application into a single .exe file

echo ================================================
echo vMix Score Control - Windows Build Script
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Checking Python version...
python --version
echo.

REM Change to backend directory
cd backend
if errorlevel 1 (
    echo ERROR: Cannot find backend directory
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
echo [2/5] Setting up virtual environment...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install dependencies
echo [3/5] Installing dependencies...
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Build the executable
echo [4/5] Building executable with PyInstaller...
echo This may take a few minutes...
echo.
pyinstaller --clean vmix_score_control.spec
if errorlevel 1 (
    echo ERROR: Failed to build executable
    pause
    exit /b 1
)

REM Check if exe was created
echo [5/5] Verifying build...
if exist dist\vmix_score_control.exe (
    echo.
    echo ================================================
    echo BUILD SUCCESSFUL!
    echo ================================================
    echo.
    echo Executable created at: dist\vmix_score_control.exe
    echo.
    echo You can now:
    echo   1. Copy dist\vmix_score_control.exe to any Windows machine
    echo   2. Double-click to run - all services will start automatically
    echo   3. Access Control Panel at: http://localhost:8000/control
    echo   4. Access Overlay at: http://localhost:8000/overlay?matchId=1
    echo.
) else (
    echo ERROR: Executable was not created!
    echo Check the build logs above for errors.
    pause
    exit /b 1
)

echo Build complete! Press any key to exit...
pause >nul
