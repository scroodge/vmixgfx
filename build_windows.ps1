# Build script for Windows (PowerShell) to create a single executable file
# This script builds the vMix Score Control application into a single .exe file

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "vMix Score Control - Windows Build Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[1/5] Checking Python version..." -ForegroundColor Green
    Write-Host $pythonVersion -ForegroundColor Yellow
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Change to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Cannot find backend directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $backendPath

# Create virtual environment if it doesn't exist
Write-Host "[2/5] Setting up virtual environment..." -ForegroundColor Green
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to activate virtual environment" -ForegroundColor Red
    Write-Host "You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Green
python -m pip install --upgrade pip | Out-Null
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Build the executable
Write-Host "[4/5] Building executable with PyInstaller..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""
pyinstaller --clean vmix_score_control.spec
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build executable" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if exe was created
Write-Host "[5/5] Verifying build..." -ForegroundColor Green
$exePath = Join-Path $backendPath "dist\vmix_score_control.exe"
if (Test-Path $exePath) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executable created at: $exePath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Yellow
    Write-Host "  1. Copy dist\vmix_score_control.exe to any Windows machine" -ForegroundColor White
    Write-Host "  2. Double-click to run - all services will start automatically" -ForegroundColor White
    Write-Host "  3. Access Control Panel at: http://localhost:8000/control" -ForegroundColor White
    Write-Host "  4. Access Overlay at: http://localhost:8000/overlay?matchId=1" -ForegroundColor White
    Write-Host ""
    
    # Get file size
    $fileSize = (Get-Item $exePath).Length / 1MB
    Write-Host "Executable size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "ERROR: Executable was not created!" -ForegroundColor Red
    Write-Host "Check the build logs above for errors." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Build complete!" -ForegroundColor Green
Read-Host "Press Enter to exit"
