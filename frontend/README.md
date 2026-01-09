# Frontend - vMix Russian Billiard Score Control

Frontend components for the vMix Russian Billiard Score Control system. Contains the control panel for operators and the overlay display for vMix Browser Input.

## Structure

```
frontend/
├── control/          # Control Panel (operator interface)
│   ├── index.html
│   ├── style.css
│   └── app.js
└── overlay/          # vMix Overlay (score display)
    ├── index.html
    ├── style.css
    └── app.js
```

## Control Panel (`control/`)

Web-based control interface for operators to manage match scores, timers, and periods.

### Features

- Real-time score control with +/- buttons
- Team name configuration
- Period management
- Timer controls (Start/Stop/Set)
- Match reset functionality
- WebSocket connection status indicator
- Responsive design

### Access

**Local:**
```
http://localhost:8000/control
```

**LAN (replace with server IP):**
```
http://192.168.1.100:8000/control
```

### Usage

1. **Set Match ID**: Enter match ID in header (default: 1)
2. **Setup Match**:
   - Enter team names
   - Set initial period and timer
   - Click "Apply Setup"
3. **Control Scores**: Use +/- buttons for each team
4. **Manage Timer**: Start/Stop or set specific time
5. **Change Period**: Use +/- buttons
6. **Reset**: Click "Reset Match" to clear everything

### Technologies

- Vanilla JavaScript (no build step)
- WebSocket API for real-time updates
- Fetch API for REST calls
- CSS3 for responsive styling

## Overlay (`overlay/`)

Transparent overlay display designed for vMix Browser Input. Shows scores, period, and timer in a broadcast-ready format.

### Features

- Transparent background for vMix compositing
- Large, readable score display
- CSS animations on score changes (bump/pop + glow)
- Real-time WebSocket updates
- Automatic reconnection with exponential backoff
- Auto-formatted timer (MM:SS or HH:MM:SS)
- Multiple match support via query parameter

### Access

**Local (Match ID 1):**
```
http://localhost:8000/overlay?matchId=1
```

**Local (Match ID 2):**
```
http://localhost:8000/overlay?matchId=2
```

**LAN (replace with server IP):**
```
http://192.168.1.100:8000/overlay?matchId=1
```

### vMix Configuration

See main `README.md` for detailed vMix Browser Input setup instructions.

**Quick Setup:**
1. Add Browser Input in vMix
2. URL: `http://localhost:8000/overlay?matchId=1`
3. Width: `1920`, Height: `1080`
4. Zoom: `100%`
5. Scrollbars: `Disabled`
6. Transparency: `Enabled`

### Display Layout

```
HomeName | HomeScore | AwayScore | AwayName
         Period: 1     Timer: 15:00
```

### Animations

- **Score Changes**: Bump/pop scale animation with golden glow effect
- **Setup/Reset**: Fade-in transition
- **Animations**: Pure CSS keyframes (no external libraries)

### Technologies

- Vanilla JavaScript (no build step)
- WebSocket API with reconnection logic
- CSS3 animations and transitions
- Fetch API for fallback polling

## Running Locally

### Prerequisites

- Backend server must be running (see `../backend/README.md`)
- Modern web browser with WebSocket support
- No build step required - files are served directly by FastAPI

### Development

1. **Start Backend Server**:
   ```bash
   cd ../backend
   python main.py
   ```

2. **Open Control Panel**:
   - Navigate to: `http://localhost:8000/control`
   - Or use the overlay: `http://localhost:8000/overlay?matchId=1`

### File Modifications

Since there's no build step, you can edit files directly:

1. **Edit HTML/CSS/JS files** in `control/` or `overlay/`
2. **Refresh browser** to see changes
3. **No compilation needed** - changes are immediate

**Note**: If backend is running with `--reload`, restart the server if you change static file paths or routing.

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

Requires browsers with:
- WebSocket API support
- Fetch API support
- ES6+ JavaScript support
- CSS3 animations support

## Network Configuration

### Local Access

Works automatically when backend runs on `localhost:8000`.

### LAN Access

1. **Find Server IP**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Linux/Mac: `ifconfig` or `ip addr`

2. **Access via IP**:
   - Control: `http://192.168.1.100:8000/control`
   - Overlay: `http://192.168.1.100:8000/overlay?matchId=1`

3. **Ensure Firewall Allows Port 8000**

## Troubleshooting

### Control Panel Not Connecting

1. Check backend server is running
2. Verify connection status indicator (top right)
3. Open browser console (F12) for errors
4. Check WebSocket connection in Network tab

### Overlay Not Updating

1. Check browser console (F12) for WebSocket errors
2. Verify match ID matches control panel
3. Check backend server is running
4. Try refreshing the overlay page
5. Verify overlay URL in vMix Browser Input settings

### Animations Not Working

1. Check browser supports CSS animations
2. Verify CSS file is loading (check Network tab)
3. Check for JavaScript errors in console

### WebSocket Reconnection Issues

- Overlay has automatic reconnection with exponential backoff
- Check server logs for WebSocket errors
- Verify firewall allows WebSocket connections
- Try accessing via `localhost` instead of IP

## Customization

### Styling

Edit CSS files directly:
- Control Panel: `control/style.css`
- Overlay: `overlay/style.css`

### Layout

Modify HTML structure:
- Control Panel: `control/index.html`
- Overlay: `overlay/index.html`

### Functionality

Extend JavaScript:
- Control Panel: `control/app.js`
- Overlay: `overlay/app.js`

**Note**: All changes take effect immediately after saving (just refresh browser).

## File Structure Details

### Control Panel Files

- `index.html`: Main HTML structure, form elements, buttons
- `style.css`: Responsive design, button styles, layout
- `app.js`: WebSocket client, REST API calls, state management, event handlers

### Overlay Files

- `index.html`: Score display layout (minimal, optimized for performance)
- `style.css`: Transparent background, animations, score display styling
- `app.js`: WebSocket client with reconnection, animation triggers, state updates

---

**Note**: These frontend files are served as static files by the FastAPI backend. No separate web server needed.
