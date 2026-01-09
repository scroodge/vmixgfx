# vMix Russian Billiard Score Control MVP

A complete real-time billiard score control system for vMix broadcasting. Designed specifically for Russian billiard games. Features a FastAPI backend with WebSocket support, a control panel for operators, and an animated overlay display optimized for vMix Browser Input.

## Features

- **Real-time Updates**: WebSocket-based broadcasting ensures instant score updates
- **Server-side Timer**: Accurate countdown timer with automatic stop at zero
- **Animated Overlay**: Smooth score change animations (bump/pop with glow effect)
- **Multiple Game Support**: Handle multiple games simultaneously via game IDs
- **Billiard-Specific Features**: Player 1/Player 2 scoring, game tracking, ball pocketing controls
- **Responsive Control Panel**: Clean, intuitive UI for score management
- **Reliable Reconnection**: Exponential backoff reconnection logic for overlay
- **No Build Step**: Pure HTML/CSS/JavaScript frontend, runs directly from FastAPI

## Tech Stack

- **Backend**: Python 3.8+ with FastAPI, WebSockets, Pydantic
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Server**: Uvicorn ASGI server

## Project Structure

```
/
├── backend/
│   ├── main.py              # FastAPI application with REST & WebSocket endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── control/             # Control Panel
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   └── overlay/             # vMix Overlay Display
│       ├── index.html
│       ├── style.css
│       └── app.js
└── README.md
```

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Windows Setup

1. **Open Command Prompt or PowerShell** in the project directory

2. **Create a virtual environment:**
   ```cmd
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   ```cmd
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```cmd
   cd backend
   pip install -r requirements.txt
   ```

5. **Return to project root and start the server:**
   ```cmd
   cd ..
   python backend/main.py
   ```

   Or using uvicorn directly:
   ```cmd
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. **Access the application:**
   - Control Panel: http://localhost:8000/control
   - Overlay: http://localhost:8000/overlay?matchId=1

### Linux/Mac Setup

1. **Open Terminal** in the project directory

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. **Return to project root and start the server:**
   ```bash
   cd ..
   python backend/main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

6. **Access the application:**
   - Control Panel: http://localhost:8000/control
   - Overlay: http://localhost:8000/overlay?matchId=1

## vMix Configuration Guide

### Adding Browser Input in vMix

1. **Open vMix** and navigate to your production

2. **Add Browser Input:**
   - Click "Add Input" button
   - Select "Browser" from the input types
   - Configure the following settings:

3. **Browser Input Settings:**
   - **URL**: `http://localhost:8000/overlay?matchId=1`
     - For a different match, change `matchId=1` to your desired match ID
     - For LAN access, replace `localhost` with the server's IP address (e.g., `http://192.168.1.100:8000/overlay?matchId=1`)
   
   - **Width**: `1920`
   - **Height**: `1080`
   - **Zoom**: `100%` (do not zoom)
   - **Scrollbars**: `Disabled` (uncheck "Show Scrollbars")
   - **Transparency**: `Enabled` (check "Transparent Background" if available)
   - **Update Rate**: `60 FPS` or `30 FPS` (for stable performance)
   - **Hardware Acceleration**: `Enabled` (recommended)

4. **Additional Tips:**
   - Use **localhost** for local testing to minimize latency
   - Ensure the server is running before adding the Browser Input
   - The overlay has a transparent background designed for vMix compositing
   - Recommended resolution is 1920x1080 for HD broadcasts
   - For 4K broadcasts, you can scale the Browser Input in vMix or adjust CSS font sizes

5. **Positioning in vMix:**
   - The overlay is centered and can be positioned anywhere on your output
   - Use vMix's position controls to adjust placement
   - Consider using vMix's borders/effects for additional styling if needed

## API Documentation

### Base URL
```
http://localhost:8000
```

### REST Endpoints

#### Get Match State
```http
GET /api/match/{match_id}/state
```

**Response:**
```json
{
  "match_id": "1",
  "homeName": "Player 1",
  "awayName": "Player 2",
  "homeScore": 8,
  "awayScore": 5,
  "period": 2,
  "timerSecondsRemaining": 1200,
  "timerRunning": false,
  "rev": 42
}
```

#### Setup Game
```http
POST /api/match/{match_id}/setup
Content-Type: application/json

{
  "homeName": "Player 1",
  "awayName": "Player 2",
  "period": 1,
  "timerSeconds": 1800
}
```

#### Update Score
```http
POST /api/match/{match_id}/score
Content-Type: application/json

{
  "team": "home",  // or "away" (Player 1 or Player 2)
  "delta": 1       // positive or negative integer (1 point per ball)
}
```

#### Reset Match
```http
POST /api/match/{match_id}/reset
```

#### Timer Controls
```http
POST /api/match/{match_id}/timer/start
POST /api/match/{match_id}/timer/stop
POST /api/match/{match_id}/timer/set
Content-Type: application/json

{
  "seconds": 600
}
```

#### Game Control
```http
POST /api/match/{match_id}/period/set
Content-Type: application/json

{
  "period": 2  // Game number (1-20)
}
```

### WebSocket Endpoint

```ws
ws://localhost:8000/ws/match/{match_id}
```

**Message Format (Server → Client):**
```json
{
  "type": "score_changed",  // "state" | "score_changed" | "timer_started" | "timer_stopped" | "period_changed" | "setup" | "reset"
  "state": {
    "match_id": "1",
    "homeName": "Player 1",
    "awayName": "Player 2",
    "homeScore": 8,
    "awayScore": 5,
    "period": 2,
    "timerSecondsRemaining": 1200,
    "timerRunning": false,
    "rev": 42
  },
  "changed": {
    "field": "score",
    "team": "home",
    "delta": 1
  },
  "ts": 1703123456789
}
```

## Usage

### Control Panel

1. **Open** http://localhost:8000/control in a web browser
2. **Set Game ID** (default: 1) in the header
3. **Configure Game:**
   - Enter Player 1 and Player 2 names
   - Set initial game number and timer
   - Click "Apply Setup"

4. **Manage Scores:**
   - Use +/- buttons to adjust scores (each ball pocketed = 1 point)
   - Use "+Ball" button for quick ball pocketing increments
   - Scores cannot go below 0
   - Changes appear instantly in the overlay

5. **Control Timer:**
   - Start/Stop the countdown timer (useful for shot clock or game time)
   - Set timer to specific time (MM:SS format)
   - Timer automatically stops at 0

6. **Manage Game:**
   - Use +/- buttons to change game number
   - Minimum game number is 1

7. **Reset:**
   - Click "Reset Game" to reset scores, game number, and timer

### Overlay

The overlay automatically connects via WebSocket and displays:
- Player names (Player 1 | Player 2 format)
- Current scores (large, readable)
- Current game number
- Timer (MM:SS or HH:MM:SS format)

**Features:**
- Score changes trigger animated bump/pop effect with glow
- Automatic reconnection with exponential backoff
- Fallback REST polling if WebSocket fails
- Transparent background for vMix compositing

**Multiple Games:**
- Use query parameter: `?matchId=2` for game ID 2
- Each game maintains independent state

## Network Configuration

### Local Access
- Server binds to `0.0.0.0:8000` (all interfaces)
- Access via `localhost` or `127.0.0.1`

### LAN Access
- Find server IP address (e.g., `192.168.1.100`)
- Access via `http://192.168.1.100:8000/control`
- Ensure firewall allows port 8000

### Security Notes
- **Development only**: CORS is open to all origins
- For production, restrict CORS origins and add authentication
- Consider using HTTPS/WSS for production deployments

## Troubleshooting

### Server won't start
- Check Python version: `python --version` (must be 3.8+)
- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip list`
- Check port 8000 is not in use: `netstat -an | grep 8000` (Linux/Mac) or `netstat -an | findstr 8000` (Windows)

### Overlay not updating
- Check WebSocket connection in browser console (F12)
- Verify server is running and accessible
- Check match ID matches between control panel and overlay
- Try refreshing the overlay page

### Control Panel not connecting
- Verify connection status indicator (top right)
- Check browser console for errors (F12)
- Ensure server is running
- Try restarting the server

### Timer not running
- Timer only runs when `timerRunning` is true
- Click "Start" button to begin countdown
- Timer stops automatically at 0

### vMix Browser Input shows blank
- Verify overlay URL is correct
- Check server is running
- Enable "Transparent Background" in Browser Input settings
- Check browser console for errors
- Try accessing URL directly in a browser first

## Development

### Running in Development Mode

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes.

### Testing API Endpoints

Use curl or any HTTP client:

```bash
# Get state
curl http://localhost:8000/api/match/1/state

# Update score
curl -X POST http://localhost:8000/api/match/1/score \
  -H "Content-Type: application/json" \
  -d '{"team":"home","delta":1}'
```

## Building Windows Executable

You can build a single Windows executable file (.exe) that contains all services. This allows you to run everything with just one file - no Python installation needed on the target machine.

### Quick Build

1. **Run the build script** from the project root:
   ```cmd
   build_windows.bat
   ```
   Or use PowerShell:
   ```powershell
   .\build_windows.ps1
   ```

2. **Wait for build to complete** (5-10 minutes on first run)

3. **Find the executable** at: `backend\dist\vmix_score_control.exe`

4. **Copy and run** the .exe file on any Windows machine (no Python needed!)

### Using the Executable

- **Double-click** `vmix_score_control.exe` to start all services
- **Control Panel**: http://localhost:8000/control
- **Overlay**: http://localhost:8000/overlay?matchId=1
- The server runs on port 8000 and is accessible on your local network

### Detailed Build Instructions

For complete build instructions, troubleshooting, and customization options, see [BUILD.md](BUILD.md).

**Requirements for Building:**
- Windows 10/11
- Python 3.8+ installed (only needed for building, not for running the .exe)
- Internet connection (for downloading dependencies)

## License

This project is provided as-is for broadcast use.

## Support

For issues or questions, check:
1. Server logs in terminal
2. Browser console (F12)
3. Network tab for API/WebSocket errors

---

**Built for reliable broadcast use with vMix**
