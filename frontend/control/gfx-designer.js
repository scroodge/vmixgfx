/**
 * GFX Designer - Visual customization interface for overlay
 * Manages colors, fonts, sizes, effects, and presets
 */

// Default settings
const defaultSettings = {
    colors: {
        player1: '#ffffff',
        player1Score: '#ffffff',
        player2: '#ffffff',
        player2Score: '#ffffff',
        separator: '#ffffff',
        gameTimer: '#ffffff',
        glow: '#ffd700'
    },
    typography: {
        fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
        playerNameSize: 48,
        scoreSize: 120,
        gameTimerSize: 42,
        fontWeight: 900
    },
    effects: {
        textShadowBlur: 4,
        textShadowOpacity: 80,
        letterSpacing: 2,
        enableGlow: true
    },
    layout: {
        spacingScores: 40,
        spacingInfo: 30,
        separatorSize: 80
    }
};

let currentSettings = JSON.parse(JSON.stringify(defaultSettings));

// DOM Elements
const gfxElements = {
    // Colors
    colorPlayer1: document.getElementById('color-player1'),
    colorPlayer1Text: document.getElementById('color-player1-text'),
    colorPlayer1Score: document.getElementById('color-player1-score'),
    colorPlayer1ScoreText: document.getElementById('color-player1-score-text'),
    colorPlayer2: document.getElementById('color-player2'),
    colorPlayer2Text: document.getElementById('color-player2-text'),
    colorPlayer2Score: document.getElementById('color-player2-score'),
    colorPlayer2ScoreText: document.getElementById('color-player2-score-text'),
    colorSeparator: document.getElementById('color-separator'),
    colorSeparatorText: document.getElementById('color-separator-text'),
    colorGameTimer: document.getElementById('color-game-timer'),
    colorGameTimerText: document.getElementById('color-game-timer-text'),
    colorGlow: document.getElementById('color-glow'),
    colorGlowText: document.getElementById('color-glow-text'),
    
    // Typography
    fontFamily: document.getElementById('font-family'),
    fontSizePlayerName: document.getElementById('font-size-player-name'),
    fontSizePlayerNameValue: document.getElementById('font-size-player-name-value'),
    fontSizeScore: document.getElementById('font-size-score'),
    fontSizeScoreValue: document.getElementById('font-size-score-value'),
    fontSizeGameTimer: document.getElementById('font-size-game-timer'),
    fontSizeGameTimerValue: document.getElementById('font-size-game-timer-value'),
    fontWeight: document.getElementById('font-weight'),
    
    // Effects
    textShadowBlur: document.getElementById('text-shadow-blur'),
    textShadowBlurValue: document.getElementById('text-shadow-blur-value'),
    textShadowOpacity: document.getElementById('text-shadow-opacity'),
    textShadowOpacityValue: document.getElementById('text-shadow-opacity-value'),
    letterSpacing: document.getElementById('letter-spacing'),
    letterSpacingValue: document.getElementById('letter-spacing-value'),
    enableGlow: document.getElementById('enable-glow'),
    
    // Layout
    spacingScores: document.getElementById('spacing-scores'),
    spacingScoresValue: document.getElementById('spacing-scores-value'),
    spacingInfo: document.getElementById('spacing-info'),
    spacingInfoValue: document.getElementById('spacing-info-value'),
    separatorSize: document.getElementById('separator-size'),
    separatorSizeValue: document.getElementById('separator-size-value'),
    
    // Presets & Actions
    presetDefault: document.getElementById('gfx-preset-default'),
    presetBold: document.getElementById('gfx-preset-bold'),
    presetElegant: document.getElementById('gfx-preset-elegant'),
    presetMinimal: document.getElementById('gfx-preset-minimal'),
    exportBtn: document.getElementById('gfx-export'),
    importBtn: document.getElementById('gfx-import'),
    importFile: document.getElementById('gfx-import-file'),
    applyBtn: document.getElementById('gfx-apply'),
    resetBtn: document.getElementById('gfx-reset'),
    preview: document.getElementById('gfx-preview')
};

// ============================================================================
// Settings Management
// ============================================================================

function loadSettings() {
    const saved = localStorage.getItem('gfxSettings');
    if (saved) {
        try {
            currentSettings = JSON.parse(saved);
            applySettingsToUI(currentSettings);
            applySettingsToOverlay(currentSettings);
        } catch (e) {
            console.error('Failed to load settings:', e);
            currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        }
    } else {
        applySettingsToUI(defaultSettings);
        applySettingsToOverlay(defaultSettings);
    }
}

function saveSettings() {
    localStorage.setItem('gfxSettings', JSON.stringify(currentSettings));
    // Also sync to overlay via localStorage message
    if (gfxElements.preview && gfxElements.preview.contentWindow) {
        try {
            gfxElements.preview.contentWindow.postMessage({
                type: 'gfxSettings',
                settings: currentSettings
            }, '*');
        } catch (e) {
            console.error('Failed to sync to preview:', e);
        }
    }
}

function applySettingsToUI(settings) {
    // Colors
    gfxElements.colorPlayer1.value = settings.colors.player1;
    gfxElements.colorPlayer1Text.value = settings.colors.player1;
    gfxElements.colorPlayer1Score.value = settings.colors.player1Score;
    gfxElements.colorPlayer1ScoreText.value = settings.colors.player1Score;
    gfxElements.colorPlayer2.value = settings.colors.player2;
    gfxElements.colorPlayer2Text.value = settings.colors.player2;
    gfxElements.colorPlayer2Score.value = settings.colors.player2Score;
    gfxElements.colorPlayer2ScoreText.value = settings.colors.player2Score;
    gfxElements.colorSeparator.value = settings.colors.separator;
    gfxElements.colorSeparatorText.value = settings.colors.separator;
    gfxElements.colorGameTimer.value = settings.colors.gameTimer;
    gfxElements.colorGameTimerText.value = settings.colors.gameTimer;
    gfxElements.colorGlow.value = settings.colors.glow;
    gfxElements.colorGlowText.value = settings.colors.glow;
    
    // Typography
    gfxElements.fontFamily.value = settings.typography.fontFamily;
    gfxElements.fontSizePlayerName.value = settings.typography.playerNameSize;
    gfxElements.fontSizePlayerNameValue.textContent = settings.typography.playerNameSize + 'px';
    gfxElements.fontSizeScore.value = settings.typography.scoreSize;
    gfxElements.fontSizeScoreValue.textContent = settings.typography.scoreSize + 'px';
    gfxElements.fontSizeGameTimer.value = settings.typography.gameTimerSize;
    gfxElements.fontSizeGameTimerValue.textContent = settings.typography.gameTimerSize + 'px';
    gfxElements.fontWeight.value = settings.typography.fontWeight;
    
    // Effects
    gfxElements.textShadowBlur.value = settings.effects.textShadowBlur;
    gfxElements.textShadowBlurValue.textContent = settings.effects.textShadowBlur + 'px';
    gfxElements.textShadowOpacity.value = settings.effects.textShadowOpacity;
    gfxElements.textShadowOpacityValue.textContent = settings.effects.textShadowOpacity + '%';
    gfxElements.letterSpacing.value = settings.effects.letterSpacing;
    gfxElements.letterSpacingValue.textContent = settings.effects.letterSpacing + 'px';
    gfxElements.enableGlow.checked = settings.effects.enableGlow;
    
    // Layout
    gfxElements.spacingScores.value = settings.layout.spacingScores;
    gfxElements.spacingScoresValue.textContent = settings.layout.spacingScores + 'px';
    gfxElements.spacingInfo.value = settings.layout.spacingInfo;
    gfxElements.spacingInfoValue.textContent = settings.layout.spacingInfo + 'px';
    gfxElements.separatorSize.value = settings.layout.separatorSize;
    gfxElements.separatorSizeValue.textContent = settings.layout.separatorSize + 'px';
}

function applySettingsToOverlay(settings) {
    // Store settings in localStorage for overlay to read
    localStorage.setItem('gfxSettings', JSON.stringify(settings));
    
    // Send message to preview iframe
    if (gfxElements.preview && gfxElements.preview.contentWindow) {
        try {
            gfxElements.preview.contentWindow.postMessage({
                type: 'gfxSettings',
                settings: settings
            }, '*');
        } catch (e) {
            // Ignore cross-origin errors
        }
    }
    
    // Update main overlay windows (all tabs with overlay)
    window.dispatchEvent(new CustomEvent('gfxSettingsChanged', { detail: settings }));
}

// ============================================================================
// Event Handlers
// ============================================================================

// Color inputs - sync color picker with text input
function setupColorSync(colorPicker, textInput, settingPath) {
    colorPicker.addEventListener('input', (e) => {
        textInput.value = e.target.value;
        updateSetting(settingPath, e.target.value);
    });
    
    textInput.addEventListener('input', (e) => {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            colorPicker.value = color;
            updateSetting(settingPath, color);
        }
    });
}

function updateSetting(path, value) {
    const parts = path.split('.');
    let obj = currentSettings;
    for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    saveSettings();
    applySettingsToOverlay(currentSettings);
}

// Range inputs
function setupRangeInput(range, valueDisplay, settingPath) {
    range.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        valueDisplay.textContent = value + (settingPath.includes('Size') || settingPath.includes('Spacing') || settingPath.includes('Blur') || settingPath.includes('letter') ? 'px' : '%');
        updateSetting(settingPath, value);
    });
}

// ============================================================================
// Initialize Event Listeners
// ============================================================================

function initializeEventListeners() {
    // Color inputs
    setupColorSync(gfxElements.colorPlayer1, gfxElements.colorPlayer1Text, 'colors.player1');
    setupColorSync(gfxElements.colorPlayer1Score, gfxElements.colorPlayer1ScoreText, 'colors.player1Score');
    setupColorSync(gfxElements.colorPlayer2, gfxElements.colorPlayer2Text, 'colors.player2');
    setupColorSync(gfxElements.colorPlayer2Score, gfxElements.colorPlayer2ScoreText, 'colors.player2Score');
    setupColorSync(gfxElements.colorSeparator, gfxElements.colorSeparatorText, 'colors.separator');
    setupColorSync(gfxElements.colorGameTimer, gfxElements.colorGameTimerText, 'colors.gameTimer');
    setupColorSync(gfxElements.colorGlow, gfxElements.colorGlowText, 'colors.glow');
    
    // Typography
    gfxElements.fontFamily.addEventListener('change', (e) => updateSetting('typography.fontFamily', e.target.value));
    setupRangeInput(gfxElements.fontSizePlayerName, gfxElements.fontSizePlayerNameValue, 'typography.playerNameSize');
    setupRangeInput(gfxElements.fontSizeScore, gfxElements.fontSizeScoreValue, 'typography.scoreSize');
    setupRangeInput(gfxElements.fontSizeGameTimer, gfxElements.fontSizeGameTimerValue, 'typography.gameTimerSize');
    gfxElements.fontWeight.addEventListener('change', (e) => updateSetting('typography.fontWeight', parseInt(e.target.value)));
    
    // Effects
    setupRangeInput(gfxElements.textShadowBlur, gfxElements.textShadowBlurValue, 'effects.textShadowBlur');
    setupRangeInput(gfxElements.textShadowOpacity, gfxElements.textShadowOpacityValue, 'effects.textShadowOpacity');
    setupRangeInput(gfxElements.letterSpacing, gfxElements.letterSpacingValue, 'effects.letterSpacing');
    gfxElements.enableGlow.addEventListener('change', (e) => updateSetting('effects.enableGlow', e.target.checked));
    
    // Layout
    setupRangeInput(gfxElements.spacingScores, gfxElements.spacingScoresValue, 'layout.spacingScores');
    setupRangeInput(gfxElements.spacingInfo, gfxElements.spacingInfoValue, 'layout.spacingInfo');
    setupRangeInput(gfxElements.separatorSize, gfxElements.separatorSizeValue, 'layout.separatorSize');
    
    // Presets
    gfxElements.presetDefault.addEventListener('click', () => applyPreset('default'));
    gfxElements.presetBold.addEventListener('click', () => applyPreset('bold'));
    gfxElements.presetElegant.addEventListener('click', () => applyPreset('elegant'));
    gfxElements.presetMinimal.addEventListener('click', () => applyPreset('minimal'));
    
    // Export/Import
    gfxElements.exportBtn.addEventListener('click', exportSettings);
    gfxElements.importBtn.addEventListener('click', () => gfxElements.importFile.click());
    gfxElements.importFile.addEventListener('change', importSettings);
    
    // Apply & Reset
    gfxElements.applyBtn.addEventListener('click', () => {
        applySettingsToOverlay(currentSettings);
        alert('Settings applied to overlay! Refresh overlay page to see changes.');
    });
    gfxElements.resetBtn.addEventListener('click', () => {
        if (confirm('Reset all changes to default settings?')) {
            currentSettings = JSON.parse(JSON.stringify(defaultSettings));
            applySettingsToUI(currentSettings);
            applySettingsToOverlay(currentSettings);
        }
    });
}

// ============================================================================
// Presets
// ============================================================================

const presets = {
    default: JSON.parse(JSON.stringify(defaultSettings)),
    bold: {
        colors: {
            player1: '#ffff00',
            player1Score: '#ffff00',
            player2: '#00ffff',
            player2Score: '#00ffff',
            separator: '#ffffff',
            gameTimer: '#ffffff',
            glow: '#ffff00'
        },
        typography: {
            fontFamily: "Impact, Charcoal, sans-serif",
            playerNameSize: 56,
            scoreSize: 140,
            gameTimerSize: 48,
            fontWeight: 900
        },
        effects: {
            textShadowBlur: 6,
            textShadowOpacity: 100,
            letterSpacing: 3,
            enableGlow: true
        },
        layout: {
            spacingScores: 50,
            spacingInfo: 35,
            separatorSize: 100
        }
    },
    elegant: {
        colors: {
            player1: '#e8d5b7',
            player1Score: '#ffffff',
            player2: '#d4af37',
            player2Score: '#ffffff',
            separator: '#c9a961',
            gameTimer: '#e8d5b7',
            glow: '#d4af37'
        },
        typography: {
            fontFamily: "Georgia, serif",
            playerNameSize: 42,
            scoreSize: 110,
            gameTimerSize: 36,
            fontWeight: 700
        },
        effects: {
            textShadowBlur: 3,
            textShadowOpacity: 60,
            letterSpacing: 1,
            enableGlow: true
        },
        layout: {
            spacingScores: 35,
            spacingInfo: 25,
            separatorSize: 70
        }
    },
    minimal: {
        colors: {
            player1: '#ffffff',
            player1Score: '#ffffff',
            player2: '#ffffff',
            player2Score: '#ffffff',
            separator: '#cccccc',
            gameTimer: '#ffffff',
            glow: '#ffffff'
        },
        typography: {
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            playerNameSize: 40,
            scoreSize: 100,
            gameTimerSize: 32,
            fontWeight: 600
        },
        effects: {
            textShadowBlur: 2,
            textShadowOpacity: 40,
            letterSpacing: 1,
            enableGlow: false
        },
        layout: {
            spacingScores: 30,
            spacingInfo: 20,
            separatorSize: 60
        }
    }
};

function applyPreset(presetName) {
    if (presets[presetName]) {
        currentSettings = JSON.parse(JSON.stringify(presets[presetName]));
        applySettingsToUI(currentSettings);
        applySettingsToOverlay(currentSettings);
    }
}

// ============================================================================
// Export/Import
// ============================================================================

function exportSettings() {
    const dataStr = JSON.stringify(currentSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gfx-settings.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importSettings(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            currentSettings = imported;
            applySettingsToUI(currentSettings);
            applySettingsToOverlay(currentSettings);
            alert('Settings imported successfully!');
        } catch (error) {
            alert('Failed to import settings: ' + error.message);
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initializeEventListeners();
    
    // Refresh preview after a delay to allow overlay to load
    setTimeout(() => {
        if (gfxElements.preview) {
            applySettingsToOverlay(currentSettings);
        }
    }, 1000);
});
