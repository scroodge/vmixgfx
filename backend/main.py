"""
vMix Sports Score Control - FastAPI Backend
Provides REST API and WebSocket endpoints for real-time score management.
"""

import asyncio
import json
import time
from pathlib import Path
from collections import defaultdict
from typing import Dict, Set, Optional
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
    homeName: str = Field(default="Home", min_length=1, max_length=50)
    awayName: str = Field(default="Away", min_length=1, max_length=50)
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
BASE_DIR = Path(__file__).resolve().parent.parent
CONTROL_DIR = BASE_DIR / "frontend" / "control"
OVERLAY_DIR = BASE_DIR / "frontend" / "overlay"

app.mount("/control", StaticFiles(directory=str(CONTROL_DIR), html=True), name="control")
app.mount("/overlay", StaticFiles(directory=str(OVERLAY_DIR), html=True), name="overlay")

# ============================================================================
# State Management
# ============================================================================

# In-memory match state storage
matches: Dict[str, MatchState] = {}

# Store GFX settings per match (can be extended to database)
gfx_settings: Dict[str, dict] = {}

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
        state.homeName = request.homeName
        state.awayName = request.awayName
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
    gfx_settings[match_id]['backgrounds']['container']['imagePositionX'] = 'center'
    gfx_settings[match_id]['backgrounds']['container']['imagePositionY'] = 'center'
    
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
        "version": "1.0.0",
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
    print("vMix Russian Billiard Score Control Server started")
    print("Control Panel: http://localhost:8000/control")
    print("Overlay: http://localhost:8000/overlay")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
