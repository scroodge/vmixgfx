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
        separatorSize: 80,
        style: 'vertical',  // 'vertical' or 'banner'
        showMatchScores: false
    },
    banner: {
        borderRadius: 12,
        height: 80,
        padding: 20,
        centerWidth: 200,
        leftColor: '#2d5016',
        centerColor: '#ffffff',
        rightColor: '#2d5016',
        nameSize: 24,
        scoreSize: 48,
        nameColor: '#ffffff',
        scoreColor: '#000000',
        matchScoreColor: '#666666'
    },
    positions: {
        scoreX: 'center',
        scoreY: 'center',
        infoX: 'center',
        infoY: 'auto',
        absolutePositioning: false
    },
    backgrounds: {
        container: {
            type: 'transparent',
            solidColor: '#000000',
            solidOpacity: 100,
            gradientType: 'linear',
            gradientColor1: '#000000',
            gradientColor2: '#333333',
            gradientAngle: 180,
            imageUrl: '',
            imageSize: 'cover',
            imageOpacity: 100
        },
        score: {
            type: 'none',
            solidColor: '#000000',
            solidOpacity: 50,
            padding: 20,
            borderRadius: 10,
            gradientColor1: '#000000',
            gradientColor2: '#333333'
        },
        info: {
            type: 'none',
            solidColor: '#000000',
            solidOpacity: 50,
            padding: 15,
            borderRadius: 10,
            gradientColor1: '#000000',
            gradientColor2: '#333333'
        }
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
    
    // Positions
    posScoreX: document.getElementById('pos-score-x'),
    posScoreY: document.getElementById('pos-score-y'),
    posInfoX: document.getElementById('pos-info-x'),
    posInfoY: document.getElementById('pos-info-y'),
    enableAbsolutePositioning: document.getElementById('enable-absolute-positioning'),
    
    // Backgrounds - Container
    bgContainerType: document.getElementById('bg-container-type'),
    bgContainerSolid: document.getElementById('bg-container-solid'),
    bgContainerColor: document.getElementById('bg-container-color'),
    bgContainerColorText: document.getElementById('bg-container-color-text'),
    bgContainerOpacity: document.getElementById('bg-container-opacity'),
    bgContainerOpacityValue: document.getElementById('bg-container-opacity-value'),
    bgContainerGradient: document.getElementById('bg-container-gradient'),
    bgContainerGradientType: document.getElementById('bg-container-gradient-type'),
    bgContainerGradientColor1: document.getElementById('bg-container-gradient-color1'),
    bgContainerGradientColor1Text: document.getElementById('bg-container-gradient-color1-text'),
    bgContainerGradientColor2: document.getElementById('bg-container-gradient-color2'),
    bgContainerGradientColor2Text: document.getElementById('bg-container-gradient-color2-text'),
    bgContainerGradientAngle: document.getElementById('bg-container-gradient-angle'),
    bgContainerGradientAngleValue: document.getElementById('bg-container-gradient-angle-value'),
    bgContainerImage: document.getElementById('bg-container-image'),
    bgContainerImageUrl: document.getElementById('bg-container-image-url'),
    bgContainerImageSize: document.getElementById('bg-container-image-size'),
    bgContainerImageOpacity: document.getElementById('bg-container-image-opacity'),
    bgContainerImageOpacityValue: document.getElementById('bg-container-image-opacity-value'),
    
    // Backgrounds - Score
    bgScoreType: document.getElementById('bg-score-type'),
    bgScoreSolid: document.getElementById('bg-score-solid'),
    bgScoreColor: document.getElementById('bg-score-color'),
    bgScoreColorText: document.getElementById('bg-score-color-text'),
    bgScoreOpacity: document.getElementById('bg-score-opacity'),
    bgScoreOpacityValue: document.getElementById('bg-score-opacity-value'),
    bgScorePadding: document.getElementById('bg-score-padding'),
    bgScorePaddingValue: document.getElementById('bg-score-padding-value'),
    bgScoreRadius: document.getElementById('bg-score-radius'),
    bgScoreRadiusValue: document.getElementById('bg-score-radius-value'),
    bgScoreGradient: document.getElementById('bg-score-gradient'),
    bgScoreGradientColor1: document.getElementById('bg-score-gradient-color1'),
    bgScoreGradientColor1Text: document.getElementById('bg-score-gradient-color1-text'),
    bgScoreGradientColor2: document.getElementById('bg-score-gradient-color2'),
    bgScoreGradientColor2Text: document.getElementById('bg-score-gradient-color2-text'),
    
    // Backgrounds - Info
    bgInfoType: document.getElementById('bg-info-type'),
    bgInfoSolid: document.getElementById('bg-info-solid'),
    bgInfoColor: document.getElementById('bg-info-color'),
    bgInfoColorText: document.getElementById('bg-info-color-text'),
    bgInfoOpacity: document.getElementById('bg-info-opacity'),
    bgInfoOpacityValue: document.getElementById('bg-info-opacity-value'),
    bgInfoPadding: document.getElementById('bg-info-padding'),
    bgInfoPaddingValue: document.getElementById('bg-info-padding-value'),
    bgInfoRadius: document.getElementById('bg-info-radius'),
    bgInfoRadiusValue: document.getElementById('bg-info-radius-value'),
    bgInfoGradient: document.getElementById('bg-info-gradient'),
    bgInfoGradientColor1: document.getElementById('bg-info-gradient-color1'),
    bgInfoGradientColor1Text: document.getElementById('bg-info-gradient-color1-text'),
    bgInfoGradientColor2: document.getElementById('bg-info-gradient-color2'),
    bgInfoGradientColor2Text: document.getElementById('bg-info-gradient-color2-text'),
    
    // Layout Style
    layoutStyle: document.getElementById('layout-style'),
    showMatchScores: document.getElementById('show-match-scores'),
    bannerStyleSection: document.getElementById('banner-style-section'),
    
    // Banner Style
    bannerBorderRadius: document.getElementById('banner-border-radius'),
    bannerBorderRadiusValue: document.getElementById('banner-border-radius-value'),
    bannerHeight: document.getElementById('banner-height'),
    bannerHeightValue: document.getElementById('banner-height-value'),
    bannerPadding: document.getElementById('banner-padding'),
    bannerPaddingValue: document.getElementById('banner-padding-value'),
    bannerCenterWidth: document.getElementById('banner-center-width'),
    bannerCenterWidthValue: document.getElementById('banner-center-width-value'),
    bannerLeftColor: document.getElementById('banner-left-color'),
    bannerLeftColorText: document.getElementById('banner-left-color-text'),
    bannerCenterColor: document.getElementById('banner-center-color'),
    bannerCenterColorText: document.getElementById('banner-center-color-text'),
    bannerRightColor: document.getElementById('banner-right-color'),
    bannerRightColorText: document.getElementById('banner-right-color-text'),
    bannerNameSize: document.getElementById('banner-name-size'),
    bannerNameSizeValue: document.getElementById('banner-name-size-value'),
    bannerScoreSize: document.getElementById('banner-score-size'),
    bannerScoreSizeValue: document.getElementById('banner-score-size-value'),
    bannerNameColor: document.getElementById('banner-name-color'),
    bannerNameColorText: document.getElementById('banner-name-color-text'),
    bannerScoreColor: document.getElementById('banner-score-color'),
    bannerScoreColorText: document.getElementById('banner-score-color-text'),
    bannerMatchScoreColor: document.getElementById('banner-match-score-color'),
    bannerMatchScoreColorText: document.getElementById('banner-match-score-color-text'),
    
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
    preview: document.getElementById('gfx-preview'),
    previewSide: document.getElementById('preview-side'),
    previewToggle: document.getElementById('preview-toggle'),
    previewToggleIcon: document.getElementById('preview-toggle-icon'),
    previewRefresh: document.getElementById('preview-refresh'),
    previewPosition: document.getElementById('preview-position')
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
    // Save to API so vMix overlay can access settings
    saveSettingsToAPI();
}

// Save settings to API so vMix overlay can access them
async function saveSettingsToAPI() {
    try {
        // Get match ID from control panel (default to '1')
        const matchIdInput = document.getElementById('match-id-input');
        const matchId = matchIdInput ? matchIdInput.value || '1' : '1';
        
        const response = await fetch(`/api/match/${matchId}/gfx-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentSettings)
        });
        
        if (response.ok) {
            console.log('GFX settings saved to API');
        } else {
            console.error('Failed to save GFX settings to API');
        }
    } catch (e) {
        console.error('Error saving GFX settings to API:', e);
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
    
    // Layout Style
    if (settings.layout.style) {
        gfxElements.layoutStyle.value = settings.layout.style;
        gfxElements.bannerStyleSection.style.display = settings.layout.style === 'banner' ? 'block' : 'none';
    }
    if (settings.layout.showMatchScores !== undefined) {
        gfxElements.showMatchScores.checked = settings.layout.showMatchScores;
    }
    
    // Banner Style
    if (settings.banner) {
        gfxElements.bannerBorderRadius.value = settings.banner.borderRadius || 12;
        gfxElements.bannerBorderRadiusValue.textContent = (settings.banner.borderRadius || 12) + 'px';
        gfxElements.bannerHeight.value = settings.banner.height || 80;
        gfxElements.bannerHeightValue.textContent = (settings.banner.height || 80) + 'px';
        gfxElements.bannerPadding.value = settings.banner.padding || 20;
        gfxElements.bannerPaddingValue.textContent = (settings.banner.padding || 20) + 'px';
        gfxElements.bannerCenterWidth.value = settings.banner.centerWidth || 200;
        gfxElements.bannerCenterWidthValue.textContent = (settings.banner.centerWidth || 200) + 'px';
        gfxElements.bannerLeftColor.value = settings.banner.leftColor || '#2d5016';
        gfxElements.bannerLeftColorText.value = settings.banner.leftColor || '#2d5016';
        gfxElements.bannerCenterColor.value = settings.banner.centerColor || '#ffffff';
        gfxElements.bannerCenterColorText.value = settings.banner.centerColor || '#ffffff';
        gfxElements.bannerRightColor.value = settings.banner.rightColor || '#2d5016';
        gfxElements.bannerRightColorText.value = settings.banner.rightColor || '#2d5016';
        gfxElements.bannerNameSize.value = settings.banner.nameSize || 24;
        gfxElements.bannerNameSizeValue.textContent = (settings.banner.nameSize || 24) + 'px';
        gfxElements.bannerScoreSize.value = settings.banner.scoreSize || 48;
        gfxElements.bannerScoreSizeValue.textContent = (settings.banner.scoreSize || 48) + 'px';
        gfxElements.bannerNameColor.value = settings.banner.nameColor || '#ffffff';
        gfxElements.bannerNameColorText.value = settings.banner.nameColor || '#ffffff';
        gfxElements.bannerScoreColor.value = settings.banner.scoreColor || '#000000';
        gfxElements.bannerScoreColorText.value = settings.banner.scoreColor || '#000000';
        gfxElements.bannerMatchScoreColor.value = settings.banner.matchScoreColor || '#666666';
        gfxElements.bannerMatchScoreColorText.value = settings.banner.matchScoreColor || '#666666';
    }
    
    // Positions
    if (settings.positions) {
        gfxElements.posScoreX.value = settings.positions.scoreX || 'center';
        gfxElements.posScoreY.value = settings.positions.scoreY || 'center';
        gfxElements.posInfoX.value = settings.positions.infoX || 'center';
        gfxElements.posInfoY.value = settings.positions.infoY || 'auto';
        gfxElements.enableAbsolutePositioning.checked = settings.positions.absolutePositioning || false;
    }
    
    // Backgrounds - Container
    if (settings.backgrounds && settings.backgrounds.container) {
        const bg = settings.backgrounds.container;
        gfxElements.bgContainerType.value = bg.type || 'transparent';
        updateBackgroundControls('container', bg.type);
        gfxElements.bgContainerColor.value = bg.solidColor || '#000000';
        gfxElements.bgContainerColorText.value = bg.solidColor || '#000000';
        gfxElements.bgContainerOpacity.value = bg.solidOpacity || 100;
        gfxElements.bgContainerOpacityValue.textContent = (bg.solidOpacity || 100) + '%';
        gfxElements.bgContainerGradientType.value = bg.gradientType || 'linear';
        gfxElements.bgContainerGradientColor1.value = bg.gradientColor1 || '#000000';
        gfxElements.bgContainerGradientColor1Text.value = bg.gradientColor1 || '#000000';
        gfxElements.bgContainerGradientColor2.value = bg.gradientColor2 || '#333333';
        gfxElements.bgContainerGradientColor2Text.value = bg.gradientColor2 || '#333333';
        gfxElements.bgContainerGradientAngle.value = bg.gradientAngle || 180;
        gfxElements.bgContainerGradientAngleValue.textContent = (bg.gradientAngle || 180) + '°';
        gfxElements.bgContainerImageUrl.value = bg.imageUrl || '';
        gfxElements.bgContainerImageSize.value = bg.imageSize || 'cover';
        gfxElements.bgContainerImageOpacity.value = bg.imageOpacity || 100;
        gfxElements.bgContainerImageOpacityValue.textContent = (bg.imageOpacity || 100) + '%';
    }
    
    // Backgrounds - Score
    if (settings.backgrounds && settings.backgrounds.score) {
        const bg = settings.backgrounds.score;
        gfxElements.bgScoreType.value = bg.type || 'none';
        updateBackgroundControls('score', bg.type);
        gfxElements.bgScoreColor.value = bg.solidColor || '#000000';
        gfxElements.bgScoreColorText.value = bg.solidColor || '#000000';
        gfxElements.bgScoreOpacity.value = bg.solidOpacity || 50;
        gfxElements.bgScoreOpacityValue.textContent = (bg.solidOpacity || 50) + '%';
        gfxElements.bgScorePadding.value = bg.padding || 20;
        gfxElements.bgScorePaddingValue.textContent = (bg.padding || 20) + 'px';
        gfxElements.bgScoreRadius.value = bg.borderRadius || 10;
        gfxElements.bgScoreRadiusValue.textContent = (bg.borderRadius || 10) + 'px';
        gfxElements.bgScoreGradientColor1.value = bg.gradientColor1 || '#000000';
        gfxElements.bgScoreGradientColor1Text.value = bg.gradientColor1 || '#000000';
        gfxElements.bgScoreGradientColor2.value = bg.gradientColor2 || '#333333';
        gfxElements.bgScoreGradientColor2Text.value = bg.gradientColor2 || '#333333';
    }
    
    // Backgrounds - Info
    if (settings.backgrounds && settings.backgrounds.info) {
        const bg = settings.backgrounds.info;
        gfxElements.bgInfoType.value = bg.type || 'none';
        updateBackgroundControls('info', bg.type);
        gfxElements.bgInfoColor.value = bg.solidColor || '#000000';
        gfxElements.bgInfoColorText.value = bg.solidColor || '#000000';
        gfxElements.bgInfoOpacity.value = bg.solidOpacity || 50;
        gfxElements.bgInfoOpacityValue.textContent = (bg.solidOpacity || 50) + '%';
        gfxElements.bgInfoPadding.value = bg.padding || 15;
        gfxElements.bgInfoPaddingValue.textContent = (bg.padding || 15) + 'px';
        gfxElements.bgInfoRadius.value = bg.borderRadius || 10;
        gfxElements.bgInfoRadiusValue.textContent = (bg.borderRadius || 10) + 'px';
        gfxElements.bgInfoGradientColor1.value = bg.gradientColor1 || '#000000';
        gfxElements.bgInfoGradientColor1Text.value = bg.gradientColor1 || '#000000';
        gfxElements.bgInfoGradientColor2.value = bg.gradientColor2 || '#333333';
        gfxElements.bgInfoGradientColor2Text.value = bg.gradientColor2 || '#333333';
    }
}

// Show/hide background controls based on type
function updateBackgroundControls(section, type) {
    if (section === 'container') {
        gfxElements.bgContainerSolid.style.display = type === 'solid' ? 'block' : 'none';
        gfxElements.bgContainerGradient.style.display = type === 'gradient' ? 'block' : 'none';
        gfxElements.bgContainerImage.style.display = type === 'image' ? 'block' : 'none';
    } else if (section === 'score') {
        gfxElements.bgScoreSolid.style.display = type === 'solid' ? 'block' : 'none';
        gfxElements.bgScoreGradient.style.display = type === 'gradient' ? 'block' : 'none';
    } else if (section === 'info') {
        gfxElements.bgInfoSolid.style.display = type === 'solid' ? 'block' : 'none';
        gfxElements.bgInfoGradient.style.display = type === 'gradient' ? 'block' : 'none';
    }
}

function applySettingsToOverlay(settings) {
    // Store settings in localStorage for overlay to read
    localStorage.setItem('gfxSettings', JSON.stringify(settings));
    
    // Store layout style separately for easy access
    if (settings.layout && settings.layout.style) {
        localStorage.setItem('gfxLayoutStyle', settings.layout.style);
    }
    if (settings.layout && settings.layout.showMatchScores !== undefined) {
        localStorage.setItem('gfxShowMatchScores', settings.layout.showMatchScores.toString());
    }
    
    // Send message to preview iframe for real-time updates
    updatePreview(settings);
    
    // Update main overlay windows (all tabs with overlay)
    window.dispatchEvent(new CustomEvent('gfxSettingsChanged', { detail: settings }));
}

// Update preview iframe with settings (debounced for performance)
let previewUpdateTimeout = null;
function updatePreview(settings) {
    if (!gfxElements.preview) {
        return;
    }
    
    // Don't update if preview is collapsed
    if (gfxElements.previewSide && gfxElements.previewSide.classList.contains('collapsed')) {
        return;
    }
    
    clearTimeout(previewUpdateTimeout);
    previewUpdateTimeout = setTimeout(() => {
        if (gfxElements.preview && gfxElements.preview.contentWindow) {
            try {
                // Send settings via postMessage for immediate update
                gfxElements.preview.contentWindow.postMessage({
                    type: 'gfxSettings',
                    settings: settings
                }, '*');
                
                // Also update localStorage in case postMessage doesn't work
                localStorage.setItem('gfxSettings', JSON.stringify(settings));
                
                // Force iframe to check for settings update
                if (gfxElements.preview.contentDocument) {
                    gfxElements.preview.contentWindow.dispatchEvent(new Event('storage'));
                }
            } catch (e) {
                // Cross-origin or iframe not ready - settings will apply via localStorage on next interaction
                console.log('Preview will update via localStorage');
            }
        }
    }, 100); // Debounce updates by 100ms for responsive feel
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
        if (!obj[parts[i]]) {
            obj[parts[i]] = {};
        }
        obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    saveSettings();
    applySettingsToOverlay(currentSettings);
}

// Range inputs
function setupRangeInput(range, valueDisplay, settingPath, suffix = null) {
    range.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (suffix) {
            valueDisplay.textContent = value + suffix;
        } else {
            valueDisplay.textContent = value + (settingPath.includes('Size') || settingPath.includes('Spacing') || settingPath.includes('Blur') || settingPath.includes('letter') || settingPath.includes('padding') || settingPath.includes('radius') ? 'px' : '%');
        }
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
    
    // Layout Style
    gfxElements.layoutStyle.addEventListener('change', (e) => {
        if (!currentSettings.layout) currentSettings.layout = {};
        currentSettings.layout.style = e.target.value;
        gfxElements.bannerStyleSection.style.display = e.target.value === 'banner' ? 'block' : 'none';
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    gfxElements.showMatchScores.addEventListener('change', (e) => {
        if (!currentSettings.layout) currentSettings.layout = {};
        currentSettings.layout.showMatchScores = e.target.checked;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    
    // Banner Style
    setupRangeInput(gfxElements.bannerBorderRadius, gfxElements.bannerBorderRadiusValue, 'banner.borderRadius');
    setupRangeInput(gfxElements.bannerHeight, gfxElements.bannerHeightValue, 'banner.height');
    setupRangeInput(gfxElements.bannerPadding, gfxElements.bannerPaddingValue, 'banner.padding');
    setupRangeInput(gfxElements.bannerCenterWidth, gfxElements.bannerCenterWidthValue, 'banner.centerWidth');
    setupColorSync(gfxElements.bannerLeftColor, gfxElements.bannerLeftColorText, 'banner.leftColor');
    setupColorSync(gfxElements.bannerCenterColor, gfxElements.bannerCenterColorText, 'banner.centerColor');
    setupColorSync(gfxElements.bannerRightColor, gfxElements.bannerRightColorText, 'banner.rightColor');
    setupRangeInput(gfxElements.bannerNameSize, gfxElements.bannerNameSizeValue, 'banner.nameSize');
    setupRangeInput(gfxElements.bannerScoreSize, gfxElements.bannerScoreSizeValue, 'banner.scoreSize');
    setupColorSync(gfxElements.bannerNameColor, gfxElements.bannerNameColorText, 'banner.nameColor');
    setupColorSync(gfxElements.bannerScoreColor, gfxElements.bannerScoreColorText, 'banner.scoreColor');
    setupColorSync(gfxElements.bannerMatchScoreColor, gfxElements.bannerMatchScoreColorText, 'banner.matchScoreColor');
    
    // Positions
    gfxElements.posScoreX.addEventListener('input', (e) => {
        if (!currentSettings.positions) currentSettings.positions = {};
        currentSettings.positions.scoreX = e.target.value;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    gfxElements.posScoreY.addEventListener('input', (e) => {
        if (!currentSettings.positions) currentSettings.positions = {};
        currentSettings.positions.scoreY = e.target.value;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    gfxElements.posInfoX.addEventListener('input', (e) => {
        if (!currentSettings.positions) currentSettings.positions = {};
        currentSettings.positions.infoX = e.target.value;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    gfxElements.posInfoY.addEventListener('input', (e) => {
        if (!currentSettings.positions) currentSettings.positions = {};
        currentSettings.positions.infoY = e.target.value;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    gfxElements.enableAbsolutePositioning.addEventListener('change', (e) => {
        if (!currentSettings.positions) currentSettings.positions = {};
        currentSettings.positions.absolutePositioning = e.target.checked;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    
    // Backgrounds - Container
    gfxElements.bgContainerType.addEventListener('change', (e) => {
        if (!currentSettings.backgrounds) currentSettings.backgrounds = {};
        if (!currentSettings.backgrounds.container) currentSettings.backgrounds.container = {};
        currentSettings.backgrounds.container.type = e.target.value;
        updateBackgroundControls('container', e.target.value);
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    setupColorSync(gfxElements.bgContainerColor, gfxElements.bgContainerColorText, 'backgrounds.container.solidColor');
    setupRangeInput(gfxElements.bgContainerOpacity, gfxElements.bgContainerOpacityValue, 'backgrounds.container.solidOpacity', '%');
    gfxElements.bgContainerGradientType.addEventListener('change', (e) => updateSetting('backgrounds.container.gradientType', e.target.value));
    setupColorSync(gfxElements.bgContainerGradientColor1, gfxElements.bgContainerGradientColor1Text, 'backgrounds.container.gradientColor1');
    setupColorSync(gfxElements.bgContainerGradientColor2, gfxElements.bgContainerGradientColor2Text, 'backgrounds.container.gradientColor2');
    setupRangeInput(gfxElements.bgContainerGradientAngle, gfxElements.bgContainerGradientAngleValue, 'backgrounds.container.gradientAngle', '°');
    gfxElements.bgContainerImageUrl.addEventListener('input', (e) => updateSetting('backgrounds.container.imageUrl', e.target.value));
    gfxElements.bgContainerImageSize.addEventListener('change', (e) => updateSetting('backgrounds.container.imageSize', e.target.value));
    setupRangeInput(gfxElements.bgContainerImageOpacity, gfxElements.bgContainerImageOpacityValue, 'backgrounds.container.imageOpacity', '%');
    
    // Backgrounds - Score
    gfxElements.bgScoreType.addEventListener('change', (e) => {
        if (!currentSettings.backgrounds) currentSettings.backgrounds = {};
        if (!currentSettings.backgrounds.score) currentSettings.backgrounds.score = {};
        currentSettings.backgrounds.score.type = e.target.value;
        updateBackgroundControls('score', e.target.value);
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    setupColorSync(gfxElements.bgScoreColor, gfxElements.bgScoreColorText, 'backgrounds.score.solidColor');
    setupRangeInput(gfxElements.bgScoreOpacity, gfxElements.bgScoreOpacityValue, 'backgrounds.score.solidOpacity', '%');
    setupRangeInput(gfxElements.bgScorePadding, gfxElements.bgScorePaddingValue, 'backgrounds.score.padding');
    setupRangeInput(gfxElements.bgScoreRadius, gfxElements.bgScoreRadiusValue, 'backgrounds.score.borderRadius');
    setupColorSync(gfxElements.bgScoreGradientColor1, gfxElements.bgScoreGradientColor1Text, 'backgrounds.score.gradientColor1');
    setupColorSync(gfxElements.bgScoreGradientColor2, gfxElements.bgScoreGradientColor2Text, 'backgrounds.score.gradientColor2');
    
    // Backgrounds - Info
    gfxElements.bgInfoType.addEventListener('change', (e) => {
        if (!currentSettings.backgrounds) currentSettings.backgrounds = {};
        if (!currentSettings.backgrounds.info) currentSettings.backgrounds.info = {};
        currentSettings.backgrounds.info.type = e.target.value;
        updateBackgroundControls('info', e.target.value);
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    setupColorSync(gfxElements.bgInfoColor, gfxElements.bgInfoColorText, 'backgrounds.info.solidColor');
    setupRangeInput(gfxElements.bgInfoOpacity, gfxElements.bgInfoOpacityValue, 'backgrounds.info.solidOpacity', '%');
    setupRangeInput(gfxElements.bgInfoPadding, gfxElements.bgInfoPaddingValue, 'backgrounds.info.padding');
    setupRangeInput(gfxElements.bgInfoRadius, gfxElements.bgInfoRadiusValue, 'backgrounds.info.borderRadius');
    setupColorSync(gfxElements.bgInfoGradientColor1, gfxElements.bgInfoGradientColor1Text, 'backgrounds.info.gradientColor1');
    setupColorSync(gfxElements.bgInfoGradientColor2, gfxElements.bgInfoGradientColor2Text, 'backgrounds.info.gradientColor2');
    
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
        updatePreview(currentSettings);
        alert('Settings applied to overlay! Refresh overlay page to see changes.');
    });
    gfxElements.resetBtn.addEventListener('click', () => {
        if (confirm('Reset all changes to default settings?')) {
            currentSettings = JSON.parse(JSON.stringify(defaultSettings));
            applySettingsToUI(currentSettings);
            applySettingsToOverlay(currentSettings);
        }
    });
    
    // Preview panel controls
    if (gfxElements.previewToggle) {
        gfxElements.previewToggle.addEventListener('click', () => {
            if (gfxElements.previewSide) {
                gfxElements.previewSide.classList.toggle('collapsed');
                if (gfxElements.previewSide.classList.contains('collapsed')) {
                    gfxElements.previewToggleIcon.textContent = '▶';
                    gfxElements.previewToggle.title = 'Show Preview';
                } else {
                    gfxElements.previewToggleIcon.textContent = '◀';
                    gfxElements.previewToggle.title = 'Hide Preview';
                    // Update preview when shown
                    setTimeout(() => updatePreview(currentSettings), 100);
                }
            }
        });
    }
    
    if (gfxElements.previewRefresh) {
        gfxElements.previewRefresh.addEventListener('click', () => {
            if (gfxElements.preview) {
                const currentSrc = gfxElements.preview.src;
                gfxElements.preview.src = '';
                setTimeout(() => {
                    gfxElements.preview.src = currentSrc;
                    setTimeout(() => updatePreview(currentSettings), 500);
                }, 100);
            }
        });
    }
    
    if (gfxElements.previewPosition) {
        gfxElements.previewPosition.addEventListener('click', () => {
            if (gfxElements.previewSide) {
                gfxElements.previewSide.classList.toggle('preview-left');
                const isLeft = gfxElements.previewSide.classList.contains('preview-left');
                gfxElements.previewPosition.title = isLeft ? 'Move to Right' : 'Move to Left';
                
                // Update controls side order
                const controlsSide = document.querySelector('.controls-side');
                if (controlsSide) {
                    controlsSide.style.order = isLeft ? '1' : '0';
                }
            }
        });
    }
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
        // Merge preset with default settings to ensure all properties exist
        currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        const preset = presets[presetName];
        
        // Deep merge
        Object.assign(currentSettings.colors, preset.colors || {});
        Object.assign(currentSettings.typography, preset.typography || {});
        Object.assign(currentSettings.effects, preset.effects || {});
        Object.assign(currentSettings.layout, preset.layout || {});
        
        // Positions and backgrounds are preserved from default (or can be customized)
        // User can still customize them after applying preset
        
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
    
    // Handle preview iframe load
    if (gfxElements.preview) {
        gfxElements.preview.addEventListener('load', () => {
            // Hide loading indicator and show preview
            const loadingEl = document.getElementById('preview-loading');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            gfxElements.preview.style.display = 'block';
            gfxElements.preview.classList.add('loaded');
            
            // Apply settings after iframe loads
            setTimeout(() => {
                updatePreview(currentSettings);
            }, 200);
        });
    }
    
    // Refresh preview after a delay to allow overlay to load
    setTimeout(() => {
        if (gfxElements.preview) {
            applySettingsToOverlay(currentSettings);
            updatePreview(currentSettings);
        }
    }, 1000);
});
