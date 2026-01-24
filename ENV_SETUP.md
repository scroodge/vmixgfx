# Environment Setup Guide

This guide explains how to set up a Python 3.10 virtual environment for the vMix Score Control project.

## Quick Setup (Automated)

### macOS/Linux
```bash
./setup_env.sh
```

### Windows
```cmd
setup_env.bat
```

The automated scripts will:
1. Check for Python 3.10
2. Create a new virtual environment
3. Install all dependencies
4. Verify the setup

## Manual Setup

### Why Python 3.10?

The project requires **Python 3.10 or higher** because:
- FastAPI 0.104+ requires Python 3.8+, but we use features from 3.10+
- Pydantic v2 works best with Python 3.10+
- Modern type hints and async features

### macOS/Linux Setup

1. **Install Python 3.10** (if not already installed):

   **Using pyenv (Recommended):**
   ```bash
   # Install pyenv if not installed
   brew install pyenv  # macOS
   
   # Install Python 3.10
   pyenv install 3.10.13
   
   # Set local version for this project
   cd backend
   pyenv local 3.10.13
   ```

   **macOS (Homebrew):**
   ```bash
   brew install python@3.10
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt-get update
   sudo apt-get install python3.10 python3.10-venv python3.10-dev
   ```

   **Linux (Fedora):**
   ```bash
   sudo dnf install python3.10 python3.10-venv
   ```

2. **Verify Python 3.10 is available:**

   **With pyenv:**
   ```bash
   pyenv versions  # List installed versions
   python --version  # After setting local version
   ```

   **Without pyenv:**
   ```bash
   python3.10 --version
   # Should output: Python 3.10.x
   ```

3. **Create virtual environment:**

   **With pyenv:**
   ```bash
   cd backend
   pyenv local 3.10.13  # Set local version
   python -m venv venv  # Use 'python' (pyenv will use 3.10.13)
   ```

   **Without pyenv:**
   ```bash
   cd backend
   python3.10 -m venv venv
   ```

4. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

5. **Verify Python version in venv:**
   ```bash
   python --version
   # Should output: Python 3.10.x
   ```

6. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

### Windows Setup

1. **Install Python 3.10** (if not already installed):
   - Download from [python.org](https://www.python.org/downloads/)
   - During installation, check "Add Python to PATH"
   - Verify installation:
     ```cmd
     python --version
     # Should output: Python 3.10.x
     ```

2. **If you have multiple Python versions**, use the Python Launcher:
   ```cmd
   py -3.10 --version
   ```

3. **Create virtual environment:**
   ```cmd
   cd backend
   python -m venv venv
   ```
   
   Or with Python Launcher:
   ```cmd
   py -3.10 -m venv venv
   ```

4. **Activate virtual environment:**
   ```cmd
   venv\Scripts\activate
   ```

5. **Verify Python version in venv:**
   ```cmd
   python --version
   # Should output: Python 3.10.x
   ```

6. **Install dependencies:**
   ```cmd
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

## Verifying the Setup

After activating the virtual environment, verify:

1. **Python version:**
   ```bash
   python --version
   # Should show: Python 3.10.x
   ```

2. **Python executable location:**
   ```bash
   which python  # macOS/Linux
   where python  # Windows
   # Should point to: backend/venv/bin/python (or venv\Scripts\python.exe on Windows)
   ```

3. **Installed packages:**
   ```bash
   pip list
   # Should show: fastapi, uvicorn, pydantic, etc.
   ```

## Troubleshooting

### "python3.10: command not found"

**If using pyenv:**
```bash
# Check if Python 3.10 is installed in pyenv
pyenv versions

# If not installed, install it:
pyenv install 3.10.13

# Set it for this project:
cd backend
pyenv local 3.10.13

# Now use 'python' instead of 'python3.10':
python -m venv venv
```

**macOS (without pyenv):**
```bash
brew install python@3.10
# Then use: python3.10
```

**Linux (without pyenv):**
```bash
sudo apt-get install python3.10 python3.10-venv
```

### Virtual environment uses wrong Python version

If your venv was created with a different Python version:

1. **Delete the old venv:**
   ```bash
   rm -rf backend/venv  # macOS/Linux
   rmdir /s backend\venv  # Windows
   ```

2. **Create new venv with Python 3.10:**

   **With pyenv:**
   ```bash
   cd backend
   pyenv local 3.10.13
   python -m venv venv
   ```

   **Without pyenv:**
   ```bash
   python3.10 -m venv backend/venv  # macOS/Linux
   py -3.10 -m venv backend\venv  # Windows
   ```

### "Module not found" errors

Make sure you:
1. Activated the virtual environment
2. Installed dependencies: `pip install -r requirements.txt`
3. Are using the correct Python interpreter

### Multiple Python versions on macOS

If you have multiple Python versions installed via Homebrew:

```bash
# List available Python versions
ls /usr/local/bin/python*  # or /opt/homebrew/bin/python* on Apple Silicon

# Use specific version
/opt/homebrew/bin/python3.10 -m venv venv
```

## Activating the Environment

**Every time you work on the project:**

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
```

**Windows:**
```cmd
cd backend
venv\Scripts\activate
```

**Deactivate when done:**
```bash
deactivate
```

## Running the Server

Once the environment is activated:

```bash
python main.py
```

Or with auto-reload (development):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## See Also

- [README.md](../README.md) - Main project documentation
- [BUILD.md](../BUILD.md) - Build instructions
