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
let currentTournamentId = null;
let tournamentsList = [];

// DOM Elements
const elements = {
    // Status
    connectionStatus: document.getElementById('connection-status'),
    matchIdInput: document.getElementById('match-id-input'),
    
    // Tournament Management
    tournamentSelect: document.getElementById('tournament-select'),
    createTournamentBtn: document.getElementById('create-tournament-btn'),
    editTournamentBtn: document.getElementById('edit-tournament-btn'),
    deleteTournamentBtn: document.getElementById('delete-tournament-btn'),
    createTournamentModal: document.getElementById('create-tournament-modal'),
    editTournamentModal: document.getElementById('edit-tournament-modal'),
    newTournamentName: document.getElementById('new-tournament-name'),
    editTournamentName: document.getElementById('edit-tournament-name'),
    createTournamentConfirm: document.getElementById('create-tournament-confirm'),
    editTournamentConfirm: document.getElementById('edit-tournament-confirm'),
    
    // Setup
    periodInput: document.getElementById('period-input'),
    timerMinutes: document.getElementById('timer-minutes'),
    timerSeconds: document.getElementById('timer-seconds'),
    setupBtn: document.getElementById('setup-btn'),
    
    // Balls Display
    homeTeamNameDisplay: document.getElementById('home-team-name-display'),
    awayTeamNameDisplay: document.getElementById('away-team-name-display'),
    homeScoreDisplay: document.getElementById('home-score-display'),
    awayScoreDisplay: document.getElementById('away-score-display'),
    
    // Balls Buttons
    homePlus: document.getElementById('home-plus'),
    homeMinus: document.getElementById('home-minus'),
    homePlusBall: document.getElementById('home-plus-ball'),
    awayPlus: document.getElementById('away-plus'),
    awayMinus: document.getElementById('away-minus'),
    awayPlusBall: document.getElementById('away-plus-ball'),
    
    // Match Score Display (Games Won)
    homeTeamNameDisplayMatch: document.getElementById('home-team-name-display-match'),
    awayTeamNameDisplayMatch: document.getElementById('away-team-name-display-match'),
    homeMatchScoreDisplay: document.getElementById('home-match-score-display'),
    awayMatchScoreDisplay: document.getElementById('away-match-score-display'),
    
    // Match Score Buttons (Games Won)
    homeMatchPlus: document.getElementById('home-match-plus'),
    homeMatchMinus: document.getElementById('home-match-minus'),
    awayMatchPlus: document.getElementById('away-match-plus'),
    awayMatchMinus: document.getElementById('away-match-minus'),
    
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
    
    // Player Management
    playerNameInput: document.getElementById('player-name-input'),
    addPlayerBtn: document.getElementById('add-player-btn'),
    playersList: document.getElementById('players-list'),
    player1Buttons: document.getElementById('player1-buttons'),
    player2Buttons: document.getElementById('player2-buttons'),
    
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
    if (!elements.connectionStatus) {
        console.warn('Connection status element not found');
        return;
    }
    
    const statusText = elements.connectionStatus.querySelector('.status-text');
    if (!statusText) {
        console.warn('Status text element not found');
        return;
    }
    
    if (connected) {
        elements.connectionStatus.classList.remove('disconnected');
        elements.connectionStatus.classList.add('connected');
        statusText.textContent = t('connected');
        reconnectDelay = 1000; // Reset reconnect delay on successful connection
    } else {
        elements.connectionStatus.classList.remove('connected');
        elements.connectionStatus.classList.add('disconnected');
        statusText.textContent = t('disconnected');
    }
}

/**
 * Update UI with current state
 */
function updateUI(state) {
    if (!state) return;
    
    currentState = state;
    
    // Update team names (for both balls and match score sections)
    elements.homeTeamNameDisplay.textContent = state.homeName || 'Player 1';
    elements.awayTeamNameDisplay.textContent = state.awayName || 'Player 2';
    if (elements.homeTeamNameDisplayMatch) elements.homeTeamNameDisplayMatch.textContent = state.homeName || 'Player 1';
    if (elements.awayTeamNameDisplayMatch) elements.awayTeamNameDisplayMatch.textContent = state.awayName || 'Player 2';
    
    // Update balls (current game score)
    elements.homeScoreDisplay.textContent = state.homeScore || 0;
    elements.awayScoreDisplay.textContent = state.awayScore || 0;
    
    // Update match scores (games won)
    const homeMatchScore = state.homeMatchScore || 0;
    const awayMatchScore = state.awayMatchScore || 0;
    if (elements.homeMatchScoreDisplay) elements.homeMatchScoreDisplay.textContent = homeMatchScore;
    if (elements.awayMatchScoreDisplay) elements.awayMatchScoreDisplay.textContent = awayMatchScore;
    
    // Enable/disable minus buttons based on score
    elements.homeMinus.disabled = (state.homeScore || 0) <= 0;
    elements.awayMinus.disabled = (state.awayScore || 0) <= 0;
    if (elements.homeMatchMinus) elements.homeMatchMinus.disabled = homeMatchScore <= 0;
    if (elements.awayMatchMinus) elements.awayMatchMinus.disabled = awayMatchScore <= 0;
    
    // Update period (display in brackets)
    elements.periodDisplay.textContent = `(${state.period || 1})`;
    
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
    
    // Update player button selection (names are now selected via Player Names buttons)
    updatePlayerButtonSelection();
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
        } else {
            console.error('Failed to fetch state: HTTP', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Failed to fetch state:', error);
        // Update connection status on fetch failure
        updateConnectionStatus(false);
    }
    return null;
}

// ============================================================================
// Tournament Management Functions
// ============================================================================

/**
 * Load all tournaments from API
 */
async function loadTournaments() {
    try {
        console.log('Fetching tournaments from:', `${API_BASE}/api/tournaments`);
        const response = await fetch(`${API_BASE}/api/tournaments`);
        console.log('Tournaments response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Tournaments data received:', data);
            tournamentsList = data.tournaments || [];
            console.log('Tournaments list:', tournamentsList);
            renderTournamentSelect();
            return tournamentsList;
        } else {
            console.error('Failed to load tournaments: HTTP', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            // Show user-friendly error message
            if (elements.tournamentSelect) {
                elements.tournamentSelect.innerHTML = '<option value="">' + (t('errorLoadingTournaments') || 'Error loading tournaments') + '</option>';
            }
        }
    } catch (error) {
        console.error('Failed to load tournaments:', error);
        console.error('Error details:', error.message, error.stack);
        // Show user-friendly error message
        if (elements.tournamentSelect) {
            elements.tournamentSelect.innerHTML = '<option value="">' + (t('errorLoadingTournaments') || 'Error loading tournaments') + '</option>';
        }
    }
    return [];
}

/**
 * Get current tournament
 */
async function getCurrentTournament() {
    try {
        const response = await fetch(`${API_BASE}/api/tournaments/current`);
        if (response.ok) {
            const data = await response.json();
            if (data.tournament) {
                currentTournamentId = data.tournament.id;
                return data.tournament;
            }
        }
    } catch (error) {
        console.error('Failed to get current tournament:', error);
    }
    return null;
}

/**
 * Select a tournament as current
 */
async function selectTournament(tournamentId) {
    try {
        const response = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/select`, {
            method: 'POST'
        });
        
        if (response.ok) {
            currentTournamentId = tournamentId;
            // Reload tournaments to update dropdown
            await loadTournaments();
            // Reload players for the new tournament
            await loadPlayers();
            // Save to localStorage
            localStorage.setItem('currentTournamentId', tournamentId);
            return true;
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to select tournament:', error);
        alert(t('connectionError') || 'Connection error');
    }
    return false;
}

/**
 * Create a new tournament
 */
async function createTournament(name) {
    if (!name || !name.trim()) {
        alert(t('tournamentNameRequired') || 'Tournament name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/tournaments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name.trim() })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Reload tournaments to update dropdown
            await loadTournaments();
            // Select newly created tournament
            if (data.tournament) {
                await selectTournament(data.tournament.id);
            }
            // Close modal
            closeTournamentModals();
            return data.tournament;
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to create tournament:', error);
        alert(t('connectionError') || 'Connection error');
    }
    return null;
}

/**
 * Update tournament name
 */
async function updateTournament(tournamentId, name) {
    if (!name || !name.trim()) {
        alert(t('tournamentNameRequired') || 'Tournament name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/tournaments/${tournamentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name.trim() })
        });
        
        if (response.ok) {
            // Reload tournaments to update dropdown
            await loadTournaments();
            // Close modal
            closeTournamentModals();
            return true;
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to update tournament:', error);
        alert(t('connectionError') || 'Connection error');
    }
    return false;
}

/**
 * Delete a tournament
 */
async function deleteTournament(tournamentId) {
    if (!confirm(t('deleteTournamentConfirm') || 'Are you sure you want to delete this tournament? All players in this tournament will be deleted.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/tournaments/${tournamentId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Reload tournaments to update dropdown
            await loadTournaments();
            // Reload players for the new current tournament
            await loadPlayers();
            return true;
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to delete tournament:', error);
        alert(t('connectionError') || 'Connection error');
    }
    return false;
}

/**
 * Render tournament selector dropdown
 */
function renderTournamentSelect() {
    if (!elements.tournamentSelect) return;
    
    // Save current selection
    const currentValue = elements.tournamentSelect.value;
    
    // Clear and populate dropdown
    elements.tournamentSelect.innerHTML = '';
    
    if (tournamentsList.length === 0) {
        elements.tournamentSelect.innerHTML = '<option value="">' + (t('noTournaments') || 'No tournaments') + '</option>';
        updateTournamentButtonStates();
        return;
    }
    
    tournamentsList.forEach(tournament => {
        const option = document.createElement('option');
        option.value = tournament.id;
        option.textContent = tournament.name + (tournament.player_count ? ` (${tournament.player_count} players)` : '');
        if (tournament.id === currentTournamentId) {
            option.selected = true;
        }
        elements.tournamentSelect.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentValue && currentTournamentId && currentValue === currentTournamentId) {
        elements.tournamentSelect.value = currentValue;
    } else if (currentTournamentId) {
        elements.tournamentSelect.value = currentTournamentId;
    }
    
    // Update button states
    updateTournamentButtonStates();
}

/**
 * Update tournament button states (enable/disable based on selection)
 */
function updateTournamentButtonStates() {
    const hasSelection = elements.tournamentSelect && elements.tournamentSelect.value;
    
    if (elements.editTournamentBtn) {
        elements.editTournamentBtn.disabled = !hasSelection;
    }
    if (elements.deleteTournamentBtn) {
        elements.deleteTournamentBtn.disabled = !hasSelection || tournamentsList.length <= 1;
    }
}

/**
 * Show create tournament modal
 */
function showCreateTournamentModal() {
    if (!elements.createTournamentModal || !elements.newTournamentName) return;
    
    elements.newTournamentName.value = '';
    elements.createTournamentModal.style.display = 'flex';
    setTimeout(() => elements.newTournamentName.focus(), 100);
}

/**
 * Show edit tournament modal
 */
function showEditTournamentModal() {
    if (!elements.editTournamentModal || !elements.editTournamentName || !elements.tournamentSelect) return;
    
    const selectedId = elements.tournamentSelect.value;
    if (!selectedId) {
        alert(t('selectTournamentFirst') || 'Please select a tournament first');
        return;
    }
    
    const tournament = tournamentsList.find(t => t.id === selectedId);
    if (!tournament) return;
    
    elements.editTournamentName.value = tournament.name;
    elements.editTournamentName.dataset.tournamentId = selectedId;
    elements.editTournamentModal.style.display = 'flex';
    setTimeout(() => elements.editTournamentName.focus(), 100);
}

/**
 * Close all tournament modals
 */
function closeTournamentModals() {
    if (elements.createTournamentModal) {
        elements.createTournamentModal.style.display = 'none';
    }
    if (elements.editTournamentModal) {
        elements.editTournamentModal.style.display = 'none';
    }
}

// Make function globally available for onclick handlers
window.closeTournamentModals = closeTournamentModals;

// ============================================================================
// Player Management Functions
// ============================================================================

let playersList = [];

/**
 * Load players from API (from current tournament)
 */
async function loadPlayers() {
    try {
        const response = await fetch(`${API_BASE}/api/players`);
        if (response.ok) {
            const data = await response.json();
            playersList = data.players || [];
            renderPlayersList();
            renderPlayerButtons();
            return playersList;
        }
    } catch (error) {
        console.error('Failed to load players:', error);
    }
    return [];
}

/**
 * Add a new player
 */
async function addPlayer(playerName) {
    if (!playerName || !playerName.trim()) {
        alert(t('playerNameRequired') || 'Player name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: playerName.trim() })
        });
        
        if (response.ok) {
            const data = await response.json();
            playersList.push(data.player);
            renderPlayersList();
            renderPlayerButtons();
            
            // Clear input
            if (elements.playerNameInput) {
                elements.playerNameInput.value = '';
            }
            
            return data.player;
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to add player:', error);
        alert(t('connectionError') || 'Connection error');
    }
    return null;
}

/**
 * Delete a player
 */
async function deletePlayer(playerId) {
    if (!confirm(t('deletePlayerConfirm') || 'Are you sure you want to delete this player?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/players/${playerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            playersList = playersList.filter(p => p.id !== playerId);
            renderPlayersList();
            renderPlayerButtons();
            return true;
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to delete player:', error);
        alert(t('connectionError') || 'Connection error');
    }
    return false;
}

/**
 * Render players list
 */
function renderPlayersList() {
    if (!elements.playersList) return;
    
    elements.playersList.innerHTML = '';
    
    if (playersList.length === 0) {
        elements.playersList.innerHTML = '<p style="color: #999; font-style: italic;">' + (t('noPlayers') || 'No players imported yet') + '</p>';
        return;
    }
    
    playersList.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <span class="player-item-name">${player.name}</span>
            <button class="player-item-delete" onclick="deletePlayer('${player.id}')" data-i18n="delete">Delete</button>
        `;
        elements.playersList.appendChild(playerItem);
    });
}

/**
 * Render player buttons in two columns
 */
function renderPlayerButtons() {
    if (!elements.player1Buttons || !elements.player2Buttons) return;
    
    // Clear existing buttons
    elements.player1Buttons.innerHTML = '';
    elements.player2Buttons.innerHTML = '';
    
    if (playersList.length === 0) {
        elements.player1Buttons.innerHTML = '<p style="color: #999; font-size: 12px; text-align: center; padding: 10px;">' + (t('noPlayers') || 'No players') + '</p>';
        elements.player2Buttons.innerHTML = '<p style="color: #999; font-size: 12px; text-align: center; padding: 10px;">' + (t('noPlayers') || 'No players') + '</p>';
        return;
    }
    
    // Create buttons for each player (same buttons in both columns)
    playersList.forEach(player => {
        // Player 1 (Home) column
        const btn1 = document.createElement('button');
        btn1.className = 'player-button';
        btn1.textContent = player.name;
        btn1.dataset.playerId = player.id;
        btn1.dataset.playerName = player.name;
        btn1.dataset.team = 'home';
        btn1.addEventListener('click', () => assignPlayerToMatch(player.id, 'home', player.name));
        elements.player1Buttons.appendChild(btn1);
        
        // Player 2 (Away) column
        const btn2 = document.createElement('button');
        btn2.className = 'player-button';
        btn2.textContent = player.name;
        btn2.dataset.playerId = player.id;
        btn2.dataset.playerName = player.name;
        btn2.dataset.team = 'away';
        btn2.addEventListener('click', () => assignPlayerToMatch(player.id, 'away', player.name));
        elements.player2Buttons.appendChild(btn2);
    });
    
    // Highlight current players if state is available
    if (currentState) {
        updatePlayerButtonSelection();
    }
}

/**
 * Assign a player to a match (home or away)
 */
async function assignPlayerToMatch(playerId, team, playerName) {
    try {
        const response = await fetch(`${API_BASE}/api/match/${matchId}/players/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player_id: playerId,
                team: team
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.state) {
                updateUI(data.state);
                updatePlayerButtonSelection();
            }
        } else {
            const error = await response.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to assign player:', error);
        alert(t('connectionError') || 'Connection error');
    }
}

/**
 * Update player button selection based on current state
 */
function updatePlayerButtonSelection() {
    if (!currentState) return;
    
    // Remove all selected classes
    const allButtons = document.querySelectorAll('.player-button');
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Select buttons matching current player names
    if (currentState.homeName) {
        const homeButtons = elements.player1Buttons.querySelectorAll('.player-button');
        homeButtons.forEach(btn => {
            if (btn.dataset.playerName === currentState.homeName) {
                btn.classList.add('selected');
            }
        });
    }
    
    if (currentState.awayName) {
        const awayButtons = elements.player2Buttons.querySelectorAll('.player-button');
        awayButtons.forEach(btn => {
            if (btn.dataset.playerName === currentState.awayName) {
                btn.classList.add('selected');
            }
        });
    }
}

// ============================================================================
// WebSocket Connection
// ============================================================================

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return;
    }
    
    // Close existing connection if any
    if (ws) {
        try {
            ws.close();
        } catch (e) {
            // Ignore errors when closing
        }
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/match/${matchId}`;
    
    console.log('Attempting to connect WebSocket:', wsUrl);
    
    try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('WebSocket connected successfully');
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
        
        ws.onclose = (event) => {
            console.log('WebSocket disconnected', event.code, event.reason);
            updateConnectionStatus(false);
            // Only schedule reconnect if it wasn't a manual close
            if (event.code !== 1000) {
                scheduleReconnect();
            }
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
if (elements.matchIdInput) {
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
            // Update scale after iframe loads (if preview scale function is available)
            previewFrame.addEventListener('load', () => {
                if (typeof updatePreviewScale === 'function') {
                    setTimeout(() => updatePreviewScale(), 500);
                }
            }, { once: true });
        }
    });
} else {
    console.warn('Match ID input element not found');
}

// Tournament management event handlers
if (elements.tournamentSelect) {
    elements.tournamentSelect.addEventListener('change', async (e) => {
        const tournamentId = e.target.value;
        if (tournamentId) {
            await selectTournament(tournamentId);
        }
    });
}

if (elements.createTournamentBtn) {
    elements.createTournamentBtn.addEventListener('click', () => {
        showCreateTournamentModal();
    });
}

if (elements.editTournamentBtn) {
    elements.editTournamentBtn.addEventListener('click', () => {
        showEditTournamentModal();
    });
}

if (elements.deleteTournamentBtn) {
    elements.deleteTournamentBtn.addEventListener('click', async () => {
        const tournamentId = elements.tournamentSelect?.value;
        if (tournamentId) {
            await deleteTournament(tournamentId);
        } else {
            alert(t('selectTournamentFirst') || 'Please select a tournament first');
        }
    });
}

if (elements.createTournamentConfirm) {
    elements.createTournamentConfirm.addEventListener('click', async () => {
        const name = elements.newTournamentName?.value.trim();
        if (name) {
            await createTournament(name);
        }
    });
    
    // Also handle Enter key in input
    if (elements.newTournamentName) {
        elements.newTournamentName.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const name = elements.newTournamentName.value.trim();
                if (name) {
                    await createTournament(name);
                }
            }
        });
    }
}

if (elements.editTournamentConfirm) {
    elements.editTournamentConfirm.addEventListener('click', async () => {
        const tournamentId = elements.editTournamentName?.dataset.tournamentId;
        const name = elements.editTournamentName?.value.trim();
        if (tournamentId && name) {
            await updateTournament(tournamentId, name);
        }
    });
    
    // Also handle Enter key in input
    if (elements.editTournamentName) {
        elements.editTournamentName.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const tournamentId = elements.editTournamentName.dataset.tournamentId;
                const name = elements.editTournamentName.value.trim();
                if (tournamentId && name) {
                    await updateTournament(tournamentId, name);
                }
            }
        });
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (elements.createTournamentModal && e.target === elements.createTournamentModal) {
        closeTournamentModals();
    }
    if (elements.editTournamentModal && e.target === elements.editTournamentModal) {
        closeTournamentModals();
    }
});

// Setup
elements.setupBtn.addEventListener('click', async () => {
    // Names are now optional - use current state values if not provided
    const period = parseInt(elements.periodInput.value) || 1;
    const timerMinutes = parseInt(elements.timerMinutes.value) || 0;
    const timerSeconds = parseInt(elements.timerSeconds.value) || 0;
    const totalSeconds = timerMinutes * 60 + timerSeconds;
    
    // Don't send names - they are set via Player Names buttons
    // API will use current state values if names are not provided
    await apiCall('/setup', 'POST', {
        period,
        timerSeconds: totalSeconds
    });
});

// Player management
if (elements.addPlayerBtn) {
    elements.addPlayerBtn.addEventListener('click', async () => {
        const playerName = elements.playerNameInput?.value.trim();
        if (playerName) {
            await addPlayer(playerName);
        }
    });
}

if (elements.playerNameInput) {
    elements.playerNameInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const playerName = elements.playerNameInput.value.trim();
            if (playerName) {
                await addPlayer(playerName);
            }
        }
    });
}

// Make deletePlayer available globally for onclick handlers
window.deletePlayer = deletePlayer;

// Balls buttons (current game score)
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

// Match score buttons (games won)
if (elements.homeMatchPlus) {
    elements.homeMatchPlus.addEventListener('click', () => apiCall('/match-score', 'POST', { team: 'home', delta: 1 }));
}
if (elements.homeMatchMinus) {
    elements.homeMatchMinus.addEventListener('click', () => {
        const homeMatchScore = (currentState?.homeMatchScore || 0);
        if (homeMatchScore > 0) {
            apiCall('/match-score', 'POST', { team: 'home', delta: -1 });
        }
    });
}
if (elements.awayMatchPlus) {
    elements.awayMatchPlus.addEventListener('click', () => apiCall('/match-score', 'POST', { team: 'away', delta: 1 }));
}
if (elements.awayMatchMinus) {
    elements.awayMatchMinus.addEventListener('click', () => {
        const awayMatchScore = (currentState?.awayMatchScore || 0);
        if (awayMatchScore > 0) {
            apiCall('/match-score', 'POST', { team: 'away', delta: -1 });
        }
    });
}

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
        // Clear form inputs (names are managed via Player Names section)
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
    console.log('Initializing control panel...');
    console.log('API_BASE:', API_BASE);
    
    // Check if required elements exist
    if (!elements.matchIdInput) {
        console.error('Match ID input element not found!');
        return;
    }
    
    if (!elements.connectionStatus) {
        console.warn('Connection status element not found');
    }
    
    if (!elements.tournamentSelect) {
        console.warn('Tournament select element not found');
    }
    
    matchId = elements.matchIdInput.value || '1';
    console.log('Match ID:', matchId);
    
    // Initialize collapsible sections
    initializeCollapsibles();
    
    // Set initial connection status
    updateConnectionStatus(false);
    
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
    try {
        await loadVisibilitySettings();
    } catch (error) {
        console.error('Error loading visibility settings:', error);
    }
    
    // Load tournaments and get current tournament
    try {
        console.log('Loading tournaments...');
        await loadTournaments();
        console.log('Tournaments loaded:', tournamentsList.length);
        const currentTournament = await getCurrentTournament();
        console.log('Current tournament:', currentTournament?.id || 'none');
        
        // Restore tournament selection from localStorage if available
        const savedTournamentId = localStorage.getItem('currentTournamentId');
        if (savedTournamentId && tournamentsList.find(t => t.id === savedTournamentId)) {
            await selectTournament(savedTournamentId);
        } else if (currentTournament) {
            // Use current tournament from API
            currentTournamentId = currentTournament.id;
            renderTournamentSelect();
            await loadPlayers();
        } else {
            // No tournament selected, load players anyway (will use default)
            await loadPlayers();
        }
    } catch (error) {
        console.error('Error initializing tournaments:', error);
        // Continue anyway - try to load players
        try {
            await loadPlayers();
        } catch (playerError) {
            console.error('Error loading players:', playerError);
        }
    }
    
    // Fetch initial state
    try {
        await fetchState();
        // Connect WebSocket after initial state is loaded
        connectWebSocket();
    } catch (error) {
        console.error('Error fetching initial state:', error);
        // Try to connect WebSocket anyway
        connectWebSocket();
    }
    
    // Set up periodic state fetch as backup (every 2 seconds)
    setInterval(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            fetchState();
        }
    }, 2000);
});
