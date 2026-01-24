#!/bin/bash
# Setup script to create a new Python 3.10 virtual environment
# Usage: ./setup_env.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================================"
echo "vMix Score Control - Python 3.10 Environment Setup"
echo "============================================================"
echo ""

# Check if Python 3.10 is available
echo "[1/5] Checking Python 3.10 installation..."

# Check for pyenv first
USE_PYENV=false
if command -v pyenv &> /dev/null; then
    # Check if pyenv has Python 3.10 installed
    PYENV_310=$(pyenv versions --bare | grep -E '^3\.10' | head -1)
    if [ -n "$PYENV_310" ]; then
        USE_PYENV=true
        echo "Found pyenv with Python $PYENV_310"
    fi
fi

# Try different Python 3.10 commands
PYTHON_CMD=""
if [ "$USE_PYENV" = true ]; then
    # Use pyenv to get Python 3.10
    PYENV_310=$(pyenv versions --bare | grep -E '^3\.10' | head -1)
    if [ -n "$PYENV_310" ]; then
        # Set local Python version for this directory
        pyenv local $PYENV_310 2>/dev/null || true
        PYTHON_CMD="python"
        echo "Using pyenv Python $PYENV_310"
    fi
elif command -v python3.10 &> /dev/null; then
    PYTHON_CMD="python3.10"
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
    if [[ "$PYTHON_VERSION" == "3.10" ]]; then
        PYTHON_CMD="python3"
    fi
fi

if [ -z "$PYTHON_CMD" ]; then
    echo -e "${RED}ERROR: Python 3.10 is not found${NC}"
    echo ""
    if command -v pyenv &> /dev/null; then
        echo "You have pyenv installed. Install Python 3.10 with:"
        echo "  pyenv install 3.10.13"
        echo "  pyenv local 3.10.13"
    else
        echo "Please install Python 3.10:"
        echo "  macOS:   brew install python@3.10"
        echo "  Linux:   sudo apt-get install python3.10 python3.10-venv"
        echo "  Windows: Download from https://www.python.org/downloads/"
    fi
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
echo -e "${GREEN}✓ Found: $PYTHON_VERSION${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}ERROR: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Remove old venv if exists
if [ -d "venv" ]; then
    echo "[2/5] Removing old virtual environment..."
    rm -rf venv
    echo -e "${GREEN}✓ Old environment removed${NC}"
else
    echo "[2/5] No existing virtual environment found"
fi

# Create new virtual environment
echo "[3/5] Creating new Python 3.10 virtual environment..."
$PYTHON_CMD -m venv venv

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to create virtual environment${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Virtual environment created${NC}"

# Verify Python version in venv
echo "Verifying Python version in virtual environment..."
VENV_PYTHON_VERSION=$(venv/bin/python --version 2>&1)
echo -e "${GREEN}✓ $VENV_PYTHON_VERSION${NC}"
echo ""

# Activate virtual environment
echo "[4/5] Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "[5/5] Installing dependencies from requirements.txt..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "============================================================"
echo -e "${GREEN}Environment setup complete!${NC}"
echo "============================================================"
echo ""
echo "Virtual environment location: $BACKEND_DIR/venv"
echo ""
echo "To activate the environment:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo ""
echo "Verify Python version after activation:"
echo "  python --version  # Should show: Python 3.10.x"
echo ""
echo "To deactivate:"
echo "  deactivate"
echo ""
echo "To run the server:"
echo "  python main.py"
echo "  or"
echo "  uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
