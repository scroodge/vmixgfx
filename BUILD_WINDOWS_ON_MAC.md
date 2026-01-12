# Building Windows .exe on macOS

**Version: 0.1a (Alpha)**

PyInstaller does not support cross-compilation, so you cannot directly build a Windows `.exe` file on macOS. This guide provides several alternative solutions.

## Quick Start

Run the interactive setup script:

```bash
./build_windows_on_mac.sh
```

This will guide you through setting up one of the build methods below.

## Option 1: GitHub Actions (RECOMMENDED) ⭐

The easiest and most reliable method. Builds automatically in the cloud on Windows.

### Setup

1. **Push your code to GitHub** (if not already done)

2. **The workflow is already configured** in `.github/workflows/build-windows.yml`

3. **Trigger the build:**
   - Go to your repository on GitHub
   - Click "Actions" tab
   - Select "Build Windows Executable" workflow
   - Click "Run workflow"
   - Wait for build to complete (5-10 minutes)

4. **Download the .exe:**
   - Go to the completed workflow run
   - Click on "vmix_score_control.exe" in Artifacts
   - Download the file

### Using GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh

# Authenticate
gh auth login

# Trigger build
gh workflow run build-windows.yml

# Download artifact (after build completes)
gh run download
```

### Automatic Builds

The workflow automatically builds when you:
- Push a tag starting with `v` (e.g., `v1.0.0`)
- Create a pull request to `main` branch

## Option 2: Docker with Windows Container

Requires Docker Desktop with Windows container support.

### Prerequisites

1. **Docker Desktop** installed
2. **Enable Windows containers:**
   - Open Docker Desktop
   - Settings > General
   - Enable "Use Windows containers"
   - Restart Docker Desktop

### Build

```bash
# Run the setup script
./build_windows_on_mac.sh
# Select option 2

# Or manually:
./build_windows_docker.sh
```

**Note:** Windows containers require significant disk space and may not work on Apple Silicon Macs.

## Option 3: Virtual Machine

Use a Windows VM (Parallels, VMware, VirtualBox, etc.)

### Steps

1. **Install Windows VM**
2. **Install Python 3.8+** in the VM
3. **Copy project** to the VM
4. **Run build script** in the VM:
   ```cmd
   build_windows.bat
   ```
   or
   ```cmd
   python build.py
   ```
5. **Copy the .exe** back to macOS

## Option 4: Remote Windows Machine

Build on a remote Windows machine via SSH.

### Setup

1. **Edit `build_windows_remote.sh`:**
   ```bash
   REMOTE_HOST="user@windows-machine"
   REMOTE_PATH="/path/to/project"
   ```

2. **Ensure SSH access** to the Windows machine

3. **Run:**
   ```bash
   ./build_windows_remote.sh
   ```

### Requirements

- SSH access to Windows machine
- Python installed on remote machine
- `rsync` and `scp` available

## Option 5: Wine (Experimental - Not Recommended)

Uses Wine to run Windows Python and PyInstaller. **This is experimental and may not work correctly.**

### Setup

```bash
# Install Wine
brew install --cask wine-stable

# Run setup
./build_windows_on_mac.sh
# Select option 5
```

**Warning:** Wine builds may produce non-functional executables. Use only for testing.

## Comparison

| Method | Ease | Reliability | Speed | Cost |
|--------|------|-------------|-------|------|
| GitHub Actions | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Free |
| Docker | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Free |
| VM | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | VM License |
| Remote | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Free |
| Wine | ⭐ | ⭐ | ⭐⭐ | Free |

## Recommended Workflow

1. **Development:** Use macOS for development
2. **Testing:** Test on macOS with Python directly
3. **Release:** Use GitHub Actions to build Windows .exe
4. **Distribution:** Download .exe from GitHub Actions artifacts

## Troubleshooting

### GitHub Actions

**Build fails:**
- Check Actions logs for errors
- Ensure all dependencies are in `requirements.txt`
- Verify spec file paths are correct

**Can't download artifact:**
- Artifacts expire after 30 days
- Re-run the workflow to generate new artifacts

### Docker

**"Windows containers not supported":**
- Apple Silicon Macs don't support Windows containers
- Use GitHub Actions instead

**Build fails:**
- Check Docker logs
- Ensure Windows container is enabled
- Verify Docker has enough resources allocated

### Remote Build

**Connection fails:**
- Verify SSH credentials
- Check network connectivity
- Ensure Python is in PATH on remote machine

## Alternative: Pre-built Executables

If you need a Windows .exe immediately:

1. Ask a Windows user to build it
2. Use a cloud Windows instance (AWS, Azure, etc.)
3. Use a CI/CD service (GitHub Actions, GitLab CI, etc.)

## See Also

- [BUILD.md](BUILD.md) - General build instructions
- [README.md](README.md) - Project documentation
