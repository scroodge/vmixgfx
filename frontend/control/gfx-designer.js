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
        showMatchScores: false,
        matchScoreFormat: 'player1'  // 'player1', 'player2', 'both', 'total'
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
        leftX: 10,   // Percentage 0-100 - Left section X position
        leftY: 50,   // Percentage 0-100 - Left section Y position
        centerX: 50, // Percentage 0-100 - Center section X position
        centerY: 50, // Percentage 0-100 - Center section Y position
        rightX: 90,  // Percentage 0-100 - Right section X position
        rightY: 50,  // Percentage 0-100 - Right section Y position
        scoreX: 50,  // Percentage 0-100 - Legacy support
        scoreY: 50,  // Percentage 0-100 - Legacy support
        infoX: 50,   // Percentage 0-100
        infoY: 80,   // Percentage 0-100
        absolutePositioning: true  // Enabled by default for positioning to work
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
            imageOpacity: 100,
            imagePositionX: 50,  // Percentage 0-100
            imagePositionY: 50   // Percentage 0-100
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
    },
    visibility: {
        showGame: true,
        showTimer: true
    },
    animations: {
        enabled: false,
        type: 'explosion'  // 'explosion', 'bounce', 'rotate', 'particles', 'flip', 'zoom'
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
    posLeftX: document.getElementById('pos-left-x'),
    posLeftXValue: document.getElementById('pos-left-x-value'),
    posLeftY: document.getElementById('pos-left-y'),
    posLeftYValue: document.getElementById('pos-left-y-value'),
    posCenterX: document.getElementById('pos-center-x'),
    posCenterXValue: document.getElementById('pos-center-x-value'),
    posCenterY: document.getElementById('pos-center-y'),
    posCenterYValue: document.getElementById('pos-center-y-value'),
    posRightX: document.getElementById('pos-right-x'),
    posRightXValue: document.getElementById('pos-right-x-value'),
    posRightY: document.getElementById('pos-right-y'),
    posRightYValue: document.getElementById('pos-right-y-value'),
    posScoreX: document.getElementById('pos-score-x'), // Legacy support
    posScoreXValue: document.getElementById('pos-score-x-value'),
    posScoreY: document.getElementById('pos-score-y'),
    posScoreYValue: document.getElementById('pos-score-y-value'),
    posInfoX: document.getElementById('pos-info-x'),
    posInfoXValue: document.getElementById('pos-info-x-value'),
    posInfoY: document.getElementById('pos-info-y'),
    posInfoYValue: document.getElementById('pos-info-y-value'),
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
    bgContainerImagePositionX: document.getElementById('bg-container-image-position-x'),
    bgContainerImagePositionXValue: document.getElementById('bg-container-image-position-x-value'),
    bgContainerImagePositionY: document.getElementById('bg-container-image-position-y'),
    bgContainerImagePositionYValue: document.getElementById('bg-container-image-position-y-value'),
    
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
    matchScoreFormat: document.getElementById('match-score-format'),
    matchScoreFormatControl: document.getElementById('match-score-format-control'),
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
    
    // Background Upload
    backgroundUpload: document.getElementById('background-upload'),
    backgroundUploadBtn: document.getElementById('background-upload-btn'),
    backgroundRemoveBtn: document.getElementById('background-remove-btn'),
    backgroundUploadStatus: document.getElementById('background-upload-status'),
    
    // Animations
    enableScoreAnimations: document.getElementById('enable-score-animations'),
    animationType: document.getElementById('animation-type'),
    animationTypeControl: document.getElementById('animation-type-control')
};

// ============================================================================
// Settings Management
// ============================================================================

async function loadSettings() {
    // Try to load from API first (primary source for vMix compatibility)
    try {
        const matchIdInput = document.getElementById('match-id-input');
        const matchId = matchIdInput ? matchIdInput.value || '1' : '1';
        
        const response = await fetch(`/api/match/${matchId}/gfx-settings`);
        if (response.ok) {
            const apiSettings = await response.json();
            if (apiSettings && Object.keys(apiSettings).length > 0) {
                console.log('Loaded GFX settings from API');
                currentSettings = apiSettings;
                applySettingsToUI(currentSettings);
                applySettingsToOverlay(currentSettings);
                
                // Also sync to localStorage for preview iframe performance (preview mode only)
                localStorage.setItem('gfxSettings', JSON.stringify(currentSettings));
                
                // Load visibility settings if present
                if (currentSettings.visibility) {
                    const showGameDisplay = document.getElementById('show-game-display');
                    const showTimerDisplay = document.getElementById('show-timer-display');
                    if (showGameDisplay && currentSettings.visibility.showGame !== undefined) {
                        showGameDisplay.checked = currentSettings.visibility.showGame !== false;
                        localStorage.setItem('showGameDisplay', showGameDisplay.checked.toString());
                    }
                    if (showTimerDisplay && currentSettings.visibility.showTimer !== undefined) {
                        showTimerDisplay.checked = currentSettings.visibility.showTimer !== false;
                        localStorage.setItem('showTimerDisplay', showTimerDisplay.checked.toString());
                    }
                }
                
                return; // Successfully loaded from API
            }
        }
    } catch (e) {
        console.warn('Failed to load settings from API, trying localStorage:', e);
    }
    
    // Fallback to localStorage (for preview iframe performance)
    const saved = localStorage.getItem('gfxSettings');
    if (saved) {
        try {
            currentSettings = JSON.parse(saved);
            applySettingsToUI(currentSettings);
            applySettingsToOverlay(currentSettings);
            
            // Sync to API in background so vMix overlay can access
            saveSettingsToAPI();
            
            // Also load visibility settings if present
            if (currentSettings.visibility) {
                const showGameDisplay = document.getElementById('show-game-display');
                const showTimerDisplay = document.getElementById('show-timer-display');
                if (showGameDisplay && currentSettings.visibility.showGame !== undefined) {
                    showGameDisplay.checked = currentSettings.visibility.showGame !== false;
                    localStorage.setItem('showGameDisplay', showGameDisplay.checked.toString());
                }
                if (showTimerDisplay && currentSettings.visibility.showTimer !== undefined) {
                    showTimerDisplay.checked = currentSettings.visibility.showTimer !== false;
                    localStorage.setItem('showTimerDisplay', showTimerDisplay.checked.toString());
                }
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
            currentSettings = JSON.parse(JSON.stringify(defaultSettings));
            // Save defaults to API
            saveSettingsToAPI();
        }
    } else {
        applySettingsToUI(defaultSettings);
        applySettingsToOverlay(defaultSettings);
        // Save defaults to API
        saveSettingsToAPI();
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
        
        // Include visibility settings from control panel
        const showGameDisplay = document.getElementById('show-game-display');
        const showTimerDisplay = document.getElementById('show-timer-display');
        
        if (!currentSettings.visibility) {
            currentSettings.visibility = {};
        }
        if (showGameDisplay) {
            currentSettings.visibility.showGame = showGameDisplay.checked;
        }
        if (showTimerDisplay) {
            currentSettings.visibility.showTimer = showTimerDisplay.checked;
        }
        
        // Ensure typography settings are included
        if (!currentSettings.typography) {
            currentSettings.typography = defaultSettings.typography;
            console.warn('⚠️ Typography settings were missing, restored from defaults');
        }
        
        // Ensure layout settings are included
        if (!currentSettings.layout) {
            currentSettings.layout = defaultSettings.layout;
            console.warn('⚠️ Layout settings were missing, restored from defaults');
        }
        
        // Ensure banner settings are included
        if (!currentSettings.banner) {
            currentSettings.banner = defaultSettings.banner;
            console.warn('⚠️ Banner settings were missing, restored from defaults');
        }
        
        // Ensure all other sections exist
        if (!currentSettings.colors) {
            currentSettings.colors = defaultSettings.colors;
        }
        if (!currentSettings.effects) {
            currentSettings.effects = defaultSettings.effects;
        }
        if (!currentSettings.positions) {
            currentSettings.positions = defaultSettings.positions;
        }
        if (!currentSettings.backgrounds) {
            currentSettings.backgrounds = defaultSettings.backgrounds;
        }
        if (!currentSettings.animations) {
            currentSettings.animations = defaultSettings.animations;
        }
        
        const response = await fetch(`/api/match/${matchId}/gfx-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentSettings)
        });
        
        if (response.ok) {
            console.log('✅ GFX settings saved to API', {
                hasTypography: !!currentSettings.typography,
                hasLayout: !!currentSettings.layout,
                hasBanner: !!currentSettings.banner,
                hasColors: !!currentSettings.colors,
                hasEffects: !!currentSettings.effects,
                hasPositions: !!currentSettings.positions,
                hasBackgrounds: !!currentSettings.backgrounds,
                hasAnimations: !!currentSettings.animations,
                bannerKeys: currentSettings.banner ? Object.keys(currentSettings.banner) : []
            });
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
        // Show/hide format control based on checkbox
        if (gfxElements.matchScoreFormatControl) {
            gfxElements.matchScoreFormatControl.style.display = settings.layout.showMatchScores ? 'block' : 'none';
        }
    }
    if (settings.layout.matchScoreFormat) {
        if (gfxElements.matchScoreFormat) {
            gfxElements.matchScoreFormat.value = settings.layout.matchScoreFormat;
        }
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
    
    // Positions - convert from number or string to number for sliders
    if (settings.positions) {
        // Handle leftX
        const leftX = typeof settings.positions.leftX === 'number' ? settings.positions.leftX :
                     (typeof settings.positions.leftX === 'string' && settings.positions.leftX.includes('%') ? 
                      parseInt(settings.positions.leftX.replace('%', '')) : 10);
        if (gfxElements.posLeftX) {
            gfxElements.posLeftX.value = leftX;
            if (gfxElements.posLeftXValue) {
                gfxElements.posLeftXValue.textContent = leftX + '%';
            }
        }
        
        // Handle leftY
        const leftY = typeof settings.positions.leftY === 'number' ? settings.positions.leftY :
                     (typeof settings.positions.leftY === 'string' && settings.positions.leftY.includes('%') ? 
                      parseInt(settings.positions.leftY.replace('%', '')) : 50);
        if (gfxElements.posLeftY) {
            gfxElements.posLeftY.value = leftY;
            if (gfxElements.posLeftYValue) {
                gfxElements.posLeftYValue.textContent = leftY + '%';
            }
        }
        
        // Handle centerX
        const centerX = typeof settings.positions.centerX === 'number' ? settings.positions.centerX :
                       (typeof settings.positions.centerX === 'string' && settings.positions.centerX.includes('%') ? 
                        parseInt(settings.positions.centerX.replace('%', '')) : 50);
        if (gfxElements.posCenterX) {
            gfxElements.posCenterX.value = centerX;
            if (gfxElements.posCenterXValue) {
                gfxElements.posCenterXValue.textContent = centerX + '%';
            }
        }
        
        // Handle centerY
        const centerY = typeof settings.positions.centerY === 'number' ? settings.positions.centerY :
                       (typeof settings.positions.centerY === 'string' && settings.positions.centerY.includes('%') ? 
                        parseInt(settings.positions.centerY.replace('%', '')) : 50);
        if (gfxElements.posCenterY) {
            gfxElements.posCenterY.value = centerY;
            if (gfxElements.posCenterYValue) {
                gfxElements.posCenterYValue.textContent = centerY + '%';
            }
        }
        
        // Handle rightX
        const rightX = typeof settings.positions.rightX === 'number' ? settings.positions.rightX :
                      (typeof settings.positions.rightX === 'string' && settings.positions.rightX.includes('%') ? 
                       parseInt(settings.positions.rightX.replace('%', '')) : 90);
        if (gfxElements.posRightX) {
            gfxElements.posRightX.value = rightX;
            if (gfxElements.posRightXValue) {
                gfxElements.posRightXValue.textContent = rightX + '%';
            }
        }
        
        // Handle rightY
        const rightY = typeof settings.positions.rightY === 'number' ? settings.positions.rightY :
                      (typeof settings.positions.rightY === 'string' && settings.positions.rightY.includes('%') ? 
                       parseInt(settings.positions.rightY.replace('%', '')) : 50);
        if (gfxElements.posRightY) {
            gfxElements.posRightY.value = rightY;
            if (gfxElements.posRightYValue) {
                gfxElements.posRightYValue.textContent = rightY + '%';
            }
        }
        
        // Legacy scoreX/Y support (fallback if new positions not set)
        const scoreX = typeof settings.positions.scoreX === 'number' ? settings.positions.scoreX :
                      (settings.positions.scoreX === 'center' ? 50 : 
                       (settings.positions.scoreX === 'left' ? 0 : 
                        (typeof settings.positions.scoreX === 'string' && settings.positions.scoreX.includes('%') ? 
                         parseInt(settings.positions.scoreX.replace('%', '')) : 50)));
        if (gfxElements.posScoreX) {
            gfxElements.posScoreX.value = scoreX;
            if (gfxElements.posScoreXValue) {
                gfxElements.posScoreXValue.textContent = scoreX + '%';
            }
        }
        
        // Handle scoreY
        const scoreY = typeof settings.positions.scoreY === 'number' ? settings.positions.scoreY :
                      (settings.positions.scoreY === 'center' ? 50 : 
                       (settings.positions.scoreY === 'top' ? 0 : 
                        (settings.positions.scoreY === 'bottom' ? 100 : 
                         (typeof settings.positions.scoreY === 'string' && settings.positions.scoreY.includes('%') ? 
                          parseInt(settings.positions.scoreY.replace('%', '')) : 50))));
        if (gfxElements.posScoreY) {
            gfxElements.posScoreY.value = scoreY;
            if (gfxElements.posScoreYValue) {
                gfxElements.posScoreYValue.textContent = scoreY + '%';
            }
        }
        
        // Handle infoX
        const infoX = typeof settings.positions.infoX === 'number' ? settings.positions.infoX :
                     (settings.positions.infoX === 'center' ? 50 : 
                      (settings.positions.infoX === 'left' ? 0 : 
                       (typeof settings.positions.infoX === 'string' && settings.positions.infoX.includes('%') ? 
                        parseInt(settings.positions.infoX.replace('%', '')) : 50)));
        if (gfxElements.posInfoX) {
            gfxElements.posInfoX.value = infoX;
            if (gfxElements.posInfoXValue) {
                gfxElements.posInfoXValue.textContent = infoX + '%';
            }
        }
        
        // Handle infoY - convert 'auto' to a number or use number
        const infoY = typeof settings.positions.infoY === 'number' ? settings.positions.infoY :
                     (settings.positions.infoY === 'auto' ? 80 : 
                      (settings.positions.infoY === 'top' ? 0 : 
                       (settings.positions.infoY === 'bottom' ? 100 : 
                        (typeof settings.positions.infoY === 'string' && settings.positions.infoY.includes('%') ? 
                         parseInt(settings.positions.infoY.replace('%', '')) : 80))));
        if (gfxElements.posInfoY) {
            gfxElements.posInfoY.value = infoY;
            if (gfxElements.posInfoYValue) {
                gfxElements.posInfoYValue.textContent = infoY + '%';
            }
        }
        
        gfxElements.enableAbsolutePositioning.checked = settings.positions.absolutePositioning !== false; // Default to true
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
        
        // Handle position - convert from percentage or default to 50
        const posX = typeof bg.imagePositionX === 'number' ? bg.imagePositionX : 
                     (bg.imagePositionX === 'center' ? 50 : 
                      (bg.imagePositionX === 'left' ? 0 : 
                       (bg.imagePositionX === 'right' ? 100 : 50)));
        const posY = typeof bg.imagePositionY === 'number' ? bg.imagePositionY : 
                     (bg.imagePositionY === 'center' ? 50 : 
                      (bg.imagePositionY === 'top' ? 0 : 
                       (bg.imagePositionY === 'bottom' ? 100 : 50)));
        
        if (gfxElements.bgContainerImagePositionX) {
            gfxElements.bgContainerImagePositionX.value = posX;
        }
        if (gfxElements.bgContainerImagePositionXValue) {
            gfxElements.bgContainerImagePositionXValue.textContent = posX + '%';
        }
        if (gfxElements.bgContainerImagePositionY) {
            gfxElements.bgContainerImagePositionY.value = posY;
        }
        if (gfxElements.bgContainerImagePositionYValue) {
            gfxElements.bgContainerImagePositionYValue.textContent = posY + '%';
        }
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
    
    // Animations
    if (settings.animations) {
        if (gfxElements.enableScoreAnimations) {
            gfxElements.enableScoreAnimations.checked = settings.animations.enabled || false;
            if (gfxElements.animationTypeControl) {
                gfxElements.animationTypeControl.style.display = settings.animations.enabled ? 'block' : 'none';
            }
        }
        if (gfxElements.animationType) {
            gfxElements.animationType.value = settings.animations.type || 'explosion';
        }
    } else {
        if (gfxElements.enableScoreAnimations) {
            gfxElements.enableScoreAnimations.checked = false;
            if (gfxElements.animationTypeControl) {
                gfxElements.animationTypeControl.style.display = 'none';
            }
        }
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
    
    // Debug: Log position changes specifically
    if (path.includes('imagePosition')) {
        console.log('🔄 Position setting changed:', path, '=', value);
    }
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
        // Ensure we store as number (not string)
        updateSetting(settingPath, value);
        if (settingPath.includes('position')) {
            console.log('💾 Position saved:', settingPath, '=', value, '(type:', typeof value, ')');
        } else if (settingPath.includes('Size')) {
            console.log('📝 Font size saved:', settingPath, '=', value + 'px');
        }
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
        // Show/hide format control
        if (gfxElements.matchScoreFormatControl) {
            gfxElements.matchScoreFormatControl.style.display = e.target.checked ? 'block' : 'none';
        }
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    
    // Match Score Format
    if (gfxElements.matchScoreFormat) {
        gfxElements.matchScoreFormat.addEventListener('change', (e) => {
            if (!currentSettings.layout) currentSettings.layout = {};
            currentSettings.layout.matchScoreFormat = e.target.value;
            saveSettings();
            applySettingsToOverlay(currentSettings);
        });
    }
    
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
    
    // Positions - Individual section controls
    if (gfxElements.posLeftX && gfxElements.posLeftXValue) {
        setupRangeInput(gfxElements.posLeftX, gfxElements.posLeftXValue, 'positions.leftX', '%');
    }
    if (gfxElements.posLeftY && gfxElements.posLeftYValue) {
        setupRangeInput(gfxElements.posLeftY, gfxElements.posLeftYValue, 'positions.leftY', '%');
    }
    if (gfxElements.posCenterX && gfxElements.posCenterXValue) {
        setupRangeInput(gfxElements.posCenterX, gfxElements.posCenterXValue, 'positions.centerX', '%');
    }
    if (gfxElements.posCenterY && gfxElements.posCenterYValue) {
        setupRangeInput(gfxElements.posCenterY, gfxElements.posCenterYValue, 'positions.centerY', '%');
    }
    if (gfxElements.posRightX && gfxElements.posRightXValue) {
        setupRangeInput(gfxElements.posRightX, gfxElements.posRightXValue, 'positions.rightX', '%');
    }
    if (gfxElements.posRightY && gfxElements.posRightYValue) {
        setupRangeInput(gfxElements.posRightY, gfxElements.posRightYValue, 'positions.rightY', '%');
    }
    
    // Legacy position controls (kept for backward compatibility)
    if (gfxElements.posScoreX && gfxElements.posScoreXValue) {
        setupRangeInput(gfxElements.posScoreX, gfxElements.posScoreXValue, 'positions.scoreX', '%');
    }
    if (gfxElements.posScoreY && gfxElements.posScoreYValue) {
        setupRangeInput(gfxElements.posScoreY, gfxElements.posScoreYValue, 'positions.scoreY', '%');
    }
    if (gfxElements.posInfoX && gfxElements.posInfoXValue) {
        setupRangeInput(gfxElements.posInfoX, gfxElements.posInfoXValue, 'positions.infoX', '%');
    }
    if (gfxElements.posInfoY && gfxElements.posInfoYValue) {
        setupRangeInput(gfxElements.posInfoY, gfxElements.posInfoYValue, 'positions.infoY', '%');
    }
    gfxElements.enableAbsolutePositioning.addEventListener('change', (e) => {
        if (!currentSettings.positions) currentSettings.positions = {};
        currentSettings.positions.absolutePositioning = e.target.checked;
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    
    // Edit Text Areas button
    const editTextAreasBtn = document.getElementById('edit-text-areas-btn');
    if (editTextAreasBtn) {
        editTextAreasBtn.addEventListener('click', () => {
            const matchIdInput = document.getElementById('match-id-input');
            const matchId = matchIdInput ? matchIdInput.value || '1' : '1';
            // Open overlay in edit mode in a new window
            const overlayUrl = `/overlay?matchId=${matchId}&editMode=true`;
            window.open(overlayUrl, '_blank', 'width=1920,height=1080');
        });
    }
    
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
    if (gfxElements.bgContainerImagePositionX && gfxElements.bgContainerImagePositionXValue) {
        setupRangeInput(gfxElements.bgContainerImagePositionX, gfxElements.bgContainerImagePositionXValue, 'backgrounds.container.imagePositionX', '%');
    }
    if (gfxElements.bgContainerImagePositionY && gfxElements.bgContainerImagePositionYValue) {
        setupRangeInput(gfxElements.bgContainerImagePositionY, gfxElements.bgContainerImagePositionYValue, 'backgrounds.container.imagePositionY', '%');
    }
    
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
    
    // Background Upload
    gfxElements.backgroundUploadBtn.addEventListener('click', async () => {
        const file = gfxElements.backgroundUpload.files[0];
        if (!file) {
            gfxElements.backgroundUploadStatus.textContent = 'Please select a file first';
            gfxElements.backgroundUploadStatus.style.color = '#ff4444';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            gfxElements.backgroundUploadStatus.textContent = 'Please select an image file';
            gfxElements.backgroundUploadStatus.style.color = '#ff4444';
            return;
        }
        
        gfxElements.backgroundUploadStatus.textContent = 'Uploading...';
        gfxElements.backgroundUploadStatus.style.color = '#666';
        gfxElements.backgroundUploadBtn.disabled = true;
        
        try {
            const matchIdInput = document.getElementById('match-id-input');
            const matchId = matchIdInput ? matchIdInput.value || '1' : '1';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`/api/match/${matchId}/background-upload`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                // Use the settings returned from API (they include the uploaded background)
                const uploadedSettings = data.settings || currentSettings;
                
                // Update current settings with uploaded background
                if (!uploadedSettings.backgrounds) uploadedSettings.backgrounds = {};
                if (!uploadedSettings.backgrounds.container) uploadedSettings.backgrounds.container = {};
                uploadedSettings.backgrounds.container.type = 'image';
                uploadedSettings.backgrounds.container.imageUrl = uploadedSettings.backgrounds.container.imageUrl || data.settings.backgrounds.container.imageUrl;
                uploadedSettings.backgrounds.container.imageSize = uploadedSettings.backgrounds.container.imageSize || 'cover';
                uploadedSettings.backgrounds.container.imageOpacity = uploadedSettings.backgrounds.container.imageOpacity || 100;
                uploadedSettings.backgrounds.container.imagePositionX = uploadedSettings.backgrounds.container.imagePositionX || 50;
                uploadedSettings.backgrounds.container.imagePositionY = uploadedSettings.backgrounds.container.imagePositionY || 50;
                
                // Merge with current settings to preserve other settings
                currentSettings = { ...currentSettings, ...uploadedSettings };
                if (!currentSettings.backgrounds) currentSettings.backgrounds = {};
                if (!currentSettings.backgrounds.container) currentSettings.backgrounds.container = {};
                currentSettings.backgrounds.container = { ...currentSettings.backgrounds.container, ...uploadedSettings.backgrounds.container };
                
                // Update UI
                if (gfxElements.bgContainerType) {
                    gfxElements.bgContainerType.value = 'image';
                    updateBackgroundControls('container', 'image');
                }
                if (gfxElements.bgContainerImageUrl) {
                    gfxElements.bgContainerImageUrl.value = currentSettings.backgrounds.container.imageUrl;
                }
                // Convert position to number if needed
                const posX = typeof currentSettings.backgrounds.container.imagePositionX === 'number' ? 
                             currentSettings.backgrounds.container.imagePositionX : 50;
                const posY = typeof currentSettings.backgrounds.container.imagePositionY === 'number' ? 
                             currentSettings.backgrounds.container.imagePositionY : 50;
                             
                if (gfxElements.bgContainerImagePositionX) {
                    gfxElements.bgContainerImagePositionX.value = posX;
                }
                if (gfxElements.bgContainerImagePositionXValue) {
                    gfxElements.bgContainerImagePositionXValue.textContent = posX + '%';
                }
                if (gfxElements.bgContainerImagePositionY) {
                    gfxElements.bgContainerImagePositionY.value = posY;
                }
                if (gfxElements.bgContainerImagePositionYValue) {
                    gfxElements.bgContainerImagePositionYValue.textContent = posY + '%';
                }
                
                // Save merged settings
                saveSettings();
                applySettingsToOverlay(currentSettings);
                
                // Force update preview with full settings including background
                // Send settings immediately via postMessage
                console.log('📤 Sending background settings to preview iframe:', currentSettings.backgrounds?.container);
                updatePreview(currentSettings);
                
                // Also trigger reload from API after a delay to ensure settings are saved
                setTimeout(() => {
                    if (gfxElements.preview && gfxElements.preview.contentWindow) {
                        try {
                            // Send message to force reload from API
                            gfxElements.preview.contentWindow.postMessage({
                                type: 'reloadGFXSettings',
                                matchId: matchId
                            }, '*');
                        } catch (e) {
                            console.error('Failed to send reload message to preview:', e);
                        }
                    }
                }, 500);
                
                gfxElements.backgroundUploadStatus.textContent = 'Background uploaded successfully!';
                gfxElements.backgroundUploadStatus.style.color = '#44ff44';
            } else {
                const error = await response.json();
                gfxElements.backgroundUploadStatus.textContent = 'Upload failed: ' + (error.detail || 'Unknown error');
                gfxElements.backgroundUploadStatus.style.color = '#ff4444';
            }
        } catch (error) {
            console.error('Upload error:', error);
            gfxElements.backgroundUploadStatus.textContent = 'Upload failed: ' + error.message;
            gfxElements.backgroundUploadStatus.style.color = '#ff4444';
        } finally {
            gfxElements.backgroundUploadBtn.disabled = false;
        }
    });
    
    // Remove Background
    gfxElements.backgroundRemoveBtn.addEventListener('click', () => {
        if (confirm('Remove background image?')) {
            if (!currentSettings.backgrounds) currentSettings.backgrounds = {};
            if (!currentSettings.backgrounds.container) currentSettings.backgrounds.container = {};
            currentSettings.backgrounds.container.type = 'transparent';
            currentSettings.backgrounds.container.imageUrl = '';
            
            if (gfxElements.bgContainerType) {
                gfxElements.bgContainerType.value = 'transparent';
                updateBackgroundControls('container', 'transparent');
            }
            
            saveSettings();
            applySettingsToOverlay(currentSettings);
            updatePreview(currentSettings);
            
            gfxElements.backgroundUploadStatus.textContent = 'Background removed';
            gfxElements.backgroundUploadStatus.style.color = '#666';
        }
    });
    
    // Animations
    gfxElements.enableScoreAnimations.addEventListener('change', (e) => {
        if (!currentSettings.animations) currentSettings.animations = {};
        currentSettings.animations.enabled = e.target.checked;
        if (gfxElements.animationTypeControl) {
            gfxElements.animationTypeControl.style.display = e.target.checked ? 'block' : 'none';
        }
        saveSettings();
        applySettingsToOverlay(currentSettings);
    });
    
    gfxElements.animationType.addEventListener('change', (e) => {
        if (!currentSettings.animations) currentSettings.animations = {};
        currentSettings.animations.type = e.target.value;
        saveSettings();
        applySettingsToOverlay(currentSettings);
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
// Preview Auto-Scaling
// ============================================================================

/**
 * Calculate preview scale to fit container while maintaining aspect ratio
 */
function calculatePreviewScale() {
    const container = document.querySelector('.gfx-preview-container');
    const iframe = document.getElementById('gfx-preview');
    
    if (!container || !iframe) return 1;
    
    const containerWidth = container.clientWidth - 30; // Account for padding
    const containerHeight = container.clientHeight - 50; // Account for padding and label
    const contentWidth = 1920; // Standard overlay width
    const contentHeight = 1080; // Standard overlay height
    
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    return scale;
}

/**
 * Update preview scale
 */
function updatePreviewScale() {
    const iframe = document.getElementById('gfx-preview');
    if (!iframe) return;
    
    const scale = calculatePreviewScale();
    iframe.style.transform = `scale(${scale})`;
    
    // Adjust container height to fit scaled content
    const container = document.querySelector('.gfx-preview-container');
    if (container) {
        const scaledHeight = 1080 * scale;
        const minHeight = Math.min(scaledHeight + 50, 600); // Max 600px including padding/label
        container.style.minHeight = minHeight + 'px';
        container.style.height = 'auto';
    }
}

// Make function globally available for use in app.js
window.updatePreviewScale = updatePreviewScale;

/**
 * Initialize preview auto-scaling
 */
function initializePreviewAutoScale() {
    const iframe = document.getElementById('gfx-preview');
    if (!iframe) return;
    
    // Update scale on iframe load
    iframe.addEventListener('load', () => {
        updatePreviewScale();
    });
    
    // Update scale on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updatePreviewScale();
        }, 250); // Debounce resize events
    });
    
    // Initial scale calculation
    setTimeout(() => {
        updatePreviewScale();
    }, 500);
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    initializeEventListeners();
    
    // Initialize preview auto-scaling
    initializePreviewAutoScale();
    
    // Refresh preview after a delay to allow overlay to load
    setTimeout(() => {
        if (gfxElements.preview) {
            applySettingsToOverlay(currentSettings);
            updatePreview(currentSettings);
            updatePreviewScale(); // Ensure scale is applied after preview loads
        }
    }, 1000);
});
