/**
 * vMix Billiard Score Control Panel - JavaScript
 * Manages WebSocket connection and REST API calls for Russian billiard score control
 */

// Configuration
const API_BASE = window.location.origin;
let matchId = '1';
let ws = null;
let reconnectTimeout = null;
let reconnectDelay = 1000; // Start with 1 second
const maxReconnectDelay = 8000; // Max 8 seconds
let currentState = null;

// DOM Elements
const elements = {
    // Status
    connectionStatus: document.getElementById('connection-status'),
    matchIdInput: document.getElementById('match-id-input'),
    
    // Setup
    homeName: document.getElementById('home-name'),
    awayName: document.getElementById('away-name'),
    periodInput: document.getElementById('period-input'),
    timerMinutes: document.getElementById('timer-minutes'),
    timerSeconds: document.getElementById('timer-seconds'),
    setupBtn: document.getElementById('setup-btn'),
    
    // Score Display
    homeTeamNameDisplay: document.getElementById('home-team-name-display'),
    awayTeamNameDisplay: document.getElementById('away-team-name-display'),
    homeScoreDisplay: document.getElementById('home-score-display'),
    awayScoreDisplay: document.getElementById('away-score-display'),
    
    // Score Buttons
    homePlus: document.getElementById('home-plus'),
    homeMinus: document.getElementById('home-minus'),
    homePlusBall: document.getElementById('home-plus-ball'),
    awayPlus: document.getElementById('away-plus'),
    awayMinus: document.getElementById('away-minus'),
    awayPlusBall: document.getElementById('away-plus-ball'),
    
    // Total Games Buttons (using homeMatchScore as total games)
    totalGamesPlus: document.getElementById('total-games-plus'),
    totalGamesMinus: document.getElementById('total-games-minus'),
    totalGamesDisplay: document.getElementById('total-games-display'),
    
    // Period
    periodDisplay: document.getElementById('period-display'),
    periodPlus: document.getElementById('period-plus'),
    periodMinus: document.getElementById('period-minus'),
    
    // Timer
    timerDisplay: document.getElementById('timer-display'),
    timerStatus: document.getElementById('timer-status'),
    timerStart: document.getElementById('timer-start'),
    timerStop: document.getElementById('timer-stop'),
    setTimerMinutes: document.getElementById('set-timer-minutes'),
    setTimerSeconds: document.getElementById('set-timer-seconds'),
    timerSetBtn: document.getElementById('timer-set-btn'),
    
    // Visibility Toggles
    showGameDisplay: document.getElementById('show-game-display'),
    showTimerDisplay: document.getElementById('show-timer-display'),
    showMatchScoreNextTimer: document.getElementById('show-match-score-next-timer'),
    
    // Reset
    resetBtn: document.getElementById('reset-btn')
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
 * Parse MM:SS or HH:MM:SS to total seconds
 */
function parseTimer(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

/**
 * Update connection status UI
 */
function updateConnectionStatus(connected) {
    if (connected) {
        elements.connectionStatus.classList.remove('disconnected');
        elements.connectionStatus.classList.add('connected');
        elements.connectionStatus.querySelector('.status-text').textContent = t('connected');
        reconnectDelay = 1000; // Reset reconnect delay on successful connection
    } else {
        elements.connectionStatus.classList.remove('connected');
        elements.connectionStatus.classList.add('disconnected');
        elements.connectionStatus.querySelector('.status-text').textContent = t('disconnected');
    }
}

/**
 * Update UI with current state
 */
function updateUI(state) {
    if (!state) return;
    
    currentState = state;
    
    // Update team names
    elements.homeTeamNameDisplay.textContent = state.homeName || 'Player 1';
    elements.awayTeamNameDisplay.textContent = state.awayName || 'Player 2';
    
    
    // Update scores
    elements.homeScoreDisplay.textContent = state.homeScore || 0;
    elements.awayScoreDisplay.textContent = state.awayScore || 0;
    
    // Update total games (using homeMatchScore as total games count)
    const totalGames = state.homeMatchScore || 0;
    if (elements.totalGamesDisplay) {
        elements.totalGamesDisplay.textContent = totalGames;
    }
    
    // Enable/disable minus buttons based on score
    elements.homeMinus.disabled = (state.homeScore || 0) <= 0;
    elements.awayMinus.disabled = (state.awayScore || 0) <= 0;
    if (elements.totalGamesMinus) {
        elements.totalGamesMinus.disabled = totalGames <= 0;
    }
    
    // Update period
    elements.periodDisplay.textContent = state.period || 1;
    
    // Update timer
    elements.timerDisplay.textContent = formatTimer(state.timerSecondsRemaining || 0);
    
    // Update timer status
    if (state.timerRunning) {
        elements.timerStatus.classList.remove('stopped');
        elements.timerStatus.classList.add('running');
    } else {
        elements.timerStatus.classList.remove('running');
        elements.timerStatus.classList.add('stopped');
    }
    
    // Update form inputs to match current state (but don't overwrite user input while typing)
    if (elements.homeName.value === '' || elements.homeName.value === elements.homeName.defaultValue) {
        elements.homeName.value = state.homeName || '';
    }
    if (elements.awayName.value === '' || elements.awayName.value === elements.awayName.defaultValue) {
        elements.awayName.value = state.awayName || '';
    }
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
// WebSocket Connection
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
            console.log('WebSocket connected');
            updateConnectionStatus(true);
            reconnectDelay = 1000; // Reset delay on successful connection
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.state) {
                    updateUI(data.state);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            updateConnectionStatus(false);
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            updateConnectionStatus(false);
            scheduleReconnect();
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        updateConnectionStatus(false);
        scheduleReconnect();
    }
}

function scheduleReconnect() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    
    reconnectTimeout = setTimeout(() => {
        console.log(`Reconnecting WebSocket (delay: ${reconnectDelay}ms)...`);
        connectWebSocket();
        
        // Exponential backoff with max limit
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    }, reconnectDelay);
}

// ============================================================================
// REST API Calls
// ============================================================================

async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE}/api/match/${matchId}${endpoint}`, options);
        
        if (response.ok) {
            const data = await response.json();
            if (data.state) {
                updateUI(data.state);
            }
            return data;
        } else {
            const error = await response.json();
            console.error('API error:', error);
            alert(`${t('error')}: ${error.detail || t('unknownError')}`);
        }
    } catch (error) {
        console.error('API call failed:', error);
        alert(t('connectionError'));
    }
    return null;
}

// ============================================================================
// Event Handlers
// ============================================================================

// Match ID change
elements.matchIdInput.addEventListener('change', () => {
    matchId = elements.matchIdInput.value || '1';
    if (ws) {
        ws.close();
    }
    connectWebSocket();
    fetchState();
    
    // Update preview iframe URL
    const previewFrame = document.getElementById('gfx-preview');
    if (previewFrame) {
        previewFrame.src = `/overlay?matchId=${matchId}&preview=true`;
    }
});

// Setup
elements.setupBtn.addEventListener('click', async () => {
    const homeName = elements.homeName.value.trim() || 'Player 1';
    const awayName = elements.awayName.value.trim() || 'Player 2';
    const period = parseInt(elements.periodInput.value) || 1;
    const timerMinutes = parseInt(elements.timerMinutes.value) || 0;
    const timerSeconds = parseInt(elements.timerSeconds.value) || 0;
    const totalSeconds = timerMinutes * 60 + timerSeconds;
    
    await apiCall('/setup', 'POST', {
        homeName,
        awayName,
        period,
        timerSeconds: totalSeconds
    });
});

// Score buttons
elements.homePlus.addEventListener('click', () => apiCall('/score', 'POST', { team: 'home', delta: 1 }));
elements.homeMinus.addEventListener('click', () => {
    if ((currentState?.homeScore || 0) > 0) {
        apiCall('/score', 'POST', { team: 'home', delta: -1 });
    }
});
elements.homePlusBall.addEventListener('click', () => apiCall('/score', 'POST', { team: 'home', delta: 1 })); // +Ball is same as +1 for now

elements.awayPlus.addEventListener('click', () => apiCall('/score', 'POST', { team: 'away', delta: 1 }));
elements.awayMinus.addEventListener('click', () => {
    if ((currentState?.awayScore || 0) > 0) {
        apiCall('/score', 'POST', { team: 'away', delta: -1 });
    }
});
elements.awayPlusBall.addEventListener('click', () => apiCall('/score', 'POST', { team: 'away', delta: 1 })); // +Ball is same as +1 for now

// Total games buttons (using homeMatchScore as total games)
elements.totalGamesPlus.addEventListener('click', () => apiCall('/match-score', 'POST', { team: 'home', delta: 1 }));
elements.totalGamesMinus.addEventListener('click', () => {
    const totalGames = (currentState?.homeMatchScore || 0);
    if (totalGames > 0) {
        apiCall('/match-score', 'POST', { team: 'home', delta: -1 });
    }
});

// Period buttons
elements.periodPlus.addEventListener('click', async () => {
    const currentPeriod = currentState?.period || 1;
    await apiCall('/period/set', 'POST', { period: currentPeriod + 1 });
});
elements.periodMinus.addEventListener('click', async () => {
    const currentPeriod = currentState?.period || 1;
    if (currentPeriod > 1) {
        await apiCall('/period/set', 'POST', { period: currentPeriod - 1 });
    }
});

// Timer buttons
elements.timerStart.addEventListener('click', () => apiCall('/timer/start', 'POST'));
elements.timerStop.addEventListener('click', () => apiCall('/timer/stop', 'POST'));
elements.timerSetBtn.addEventListener('click', async () => {
    const minutes = parseInt(elements.setTimerMinutes.value) || 0;
    const seconds = parseInt(elements.setTimerSeconds.value) || 0;
    const totalSeconds = minutes * 60 + seconds;
    await apiCall('/timer/set', 'POST', { seconds: totalSeconds });
});

// Visibility Toggles
elements.showGameDisplay.addEventListener('change', (e) => {
    localStorage.setItem('showGameDisplay', e.target.checked.toString());
    // Save visibility to API
    saveVisibilityToAPI();
    // Update overlay via broadcast
    window.dispatchEvent(new CustomEvent('overlayVisibilityChanged', { 
        detail: { game: e.target.checked, timer: elements.showTimerDisplay.checked } 
    }));
    // Update preview iframe
    updateOverlayVisibility();
});

elements.showTimerDisplay.addEventListener('change', (e) => {
    localStorage.setItem('showTimerDisplay', e.target.checked.toString());
    // Save visibility to API
    saveVisibilityToAPI();
    // Update overlay via broadcast
    window.dispatchEvent(new CustomEvent('overlayVisibilityChanged', { 
        detail: { game: elements.showGameDisplay.checked, timer: e.target.checked } 
    }));
    // Update preview iframe
    updateOverlayVisibility();
});

elements.showMatchScoreNextTimer.addEventListener('change', (e) => {
    localStorage.setItem('showMatchScoreNextTimer', e.target.checked.toString());
    // Save visibility to API
    saveVisibilityToAPI();
    // Update overlay via broadcast
    window.dispatchEvent(new CustomEvent('overlayVisibilityChanged', { 
        detail: { 
            game: elements.showGameDisplay.checked, 
            timer: elements.showTimerDisplay.checked,
            matchScoreNextTimer: e.target.checked
        } 
    }));
    // Update preview iframe
    updateOverlayVisibility();
});

// Save visibility settings to API
async function saveVisibilityToAPI() {
    try {
        const matchIdInput = document.getElementById('match-id-input');
        const matchId = matchIdInput ? matchIdInput.value || '1' : '1';
        
        // Get current GFX settings from API or create new object
        const response = await fetch(`/api/match/${matchId}/gfx-settings`);
        let settings = {};
        if (response.ok) {
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
                settings = data;
            }
        }
        
        // Update visibility settings
        if (!settings.visibility) {
            settings.visibility = {};
        }
        settings.visibility.showGame = elements.showGameDisplay.checked;
        settings.visibility.showTimer = elements.showTimerDisplay.checked;
        settings.visibility.showMatchScoreNextTimer = elements.showMatchScoreNextTimer.checked;
        
        // Save to API
        const saveResponse = await fetch(`/api/match/${matchId}/gfx-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (saveResponse.ok) {
            console.log('Visibility settings saved to API');
        }
    } catch (e) {
        console.error('Error saving visibility settings to API:', e);
    }
}

// Function to update overlay visibility
function updateOverlayVisibility() {
    const showGame = elements.showGameDisplay.checked;
    const showTimer = elements.showTimerDisplay.checked;
    const showMatchScoreNextTimer = elements.showMatchScoreNextTimer.checked;
    
    // Update preview iframe
    const previewFrame = document.getElementById('gfx-preview');
    if (previewFrame && previewFrame.contentWindow) {
        try {
            previewFrame.contentWindow.postMessage({
                type: 'visibilityUpdate',
                showGame: showGame,
                showTimer: showTimer,
                matchScoreNextTimer: showMatchScoreNextTimer
            }, '*');
        } catch (e) {
            // Ignore cross-origin errors
        }
    }
}

// Load visibility settings on init - API first, localStorage fallback
async function loadVisibilitySettings() {
    try {
        const matchIdInput = document.getElementById('match-id-input');
        const matchId = matchIdInput ? matchIdInput.value || '1' : '1';
        
        // Try API first (primary source for vMix compatibility)
        const response = await fetch(`/api/match/${matchId}/gfx-settings`);
        if (response.ok) {
            const settings = await response.json();
            if (settings && settings.visibility) {
                console.log('Loaded visibility settings from API');
                elements.showGameDisplay.checked = settings.visibility.showGame !== false;
                elements.showTimerDisplay.checked = settings.visibility.showTimer !== false;
                elements.showMatchScoreNextTimer.checked = settings.visibility.showMatchScoreNextTimer === true;
                
                // Sync to localStorage for local use
                localStorage.setItem('showGameDisplay', elements.showGameDisplay.checked.toString());
                localStorage.setItem('showTimerDisplay', elements.showTimerDisplay.checked.toString());
                localStorage.setItem('showMatchScoreNextTimer', elements.showMatchScoreNextTimer.checked.toString());
                
                return; // Successfully loaded from API
            }
        }
    } catch (e) {
        console.warn('Failed to load visibility from API, trying localStorage:', e);
    }
    
    // Fallback to localStorage
    const showGame = localStorage.getItem('showGameDisplay');
    const showTimer = localStorage.getItem('showTimerDisplay');
    const showMatchScoreNextTimer = localStorage.getItem('showMatchScoreNextTimer');
    
    if (showGame !== null) {
        elements.showGameDisplay.checked = showGame === 'true';
    }
    if (showTimer !== null) {
        elements.showTimerDisplay.checked = showTimer === 'true';
    }
    if (showMatchScoreNextTimer !== null) {
        elements.showMatchScoreNextTimer.checked = showMatchScoreNextTimer === 'true';
    }
    
    // Sync current state to API
    saveVisibilityToAPI();
}

// Reset
elements.resetBtn.addEventListener('click', async () => {
    if (confirm(t('resetConfirm'))) {
        await apiCall('/reset', 'POST');
        // Clear form inputs
        elements.homeName.value = '';
        elements.awayName.value = '';
        elements.periodInput.value = '1';
        elements.timerMinutes.value = '0';
        elements.timerSeconds.value = '0';
    }
});

// ============================================================================
// Initialization
// ============================================================================

// Initialize collapsible sections (spoilers)
function initializeCollapsibles() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        // Remove any existing event listeners by cloning the header
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        const section = newHeader.closest('.collapsible');
        if (!section) return;
        
        newHeader.addEventListener('click', function() {
            const content = section.querySelector('.collapsible-content');
            if (!content) return;
            
            // Check if content is currently visible
            const isOpen = content.classList.contains('show') || 
                          (content.style.display !== 'none' && content.style.display !== '');
            
            if (isOpen) {
                content.style.display = 'none';
                content.classList.remove('show');
                this.classList.remove('active');
            } else {
                content.style.display = 'block';
                content.classList.add('show');
                this.classList.add('active');
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    matchId = elements.matchIdInput.value || '1';
    
    // Initialize collapsible sections
    initializeCollapsibles();
    
    // Initialize language switcher
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = getLanguage();
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
    
    // Listen for language changes
    window.addEventListener('languageChanged', () => {
        updateConnectionStatus(ws && ws.readyState === WebSocket.OPEN);
        // Update all texts including select options
        if (typeof updateAllTexts === 'function') {
            updateAllTexts();
        }
    });
    
    // Load visibility settings (async, from API first)
    await loadVisibilitySettings();
    
    // Fetch initial state
    fetchState().then(() => {
        // Connect WebSocket after initial state is loaded
        connectWebSocket();
    });
    
    // Set up periodic state fetch as backup (every 2 seconds)
    setInterval(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            fetchState();
        }
    }, 2000);
});
