#!/bin/bash
# Universal build script for Linux and macOS
# Usage: ./build.sh

set -e  # Exit on error

echo "============================================================"
echo "vMix Score Control - Build Script (Linux/macOS)"
echo "============================================================"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi

echo "[1/5] Checking Python version..."
python3 --version
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Change to backend directory
cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
echo "[2/5] Setting up virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "[3/5] Installing dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Build the executable
echo "[4/5] Building executable with PyInstaller..."
echo "This may take a few minutes..."
echo ""
pyinstaller --clean vmix_score_control.spec
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build executable"
    exit 1
fi
echo ""

# Verify build
echo "[5/5] Verifying build..."
if [ -f "dist/vmix_score_control" ]; then
    SIZE=$(du -h dist/vmix_score_control | cut -f1)
    echo ""
    echo "============================================================"
    echo "BUILD SUCCESSFUL!"
    echo "============================================================"
    echo ""
    echo "Executable created at: dist/vmix_score_control"
    echo "Size: $SIZE"
    echo ""
    echo "To run:"
    echo "  cd dist"
    echo "  ./vmix_score_control"
    echo ""
    echo "Or make it executable and run from anywhere:"
    echo "  chmod +x dist/vmix_score_control"
    echo "  ./dist/vmix_score_control"
    echo ""
    echo "Access the application:"
    echo "  Control Panel: http://localhost:8000/control"
    echo "  Overlay:       http://localhost:8000/overlay?matchId=1"
    echo "  JSON Data:     http://localhost:8000/api/match/1/data.json"
    echo ""
else
    echo "ERROR: Executable was not created!"
    echo "Check the build logs above for errors."
    exit 1
fi
