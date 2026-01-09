# Building Windows Executable

This guide explains how to build a single Windows executable file (.exe) that contains all services (backend server and frontend files). Users can simply double-click the .exe file to start everything.

## Prerequisites

- **Windows 10/11** (64-bit recommended)
- **Python 3.8 or higher** installed from [python.org](https://www.python.org/)
- **Internet connection** (for downloading dependencies during build)

## Quick Start

### Option 1: Using Batch Script (Recommended)

1. Open **Command Prompt** or **PowerShell** in the project root directory
2. Double-click `build_windows.bat` or run:
   ```cmd
   build_windows.bat
   ```
3. Wait for the build to complete (this may take 5-10 minutes)
4. Find the executable at: `backend\dist\vmix_score_control.exe`

### Option 2: Using PowerShell Script

1. Open **PowerShell** in the project root directory
2. If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Run the build script:
   ```powershell
   .\build_windows.ps1
   ```
4. Wait for the build to complete
5. Find the executable at: `backend\dist\vmix_score_control.exe`

### Option 3: Manual Build

1. Open **Command Prompt** or **PowerShell** in the `backend` directory
2. Create and activate virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Build the executable:
   ```cmd
   pyinstaller --clean vmix_score_control.spec
   ```
5. Find the executable at: `dist\vmix_score_control.exe`

## Using the Executable

### Running the Application

1. **Copy** `vmix_score_control.exe` to any Windows machine (no Python installation needed)
2. **Double-click** the executable to start the server
3. A console window will appear showing server status
4. The server will start on `http://localhost:8000`

### Accessing the Application

- **Control Panel**: Open your browser and go to `http://localhost:8000/control`
- **Overlay**: Open your browser and go to `http://localhost:8000/overlay?matchId=1`

### Network Access

The server binds to `0.0.0.0:8000` by default, which means:
- **Local access**: Use `localhost` or `127.0.0.1`
- **LAN access**: Use the machine's IP address (e.g., `http://192.168.1.100:8000/control`)
- **Firewall**: Windows Firewall may prompt you to allow the connection on first run

### Stopping the Application

- Click the **X** button on the console window, or
- Press `Ctrl+C` in the console window

## Build Configuration

### PyInstaller Spec File

The build process uses `backend/vmix_score_control.spec` which configures:
- **Entry point**: `main.py`
- **Frontend files**: All HTML, CSS, and JavaScript files are bundled
- **Python dependencies**: FastAPI, Uvicorn, WebSockets, etc.
- **Output**: Single-file executable (all-in-one)

### Customization

#### Hide Console Window

If you want to hide the console window, edit `backend/vmix_score_control.spec` and change:
```python
console=True,  # Change to False
```

#### Add Application Icon

1. Create or obtain a `.ico` file (e.g., `icon.ico`)
2. Place it in the `backend` directory
3. Edit `backend/vmix_score_control.spec` and change:
   ```python
   icon=None,  # Change to 'icon.ico'
   ```

#### Change Executable Name

Edit `backend/vmix_score_control.spec` and change:
```python
name='vmix_score_control',  # Change to your desired name
```

## File Size

The executable will be approximately:
- **100-150 MB** (depending on dependencies)
- This is normal for PyInstaller bundles that include Python runtime

## Troubleshooting

### Build Errors

#### "Python is not found"
- Install Python from [python.org](https://www.python.org/)
- Make sure Python is added to PATH during installation
- Restart your terminal/command prompt after installation

#### "pip is not recognized"
- Update pip: `python -m pip install --upgrade pip`
- Use: `python -m pip install -r requirements.txt`

#### "PyInstaller not found"
- Make sure you've installed dependencies: `pip install -r requirements.txt`
- Check that `pyinstaller` is in `requirements.txt`

#### "Module not found" errors during build
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Try cleaning and rebuilding: `pyinstaller --clean vmix_score_control.spec`

#### Build takes too long or hangs
- This is normal for first-time builds (5-15 minutes)
- Ensure stable internet connection for dependency downloads
- Close other applications to free up system resources

### Runtime Errors

#### "Port 8000 already in use"
- Another instance of the server may be running
- Close any existing instances
- Or change the port in the code before building

#### "Frontend files not found"
- Make sure the spec file includes all frontend files
- Check that file paths in the spec file are correct

#### Executable won't start
- Try running from Command Prompt to see error messages
- Check Windows Event Viewer for system errors
- Ensure you're on a compatible Windows version (Windows 7+)

#### Antivirus blocks the executable
- This is common for PyInstaller executables
- Add the executable to your antivirus exclusion list
- Or sign the executable with a code signing certificate

## Distribution

### Distributing the Executable

1. **Test thoroughly** on a clean Windows machine without Python installed
2. **Create a zip file** containing:
   - `vmix_score_control.exe`
   - `README.txt` (brief instructions)
3. **Optional**: Create an installer using tools like:
   - Inno Setup (free)
   - NSIS (free)
   - WiX Toolset (free, open-source)

### Installation Instructions for End Users

Include these instructions with the executable:

```
vMix Score Control - Installation Instructions
==============================================

1. Extract vmix_score_control.exe to any folder
2. Double-click vmix_score_control.exe to start
3. Open your browser and go to: http://localhost:8000/control
4. For vMix overlay: http://localhost:8000/overlay?matchId=1

Note: Windows Firewall may ask for permission on first run.

To stop the server, close the console window or press Ctrl+C.
```

## Advanced: Building with Different Options

### Debug Build (with console for troubleshooting)

The current spec file has `console=True` which shows the console window. This is useful for debugging.

### Release Build (without console)

Change `console=False` in the spec file to hide the console window. You'll need to create a log file if you want to capture output.

### One-Folder vs One-File

The current spec creates a **one-file** executable (everything bundled). If you want a **one-folder** build (faster startup, but multiple files), modify the spec file or use:

```cmd
pyinstaller --onedir vmix_score_control.spec
```

## Building on Other Platforms

While this guide focuses on Windows, you can build executables for other platforms:

- **Linux**: Similar process, but output will be a binary (no .exe extension)
- **macOS**: Similar process, output will be an .app bundle or binary

Note: PyInstaller builds are platform-specific. Build on the target platform or use cross-compilation tools.

## Updating the Executable

When you make changes to the code:

1. Make your code changes
2. Test in development mode first
3. Rebuild the executable using the same build process
4. Test the new executable thoroughly before distributing

## Support

For issues or questions:
1. Check the build logs for specific errors
2. Review the troubleshooting section above
3. Check PyInstaller documentation: https://pyinstaller.org/

---

**Note**: The first build may take longer as it downloads and packages all dependencies. Subsequent builds will be faster if dependencies haven't changed.
