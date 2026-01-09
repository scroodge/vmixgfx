/**
 * vMix Billiard Score Overlay - JavaScript
 * WebSocket client for real-time Russian billiard score display with reconnection logic
 * Includes GFX settings support
 */

// Configuration
const API_BASE = window.location.origin;

// ============================================================================
// GFX Settings Management
// ============================================================================

function loadGFXSettings() {
    const saved = localStorage.getItem('gfxSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            applyGFXSettings(settings);
        } catch (e) {
            console.error('Failed to load GFX settings:', e);
        }
    }
}

function applyGFXSettings(settings) {
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--color-player1', settings.colors.player1);
    root.style.setProperty('--color-player1-score', settings.colors.player1Score);
    root.style.setProperty('--color-player2', settings.colors.player2);
    root.style.setProperty('--color-player2-score', settings.colors.player2Score);
    root.style.setProperty('--color-separator', settings.colors.separator);
    root.style.setProperty('--color-game-timer', settings.colors.gameTimer);
    root.style.setProperty('--color-glow', settings.colors.glow);
    
    // Typography
    root.style.setProperty('--font-family', settings.typography.fontFamily);
    root.style.setProperty('--font-size-player-name', settings.typography.playerNameSize + 'px');
    root.style.setProperty('--font-size-score', settings.typography.scoreSize + 'px');
    root.style.setProperty('--font-size-game-timer', settings.typography.gameTimerSize + 'px');
    root.style.setProperty('--font-weight', settings.typography.fontWeight);
    
    // Effects
    root.style.setProperty('--text-shadow-blur', settings.effects.textShadowBlur + 'px');
    root.style.setProperty('--text-shadow-opacity', (settings.effects.textShadowOpacity / 100).toFixed(2));
    root.style.setProperty('--letter-spacing', settings.effects.letterSpacing + 'px');
    
    // Layout
    root.style.setProperty('--spacing-scores', settings.layout.spacingScores + 'px');
    root.style.setProperty('--spacing-info', settings.layout.spacingInfo + 'px');
    root.style.setProperty('--separator-size', settings.layout.separatorSize + 'px');
    
    // Store glow enabled state
    document.body.dataset.glowEnabled = settings.effects.enableGlow;
}

// Listen for settings updates from control panel
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'gfxSettings') {
        applyGFXSettings(event.data.settings);
        // Also save to localStorage
        localStorage.setItem('gfxSettings', JSON.stringify(event.data.settings));
    }
});

// Listen for custom event from same window (for direct updates)
window.addEventListener('gfxSettingsChanged', (event) => {
    if (event.detail) {
        applyGFXSettings(event.detail);
    }
});

// Get match ID from query string, default to '1'
function getMatchId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('matchId') || '1';
}

let matchId = getMatchId();
let ws = null;
let reconnectTimeout = null;
let reconnectDelay = 1000; // Start with 1 second
const maxReconnectDelay = 8000; // Max 8 seconds
let currentState = null;

// DOM Elements
const elements = {
    homeName: document.getElementById('home-name'),
    awayName: document.getElementById('away-name'),
    homeScore: document.getElementById('home-score'),
    awayScore: document.getElementById('away-score'),
    periodValue: document.getElementById('period-value'),
    timerValue: document.getElementById('timer-value'),
    container: document.querySelector('.overlay-container')
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format seconds as MM:SS or HH:MM:SS
 */
function formatTimer(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

/**
 * Update UI with current state
 */
function updateUI(state, eventType = null, changed = null) {
    if (!state) return;
    
    const prevState = currentState;
    currentState = state;
    
    // Update team names
    elements.homeName.textContent = state.homeName || 'Player 1';
    elements.awayName.textContent = state.awayName || 'Player 2';
    
    // Update scores with animation on change
    const homeScoreChanged = prevState && prevState.homeScore !== state.homeScore;
    const awayScoreChanged = prevState && prevState.awayScore !== state.awayScore;
    
    if (homeScoreChanged) {
        animateScoreChange(elements.homeScore, state.homeScore || 0);
    } else {
        elements.homeScore.textContent = state.homeScore || 0;
    }
    
    if (awayScoreChanged) {
        animateScoreChange(elements.awayScore, state.awayScore || 0);
    } else {
        elements.awayScore.textContent = state.awayScore || 0;
    }
    
    // Update period
    elements.periodValue.textContent = state.period || 1;
    
    // Update timer
    elements.timerValue.textContent = formatTimer(state.timerSecondsRemaining || 0);
    
    // Handle setup/reset events with fade-in
    if (eventType === 'setup' || eventType === 'reset') {
        elements.container.classList.add('fade-in');
        setTimeout(() => {
            elements.container.classList.remove('fade-in');
        }, 500);
    }
}

/**
 * Animate score change with bump/pop effect
 */
function animateScoreChange(element, newValue) {
    // Remove any existing animation class
    element.classList.remove('score-changed', 'glow-enabled');
    
    // Trigger reflow to restart animation
    void element.offsetWidth;
    
    // Update value
    element.textContent = newValue;
    
    // Check if glow is enabled
    const glowEnabled = document.body.dataset.glowEnabled === 'true';
    
    // Add animation class
    element.classList.add('score-changed');
    if (glowEnabled) {
        element.classList.add('glow-enabled');
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
        element.classList.remove('score-changed', 'glow-enabled');
    }, 500);
}

/**
 * Fetch current state from API
 */
async function fetchState() {
    try {
        const response = await fetch(`${API_BASE}/api/match/${matchId}/state`);
        if (response.ok) {
            const state = await response.json();
            updateUI(state);
            return state;
        }
    } catch (error) {
        console.error('Failed to fetch state:', error);
    }
    return null;
}

// ============================================================================
// WebSocket Connection with Exponential Backoff Reconnection
// ============================================================================

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/match/${matchId}`;
    
    try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('WebSocket connected to match', matchId);
            reconnectDelay = 1000; // Reset delay on successful connection
            
            // Fetch current state immediately on connect
            fetchState();
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.state) {
                    // Update UI with event type and change info
                    updateUI(
                        data.state,
                        data.type,
                        data.changed
                    );
                    
                    // Special handling for score_changed event
                    if (data.type === 'score_changed' && data.changed) {
                        const team = data.changed.team;
                        if (team === 'home') {
                            animateScoreChange(elements.homeScore, data.state.homeScore || 0);
                        } else if (team === 'away') {
                            animateScoreChange(elements.awayScore, data.state.awayScore || 0);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        ws.onclose = (event) => {
            console.log('WebSocket disconnected', event.code, event.reason);
            
            // Only attempt reconnect if not a normal closure
            if (event.code !== 1000) {
                scheduleReconnect();
            }
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        scheduleReconnect();
    }
}

/**
 * Schedule WebSocket reconnection with exponential backoff
 */
function scheduleReconnect() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * reconnectDelay;
    const delay = reconnectDelay + jitter;
    
    console.log(`Scheduling reconnect in ${Math.round(delay)}ms...`);
    
    reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connectWebSocket();
        
        // Exponential backoff with max limit
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    }, delay);
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Load GFX settings first
    loadGFXSettings();
    
    // Get match ID from query string
    matchId = getMatchId();
    
    console.log('Initializing overlay for match:', matchId);
    
    // Fetch initial state first
    fetchState().then(() => {
        // Connect WebSocket after initial state is loaded
        connectWebSocket();
    });
    
    // Set up periodic state fetch as backup (every 3 seconds)
    // This ensures display stays updated even if WebSocket fails
    setInterval(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log('WebSocket not connected, fetching state via REST...');
            fetchState();
        }
    }, 3000);
    
    // Handle visibility change (when browser tab becomes visible again)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Reconnect if disconnected
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                connectWebSocket();
            } else {
                // Refresh state when tab becomes visible
                fetchState();
            }
        }
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    if (ws) {
        ws.close(1000, 'Page unloading');
    }
});
