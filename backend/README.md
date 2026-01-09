# Backend - vMix Russian Billiard Score Control API

FastAPI backend server providing REST API and WebSocket endpoints for real-time Russian billiard score management.

## Features

- REST API for match state management
- WebSocket server for real-time updates
- Server-side timer with automatic countdown
- Multiple match support (by match ID)
- In-memory state storage
- CORS enabled for local LAN access

## Requirements

- Python 3.8 or higher
- pip (Python package installer)

## Installation

### Step 1: Create Virtual Environment

**Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `websockets` - WebSocket support
- `python-multipart` - Form data handling
- `pydantic` - Data validation

### Step 3: Run the Server

**Option 1: Using Python directly**
```bash
python main.py
```

**Option 2: Using uvicorn (recommended for development)**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes (development only).

**Option 3: Run from project root**
```bash
cd ..
python backend/main.py
```

or

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Server Endpoints

Once running, the server will be available at:

- **API Base**: `http://localhost:8000`
- **Control Panel**: `http://localhost:8000/control`
- **Overlay**: `http://localhost:8000/overlay?matchId=1`
- **API Docs**: `http://localhost:8000/docs` (FastAPI auto-generated docs)

## Configuration

The server binds to `0.0.0.0:8000` by default, which allows:
- Local access via `localhost` or `127.0.0.1`
- LAN access via your machine's IP address (e.g., `192.168.1.100:8000`)

To change the port, edit `main.py`:

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Change port here
```

## API Endpoints

### REST API

All endpoints follow the pattern: `/api/match/{match_id}/...`

- `GET /api/match/{match_id}/state` - Get current match state
- `POST /api/match/{match_id}/setup` - Setup match (team names, period, timer)
- `POST /api/match/{match_id}/score` - Update score (`{"team": "home|away", "delta": ±int}`)
- `POST /api/match/{match_id}/reset` - Reset match to initial state
- `POST /api/match/{match_id}/timer/start` - Start countdown timer
- `POST /api/match/{match_id}/timer/stop` - Stop countdown timer
- `POST /api/match/{match_id}/timer/set` - Set timer to specific seconds
- `POST /api/match/{match_id}/period/set` - Set period number

### WebSocket

- `ws://localhost:8000/ws/match/{match_id}` - Real-time state updates

## State Structure

```json
{
  "match_id": "1",
  "homeName": "Team A",
  "awayName": "Team B",
  "homeScore": 5,
  "awayScore": 3,
  "period": 2,
  "timerSecondsRemaining": 1200,
  "timerRunning": false,
  "rev": 42
}
```

## Timer Behavior

- Timer runs in a background asyncio task
- Decrements `timerSecondsRemaining` every 1 second when `timerRunning=true`
- Automatically stops when reaching 0
- Prevents negative values
- Broadcasts state updates every second while running

## Troubleshooting

### Port Already in Use

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Import Errors

Make sure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Static Files Not Found

Ensure you're running from the project root (parent of `backend/` and `frontend/`), or adjust paths in `main.py`.

## Development

### Running with Auto-reload

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing Endpoints

Use curl or any HTTP client:

```bash
# Get state
curl http://localhost:8000/api/match/1/state

# Update score
curl -X POST http://localhost:8000/api/match/1/score \
  -H "Content-Type: application/json" \
  -d '{"team":"home","delta":1}'

# Setup match
curl -X POST http://localhost:8000/api/match/1/setup \
  -H "Content-Type: application/json" \
  -d '{"homeName":"Team A","awayName":"Team B","period":1,"timerSeconds":1800}'
```

### View API Documentation

FastAPI automatically generates interactive API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Production Considerations

For production use:
1. Remove `--reload` flag
2. Use a production ASGI server (gunicorn with uvicorn workers)
3. Configure proper CORS origins instead of `*`
4. Add authentication/authorization
5. Use HTTPS/WSS for secure connections
6. Implement persistent state storage (database) instead of in-memory
7. Add logging and monitoring
8. Use environment variables for configuration

---

**Note**: This backend serves both API endpoints and static frontend files.
