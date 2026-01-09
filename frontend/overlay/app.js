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
    const container = document.querySelector('.overlay-container');
    const scoreSection = document.querySelector('.score-section');
    const infoSection = document.querySelector('.info-section');
    
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
    
    // Positions
    if (settings.positions) {
        const absolute = settings.positions.absolutePositioning;
        if (absolute && container) {
            container.classList.add('position-absolute');
            
            // Score section positioning
            if (scoreSection) {
                const scoreX = settings.positions.scoreX || 'center';
                const scoreY = settings.positions.scoreY || 'center';
                applyPosition(scoreSection, scoreX, scoreY);
            }
            
            // Info section positioning
            if (infoSection) {
                const infoX = settings.positions.infoX || 'center';
                const infoY = settings.positions.infoY || 'auto';
                applyPosition(infoSection, infoX, infoY);
            }
        } else if (container) {
            container.classList.remove('position-absolute');
            if (scoreSection) {
                scoreSection.style.left = '';
                scoreSection.style.top = '';
                scoreSection.style.transform = '';
            }
            if (infoSection) {
                infoSection.style.left = '';
                infoSection.style.top = '';
                infoSection.style.transform = '';
            }
        }
    }
    
    // Backgrounds
    if (settings.backgrounds) {
        // Container background
        if (settings.backgrounds.container && container) {
            const bg = settings.backgrounds.container;
            let bgValue = 'transparent';
            
            if (bg.type === 'solid') {
                const opacity = (bg.solidOpacity || 100) / 100;
                const color = bg.solidColor || '#000000';
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                bgValue = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            } else if (bg.type === 'gradient') {
                const angle = bg.gradientAngle || 180;
                const color1 = bg.gradientColor1 || '#000000';
                const color2 = bg.gradientColor2 || '#333333';
                if (bg.gradientType === 'radial') {
                    bgValue = `radial-gradient(circle, ${color1}, ${color2})`;
                } else {
                    bgValue = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
                }
            } else if (bg.type === 'image' && bg.imageUrl) {
                const opacity = (bg.imageOpacity || 100) / 100;
                const size = bg.imageSize || 'cover';
                bgValue = `linear-gradient(rgba(0,0,0,${1 - opacity}), rgba(0,0,0,${1 - opacity})), url('${bg.imageUrl}')`;
                container.style.backgroundSize = size;
                container.style.backgroundPosition = 'center';
                container.style.backgroundRepeat = 'no-repeat';
            }
            
            container.style.background = bgValue;
        }
        
        // Score section background
        if (settings.backgrounds.score && scoreSection) {
            const bg = settings.backgrounds.score;
            let bgValue = 'none';
            
            if (bg.type === 'solid') {
                const opacity = (bg.solidOpacity || 50) / 100;
                const color = bg.solidColor || '#000000';
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                bgValue = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                scoreSection.style.padding = (bg.padding || 20) + 'px';
                scoreSection.style.borderRadius = (bg.borderRadius || 10) + 'px';
            } else if (bg.type === 'gradient') {
                const color1 = bg.gradientColor1 || '#000000';
                const color2 = bg.gradientColor2 || '#333333';
                bgValue = `linear-gradient(135deg, ${color1}, ${color2})`;
                scoreSection.style.padding = (bg.padding || 20) + 'px';
                scoreSection.style.borderRadius = (bg.borderRadius || 10) + 'px';
            } else {
                scoreSection.style.padding = '';
                scoreSection.style.borderRadius = '';
            }
            
            scoreSection.style.background = bgValue;
        }
        
        // Info section background
        if (settings.backgrounds.info && infoSection) {
            const bg = settings.backgrounds.info;
            let bgValue = 'none';
            
            if (bg.type === 'solid') {
                const opacity = (bg.solidOpacity || 50) / 100;
                const color = bg.solidColor || '#000000';
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                bgValue = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                infoSection.style.padding = (bg.padding || 15) + 'px';
                infoSection.style.borderRadius = (bg.borderRadius || 10) + 'px';
            } else if (bg.type === 'gradient') {
                const color1 = bg.gradientColor1 || '#000000';
                const color2 = bg.gradientColor2 || '#333333';
                bgValue = `linear-gradient(135deg, ${color1}, ${color2})`;
                infoSection.style.padding = (bg.padding || 15) + 'px';
                infoSection.style.borderRadius = (bg.borderRadius || 10) + 'px';
            } else {
                infoSection.style.padding = '';
                infoSection.style.borderRadius = '';
            }
            
            infoSection.style.background = bgValue;
        }
    }
    
    // Store glow enabled state
    document.body.dataset.glowEnabled = settings.effects.enableGlow;
}

// Helper function to apply positioning
function applyPosition(element, x, y) {
    let translateX = '';
    let translateY = '';
    
    // Handle X position
    if (x === 'center') {
        element.style.left = '50%';
        translateX = '-50%';
    } else if (typeof x === 'string' && (x.includes('%') || x.includes('px'))) {
        element.style.left = x;
        translateX = '0';
    } else if (x) {
        element.style.left = x;
        translateX = '0';
    } else {
        element.style.left = '';
        translateX = '0';
    }
    
    // Handle Y position
    if (y === 'center') {
        element.style.top = '50%';
        translateY = '-50%';
    } else if (y === 'auto') {
        element.style.top = '';
        translateY = '0';
    } else if (typeof y === 'string' && (y.includes('%') || y.includes('px'))) {
        element.style.top = y;
        translateY = '0';
    } else if (y) {
        element.style.top = y;
        translateY = '0';
    } else {
        element.style.top = '';
        translateY = '0';
    }
    
    // Apply transform
    if (translateX === '-50%' || translateY === '-50%') {
        const tx = translateX === '-50%' ? '-50%' : '0';
        const ty = translateY === '-50%' ? '-50%' : '0';
        if (tx === '-50%' && ty === '-50%') {
            element.style.transform = 'translate(-50%, -50%)';
        } else if (tx === '-50%') {
            element.style.transform = 'translateX(-50%)';
        } else if (ty === '-50%') {
            element.style.transform = 'translateY(-50%)';
        } else {
            element.style.transform = '';
        }
    } else {
        element.style.transform = '';
    }
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
