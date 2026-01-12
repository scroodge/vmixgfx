#!/usr/bin/env python3
"""
Universal build script for vMix Score Control
Works on Windows, Linux, and macOS
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60 + "\n")

def check_python():
    """Check if Python is installed and version is correct"""
    print("[1/6] Checking Python installation...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"ERROR: Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_dependencies():
    """Check if required tools are available"""
    print("[2/6] Checking dependencies...")
    try:
        import pip
        print("✓ pip is available")
    except ImportError:
        print("ERROR: pip is not installed")
        return False
    return True

def setup_venv(backend_dir):
    """Create and activate virtual environment"""
    print("[3/6] Setting up virtual environment...")
    venv_path = backend_dir / "venv"
    
    if not venv_path.exists():
        print("Creating virtual environment...")
        result = subprocess.run(
            [sys.executable, "-m", "venv", str(venv_path)],
            cwd=backend_dir,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"ERROR: Failed to create virtual environment: {result.stderr}")
            return None
        print("✓ Virtual environment created")
    else:
        print("✓ Virtual environment already exists")
    
    # Determine activation script based on platform
    system = platform.system()
    if system == "Windows":
        python_exe = venv_path / "Scripts" / "python.exe"
        pip_exe = venv_path / "Scripts" / "pip.exe"
    else:
        python_exe = venv_path / "bin" / "python"
        pip_exe = venv_path / "bin" / "pip"
    
    if not python_exe.exists():
        print(f"ERROR: Python executable not found at {python_exe}")
        return None
    
    return {
        "python": str(python_exe),
        "pip": str(pip_exe),
        "venv_path": venv_path
    }

def install_dependencies(venv_info):
    """Install required dependencies"""
    print("[4/6] Installing dependencies...")
    backend_dir = Path(__file__).parent / "backend"
    requirements = backend_dir / "requirements.txt"
    
    if not requirements.exists():
        print(f"ERROR: requirements.txt not found at {requirements}")
        return False
    
    # Upgrade pip first
    print("Upgrading pip...")
    subprocess.run(
        [venv_info["pip"], "install", "--upgrade", "pip"],
        cwd=backend_dir,
        capture_output=True
    )
    
    # Install requirements
    print("Installing dependencies from requirements.txt...")
    result = subprocess.run(
        [venv_info["pip"], "install", "-r", str(requirements)],
        cwd=backend_dir,
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"ERROR: Failed to install dependencies: {result.stderr}")
        return False
    
    print("✓ Dependencies installed")
    return True

def build_executable(venv_info):
    """Build the executable using PyInstaller"""
    print("[5/6] Building executable with PyInstaller...")
    backend_dir = Path(__file__).parent / "backend"
    spec_file = backend_dir / "vmix_score_control.spec"
    
    if not spec_file.exists():
        print(f"ERROR: Spec file not found at {spec_file}")
        return False
    
    # Get pyinstaller from venv
    system = platform.system()
    if system == "Windows":
        pyinstaller = venv_info["venv_path"] / "Scripts" / "pyinstaller.exe"
    else:
        pyinstaller = venv_info["venv_path"] / "bin" / "pyinstaller"
    
    if not pyinstaller.exists():
        print("ERROR: PyInstaller not found. Installing...")
        result = subprocess.run(
            [venv_info["pip"], "install", "pyinstaller"],
            cwd=backend_dir,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"ERROR: Failed to install PyInstaller: {result.stderr}")
            return False
    
    print("This may take a few minutes...")
    result = subprocess.run(
        [str(pyinstaller), "--clean", str(spec_file)],
        cwd=backend_dir,
        text=True
    )
    
    if result.returncode != 0:
        print(f"ERROR: Build failed")
        return False
    
    print("✓ Build completed")
    return True

def verify_build(backend_dir):
    """Verify that the executable was created"""
    print("[6/6] Verifying build...")
    
    system = platform.system()
    dist_dir = backend_dir / "dist"
    
    if system == "Windows":
        exe_name = "vmix_score_control.exe"
    elif system == "Darwin":  # macOS
        exe_name = "vmix_score_control"
        # On macOS, PyInstaller might create a .app bundle
        app_bundle = dist_dir / "vmix_score_control.app"
        if app_bundle.exists():
            print(f"✓ Application bundle created: {app_bundle}")
            return True
    else:  # Linux
        exe_name = "vmix_score_control"
    
    exe_path = dist_dir / exe_name
    
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"✓ Executable created: {exe_path}")
        print(f"  Size: {size_mb:.1f} MB")
        return True
    else:
        print(f"ERROR: Executable not found at {exe_path}")
        print(f"  Check {dist_dir} for output files")
        return False

def get_platform_info():
    """Get information about the current platform"""
    system = platform.system()
    machine = platform.machine()
    return {
        "system": system,
        "machine": machine,
        "platform": f"{system} {machine}"
    }

def main():
    """Main build function"""
    print_header("vMix Score Control - Universal Build Script")
    
    # Get platform info
    platform_info = get_platform_info()
    print(f"Platform: {platform_info['platform']}")
    print(f"Python: {sys.executable}")
    
    # Get project directories
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    
    if not backend_dir.exists():
        print(f"ERROR: Backend directory not found at {backend_dir}")
        return 1
    
    # Step 1: Check Python
    if not check_python():
        return 1
    
    # Step 2: Check dependencies
    if not check_dependencies():
        return 1
    
    # Step 3: Setup virtual environment
    venv_info = setup_venv(backend_dir)
    if not venv_info:
        return 1
    
    # Step 4: Install dependencies
    if not install_dependencies(venv_info):
        return 1
    
    # Step 5: Build executable
    if not build_executable(venv_info):
        return 1
    
    # Step 6: Verify build
    if not verify_build(backend_dir):
        return 1
    
    # Success!
    print_header("BUILD SUCCESSFUL!")
    
    system = platform.system()
    dist_dir = backend_dir / "dist"
    
    if system == "Windows":
        exe_path = dist_dir / "vmix_score_control.exe"
        print(f"Executable: {exe_path}")
        print("\nTo run:")
        print(f"  {exe_path}")
    elif system == "Darwin":
        app_bundle = dist_dir / "vmix_score_control.app"
        if app_bundle.exists():
            print(f"Application bundle: {app_bundle}")
            print("\nTo run:")
            print(f"  open {app_bundle}")
        else:
            exe_path = dist_dir / "vmix_score_control"
            print(f"Executable: {exe_path}")
            print("\nTo run:")
            print(f"  {exe_path}")
    else:  # Linux
        exe_path = dist_dir / "vmix_score_control"
        print(f"Executable: {exe_path}")
        print("\nTo run:")
        print(f"  {exe_path}")
        print("\nOr make it executable:")
        print(f"  chmod +x {exe_path}")
    
    print("\nAccess the application:")
    print("  Control Panel: http://localhost:8000/control")
    print("  Overlay:       http://localhost:8000/overlay?matchId=1")
    print("  JSON Data:     http://localhost:8000/api/match/1/data.json")
    
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nBuild cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
