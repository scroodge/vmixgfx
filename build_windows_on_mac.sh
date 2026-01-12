#!/bin/bash
# Script to build Windows .exe on macOS
# This script provides options for cross-platform building

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function setup_github_actions() {
    mkdir -p .github/workflows
    
    cat > .github/workflows/build-windows.yml << 'EOF'
name: Build Windows Executable

on:
  workflow_dispatch:
  push:
    tags:
      - 'v*'
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        cd backend
        pip install -r requirements.txt
    
    - name: Build executable
      run: |
        cd backend
        pyinstaller --clean vmix_score_control.spec
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: vmix_score_control.exe
        path: backend/dist/vmix_score_control.exe
        retention-days: 30
    
    - name: Create Release (on tag)
      if: startsWith(github.ref, 'refs/tags/')
      uses: softprops/action-gh-release@v1
      with:
        files: backend/dist/vmix_score_control.exe
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF

    echo -e "${GREEN}✓ GitHub Actions workflow created${NC}"
    echo ""
    echo "To use:"
    echo "1. Push this code to GitHub"
    echo "2. Go to Actions tab in your repository"
    echo "3. Run 'Build Windows Executable' workflow"
    echo "4. Download the .exe from artifacts"
    echo ""
    echo "Or trigger manually with GitHub CLI:"
    echo "  gh workflow run build-windows.yml"
    echo ""
    echo "The workflow file is at: .github/workflows/build-windows.yml"
}

function setup_docker_build() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}ERROR: Docker is not installed${NC}"
        echo "Install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    # Create Dockerfile for Windows build
    cat > Dockerfile.windows << 'EOF'
# Note: This requires Windows container support in Docker Desktop
# Enable "Use Windows containers" in Docker Desktop settings

FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Install Python
RUN powershell -Command \
    Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe -OutFile python.exe; \
    Start-Process python.exe -ArgumentList '/quiet InstallAllUsers=1 PrependPath=1' -Wait; \
    Remove-Item python.exe

# Set working directory
WORKDIR C:\\app

# Copy project files
COPY backend\\ C:\\app\\backend\\
COPY frontend\\ C:\\app\\frontend\\

# Install dependencies and build
RUN cd backend && \
    python -m pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pyinstaller --clean vmix_score_control.spec

# Output will be in C:\app\backend\dist\vmix_score_control.exe
EOF

    # Create build script
    cat > build_windows_docker.sh << 'EOF'
#!/bin/bash
# Build Windows .exe using Docker

echo "Building Windows .exe with Docker..."
echo "NOTE: This requires Windows containers in Docker Desktop"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running"
    exit 1
fi

# Build the image
docker build -f Dockerfile.windows -t vmix-build-windows .

# Create a container and copy the exe
docker create --name vmix-build-temp vmix-build-windows
docker cp vmix-build-temp:C:/app/backend/dist/vmix_score_control.exe ./vmix_score_control.exe
docker rm vmix-build-temp

echo "✓ Build complete: vmix_score_control.exe"
EOF

    chmod +x build_windows_docker.sh
    
    echo -e "${GREEN}✓ Docker build files created${NC}"
    echo ""
    echo "IMPORTANT: Enable Windows containers in Docker Desktop:"
    echo "1. Open Docker Desktop"
    echo "2. Settings > General"
    echo "3. Enable 'Use Windows containers'"
    echo "4. Restart Docker Desktop"
    echo ""
    echo "Then run:"
    echo "  ./build_windows_docker.sh"
    echo ""
    echo -e "${YELLOW}NOTE: Windows containers may not work on Apple Silicon Macs${NC}"
}

function show_vm_instructions() {
    cat << 'EOF'

VM Setup Instructions:
======================

1. Install a Windows VM (Parallels, VMware, VirtualBox, etc.)
2. Install Python 3.8+ in the VM
3. Copy this project to the VM
4. Run the build script in the VM:
   - build_windows.bat
   - or: python build.py

Alternative: Use GitHub Codespaces with Windows
- Create a Windows Codespace
- Run build script there

EOF
}

function setup_remote_build() {
    cat > build_windows_remote.sh << 'EOF'
#!/bin/bash
# Build Windows .exe on remote Windows machine via SSH

# Configuration - EDIT THESE VALUES
REMOTE_HOST="user@windows-machine"
REMOTE_PATH="/path/to/project"
LOCAL_OUTPUT="./vmix_score_control.exe"

echo "Building Windows .exe on remote machine..."
echo "Remote: $REMOTE_HOST"
echo ""

# Copy project to remote
echo "Copying project to remote machine..."
rsync -avz --exclude 'venv' --exclude '__pycache__' --exclude '*.pyc' \
    --exclude '.git' --exclude 'dist' --exclude 'build' \
    ./ "$REMOTE_HOST:$REMOTE_PATH/"

# Build on remote
echo "Building on remote machine..."
ssh "$REMOTE_HOST" "cd $REMOTE_PATH && python build.py"

# Copy result back
echo "Copying executable back..."
scp "$REMOTE_HOST:$REMOTE_PATH/backend/dist/vmix_score_control.exe" "$LOCAL_OUTPUT"

echo "✓ Build complete: $LOCAL_OUTPUT"
EOF

    chmod +x build_windows_remote.sh
    
    echo -e "${GREEN}✓ Remote build script created${NC}"
    echo ""
    echo "Edit build_windows_remote.sh with your remote host details:"
    echo "  REMOTE_HOST=\"user@windows-machine\""
    echo "  REMOTE_PATH=\"/path/to/project\""
    echo ""
    echo "Then run: ./build_windows_remote.sh"
}

function setup_wine_build() {
    echo -e "${YELLOW}WARNING: Wine build is experimental and may not work correctly${NC}"
    echo ""
    read -p "Continue with Wine setup? (y/n): " confirm
    
    if [ "$confirm" != "y" ]; then
        echo "Cancelled"
        exit 0
    fi
    
    # Check if Wine is installed
    if ! command -v wine &> /dev/null; then
        echo "Wine is not installed."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "Install Wine via Homebrew:"
            echo "  brew install --cask wine-stable"
        else
            echo "Install Wine via your package manager"
        fi
        exit 1
    fi
    
    cat > build_windows_wine.sh << 'EOF'
#!/bin/bash
# Experimental: Build Windows .exe using Wine

echo "WARNING: This is experimental and may not work correctly"
echo ""

# Download Python for Windows
PYTHON_URL="https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe"
PYTHON_INSTALLER="./python_installer.exe"

if [ ! -f "$PYTHON_INSTALLER" ]; then
    echo "Downloading Python for Windows..."
    curl -L -o "$PYTHON_INSTALLER" "$PYTHON_URL"
fi

# Install Python in Wine
echo "Installing Python in Wine (this may take a while)..."
wine "$PYTHON_INSTALLER" /quiet InstallAllUsers=1 PrependPath=1

# Install pip packages
echo "Installing dependencies..."
wine python -m pip install --upgrade pip
cd backend
wine python -m pip install -r requirements.txt

# Build
echo "Building executable..."
wine python -m PyInstaller --clean vmix_score_control.spec

echo "✓ Build complete (experimental)"
echo "Check backend/dist/vmix_score_control.exe"
EOF

    chmod +x build_windows_wine.sh
    
    echo -e "${GREEN}✓ Wine build script created${NC}"
    echo ""
    echo "Run: ./build_windows_wine.sh"
    echo -e "${YELLOW}NOTE: This is experimental and may not produce a working .exe${NC}"
}

# Main script
echo "============================================================"
echo "vMix Score Control - Build Windows .exe on macOS"
echo "============================================================"
echo ""
echo -e "${YELLOW}NOTE: PyInstaller does not support cross-compilation.${NC}"
echo -e "${YELLOW}You cannot directly build Windows .exe on macOS.${NC}"
echo ""
echo "Available options:"
echo ""
echo -e "${GREEN}1.${NC} GitHub Actions (RECOMMENDED) - Automatic build in cloud"
echo -e "${BLUE}2.${NC} Docker with Windows container (requires Docker Desktop)"
echo -e "${BLUE}3.${NC} Virtual Machine with Windows"
echo -e "${BLUE}4.${NC} Remote Windows machine via SSH"
echo -e "${YELLOW}5.${NC} Wine + PyInstaller (experimental, not recommended)"
echo ""
read -p "Select option (1-5): " option

case $option in
    1)
        echo ""
        echo -e "${GREEN}Setting up GitHub Actions workflow...${NC}"
        setup_github_actions
        ;;
    2)
        echo ""
        echo -e "${GREEN}Setting up Docker build...${NC}"
        setup_docker_build
        ;;
    3)
        echo ""
        echo -e "${BLUE}VM Setup Instructions:${NC}"
        show_vm_instructions
        ;;
    4)
        echo ""
        echo -e "${GREEN}Setting up remote build script...${NC}"
        setup_remote_build
        ;;
    5)
        echo ""
        echo -e "${YELLOW}Wine setup (experimental)...${NC}"
        setup_wine_build
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "For more information, see: BUILD_WINDOWS_ON_MAC.md"
