"""
vMix Sports Score Control - FastAPI Backend
Provides REST API and WebSocket endpoints for real-time score management.
"""

import asyncio
import json
import time
import sys
import os
from pathlib import Path
from collections import defaultdict
from typing import Dict, Set, Optional, List
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field, field_validator
import base64

# ============================================================================
# Pydantic Models
# ============================================================================

class MatchState(BaseModel):
    """Complete match state structure"""
    match_id: str
    homeName: str = "Home"
    awayName: str = "Away"
    homeScore: int = 0  # Current game score
    awayScore: int = 0  # Current game score
    homeMatchScore: int = 0  # Overall match score (sum of games won)
    awayMatchScore: int = 0  # Overall match score (sum of games won)
    period: int = 1
    timerSecondsRemaining: int = 0
    timerRunning: bool = False
    rev: int = 0  # Revision counter for tracking changes

class SetupRequest(BaseModel):
    """Request model for match setup"""
    homeName: Optional[str] = Field(default=None, min_length=1, max_length=50, description="Optional: Player 1 name (if not provided, uses current state)")
    awayName: Optional[str] = Field(default=None, min_length=1, max_length=50, description="Optional: Player 2 name (if not provided, uses current state)")
    period: int = Field(default=1, ge=1, le=20)
    timerSeconds: int = Field(default=0, ge=0)

class ScoreRequest(BaseModel):
    """Request model for score updates"""
    team: str = Field(..., description="Must be 'home' or 'away'")
    delta: int = Field(..., description="Score change (positive or negative)")

    @field_validator('team')
    @classmethod
    def validate_team(cls, v: str) -> str:
        if v.lower() not in ['home', 'away']:
            raise ValueError("team must be 'home' or 'away'")
        return v.lower()

class TimerSetRequest(BaseModel):
    """Request model for setting timer"""
    seconds: int = Field(..., ge=0)

class PeriodSetRequest(BaseModel):
    """Request model for setting period"""
    period: int = Field(..., ge=1, le=20)

class PlayerCreate(BaseModel):
    """Request model for creating a player"""
    name: str = Field(..., min_length=1, max_length=50, description="Player name")

class PlayerAssign(BaseModel):
    """Request model for assigning player to match"""
    player_id: str = Field(..., description="Player ID to assign")
    team: str = Field(..., description="Must be 'home' or 'away'")
    
    @field_validator('team')
    @classmethod
    def validate_team(cls, v: str) -> str:
        if v.lower() not in ['home', 'away']:
            raise ValueError("team must be 'home' or 'away'")
        return v.lower()

class Player(BaseModel):
    """Player model"""
    id: str
    name: str
    created_at: float

class Tournament(BaseModel):
    """Tournament model"""
    id: str
    name: str
    created_at: float
    players: List[Player] = []

class TournamentCreate(BaseModel):
    """Request model for creating a tournament"""
    name: str = Field(..., min_length=1, max_length=100, description="Tournament name")

class TournamentUpdate(BaseModel):
    """Request model for updating tournament name"""
    name: str = Field(..., min_length=1, max_length=100, description="Tournament name")

class TournamentData(BaseModel):
    """Tournament data structure for JSON storage"""
    tournaments: Dict[str, Tournament] = {}
    current_tournament_id: Optional[str] = None
    tournament_id_counter: int = 0
    player_id_counter: int = 0

class WebSocketEvent(BaseModel):
    """WebSocket message structure"""
    type: str  # "state" | "score_changed" | "timer_started" | "timer_stopped" | "period_changed" | "setup" | "reset"
    state: MatchState
    changed: Optional[Dict] = None  # Optional field with change details {field, team, delta}
    ts: int  # Unix timestamp in milliseconds

# ============================================================================
# FastAPI App Setup
# ============================================================================

app = FastAPI(title="vMix Sports Score Control")

# CORS middleware for local LAN usage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local LAN
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving - resolve paths relative to this file's parent directory
# Handle PyInstaller bundle mode
if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle - files are extracted to sys._MEIPASS
    BASE_DIR = Path(sys._MEIPASS)
else:
    # Running in development mode
    BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"
CONTROL_DIR = BASE_DIR / "frontend" / "control"
OVERLAY_DIR = BASE_DIR / "frontend" / "overlay"

# Verify directories exist and log paths for debugging
if not FRONTEND_DIR.exists():
    print(f"WARNING: Frontend directory not found at: {FRONTEND_DIR}")
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"sys._MEIPASS: {getattr(sys, '_MEIPASS', 'N/A')}")
    print(f"__file__: {__file__}")
    # Try alternative path structure (if files are in different location)
    if (BASE_DIR / "control").exists():
        FRONTEND_DIR = BASE_DIR
        CONTROL_DIR = BASE_DIR / "control"
        OVERLAY_DIR = BASE_DIR / "overlay"
    else:
        print("ERROR: Frontend files not found. Cannot start server.")
        raise FileNotFoundError(f"Frontend directory not found at: {FRONTEND_DIR}")
else:
    print(f"Frontend directory found at: {FRONTEND_DIR}")

# Mount frontend directory for shared files like translations.js
# Verify directories exist before mounting
if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR), html=False), name="frontend")
else:
    print(f"ERROR: Frontend directory does not exist: {FRONTEND_DIR}")

if CONTROL_DIR.exists():
    app.mount("/control", StaticFiles(directory=str(CONTROL_DIR), html=True), name="control")
else:
    print(f"ERROR: Control directory does not exist: {CONTROL_DIR}")

if OVERLAY_DIR.exists():
    app.mount("/overlay", StaticFiles(directory=str(OVERLAY_DIR), html=True), name="overlay")
else:
    print(f"ERROR: Overlay directory does not exist: {OVERLAY_DIR}")

# ============================================================================
# JSON Persistence for Tournaments
# ============================================================================

def get_data_directory() -> Path:
    """Get the data directory path (works with PyInstaller and dev mode)"""
    if getattr(sys, 'frozen', False):
        # PyInstaller bundle - save data next to exe
        return Path(sys.executable).parent / "data"
    else:
        # Development mode - save in backend/data
        return Path(__file__).resolve().parent / "data"

def get_tournaments_file_path() -> Path:
    """Get the path to tournaments.json file"""
    data_dir = get_data_directory()
    return data_dir / "tournaments.json"

def load_tournaments_data() -> TournamentData:
    """Load tournaments data from JSON file"""
    file_path = get_tournaments_file_path()
    
    # Create data directory if it doesn't exist
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Load data from file if exists
    if file_path.exists():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Parse into TournamentData model
                tournaments = {}
                for tid, tdata in data.get('tournaments', {}).items():
                    # Parse players safely
                    players = []
                    for p in tdata.get('players', []):
                        try:
                            if isinstance(p, dict):
                                # Ensure all required fields are present
                                if 'id' in p and 'name' in p and 'created_at' in p:
                                    players.append(Player(
                                        id=str(p['id']),
                                        name=str(p['name']),
                                        created_at=float(p['created_at'])
                                    ))
                                else:
                                    print(f"Warning: Player data missing required fields: {p}")
                            elif isinstance(p, Player):
                                # Already a Player object
                                players.append(p)
                            else:
                                print(f"Warning: Unknown player type: {type(p)}")
                        except Exception as e:
                            print(f"Error parsing player {p}: {e}")
                            continue
                    
                    try:
                        tournaments[tid] = Tournament(
                            id=str(tdata.get('id', tid)),
                            name=str(tdata.get('name', 'Unknown Tournament')),
                            created_at=float(tdata.get('created_at', time.time())),
                            players=players
                        )
                    except Exception as e:
                        print(f"Error creating tournament {tid}: {e}")
                        continue
                
                return TournamentData(
                    tournaments=tournaments,
                    current_tournament_id=data.get('current_tournament_id'),
                    tournament_id_counter=data.get('tournament_id_counter', 0),
                    player_id_counter=data.get('player_id_counter', 0)
                )
        except Exception as e:
            print(f"Error loading tournaments data: {e}")
            import traceback
            traceback.print_exc()
            print("Creating default tournaments data...")
    
    # Return default empty data if file doesn't exist or loading failed
    return TournamentData(
        tournaments={},
        current_tournament_id=None,
        tournament_id_counter=0,
        player_id_counter=0
    )

def save_tournaments_data(data: TournamentData):
    """Save tournaments data to JSON file"""
    file_path = get_tournaments_file_path()
    
    # Create data directory if it doesn't exist
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Convert to dict for JSON serialization
        json_data = {
            'tournaments': {
                tid: {
                    'id': tournament.id,
                    'name': tournament.name,
                    'created_at': tournament.created_at,
                    'players': [p.model_dump() for p in tournament.players]
                }
                for tid, tournament in data.tournaments.items()
            },
            'current_tournament_id': data.current_tournament_id,
            'tournament_id_counter': data.tournament_id_counter,
            'player_id_counter': data.player_id_counter
        }
        
        # Write to file atomically (using temporary file)
        temp_path = file_path.with_suffix('.json.tmp')
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        # Replace original file
        temp_path.replace(file_path)
        
        print(f"Tournaments data saved to: {file_path}")
    except Exception as e:
        print(f"Error saving tournaments data: {e}")
        raise

# ============================================================================
# State Management
# ============================================================================

# In-memory match state storage
matches: Dict[str, MatchState] = {}

# Store GFX settings per match (can be extended to database)
gfx_settings: Dict[str, dict] = {}

# Store tournaments data (loaded from JSON)
tournaments_data: TournamentData = TournamentData()

# WebSocket connections per match
connections: Dict[str, Set[WebSocket]] = defaultdict(set)

# Timer task references (to track if timer is running for a match)
timer_tasks: Dict[str, asyncio.Task] = {}

# Lock for state updates (not strictly needed with asyncio but good practice)
state_lock = asyncio.Lock()

# ============================================================================
# Helper Functions
# ============================================================================

async def broadcast_event(match_id: str, event_type: str, state: MatchState, changed: Optional[Dict] = None):
    """Broadcast an event to all WebSocket connections for a match"""
    if match_id not in connections:
        return
    
    event = WebSocketEvent(
        type=event_type,
        state=state,
        changed=changed,
        ts=int(time.time() * 1000)
    )
    
    message = event.model_dump_json()
    
    # Send to all connected clients
    disconnected = set()
    for ws in connections[match_id]:
        try:
            await ws.send_text(message)
        except Exception:
            disconnected.add(ws)
    
    # Remove disconnected clients
    connections[match_id] -= disconnected

def get_or_create_match(match_id: str) -> MatchState:
    """Get existing match or create a new one"""
    if match_id not in matches:
        matches[match_id] = MatchState(match_id=match_id)
    return matches[match_id]

def get_current_tournament() -> Optional[Tournament]:
    """Get the current selected tournament"""
    try:
        if not hasattr(tournaments_data, 'current_tournament_id') or not tournaments_data.current_tournament_id:
            return None
        
        if tournaments_data.current_tournament_id not in tournaments_data.tournaments:
            # Current tournament ID doesn't exist in tournaments dict
            print(f"Warning: Current tournament ID '{tournaments_data.current_tournament_id}' not found in tournaments")
            return None
        
        return tournaments_data.tournaments[tournaments_data.current_tournament_id]
    except Exception as e:
        print(f"Error in get_current_tournament: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_or_create_current_tournament() -> Tournament:
    """Get current tournament or create default if none exists"""
    tournament = get_current_tournament()
    if tournament is None:
        # Create default tournament
        tournament_id = f"tournament_{tournaments_data.tournament_id_counter + 1}"
        tournaments_data.tournament_id_counter += 1
        tournament = Tournament(
            id=tournament_id,
            name="Default Tournament",
            created_at=time.time(),
            players=[]
        )
        tournaments_data.tournaments[tournament_id] = tournament
        tournaments_data.current_tournament_id = tournament_id
        save_tournaments_data(tournaments_data)
    return tournament

# ============================================================================
# Timer Task
# ============================================================================

async def timer_loop(match_id: str):
    """Background task that decrements timer every second"""
    while True:
        await asyncio.sleep(1)
        
        async with state_lock:
            if match_id not in matches:
                break
            
            state = matches[match_id]
            
            # Only decrement if timer is running
            if not state.timerRunning:
                continue
            
            # Decrement timer
            if state.timerSecondsRemaining > 0:
                state.timerSecondsRemaining -= 1
                state.rev += 1
                matches[match_id] = state
                
                # Broadcast state update
                await broadcast_event(match_id, "state", state)
            else:
                # Timer reached 0, stop it
                state.timerRunning = False
                state.rev += 1
                matches[match_id] = state
                await broadcast_event(match_id, "timer_stopped", state)
                break

def start_timer_task(match_id: str):
    """Start the timer task for a match if not already running"""
    if match_id in timer_tasks and not timer_tasks[match_id].done():
        return
    
    task = asyncio.create_task(timer_loop(match_id))
    timer_tasks[match_id] = task

def stop_timer_task(match_id: str):
    """Stop the timer task for a match"""
    if match_id in timer_tasks and not timer_tasks[match_id].done():
        timer_tasks[match_id].cancel()
        del timer_tasks[match_id]

# ============================================================================
# REST API Endpoints
# ============================================================================

@app.get("/api/match/{match_id}/state")
async def get_match_state(match_id: str):
    """Get current match state"""
    state = get_or_create_match(match_id)
    return state.model_dump()

@app.post("/api/match/{match_id}/setup")
async def setup_match(match_id: str, request: SetupRequest):
    """Set up match with team names, period, and initial timer"""
    async with state_lock:
        state = get_or_create_match(match_id)
        
        # Update names only if provided (otherwise keep current values)
        if request.homeName is not None:
            state.homeName = request.homeName
        # If homeName is None and state has no name, use default
        elif not state.homeName or state.homeName == "Home":
            state.homeName = "Player 1"
        
        if request.awayName is not None:
            state.awayName = request.awayName
        # If awayName is None and state has no name, use default
        elif not state.awayName or state.awayName == "Away":
            state.awayName = "Player 2"
        
        state.period = request.period
        state.timerSecondsRemaining = request.timerSeconds
        state.timerRunning = False
        # Match scores default to 0 if not set
        if not hasattr(state, 'homeMatchScore'):
            state.homeMatchScore = 0
        if not hasattr(state, 'awayMatchScore'):
            state.awayMatchScore = 0
        state.rev += 1
        matches[match_id] = state
        
        await broadcast_event(match_id, "setup", state, {"field": "setup"})
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/score")
async def update_score(match_id: str, request: ScoreRequest):
    """Update score for home or away team"""
    async with state_lock:
        state = get_or_create_match(match_id)
        
        if request.team == "home":
            new_score = max(0, state.homeScore + request.delta)
            state.homeScore = new_score
        else:
            new_score = max(0, state.awayScore + request.delta)
            state.awayScore = new_score
        
        state.rev += 1
        matches[match_id] = state
        
        await broadcast_event(
            match_id,
            "score_changed",
            state,
            {"field": "score", "team": request.team, "delta": request.delta}
        )
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/reset")
async def reset_match(match_id: str):
    """Reset match to initial state"""
    async with state_lock:
        state = get_or_create_match(match_id)
        state.homeScore = 0
        state.awayScore = 0
        state.homeMatchScore = 0
        state.awayMatchScore = 0
        state.period = 1
        state.timerSecondsRemaining = 0
        state.timerRunning = False
        state.rev += 1
        matches[match_id] = state
        
        # Stop timer task if running
        stop_timer_task(match_id)
        
        await broadcast_event(match_id, "reset", state, {"field": "reset"})
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/match-score")
async def update_match_score(match_id: str, request: ScoreRequest):
    """Update overall match score (games won) for home or away team"""
    async with state_lock:
        state = get_or_create_match(match_id)
        
        if request.team == "home":
            new_score = max(0, state.homeMatchScore + request.delta)
            state.homeMatchScore = new_score
        else:
            new_score = max(0, state.awayMatchScore + request.delta)
            state.awayMatchScore = new_score
        
        state.rev += 1
        matches[match_id] = state
        
        await broadcast_event(
            match_id,
            "match_score_changed",
            state,
            {"field": "match_score", "team": request.team, "delta": request.delta}
        )
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/timer/start")
async def start_timer(match_id: str):
    """Start the timer"""
    async with state_lock:
        state = get_or_create_match(match_id)
        
        if not state.timerRunning:
            state.timerRunning = True
            state.rev += 1
            matches[match_id] = state
            
            # Start timer task
            start_timer_task(match_id)
            
            await broadcast_event(match_id, "timer_started", state)
        else:
            # Already running, just broadcast current state
            await broadcast_event(match_id, "state", state)
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/timer/stop")
async def stop_timer(match_id: str):
    """Stop the timer"""
    async with state_lock:
        state = get_or_create_match(match_id)
        
        if state.timerRunning:
            state.timerRunning = False
            state.rev += 1
            matches[match_id] = state
            
            # Stop timer task
            stop_timer_task(match_id)
            
            await broadcast_event(match_id, "timer_stopped", state)
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/timer/set")
async def set_timer(match_id: str, request: TimerSetRequest):
    """Set timer to specific seconds (stops timer if running)"""
    async with state_lock:
        state = get_or_create_match(match_id)
        state.timerSecondsRemaining = request.seconds
        state.timerRunning = False
        state.rev += 1
        matches[match_id] = state
        
        # Stop timer task if running
        stop_timer_task(match_id)
        
        await broadcast_event(match_id, "state", state, {"field": "timer", "seconds": request.seconds})
    
    return {"status": "ok", "state": state.model_dump()}

@app.post("/api/match/{match_id}/period/set")
async def set_period(match_id: str, request: PeriodSetRequest):
    """Set period number"""
    async with state_lock:
        state = get_or_create_match(match_id)
        state.period = request.period
        state.rev += 1
        matches[match_id] = state
        
        await broadcast_event(match_id, "period_changed", state, {"field": "period", "period": request.period})
    
    return {"status": "ok", "state": state.model_dump()}

# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws/match/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: str):
    """WebSocket endpoint for real-time match state updates"""
    await websocket.accept()
    
    # Add to connections
    connections[match_id].add(websocket)
    
    # Send initial state
    state = get_or_create_match(match_id)
    initial_event = WebSocketEvent(
        type="state",
        state=state,
        ts=int(time.time() * 1000)
    )
    await websocket.send_text(initial_event.model_dump_json())
    
    try:
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            # Optionally handle client messages here (ping/pong, etc.)
            # For now, just keep connection alive
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error for match {match_id}: {e}")
    finally:
        # Remove from connections
        connections[match_id].discard(websocket)
        if not connections[match_id]:
            del connections[match_id]

# ============================================================================
# Root endpoint
# ============================================================================

# ============================================================================
# GFX Settings API
# ============================================================================

@app.get("/api/match/{match_id}/gfx-settings")
async def get_gfx_settings(match_id: str):
    """Get GFX settings for a match"""
    if match_id in gfx_settings:
        return gfx_settings[match_id]
    return {}

@app.post("/api/match/{match_id}/gfx-settings")
async def set_gfx_settings(match_id: str, settings: dict):
    """Save GFX settings for a match (primary storage for vMix)"""
    gfx_settings[match_id] = settings
    # Broadcast settings update to connected overlays via WebSocket
    if match_id in connections:
        message = json.dumps({"type": "gfxSettings", "settings": settings})
        disconnected = []
        for ws in connections[match_id]:
            try:
                await ws.send_text(message)
            except:
                disconnected.append(ws)
        # Clean up disconnected clients
        for ws in disconnected:
            connections[match_id].discard(ws)
    return {"status": "ok"}

@app.post("/api/match/{match_id}/background-upload")
async def upload_background(match_id: str, file: UploadFile = File(...)):
    """Upload a background image for a match (converts to base64)"""
    # Read file content
    contents = await file.read()
    
    # Convert to base64
    base64_content = base64.b64encode(contents).decode('utf-8')
    
    # Get file extension/mime type
    mime_type = file.content_type or "image/png"
    
    # Create data URL
    data_url = f"data:{mime_type};base64,{base64_content}"
    
    # Get or create GFX settings for this match
    if match_id not in gfx_settings:
        gfx_settings[match_id] = {}
    
    if 'backgrounds' not in gfx_settings[match_id]:
        gfx_settings[match_id]['backgrounds'] = {}
    
    if 'container' not in gfx_settings[match_id]['backgrounds']:
        gfx_settings[match_id]['backgrounds']['container'] = {}
    
    # Store the uploaded background image
    gfx_settings[match_id]['backgrounds']['container']['type'] = 'image'
    gfx_settings[match_id]['backgrounds']['container']['imageUrl'] = data_url
    gfx_settings[match_id]['backgrounds']['container']['imageSize'] = 'cover'
    gfx_settings[match_id]['backgrounds']['container']['imageOpacity'] = 100
    gfx_settings[match_id]['backgrounds']['container']['imagePositionX'] = 50  # Percentage 0-100
    gfx_settings[match_id]['backgrounds']['container']['imagePositionY'] = 50  # Percentage 0-100
    
    # Broadcast settings update to connected overlays via WebSocket
    if match_id in connections:
        message = json.dumps({"type": "gfxSettings", "settings": gfx_settings[match_id]})
        disconnected = []
        for ws in connections[match_id]:
            try:
                await ws.send_text(message)
            except:
                disconnected.append(ws)
        for ws in disconnected:
            connections[match_id].discard(ws)
    
    return {
        "status": "ok",
        "message": "Background uploaded successfully",
        "settings": gfx_settings[match_id]
    }

# ============================================================================
# Tournament Management API
# ============================================================================

@app.get("/api/tournaments")
async def get_tournaments():
    """Get all tournaments"""
    tournament_list = [{
        "id": tournament.id,
        "name": tournament.name,
        "created_at": tournament.created_at,
        "player_count": len(tournament.players)
    } for tournament in tournaments_data.tournaments.values()]
    # Sort by creation time (newest first)
    tournament_list.sort(key=lambda x: x.get('created_at', 0), reverse=True)
    return {"status": "ok", "tournaments": tournament_list}

@app.post("/api/tournaments")
async def create_tournament(request: TournamentCreate):
    """Create a new tournament"""
    tournaments_data.tournament_id_counter += 1
    tournament_id = f"tournament_{tournaments_data.tournament_id_counter}"
    
    tournament = Tournament(
        id=tournament_id,
        name=request.name,
        created_at=time.time(),
        players=[]
    )
    
    tournaments_data.tournaments[tournament_id] = tournament
    # Automatically select newly created tournament
    tournaments_data.current_tournament_id = tournament_id
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "tournament": {
        "id": tournament.id,
        "name": tournament.name,
        "created_at": tournament.created_at,
        "player_count": len(tournament.players)
    }}

@app.get("/api/tournaments/{tournament_id}")
async def get_tournament(tournament_id: str):
    """Get tournament information"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament = tournaments_data.tournaments[tournament_id]
    return {"status": "ok", "tournament": {
        "id": tournament.id,
        "name": tournament.name,
        "created_at": tournament.created_at,
        "players": [p.model_dump() for p in tournament.players]
    }}

@app.put("/api/tournaments/{tournament_id}")
async def update_tournament(tournament_id: str, request: TournamentUpdate):
    """Update tournament name"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournaments_data.tournaments[tournament_id].name = request.name
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "tournament": {
        "id": tournaments_data.tournaments[tournament_id].id,
        "name": tournaments_data.tournaments[tournament_id].name,
        "created_at": tournaments_data.tournaments[tournament_id].created_at,
        "player_count": len(tournaments_data.tournaments[tournament_id].players)
    }}

@app.delete("/api/tournaments/{tournament_id}")
async def delete_tournament(tournament_id: str):
    """Delete a tournament"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Don't allow deleting if it's the only tournament
    if len(tournaments_data.tournaments) <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the only tournament")
    
    del tournaments_data.tournaments[tournament_id]
    
    # If deleted tournament was current, select first available
    if tournaments_data.current_tournament_id == tournament_id:
        if tournaments_data.tournaments:
            tournaments_data.current_tournament_id = list(tournaments_data.tournaments.keys())[0]
        else:
            tournaments_data.current_tournament_id = None
    
    save_tournaments_data(tournaments_data)
    return {"status": "ok", "message": "Tournament deleted"}

@app.get("/api/tournaments/current")
async def get_current_tournament_endpoint():
    """Get current selected tournament"""
    tournament = get_current_tournament()
    if tournament is None:
        # Return default structure if no tournament selected
        return {"status": "ok", "tournament": None}
    
    return {"status": "ok", "tournament": {
        "id": tournament.id,
        "name": tournament.name,
        "created_at": tournament.created_at,
        "players": [p.model_dump() for p in tournament.players]
    }}

@app.post("/api/tournaments/{tournament_id}/select")
async def select_tournament(tournament_id: str):
    """Select a tournament as current"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournaments_data.current_tournament_id = tournament_id
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "message": "Tournament selected", "tournament_id": tournament_id}

@app.get("/api/tournaments/{tournament_id}/players")
async def get_tournament_players(tournament_id: str):
    """Get players in a tournament"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament = tournaments_data.tournaments[tournament_id]
    player_list = [player.model_dump() for player in tournament.players]
    player_list.sort(key=lambda x: x.get('created_at', 0), reverse=True)
    return {"status": "ok", "players": player_list}

@app.post("/api/tournaments/{tournament_id}/players")
async def add_player_to_tournament(tournament_id: str, request: PlayerCreate):
    """Add a player to a tournament"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournaments_data.player_id_counter += 1
    player_id = str(tournaments_data.player_id_counter)
    
    player = Player(
        id=player_id,
        name=request.name,
        created_at=time.time()
    )
    
    tournaments_data.tournaments[tournament_id].players.append(player)
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "player": player.model_dump()}

@app.delete("/api/tournaments/{tournament_id}/players/{player_id}")
async def delete_player_from_tournament(tournament_id: str, player_id: str):
    """Delete a player from a tournament"""
    if tournament_id not in tournaments_data.tournaments:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament = tournaments_data.tournaments[tournament_id]
    player_index = None
    for i, p in enumerate(tournament.players):
        if p.id == player_id:
            player_index = i
            break
    
    if player_index is None:
        raise HTTPException(status_code=404, detail="Player not found in tournament")
    
    tournament.players.pop(player_index)
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "message": "Player deleted"}

# ============================================================================
# Players Management API (Updated to work with tournaments)
# ============================================================================

@app.post("/api/players")
async def create_player(request: PlayerCreate):
    """Add a new player to the current tournament"""
    tournament = get_or_create_current_tournament()
    
    tournaments_data.player_id_counter += 1
    player_id = str(tournaments_data.player_id_counter)
    
    player = Player(
        id=player_id,
        name=request.name,
        created_at=time.time()
    )
    
    tournament.players.append(player)
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "player": player.model_dump()}

@app.get("/api/players")
async def get_players():
    """Get all players from the current tournament"""
    try:
        tournament = get_current_tournament()
        if tournament is None:
            return {"status": "ok", "players": []}
        
        # Ensure players is a list
        if not isinstance(tournament.players, list):
            print(f"Warning: tournament.players is not a list, it's {type(tournament.players)}")
            return {"status": "ok", "players": []}
        
        # Convert players to dict format, handling both Player objects and dicts
        player_list = []
        for player in tournament.players:
            try:
                if hasattr(player, 'model_dump'):
                    # It's a Pydantic model
                    player_list.append(player.model_dump())
                elif isinstance(player, dict):
                    # It's already a dict
                    player_list.append(player)
                else:
                    # Try to convert using model_dump_json or create dict manually
                    print(f"Warning: Unknown player type: {type(player)}, skipping")
            except Exception as e:
                print(f"Error converting player {player}: {e}")
                continue
        
        # Sort by creation time (newest first)
        player_list.sort(key=lambda x: x.get('created_at', 0), reverse=True)
        return {"status": "ok", "players": player_list}
    except Exception as e:
        print(f"Error in get_players: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/api/players/{player_id}")
async def delete_player(player_id: str):
    """Delete a player from the current tournament"""
    tournament = get_current_tournament()
    if tournament is None:
        raise HTTPException(status_code=404, detail="No current tournament")
    
    player_index = None
    for i, p in enumerate(tournament.players):
        if p.id == player_id:
            player_index = i
            break
    
    if player_index is None:
        raise HTTPException(status_code=404, detail="Player not found")
    
    tournament.players.pop(player_index)
    save_tournaments_data(tournaments_data)
    
    return {"status": "ok", "message": "Player deleted"}

@app.post("/api/match/{match_id}/players/assign")
async def assign_player_to_match(match_id: str, request: PlayerAssign):
    """Assign a player to a match (home or away)"""
    tournament = get_current_tournament()
    if tournament is None:
        raise HTTPException(status_code=404, detail="No current tournament")
    
    player = None
    for p in tournament.players:
        if p.id == request.player_id:
            player = p
            break
    
    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    
    async with state_lock:
        state = get_or_create_match(match_id)
        
        if request.team == "home":
            state.homeName = player.name
        else:
            state.awayName = player.name
        
        state.rev += 1
        matches[match_id] = state
        
        await broadcast_event(match_id, "setup", state, {
            "field": "player_name",
            "team": request.team,
            "player_id": request.player_id,
            "player_name": player.name
        })
    
    return {"status": "ok", "state": state.model_dump()}

@app.get("/")
async def root(request: Request):
    """Root endpoint - redirects to overlay if matchId provided, else shows API info"""
    match_id = request.query_params.get("matchId")
    
    if match_id:
        # If matchId is provided, redirect to overlay endpoint
        return RedirectResponse(url=f"/overlay?matchId={match_id}")
    
    # Otherwise, return API information
    return {
        "service": "vMix Russian Billiard Score Control",
        "version": "0.1a",
        "endpoints": {
            "control": "/control",
            "overlay": "/overlay",
            "api": "/api/match/{match_id}/..."
        },
        "usage": "Add ?matchId=1 to access overlay directly, or use /overlay?matchId=1"
    }

# ============================================================================
# Startup
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    global tournaments_data
    
    # Load tournaments data from JSON
    print("Loading tournaments data...")
    tournaments_data = load_tournaments_data()
    
    # Create default tournament if none exists
    if not tournaments_data.tournaments:
        print("No tournaments found, creating default tournament...")
        default_tournament = Tournament(
            id="tournament_1",
            name="Default Tournament",
            created_at=time.time(),
            players=[]
        )
        tournaments_data.tournaments["tournament_1"] = default_tournament
        tournaments_data.current_tournament_id = "tournament_1"
        tournaments_data.tournament_id_counter = 1
        save_tournaments_data(tournaments_data)
    elif tournaments_data.current_tournament_id is None:
        # If tournaments exist but no current tournament, select first one
        first_tournament_id = list(tournaments_data.tournaments.keys())[0]
        tournaments_data.current_tournament_id = first_tournament_id
        save_tournaments_data(tournaments_data)
    
    print(f"Loaded {len(tournaments_data.tournaments)} tournament(s)")
    if tournaments_data.current_tournament_id:
        current = tournaments_data.tournaments[tournaments_data.current_tournament_id]
        print(f"Current tournament: {current.name} ({current.id})")
        print(f"  Players: {len(current.players)}")
    
    print("=" * 60)
    print("vMix Russian Billiard Score Control Server")
    print("=" * 60)
    print(f"Server started successfully on http://0.0.0.0:8000")
    print("")
    print("Access the application:")
    print("  Control Panel: http://localhost:8000/control")
    print("  Overlay:       http://localhost:8000/overlay?matchId=1")
    print("")
    print("Network Access:")
    print("  You can access this server from other devices on your network")
    print("  using your computer's IP address (e.g., http://192.168.1.100:8000)")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
