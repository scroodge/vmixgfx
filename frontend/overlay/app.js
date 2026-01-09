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
    if (!settings || typeof settings !== 'object') {
        console.error('Invalid settings provided to applyGFXSettings');
        return;
    }
    
    const root = document.documentElement;
    const container = document.querySelector('.overlay-container');
    const scoreSection = document.querySelector('.score-section');
    const scoreBanner = document.querySelector('.score-banner');
    const infoSection = document.querySelector('.info-section');
    
    // Apply layout style (banner vs vertical)
    if (settings.layout && settings.layout.style) {
        const layoutStyle = settings.layout.style;
        localStorage.setItem('gfxLayoutStyle', layoutStyle);
        
        // Re-query banner elements in case they weren't found earlier
        const currentScoreBanner = document.querySelector('.score-banner') || scoreBanner;
        const currentScoreSection = document.querySelector('.score-section') || scoreSection;
        
        if (layoutStyle === 'banner') {
            if (currentScoreSection) currentScoreSection.style.display = 'none';
            if (currentScoreBanner) currentScoreBanner.style.display = 'flex';
        } else {
            if (currentScoreSection) currentScoreSection.style.display = 'flex';
            if (currentScoreBanner) currentScoreBanner.style.display = 'none';
        }
    }
    
    // Show/hide match scores in banner
    if (settings.layout && settings.layout.showMatchScores !== undefined) {
        const isPreview = window.location.search.includes('preview=true');
        if (isPreview) {
            localStorage.setItem('gfxShowMatchScores', settings.layout.showMatchScores.toString());
        }
        // Store format for later use
        if (settings.layout.matchScoreFormat) {
            if (isPreview) {
                localStorage.setItem('gfxMatchScoreFormat', settings.layout.matchScoreFormat);
            }
        }
    }
    
    // Colors (with fallbacks)
    if (settings.colors) {
        root.style.setProperty('--color-player1', settings.colors.player1 || '#ffffff');
        root.style.setProperty('--color-player1-score', settings.colors.player1Score || '#ffffff');
        root.style.setProperty('--color-player2', settings.colors.player2 || '#ffffff');
        root.style.setProperty('--color-player2-score', settings.colors.player2Score || '#ffffff');
        root.style.setProperty('--color-separator', settings.colors.separator || '#ffffff');
        root.style.setProperty('--color-game-timer', settings.colors.gameTimer || '#ffffff');
        root.style.setProperty('--color-glow', settings.colors.glow || '#ffd700');
    }
    
    // Typography (with fallbacks)
    if (settings.typography) {
        root.style.setProperty('--font-family', settings.typography.fontFamily || 'Arial, sans-serif');
        root.style.setProperty('--font-size-player-name', (settings.typography.playerNameSize || 48) + 'px');
        root.style.setProperty('--font-size-score', (settings.typography.scoreSize || 120) + 'px');
        root.style.setProperty('--font-size-game-timer', (settings.typography.gameTimerSize || 42) + 'px');
        root.style.setProperty('--font-weight', settings.typography.fontWeight || 900);
    }
    
    // Effects (with fallbacks)
    if (settings.effects) {
        root.style.setProperty('--text-shadow-blur', (settings.effects.textShadowBlur || 4) + 'px');
        root.style.setProperty('--text-shadow-opacity', ((settings.effects.textShadowOpacity || 80) / 100).toFixed(2));
        root.style.setProperty('--letter-spacing', (settings.effects.letterSpacing || 2) + 'px');
    }
    
    // Layout (with fallbacks)
    if (settings.layout) {
        root.style.setProperty('--spacing-scores', (settings.layout.spacingScores || 40) + 'px');
        root.style.setProperty('--spacing-info', (settings.layout.spacingInfo || 30) + 'px');
        root.style.setProperty('--separator-size', (settings.layout.separatorSize || 80) + 'px');
    }
    
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
                const positionX = bg.imagePositionX || 'center';
                const positionY = bg.imagePositionY || 'center';
                bgValue = `linear-gradient(rgba(0,0,0,${1 - opacity}), rgba(0,0,0,${1 - opacity})), url('${bg.imageUrl}')`;
                container.style.backgroundSize = size;
                
                // Handle position values - convert keywords to CSS values
                let posX = positionX;
                let posY = positionY;
                
                // Convert common keywords
                if (positionX === 'left') posX = '0%';
                else if (positionX === 'right') posX = '100%';
                else if (positionX === 'center') posX = '50%';
                
                if (positionY === 'top') posY = '0%';
                else if (positionY === 'bottom') posY = '100%';
                else if (positionY === 'center') posY = '50%';
                
                container.style.backgroundPosition = `${posX} ${posY}`;
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
    if (settings.effects && settings.effects.enableGlow !== undefined) {
        document.body.dataset.glowEnabled = settings.effects.enableGlow;
    }
    
    // Store animation settings for access in animateScoreChange
    if (settings.animations) {
        if (!window.gfxSettings) window.gfxSettings = {};
        window.gfxSettings.animations = settings.animations;
    }
    
    // Banner styling - apply directly to banner elements
    if (settings.banner) {
        // Always set CSS variables
        root.style.setProperty('--banner-border-radius', (settings.banner.borderRadius || 12) + 'px');
        root.style.setProperty('--banner-height', (settings.banner.height || 80) + 'px');
        root.style.setProperty('--banner-padding', (settings.banner.padding || 20) + 'px');
        root.style.setProperty('--banner-center-width', (settings.banner.centerWidth || 200) + 'px');
        root.style.setProperty('--banner-name-size', (settings.banner.nameSize || 24) + 'px');
        root.style.setProperty('--banner-score-size', (settings.banner.scoreSize || 48) + 'px');
        root.style.setProperty('--banner-name-color', settings.banner.nameColor || '#ffffff');
        root.style.setProperty('--banner-score-color', settings.banner.scoreColor || '#000000');
        root.style.setProperty('--banner-match-score-color', settings.banner.matchScoreColor || '#666666');
        
        // Try to apply to banner elements if they exist (re-query to be sure)
        const currentScoreBanner = document.querySelector('.score-banner');
        if (currentScoreBanner) {
            const leftSegment = currentScoreBanner.querySelector('.banner-left');
            const centerSegment = currentScoreBanner.querySelector('.banner-center');
            const rightSegment = currentScoreBanner.querySelector('.banner-right');
            
            if (leftSegment) {
                const lighter = adjustColorBrightness(settings.banner.leftColor || '#2d5016', 1.2);
                leftSegment.style.background = `linear-gradient(135deg, ${settings.banner.leftColor || '#2d5016'} 0%, ${lighter} 100%)`;
            }
            if (centerSegment) {
                centerSegment.style.background = settings.banner.centerColor || '#ffffff';
            }
            if (rightSegment) {
                const lighter = adjustColorBrightness(settings.banner.rightColor || '#2d5016', 1.2);
                rightSegment.style.background = `linear-gradient(135deg, ${settings.banner.rightColor || '#2d5016'} 0%, ${lighter} 100%)`;
            }
        } else {
            // Set CSS variables for gradients (will be used when banner appears)
            const lighter = adjustColorBrightness(settings.banner.leftColor || '#2d5016', 1.2);
            root.style.setProperty('--banner-left-color', `linear-gradient(135deg, ${settings.banner.leftColor || '#2d5016'} 0%, ${lighter} 100%)`);
            root.style.setProperty('--banner-center-color', settings.banner.centerColor || '#ffffff');
            const lighterRight = adjustColorBrightness(settings.banner.rightColor || '#2d5016', 1.2);
            root.style.setProperty('--banner-right-color', `linear-gradient(135deg, ${settings.banner.rightColor || '#2d5016'} 0%, ${lighterRight} 100%)`);
        }
    }
}

// Helper function to adjust color brightness for gradient
function adjustColorBrightness(hex, factor) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) * factor));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * factor));
    const b = Math.min(255, Math.floor((num & 0x0000FF) * factor));
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
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

// Listen for settings updates from control panel (preview mode only)
// In vMix, settings come from API, not postMessage
const isPreview = window.location.search.includes('preview=true');
if (isPreview) {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'gfxSettings') {
            applyGFXSettings(event.data.settings);
            // Cache in localStorage for preview mode only
            localStorage.setItem('gfxSettings', JSON.stringify(event.data.settings));
        } else if (event.data && event.data.type === 'visibilityUpdate') {
            // Handle visibility updates (preview mode)
            updateVisibility(event.data.showGame, event.data.showTimer);
        }
    });

    // Listen for custom event from same window (for direct updates in preview)
    window.addEventListener('gfxSettingsChanged', (event) => {
        if (event.detail) {
            applyGFXSettings(event.detail);
        }
    });

    // Listen for storage changes (preview mode only - same-origin iframe)
    window.addEventListener('storage', (event) => {
        if (event.key === 'gfxSettings' && event.newValue) {
            try {
                const settings = JSON.parse(event.newValue);
                applyGFXSettings(settings);
            } catch (e) {
                console.error('Failed to parse settings from storage:', e);
            }
        }
    });
}

// For preview mode only: check localStorage for real-time updates (same-origin iframe)
// For vMix: settings are updated via WebSocket messages from the server
if (window.location.search.includes('preview=true')) {
    let lastSettingsHash = '';
    let lastVisibilityHash = '';
    setInterval(() => {
        // Only use localStorage polling in preview mode
        const settingsStr = localStorage.getItem('gfxSettings');
        if (settingsStr) {
            const hash = settingsStr.length + ''; // Simple hash
            if (hash !== lastSettingsHash) {
                lastSettingsHash = hash;
                try {
                    const settings = JSON.parse(settingsStr);
                    applyGFXSettings(settings);
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
        
        // Check visibility settings (preview mode only)
        const showGame = localStorage.getItem('showGameDisplay');
        const showTimer = localStorage.getItem('showTimerDisplay');
        const visibilityHash = (showGame || 'true') + '|' + (showTimer || 'true');
        if (visibilityHash !== lastVisibilityHash) {
            lastVisibilityHash = visibilityHash;
            updateVisibility(
                showGame === null ? true : showGame === 'true',
                showTimer === null ? true : showTimer === 'true'
            );
        }
    }, 200); // Check every 200ms for changes (preview mode only)
} else {
    // vMix mode: Periodically refresh settings from API (not localStorage)
    setInterval(async () => {
        try {
            const response = await fetch(`/api/match/${matchId}/gfx-settings`);
            if (response.ok) {
                const settings = await response.json();
                if (settings && Object.keys(settings).length > 0) {
                    applyGFXSettings(settings);
                    if (settings.visibility) {
                        updateVisibility(
                            settings.visibility.showGame !== false,
                            settings.visibility.showTimer !== false
                        );
                    }
                }
            }
        } catch (e) {
            // Silent fail - will retry on next interval
        }
    }, 5000); // Check API every 5 seconds for vMix
}

// Function to update visibility of game and timer displays
function updateVisibility(showGame, showTimer) {
    if (elements.periodDisplay) {
        elements.periodDisplay.style.display = showGame ? 'flex' : 'none';
    }
    if (elements.timerDisplay) {
        elements.timerDisplay.style.display = showTimer ? 'flex' : 'none';
    }
    
    // Hide entire info section if both are hidden
    if (elements.infoSection) {
        if (!showGame && !showTimer) {
            elements.infoSection.style.display = 'none';
        } else {
            elements.infoSection.style.display = 'flex';
        }
    }
}

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
    container: document.querySelector('.overlay-container'),
    infoSection: document.querySelector('.info-section'),
    periodDisplay: document.querySelector('.period-display'),
    timerDisplay: document.querySelector('.timer-display'),
    // Banner layout elements
    scoreSection: document.querySelector('.score-section'),
    scoreBanner: document.querySelector('.score-banner'),
    bannerHomeName: document.getElementById('banner-home-name'),
    bannerAwayName: document.getElementById('banner-away-name'),
    bannerHomeScore: document.getElementById('banner-home-score'),
    bannerAwayScore: document.getElementById('banner-away-score'),
    bannerMatchScores: document.getElementById('banner-match-scores')
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
    
    // Get settings from loaded GFX settings or localStorage (preview mode only)
    const isPreview = window.location.search.includes('preview=true');
    let layoutStyle = 'vertical';
    let showMatchScores = false;
    let matchScoreFormat = 'player1';
    
    // Try to get from loaded settings (stored when settings are loaded)
    if (window.gfxSettings && window.gfxSettings.layout) {
        layoutStyle = window.gfxSettings.layout.style || 'vertical';
        showMatchScores = window.gfxSettings.layout.showMatchScores || false;
        matchScoreFormat = window.gfxSettings.layout.matchScoreFormat || 'player1';
    } else if (isPreview) {
        // Preview mode: fallback to localStorage
        layoutStyle = localStorage.getItem('gfxLayoutStyle') || 'vertical';
        showMatchScores = localStorage.getItem('gfxShowMatchScores') === 'true';
        matchScoreFormat = localStorage.getItem('gfxMatchScoreFormat') || 'player1';
    }
    
    // Update layout visibility
    if (layoutStyle === 'banner') {
        if (elements.scoreSection) elements.scoreSection.style.display = 'none';
        if (elements.scoreBanner) {
            elements.scoreBanner.style.display = 'flex';
            // Re-apply banner styles when banner becomes visible
            const settingsStr = localStorage.getItem('gfxSettings');
            if (settingsStr) {
                try {
                    const settings = JSON.parse(settingsStr);
                    if (settings.banner) {
                        // Re-apply banner background styles
                        const leftSegment = elements.scoreBanner.querySelector('.banner-left');
                        const centerSegment = elements.scoreBanner.querySelector('.banner-center');
                        const rightSegment = elements.scoreBanner.querySelector('.banner-right');
                        
                        if (leftSegment && settings.banner.leftColor) {
                            const lighter = adjustColorBrightness(settings.banner.leftColor, 1.2);
                            leftSegment.style.background = `linear-gradient(135deg, ${settings.banner.leftColor} 0%, ${lighter} 100%)`;
                        }
                        if (centerSegment && settings.banner.centerColor) {
                            centerSegment.style.background = settings.banner.centerColor;
                        }
                        if (rightSegment && settings.banner.rightColor) {
                            const lighter = adjustColorBrightness(settings.banner.rightColor, 1.2);
                            rightSegment.style.background = `linear-gradient(135deg, ${settings.banner.rightColor} 0%, ${lighter} 100%)`;
                        }
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
        }
    } else {
        if (elements.scoreSection) elements.scoreSection.style.display = 'flex';
        if (elements.scoreBanner) elements.scoreBanner.style.display = 'none';
    }
    
    // Update team names
    const homeName = state.homeName || 'Player 1';
    const awayName = state.awayName || 'Player 2';
    
    elements.homeName.textContent = homeName;
    elements.awayName.textContent = awayName;
    
    if (elements.bannerHomeName) elements.bannerHomeName.textContent = homeName;
    if (elements.bannerAwayName) elements.bannerAwayName.textContent = awayName;
    
    // Update scores with animation on change
    const homeScoreChanged = prevState && prevState.homeScore !== state.homeScore;
    const awayScoreChanged = prevState && prevState.awayScore !== state.awayScore;
    const homeMatchScore = state.homeMatchScore || 0;
    const awayMatchScore = state.awayMatchScore || 0;
    
    if (homeScoreChanged) {
        animateScoreChange(elements.homeScore, state.homeScore || 0);
        if (elements.bannerHomeScore) animateScoreChange(elements.bannerHomeScore, state.homeScore || 0);
    } else {
        elements.homeScore.textContent = state.homeScore || 0;
        if (elements.bannerHomeScore) elements.bannerHomeScore.textContent = state.homeScore || 0;
    }
    
    if (awayScoreChanged) {
        animateScoreChange(elements.awayScore, state.awayScore || 0);
        if (elements.bannerAwayScore) animateScoreChange(elements.bannerAwayScore, state.awayScore || 0);
    } else {
        elements.awayScore.textContent = state.awayScore || 0;
        if (elements.bannerAwayScore) elements.bannerAwayScore.textContent = state.awayScore || 0;
    }
    
    // Update match scores in banner format based on selected format
    // Formats: player1 = "(5)", player2 = "(3)", both = "(5-3)", total = "(8)"
    if (elements.bannerMatchScores) {
        if (showMatchScores) {
            let matchScoreText = '';
            
            if (matchScoreFormat === 'player1') {
                // Show Player 1's match score: "3 (5) 2"
                matchScoreText = `(${homeMatchScore})`;
            } else if (matchScoreFormat === 'player2') {
                // Show Player 2's match score: "3 (3) 2"
                matchScoreText = `(${awayMatchScore})`;
            } else if (matchScoreFormat === 'both') {
                // Show both: "3 (5-3) 2"
                matchScoreText = `(${homeMatchScore}-${awayMatchScore})`;
            } else if (matchScoreFormat === 'total') {
                // Show total games played: "3 (8) 2"
                const total = homeMatchScore + awayMatchScore;
                matchScoreText = `(${total})`;
            }
            
            if (homeMatchScore > 0 || awayMatchScore > 0) {
                elements.bannerMatchScores.textContent = matchScoreText;
                elements.bannerMatchScores.style.display = 'inline';
            } else {
                elements.bannerMatchScores.style.display = 'none';
            }
        } else {
            elements.bannerMatchScores.style.display = 'none';
        }
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
 * Animate score change with bump/pop effect or fantastic animations
 */
function animateScoreChange(element, newValue) {
    // Remove any existing animation classes
    element.classList.remove(
        'score-changed', 
        'glow-enabled',
        'animation-explosion',
        'animation-bounce',
        'animation-rotate',
        'animation-particles',
        'animation-flip',
        'animation-zoom'
    );
    
    // Trigger reflow to restart animation
    void element.offsetWidth;
    
    // Update value
    element.textContent = newValue;
    
    // Check animation settings
    let animationsEnabled = false;
    let animationType = 'explosion';
    
    // Try to get from loaded settings
    if (window.gfxSettings && window.gfxSettings.animations) {
        animationsEnabled = window.gfxSettings.animations.enabled || false;
        animationType = window.gfxSettings.animations.type || 'explosion';
    } else {
        // Fallback: check localStorage (for preview mode) or API
        const isPreview = window.location.search.includes('preview=true');
        if (isPreview) {
            const settingsStr = localStorage.getItem('gfxSettings');
            if (settingsStr) {
                try {
                    const settings = JSON.parse(settingsStr);
                    if (settings.animations) {
                        animationsEnabled = settings.animations.enabled || false;
                        animationType = settings.animations.type || 'explosion';
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }
    
    // Check if glow is enabled (for basic animation)
    const glowEnabled = document.body.dataset.glowEnabled === 'true';
    
    if (animationsEnabled && animationType) {
        // Apply fantastic animation
        element.classList.add(`animation-${animationType}`);
        
        // Remove animation class after animation completes
        const animationDuration = animationType === 'bounce' ? 900 : 
                                  animationType === 'rotate' || animationType === 'flip' ? 800 :
                                  animationType === 'particles' ? 1000 : 700;
        setTimeout(() => {
            element.classList.remove(`animation-${animationType}`);
        }, animationDuration);
    } else {
        // Use default animation
        element.classList.add('score-changed');
        if (glowEnabled) {
            element.classList.add('glow-enabled');
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('score-changed', 'glow-enabled');
        }, 500);
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
                
                // Handle GFX settings updates via WebSocket (for vMix - no localStorage needed)
                if (data.type === 'gfxSettings' && data.settings) {
                    console.log('Received GFX settings update via WebSocket');
                    applyGFXSettings(data.settings);
                    if (data.settings.visibility) {
                        updateVisibility(
                            data.settings.visibility.showGame !== false,
                            data.settings.visibility.showTimer !== false
                        );
                    }
                    return; // Don't process as state update
                }
                
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

// Load GFX settings from API (primary source for vMix)
async function loadGFXSettingsFromAPI() {
    try {
        const response = await fetch(`/api/match/${matchId}/gfx-settings`);
        if (response.ok) {
            const settings = await response.json();
            if (settings && Object.keys(settings).length > 0) {
                console.log('Loading GFX settings from API:', settings);
                applyGFXSettings(settings);
                
                // Only use localStorage for preview mode (same-origin iframe), NOT for vMix
                // Store settings globally for access in updateUI
                window.gfxSettings = settings;
                
                const isPreview = window.location.search.includes('preview=true');
                if (isPreview) {
                    // Cache in localStorage for preview iframe performance only
                    localStorage.setItem('gfxSettings', JSON.stringify(settings));
                    if (settings.layout && settings.layout.style) {
                        localStorage.setItem('gfxLayoutStyle', settings.layout.style);
                    }
                    if (settings.layout && settings.layout.showMatchScores !== undefined) {
                        localStorage.setItem('gfxShowMatchScores', settings.layout.showMatchScores.toString());
                    }
                    if (settings.layout && settings.layout.matchScoreFormat) {
                        localStorage.setItem('gfxMatchScoreFormat', settings.layout.matchScoreFormat);
                    }
                    if (settings.visibility) {
                        localStorage.setItem('showGameDisplay', settings.visibility.showGame !== false ? 'true' : 'false');
                        localStorage.setItem('showTimerDisplay', settings.visibility.showTimer !== false ? 'true' : 'false');
                    }
                }
                // For vMix: Do NOT use localStorage - settings come from API/WebSocket only
                
                // Apply visibility settings if present (works for both preview and vMix)
                if (settings.visibility) {
                    updateVisibility(
                        settings.visibility.showGame !== false,
                        settings.visibility.showTimer !== false
                    );
                }
                console.log('GFX settings loaded from API and applied');
                return true;
            }
        }
    } catch (e) {
        console.error('Failed to load GFX settings from API:', e);
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    // Get match ID first
    matchId = getMatchId();
    
    // Check if this is preview mode (iframe in control panel) or vMix (standalone)
    const isPreview = window.location.search.includes('preview=true');
    
    // For vMix: Load ONLY from API (no localStorage dependency)
    // For preview: Can use localStorage as cache for same-origin performance
    loadGFXSettingsFromAPI().then(loadedFromAPI => {
        if (!loadedFromAPI) {
            if (isPreview) {
                // Preview mode only: fallback to localStorage for development/testing
                const settingsStr = localStorage.getItem('gfxSettings');
                if (settingsStr) {
                    try {
                        const settings = JSON.parse(settingsStr);
                        console.log('Loading GFX settings from localStorage (preview mode fallback):', settings);
                        applyGFXSettings(settings);
                        
                        // Apply layout and visibility from settings
                        if (settings.layout && settings.layout.style) {
                            const layoutStyle = settings.layout.style;
                            if (elements.scoreSection && elements.scoreBanner) {
                                if (layoutStyle === 'banner') {
                                    elements.scoreSection.style.display = 'none';
                                    elements.scoreBanner.style.display = 'flex';
                                } else {
                                    elements.scoreSection.style.display = 'flex';
                                    elements.scoreBanner.style.display = 'none';
                                }
                            }
                        }
                        
                        if (settings.visibility) {
                            updateVisibility(
                                settings.visibility.showGame !== false,
                                settings.visibility.showTimer !== false
                            );
                        }
                    } catch (e) {
                        console.error('Failed to load GFX settings from localStorage:', e);
                        // Use defaults
                        if (elements.scoreSection && elements.scoreBanner) {
                            elements.scoreSection.style.display = 'flex';
                            elements.scoreBanner.style.display = 'none';
                        }
                        updateVisibility(true, true);
                    }
                } else {
                    // Preview mode: no settings found
                    if (elements.scoreSection && elements.scoreBanner) {
                        elements.scoreSection.style.display = 'flex';
                        elements.scoreBanner.style.display = 'none';
                    }
                    updateVisibility(true, true);
                }
            } else {
                // vMix mode: no localStorage fallback - use defaults
                console.warn('No GFX settings found in API. Using default styling.');
                if (elements.scoreSection && elements.scoreBanner) {
                    elements.scoreSection.style.display = 'flex';
                    elements.scoreBanner.style.display = 'none';
                }
                updateVisibility(true, true);
            }
        } else {
            // Settings loaded from API - layout and visibility already applied in loadGFXSettingsFromAPI
            // Layout is applied from settings in applyGFXSettings function
        }
        
        // Continue with initialization
        initializeOverlay();
    });
});

// Separate function for overlay initialization
function initializeOverlay() {
    
    // Check if this is a preview (from control panel)
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get('preview') === 'true';
    
    if (isPreview) {
        console.log('Initializing overlay preview for match:', matchId);
        // In preview mode, update immediately when settings change
        // Settings are already loaded above
        
        // Fetch state but don't connect WebSocket in preview (optional, can be enabled)
        fetchState();
    } else {
        console.log('Initializing overlay for match:', matchId);
        
        // Fetch initial state first
        fetchState().then(() => {
            // Connect WebSocket after initial state is loaded
            connectWebSocket();
        });
    }
    
    // Listen for GFX settings updates via WebSocket
    // (Settings will be updated when changed in control panel)
    
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
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    if (ws) {
        ws.close(1000, 'Page unloading');
    }
});
