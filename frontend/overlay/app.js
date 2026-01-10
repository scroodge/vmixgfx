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
    
    console.log('🎨 Applying GFX Settings - Sections present:', {
        colors: !!settings.colors,
        typography: !!settings.typography,
        layout: !!settings.layout,
        effects: !!settings.effects,
        positions: !!settings.positions,
        backgrounds: !!settings.backgrounds,
        banner: !!settings.banner,
        animations: !!settings.animations
    });
    
    // Log full settings structure for debugging
    if (!settings.typography || !settings.layout) {
        console.warn('⚠️ Missing settings sections:', {
            missingTypography: !settings.typography,
            missingLayout: !settings.layout,
            allKeys: Object.keys(settings)
        });
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
        const playerNameSize = settings.typography.playerNameSize || 48;
        const scoreSize = settings.typography.scoreSize || 120;
        const gameTimerSize = settings.typography.gameTimerSize || 42;
        
        root.style.setProperty('--font-family', settings.typography.fontFamily || 'Arial, sans-serif');
        root.style.setProperty('--font-size-player-name', playerNameSize + 'px');
        root.style.setProperty('--font-size-score', scoreSize + 'px');
        root.style.setProperty('--font-size-game-timer', gameTimerSize + 'px');
        root.style.setProperty('--font-weight', settings.typography.fontWeight || 900);
        
        console.log('📝 Typography applied:', {
            playerNameSize,
            scoreSize,
            gameTimerSize,
            fontWeight: settings.typography.fontWeight || 900
        });
    } else {
        console.warn('⚠️ No typography settings found in:', settings);
    }
    
    // Effects (with fallbacks)
    if (settings.effects) {
        root.style.setProperty('--text-shadow-blur', (settings.effects.textShadowBlur || 4) + 'px');
        root.style.setProperty('--text-shadow-opacity', ((settings.effects.textShadowOpacity || 80) / 100).toFixed(2));
        root.style.setProperty('--letter-spacing', (settings.effects.letterSpacing || 2) + 'px');
    }
    
    // Layout (with fallbacks)
    if (settings.layout) {
        const spacingScores = settings.layout.spacingScores || 40;
        const spacingInfo = settings.layout.spacingInfo || 30;
        const separatorSize = settings.layout.separatorSize || 80;
        
        root.style.setProperty('--spacing-scores', spacingScores + 'px');
        root.style.setProperty('--spacing-info', spacingInfo + 'px');
        root.style.setProperty('--separator-size', separatorSize + 'px');
        
        console.log('📐 Layout & Spacing applied:', {
            spacingScores: spacingScores + 'px',
            spacingInfo: spacingInfo + 'px',
            separatorSize: separatorSize + 'px',
            layoutStyle: settings.layout.style
        });
    } else {
        console.warn('⚠️ No layout settings found in:', settings);
    }
    
    // Positions - apply to both score section and banner
    // Only clear positions if explicitly disabled (absolutePositioning === false)
    // If positions object exists but absolutePositioning is undefined/missing, keep current positions
    if (settings.positions) {
        const absolute = settings.positions.absolutePositioning !== false; // Default to true if undefined
        if (absolute && container) {
            container.classList.add('position-absolute');
            
            // Convert position values - expect numbers (0-100) from API, convert to percentage strings
            // Normalize to ensure we're working with numbers
            const scoreXNum = typeof settings.positions.scoreX === 'number' ? settings.positions.scoreX :
                             (typeof settings.positions.scoreX === 'string' && settings.positions.scoreX.includes('%') ?
                              parseInt(settings.positions.scoreX.replace('%', '')) : 50);
            const scoreYNum = typeof settings.positions.scoreY === 'number' ? settings.positions.scoreY :
                             (typeof settings.positions.scoreY === 'string' && settings.positions.scoreY.includes('%') ?
                              parseInt(settings.positions.scoreY.replace('%', '')) : 50);
            const infoXNum = typeof settings.positions.infoX === 'number' ? settings.positions.infoX :
                            (typeof settings.positions.infoX === 'string' && settings.positions.infoX.includes('%') ?
                             parseInt(settings.positions.infoX.replace('%', '')) : 50);
            const infoYNum = typeof settings.positions.infoY === 'number' ? settings.positions.infoY :
                            (settings.positions.infoY === 'auto' ? 'auto' :
                             (typeof settings.positions.infoY === 'string' && settings.positions.infoY.includes('%') ?
                              parseInt(settings.positions.infoY.replace('%', '')) : 80));
            
            const scoreX = scoreXNum + '%';
            const scoreY = scoreYNum + '%';
            const infoX = infoXNum + '%';
            const infoY = infoYNum === 'auto' ? 'auto' : infoYNum + '%';
            
            console.log('📍 Applying positions:', { 
                scoreX: scoreXNum, scoreY: scoreYNum, 
                infoX: infoXNum, infoY: infoYNum,
                raw: settings.positions 
            });
            
            // Apply individual positioning to horizontal layout elements
            const leftElement = document.getElementById('score-left');
            const centerElement = document.getElementById('score-center');
            const rightElement = document.getElementById('score-right');
            
            // Get individual positions or fallback to general positions
            const leftX = typeof settings.positions.leftX === 'number' ? settings.positions.leftX + '%' :
                         (typeof settings.positions.leftX === 'string' ? settings.positions.leftX : '10%');
            const leftY = typeof settings.positions.leftY === 'number' ? settings.positions.leftY + '%' :
                         (typeof settings.positions.leftY === 'string' ? settings.positions.leftY : scoreY);
            
            const centerX = typeof settings.positions.centerX === 'number' ? settings.positions.centerX + '%' :
                           (typeof settings.positions.centerX === 'string' ? settings.positions.centerX : scoreX);
            const centerY = typeof settings.positions.centerY === 'number' ? settings.positions.centerY + '%' :
                           (typeof settings.positions.centerY === 'string' ? settings.positions.centerY : scoreY);
            
            const rightX = typeof settings.positions.rightX === 'number' ? settings.positions.rightX + '%' :
                          (typeof settings.positions.rightX === 'string' ? settings.positions.rightX : '90%');
            const rightY = typeof settings.positions.rightY === 'number' ? settings.positions.rightY + '%' :
                          (typeof settings.positions.rightY === 'string' ? settings.positions.rightY : scoreY);
            
            if (leftElement) {
                root.style.setProperty('--pos-left-x', leftX);
                root.style.setProperty('--pos-left-y', leftY);
            }
            if (centerElement) {
                root.style.setProperty('--pos-center-x', centerX);
                root.style.setProperty('--pos-center-y', centerY);
            }
            if (rightElement) {
                root.style.setProperty('--pos-right-x', rightX);
                root.style.setProperty('--pos-right-y', rightY);
            }
            
            // Also apply to score section as fallback (vertical layout legacy)
            if (scoreSection) {
                applyPosition(scoreSection, scoreX, scoreY);
            }
            
            // Apply to banner (banner layout) - same positioning
            if (scoreBanner) {
                applyPosition(scoreBanner, scoreX, scoreY);
            }
            
            // Info section positioning
            if (infoSection) {
                applyPosition(infoSection, infoX, infoY);
            }
        } else if (settings.positions.absolutePositioning === false && container) {
            // Only clear if explicitly disabled
            container.classList.remove('position-absolute');
            if (scoreSection) {
                scoreSection.style.left = '';
                scoreSection.style.top = '';
                scoreSection.style.transform = '';
            }
            if (scoreBanner) {
                scoreBanner.style.left = '';
                scoreBanner.style.top = '';
                scoreBanner.style.transform = '';
            }
            if (infoSection) {
                infoSection.style.left = '';
                infoSection.style.top = '';
                infoSection.style.transform = '';
            }
        }
        // If positions object exists but absolutePositioning is undefined, do nothing (preserve current state)
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
                console.log('🖼️ Applying background image:', {
                    imageUrl: bg.imageUrl.substring(0, 50) + '...',
                    imageSize: bg.imageSize,
                    imageOpacity: bg.imageOpacity,
                    imagePositionX: bg.imagePositionX,
                    imagePositionY: bg.imagePositionY
                });
                
                const opacity = (bg.imageOpacity || 100) / 100;
                const size = bg.imageSize || 'cover';
                
                // Handle position - can be number (percentage) or string (keyword)
                let posX = typeof bg.imagePositionX === 'number' ? `${bg.imagePositionX}%` : 
                          (bg.imagePositionX === 'center' ? '50%' : 
                           (bg.imagePositionX === 'left' ? '0%' : 
                            (bg.imagePositionX === 'right' ? '100%' : 
                             (bg.imagePositionX || '50%'))));
                let posY = typeof bg.imagePositionY === 'number' ? `${bg.imagePositionY}%` : 
                          (bg.imagePositionY === 'center' ? '50%' : 
                           (bg.imagePositionY === 'top' ? '0%' : 
                            (bg.imagePositionY === 'bottom' ? '100%' : 
                             (bg.imagePositionY || '50%'))));
                
                // Build background image value with opacity overlay if needed
                const bgImageValue = opacity < 1 
                    ? `linear-gradient(rgba(0,0,0,${1 - opacity}), rgba(0,0,0,${1 - opacity})), url('${bg.imageUrl}')`
                    : `url('${bg.imageUrl}')`;
                
                const bgPosition = `${posX} ${posY}`;
                
                // IMPORTANT: Clear shorthand background FIRST to avoid conflicts with CSS rules
                // The CSS rule .overlay-container { background: var(--bg-container); } can override inline styles
                container.style.background = '';
                
                // Set individual properties explicitly with !important to override CSS variables
                // Order matters - set backgroundImage first
                container.style.setProperty('background-image', bgImageValue, 'important');
                // Then set size - ensure it's not 'auto'
                const finalSize = size === 'auto' ? 'cover' : size;
                container.style.setProperty('background-size', finalSize, 'important');
                container.style.setProperty('background-position', bgPosition, 'important');
                container.style.setProperty('background-repeat', 'no-repeat', 'important');
                container.style.setProperty('background-attachment', 'scroll', 'important');
                
                // Set background color separately (transparent by default)
                container.style.setProperty('background-color', 'transparent', 'important');
                
                // Force reflow to ensure styles are applied
                void container.offsetWidth;
                
                // Verify the styles were actually applied
                const computedStyle = window.getComputedStyle(container);
                console.log('✅ Background image applied:', {
                    backgroundImage: computedStyle.backgroundImage.substring(0, 50),
                    backgroundSize: computedStyle.backgroundSize,
                    backgroundPosition: computedStyle.backgroundPosition,
                    containerExists: !!container,
                    containerVisible: computedStyle.display !== 'none'
                });
                
                // When background image is uploaded, set flag
                container.dataset.hasUploadedBackground = 'true';
                
                // Ensure horizontal layout is visible (banner is always hidden)
                const scoreBanner = document.querySelector('.score-banner');
                const scoreSection = document.querySelector('.score-section');
                
                if (scoreBanner) {
                    scoreBanner.style.display = 'none';
                }
                if (scoreSection) {
                    scoreSection.style.display = 'flex';
                }
            } else {
                // No uploaded image - clear the flag and restore normal layout behavior
                if (container) {
                    container.dataset.hasUploadedBackground = 'false';
                    // Clear background image properties
                    container.style.backgroundImage = '';
                    container.style.backgroundSize = '';
                    container.style.backgroundRepeat = '';
                    container.style.backgroundPosition = '';
                    container.style.backgroundAttachment = '';
                }
            }
            
            // Only use bgValue shorthand for solid and gradient types
            // For image type, complete background was already set above
            if (bg.type === 'solid' || bg.type === 'gradient') {
                container.style.background = bgValue;
            }
            // For image type, background is already set above with complete shorthand
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
    // Always initialize window.gfxSettings to ensure it exists
    if (!window.gfxSettings) window.gfxSettings = {};
    
    if (settings.animations) {
        window.gfxSettings.animations = settings.animations;
        console.log('✅ Animation settings stored:', settings.animations);
    } else {
        // Initialize with defaults if not present
        window.gfxSettings.animations = {
            enabled: false,
            type: 'explosion'
        };
    }
    
    // Banner styling - apply directly to banner elements
    // BUT: Only apply colors if no uploaded background image exists
    // When background image exists, banner is hidden completely (handled above)
    if (settings.banner) {
        // Check if uploaded image exists
        const hasUploadedImage = container && container.dataset.hasUploadedBackground === 'true';
        
        // If background image exists, hide banner and show text-only layout
        if (hasUploadedImage) {
            const scoreBanner = document.querySelector('.score-banner');
            const scoreSection = document.querySelector('.score-section');
            
            if (scoreBanner) {
                scoreBanner.style.display = 'none';
            }
            if (scoreSection) {
                scoreSection.style.display = 'flex';
            }
        } else {
            // No background image - apply banner styling normally
            // Always set CSS variables for sizing and text styling
            const bannerScoreSize = settings.banner.scoreSize || 48;
            const bannerNameSize = settings.banner.nameSize || 24;
            root.style.setProperty('--banner-border-radius', (settings.banner.borderRadius || 12) + 'px');
            root.style.setProperty('--banner-height', (settings.banner.height || 80) + 'px');
            root.style.setProperty('--banner-padding', (settings.banner.padding || 20) + 'px');
            root.style.setProperty('--banner-center-width', (settings.banner.centerWidth || 200) + 'px');
            root.style.setProperty('--banner-name-size', bannerNameSize + 'px');
            root.style.setProperty('--banner-score-size', bannerScoreSize + 'px');
            console.log('📝 Banner sizes applied:', { bannerScoreSize, bannerNameSize });
            root.style.setProperty('--banner-name-color', settings.banner.nameColor || '#ffffff');
            root.style.setProperty('--banner-score-color', settings.banner.scoreColor || '#000000');
            root.style.setProperty('--banner-match-score-color', settings.banner.matchScoreColor || '#666666');
            
            // Try to apply to banner elements if they exist (re-query to be sure)
            const currentScoreBanner = document.querySelector('.score-banner');
            if (currentScoreBanner) {
                const leftSegment = currentScoreBanner.querySelector('.banner-left');
                const centerSegment = currentScoreBanner.querySelector('.banner-center');
                const rightSegment = currentScoreBanner.querySelector('.banner-right');
                
                // Use generated banner colors
                if (leftSegment) {
                    leftSegment.style.removeProperty('background');
                    const lighter = adjustColorBrightness(settings.banner.leftColor || '#2d5016', 1.2);
                    leftSegment.style.background = `linear-gradient(135deg, ${settings.banner.leftColor || '#2d5016'} 0%, ${lighter} 100%)`;
                }
                if (centerSegment) {
                    centerSegment.style.removeProperty('background');
                    centerSegment.style.background = settings.banner.centerColor || '#ffffff';
                }
                if (rightSegment) {
                    rightSegment.style.removeProperty('background');
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
    
    // Apply text areas if present (for text centering within defined areas)
    if (settings.textAreas && typeof settings.textAreas === 'object') {
        applyTextAreaSettings(settings.textAreas);
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
    if (!element) return;
    
    let leftValue = '';
    let topValue = '';
    let translateX = '0';
    let translateY = '0';
    
    // Handle X position - support percentage values directly
    if (x === 'center' || x === '50%') {
        leftValue = '50%';
        translateX = '-50%';
    } else if (typeof x === 'string' && x.includes('%')) {
        // Percentage value like "30%"
        leftValue = x;
        translateX = '0';
    } else if (typeof x === 'string' && x.includes('px')) {
        // Pixel value
        leftValue = x;
        translateX = '0';
    } else if (x) {
        leftValue = x;
        translateX = '0';
    }
    
    // Handle Y position
    if (y === 'center' || y === '50%') {
        topValue = '50%';
        translateY = '-50%';
    } else if (y === 'auto') {
        topValue = '';
        translateY = '0';
    } else if (typeof y === 'string' && y.includes('%')) {
        // Percentage value like "25%"
        topValue = y;
        translateY = '0';
    } else if (typeof y === 'string' && y.includes('px')) {
        // Pixel value
        topValue = y;
        translateY = '0';
    } else if (y) {
        topValue = y;
        translateY = '0';
    }
    
    // Apply styles
    if (leftValue) {
        element.style.left = leftValue;
    } else {
        element.style.left = '';
    }
    
    if (topValue) {
        element.style.top = topValue;
    } else {
        element.style.top = '';
    }
    
    // Apply transform for centering
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
    
    // Debug logging
    console.log('📍 Position applied:', {
        element: element.className,
        left: leftValue || 'default',
        top: topValue || 'default',
        transform: element.style.transform || 'none'
    });
}

// Listen for settings updates from control panel (preview mode only)
// In vMix, settings come from API, not postMessage
const isPreview = window.location.search.includes('preview=true');
if (isPreview) {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'gfxSettings') {
            console.log('📨 Received gfxSettings via postMessage');
            applyGFXSettings(event.data.settings);
            // Cache in localStorage for preview mode only
            localStorage.setItem('gfxSettings', JSON.stringify(event.data.settings));
        } else if (event.data && event.data.type === 'reloadGFXSettings') {
            // Reload settings from API (useful after background upload)
            console.log('🔄 Reloading GFX settings from API...');
            const matchId = event.data.matchId || getMatchId();
            fetch(`/api/match/${matchId}/gfx-settings`)
                .then(response => response.json())
                .then(settings => {
                    if (settings && Object.keys(settings).length > 0) {
                        console.log('✅ GFX settings reloaded from API');
                        applyGFXSettings(settings);
                        localStorage.setItem('gfxSettings', JSON.stringify(settings));
                    }
                })
                .catch(err => {
                    console.error('⚠️ Failed to reload GFX settings from API:', err);
                });
        } else if (event.data && event.data.type === 'visibilityUpdate') {
            // Handle visibility updates (preview mode)
            updateVisibility(
                event.data.showGame, 
                event.data.showTimer,
                event.data.matchScoreNextTimer || false
            );
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
        const showMatchScoreNextTimer = localStorage.getItem('showMatchScoreNextTimer');
        const visibilityHash = (showGame || 'true') + '|' + (showTimer || 'true') + '|' + (showMatchScoreNextTimer || 'false');
        if (visibilityHash !== lastVisibilityHash) {
            lastVisibilityHash = visibilityHash;
            updateVisibility(
                showGame === null ? true : showGame === 'true',
                showTimer === null ? true : showTimer === 'true',
                showMatchScoreNextTimer === 'true'
            );
        }
    }, 200); // Check every 200ms for changes (preview mode only)
} else {
    // vMix mode: Periodically refresh settings from API (not localStorage)
    // Use shorter interval for more responsive position updates
    setInterval(async () => {
        try {
            const response = await fetch(`/api/match/${matchId}/gfx-settings`);
            if (response.ok) {
                const settings = await response.json();
                if (settings && Object.keys(settings).length > 0) {
                    // Normalize position values to ensure they're numbers (0-100) for consistent comparison
                    if (settings.positions) {
                        if (typeof settings.positions.scoreX === 'string' && settings.positions.scoreX.includes('%')) {
                            settings.positions.scoreX = parseInt(settings.positions.scoreX.replace('%', '')) || 50;
                        }
                        if (typeof settings.positions.scoreY === 'string' && settings.positions.scoreY.includes('%')) {
                            settings.positions.scoreY = parseInt(settings.positions.scoreY.replace('%', '')) || 50;
                        }
                        if (typeof settings.positions.infoX === 'string' && settings.positions.infoX.includes('%')) {
                            settings.positions.infoX = parseInt(settings.positions.infoX.replace('%', '')) || 50;
                        }
                        if (typeof settings.positions.infoY === 'string' && settings.positions.infoY.includes('%') && settings.positions.infoY !== 'auto') {
                            settings.positions.infoY = parseInt(settings.positions.infoY.replace('%', '')) || 80;
                        }
                        // Ensure absolutePositioning defaults to true if not explicitly false
                        if (settings.positions.absolutePositioning === undefined) {
                            settings.positions.absolutePositioning = true;
                        }
                    }
                    
                    // Ensure layout settings are present (for spacing, separator, etc.)
                    if (!settings.layout) {
                        console.warn('⚠️ Layout settings missing from API response, using defaults');
                        settings.layout = {
                            spacingScores: 40,
                            spacingInfo: 30,
                            separatorSize: 80,
                            style: 'vertical',
                            showMatchScores: false,
                            matchScoreFormat: 'player1'
                        };
                    }
                    
                    // Ensure typography settings are present
                    if (!settings.typography) {
                        console.warn('⚠️ Typography settings missing from API response, using defaults');
                        settings.typography = {
                            fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
                            playerNameSize: 48,
                            scoreSize: 120,
                            gameTimerSize: 42,
                            fontWeight: 900
                        };
                    }
                    
                    // Only apply if settings actually changed (avoid unnecessary re-renders)
                    const settingsStr = JSON.stringify(settings);
                    if (!window.lastSettingsStr || window.lastSettingsStr !== settingsStr) {
                        window.lastSettingsStr = settingsStr;
                        console.log('🔄 Settings changed, applying:', {
                            hasTypography: !!settings.typography,
                            hasLayout: !!settings.layout,
                            hasPositions: !!settings.positions,
                            typography: settings.typography,
                            layout: settings.layout
                        });
                        applyGFXSettings(settings);
                        if (settings.visibility) {
                            updateVisibility(
                                settings.visibility.showGame !== false,
                                settings.visibility.showTimer !== false
                            );
                        }
                    }
                }
            }
        } catch (e) {
            // Silent fail - will retry on next interval
            console.error('Failed to fetch GFX settings:', e);
        }
    }, 1000); // Check API every 1 second for more responsive updates
}

// Function to update visibility of game and timer displays
function updateVisibility(showGame, showTimer, showMatchScoreNextTimer = false) {
    if (elements.periodDisplay) {
        elements.periodDisplay.style.display = showGame ? 'flex' : 'none';
    }
    if (elements.timerDisplay) {
        elements.timerDisplay.style.display = showTimer ? 'flex' : 'none';
    }
    
    // Update match score next to timer visibility
    if (elements.matchScoreNextTimer) {
        // Only show if setting is enabled AND timer is visible
        elements.matchScoreNextTimer.style.display = (showMatchScoreNextTimer && showTimer) ? 'inline' : 'none';
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
    matchScoreNextTimer: document.getElementById('match-score-next-timer'),
    // Banner layout elements
    scoreSection: document.querySelector('.score-section'),
    scoreBanner: document.querySelector('.score-banner'),
    bannerHomeName: document.getElementById('banner-home-name'),
    bannerAwayName: document.getElementById('banner-away-name'),
    bannerHomeScore: document.getElementById('banner-home-score'),
    bannerAwayScore: document.getElementById('banner-away-score'),
    bannerMatchScores: document.getElementById('banner-match-scores'),
    matchScores: document.getElementById('match-scores')
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
    
    // Always show horizontal layout (text-only)
    if (elements.scoreSection) elements.scoreSection.style.display = 'flex';
    if (elements.scoreBanner) elements.scoreBanner.style.display = 'none';
    
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
    
    // Update match scores in center section based on selected format
    // Formats: player1 = "(5)", player2 = "(3)", both = "(5-3)", total = "(8)"
    const matchScoresElement = document.getElementById('match-scores');
    if (matchScoresElement) {
        if (showMatchScores) {
            let matchScoreText = '';
            
            if (matchScoreFormat === 'player1') {
                // Show Player 1's match score: "1 (5) 1"
                matchScoreText = `(${homeMatchScore})`;
            } else if (matchScoreFormat === 'player2') {
                // Show Player 2's match score: "1 (3) 1"
                matchScoreText = `(${awayMatchScore})`;
            } else if (matchScoreFormat === 'both') {
                // Show both: "1 (5-3) 1"
                matchScoreText = `(${homeMatchScore}-${awayMatchScore})`;
            } else if (matchScoreFormat === 'total') {
                // Show total: "1 (8) 1"
                const total = homeMatchScore + awayMatchScore;
                matchScoreText = `(${total})`;
            }
            
            if (homeMatchScore > 0 || awayMatchScore > 0) {
                matchScoresElement.textContent = matchScoreText;
                matchScoresElement.style.display = 'inline';
            } else {
                matchScoresElement.style.display = 'none';
            }
        } else {
            matchScoresElement.style.display = 'none';
        }
    }
    
    // Also update banner match scores for compatibility
    if (elements.bannerMatchScores) {
        if (showMatchScores) {
            let matchScoreText = '';
            
            if (matchScoreFormat === 'player1') {
                matchScoreText = `(${homeMatchScore})`;
            } else if (matchScoreFormat === 'player2') {
                matchScoreText = `(${awayMatchScore})`;
            } else if (matchScoreFormat === 'both') {
                matchScoreText = `(${homeMatchScore}-${awayMatchScore})`;
            } else if (matchScoreFormat === 'total') {
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
    
    // Update match score next to timer (total games played)
    if (elements.matchScoreNextTimer) {
        // Get setting for showing match score next to timer
        let showMatchScoreNextTimer = false;
        if (window.gfxSettings && window.gfxSettings.visibility) {
            showMatchScoreNextTimer = window.gfxSettings.visibility.showMatchScoreNextTimer === true;
        } else {
            const isPreview = window.location.search.includes('preview=true');
            if (isPreview) {
                showMatchScoreNextTimer = localStorage.getItem('showMatchScoreNextTimer') === 'true';
            }
        }
        
        // Use homeMatchScore as total games played
        const totalGames = homeMatchScore || 0;
        
        if (showMatchScoreNextTimer && totalGames > 0) {
            // Format: show total games played: (8)
            const matchScoreText = `(${totalGames})`;
            elements.matchScoreNextTimer.textContent = matchScoreText;
            elements.matchScoreNextTimer.style.display = 'inline';
        } else {
            elements.matchScoreNextTimer.style.display = 'none';
        }
    }
    
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
    
    // Check animation settings - try multiple sources
    let animationsEnabled = false;
    let animationType = 'explosion';
    
    // First try: window.gfxSettings (most up-to-date)
    if (window.gfxSettings && window.gfxSettings.animations) {
        animationsEnabled = window.gfxSettings.animations.enabled === true;
        animationType = window.gfxSettings.animations.type || 'explosion';
        console.log('🎬 Animation settings from window.gfxSettings:', { enabled: animationsEnabled, type: animationType });
    } else {
        // Fallback: check localStorage (works in both preview and vMix mode)
        const settingsStr = localStorage.getItem('gfxSettings');
        if (settingsStr) {
            try {
                const settings = JSON.parse(settingsStr);
                if (settings.animations) {
                    animationsEnabled = settings.animations.enabled === true;
                    animationType = settings.animations.type || 'explosion';
                    console.log('🎬 Animation settings from localStorage:', { enabled: animationsEnabled, type: animationType });
                    
                    // Also update window.gfxSettings for future calls
                    if (!window.gfxSettings) window.gfxSettings = {};
                    window.gfxSettings.animations = settings.animations;
                }
            } catch (e) {
                console.error('Failed to parse animation settings:', e);
            }
        }
    }
    
    // Check if glow is enabled (for basic animation)
    const glowEnabled = document.body.dataset.glowEnabled === 'true';
    
    if (animationsEnabled && animationType) {
        // Apply fantastic animation
        const animationClass = `animation-${animationType}`;
        console.log(`🎬 Applying animation: ${animationClass} to element:`, element.id || element.className);
        element.classList.add(animationClass);
        
        // Remove animation class after animation completes
        const animationDuration = animationType === 'bounce' ? 900 : 
                                  animationType === 'rotate' || animationType === 'flip' ? 800 :
                                  animationType === 'particles' ? 1000 : 700;
        setTimeout(() => {
            element.classList.remove(animationClass);
            console.log(`🎬 Removed animation: ${animationClass}`);
        }, animationDuration);
    } else {
        // Use default animation
        console.log('🎬 Using default animation (fantastic animations disabled or not configured)');
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
                    console.log('📡 Received GFX settings update via WebSocket:', {
                        keys: Object.keys(data.settings),
                        hasTypography: !!data.settings.typography,
                        hasLayout: !!data.settings.layout,
                        hasColors: !!data.settings.colors,
                        hasEffects: !!data.settings.effects,
                        hasPositions: !!data.settings.positions,
                        hasBackgrounds: !!data.settings.backgrounds
                    });
                    applyGFXSettings(data.settings);
                    if (data.settings.visibility) {
                        updateVisibility(
                            data.settings.visibility.showGame !== false,
                            data.settings.visibility.showTimer !== false,
                            data.settings.visibility.showMatchScoreNextTimer === true
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
        let settings = {};
        if (response.ok) {
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
                settings = data;
            }
        }
        
        // Also load text areas from current tournament (overrides match settings)
        let hasTextAreas = false;
        try {
            const tournamentResponse = await fetch(`/api/tournaments/current/text-areas`);
            if (tournamentResponse.ok) {
                const tournamentData = await tournamentResponse.json();
                if (tournamentData && tournamentData.text_areas && Object.keys(tournamentData.text_areas).length > 0) {
                    // Merge tournament text_areas into settings (tournament takes priority)
                    if (!settings.textAreas) settings.textAreas = {};
                    settings.textAreas = tournamentData.text_areas;
                    hasTextAreas = true;
                    console.log('📐 Loaded text areas from tournament:', tournamentData.text_areas);
                }
            }
        } catch (e) {
            console.warn('Failed to load text areas from tournament:', e);
        }
        
        // Apply settings if we have any (GFX settings or text areas from tournament)
        if (settings && (Object.keys(settings).length > 0 || hasTextAreas)) {
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
                    settings.visibility.showTimer !== false,
                    settings.visibility.showMatchScoreNextTimer === true
                );
            }
            console.log('GFX settings loaded from API and applied');
            return true;
        }
    } catch (e) {
        console.error('Failed to load GFX settings from API:', e);
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    // Get match ID first
    matchId = getMatchId();
    
    // Initialize language switcher
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = getLanguage();
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
    
    // Check if this is preview mode (iframe in control panel) or vMix (standalone)
    const isPreview = window.location.search.includes('preview=true');
    
    // Also load from localStorage immediately (for preview mode quick updates)
    if (isPreview) {
        loadGFXSettings();
    }
    
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
                                settings.visibility.showTimer !== false,
                                settings.visibility.showMatchScoreNextTimer === true
                            );
                        }
                    } catch (e) {
                        console.error('Failed to load GFX settings from localStorage:', e);
                        // Use defaults
                        if (elements.scoreSection && elements.scoreBanner) {
                            elements.scoreSection.style.display = 'flex';
                            elements.scoreBanner.style.display = 'none';
                        }
                        updateVisibility(true, true, false);
                    }
                } else {
                    // Preview mode: no settings found
                    if (elements.scoreSection && elements.scoreBanner) {
                        elements.scoreSection.style.display = 'flex';
                        elements.scoreBanner.style.display = 'none';
                    }
                    updateVisibility(true, true, false);
                }
            } else {
                // vMix mode: no localStorage fallback - use defaults
                console.warn('No GFX settings found in API. Using default styling.');
                if (elements.scoreSection && elements.scoreBanner) {
                    elements.scoreSection.style.display = 'flex';
                    elements.scoreBanner.style.display = 'none';
                }
                updateVisibility(true, true, false);
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
    
    // Check if edit mode is enabled
    if (checkEditMode()) {
        console.log('Edit mode enabled, initializing text area editor...');
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            enableTextAreaEditor();
        }, 500);
        // Don't connect WebSocket or fetch state in edit mode
        return;
    }
    
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

// ============================================================================
// Text Area Editor Mode
// ============================================================================

let editMode = false;
let textAreaElements = {};
let isDragging = false;
let isResizing = false;
let currentArea = null;
let dragOffset = { x: 0, y: 0 };

/**
 * Check if edit mode is enabled via URL parameter
 */
function checkEditMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('editMode') === 'true';
}

/**
 * Enable text area editor mode
 */
function enableTextAreaEditor() {
    editMode = true;
    
    // Create editor overlay
    const editorOverlay = document.createElement('div');
    editorOverlay.id = 'text-area-editor-overlay';
    editorOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: none;
    `;
    document.body.appendChild(editorOverlay);
    
    // Create areas for each text element
    createTextArea('left', elements.scoreSection.querySelector('#score-left') || document.getElementById('score-left'));
    createTextArea('center', elements.scoreSection.querySelector('#score-center') || document.getElementById('score-center'));
    createTextArea('right', elements.scoreSection.querySelector('#score-right') || document.getElementById('score-right'));
    createTextArea('info', elements.infoSection);
    
    // Add save button
    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-text-areas-btn';
    saveBtn.textContent = t('saveTextAreasToTournament') || 'Save Text Areas to Tournament';
    saveBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10001;
        padding: 15px 30px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
    saveBtn.addEventListener('click', saveTextAreaSettings);
    document.body.appendChild(saveBtn);
    
    // Add cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancel-text-areas-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 180px;
        z-index: 10001;
        padding: 15px 30px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
    cancelBtn.addEventListener('click', () => {
        // If opened from control panel, close this window
        if (window.opener) {
            window.close();
        } else {
            // Otherwise, remove editMode from URL
            window.location.search = window.location.search.replace(/[?&]editMode=true/, '');
        }
    });
    document.body.appendChild(cancelBtn);
    
    console.log('Text area editor mode enabled');
}

/**
 * Create a draggable/resizable text area
 */
function createTextArea(areaKey, element) {
    if (!element) {
        console.warn(`Element not found for area: ${areaKey}`);
        return;
    }
    
    const rect = element.getBoundingClientRect();
    const container = document.getElementById('text-area-editor-overlay');
    
    // Create area wrapper
    const areaWrapper = document.createElement('div');
    areaWrapper.className = 'text-area-wrapper';
    areaWrapper.dataset.areaKey = areaKey;
    areaWrapper.style.cssText = `
        position: absolute;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 2px dashed #ffd700;
        background: rgba(255, 215, 0, 0.1);
        pointer-events: auto;
        cursor: move;
        z-index: 10001;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.textContent = areaKey.toUpperCase();
    label.style.cssText = `
        position: absolute;
        top: -20px;
        left: 0;
        background: #ffd700;
        color: #000;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: bold;
        border-radius: 3px 3px 0 0;
    `;
    areaWrapper.appendChild(label);
    
    // Add resize handles
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(handle => {
        const handleEl = document.createElement('div');
        handleEl.className = `resize-handle resize-handle-${handle}`;
        handleEl.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: #ffd700;
            border: 1px solid #000;
            cursor: ${getResizeCursor(handle)};
            z-index: 10002;
        `;
        
        const positions = getResizeHandlePosition(handle, rect.width, rect.height);
        handleEl.style.left = positions.x + 'px';
        handleEl.style.top = positions.y + 'px';
        
        handleEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startResize(areaKey, handle, e);
        });
        
        areaWrapper.appendChild(handleEl);
    });
    
    // Make draggable
    areaWrapper.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        startDrag(areaKey, e);
    });
    
    container.appendChild(areaWrapper);
    textAreaElements[areaKey] = {
        wrapper: areaWrapper,
        element: element,
        rect: rect
    };
}

/**
 * Get resize cursor based on handle position
 */
function getResizeCursor(handle) {
    const cursors = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'e': 'e-resize',
        'w': 'w-resize'
    };
    return cursors[handle] || 'default';
}

/**
 * Get resize handle position
 */
function getResizeHandlePosition(handle, width, height) {
    const positions = {
        'nw': { x: -5, y: -5 },
        'ne': { x: width - 5, y: -5 },
        'sw': { x: -5, y: height - 5 },
        'se': { x: width - 5, y: height - 5 },
        'n': { x: width / 2 - 5, y: -5 },
        's': { x: width / 2 - 5, y: height - 5 },
        'e': { x: width - 5, y: height / 2 - 5 },
        'w': { x: -5, y: height / 2 - 5 }
    };
    return positions[handle] || { x: 0, y: 0 };
}

/**
 * Start dragging an area
 */
function startDrag(areaKey, e) {
    isDragging = true;
    currentArea = areaKey;
    const wrapper = textAreaElements[areaKey].wrapper;
    const rect = wrapper.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
}

/**
 * Handle drag
 */
function onDrag(e) {
    if (!isDragging || !currentArea) return;
    
    const wrapper = textAreaElements[currentArea].wrapper;
    const container = wrapper.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Constrain to container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - wrapper.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - wrapper.offsetHeight));
    
    wrapper.style.left = newX + 'px';
    wrapper.style.top = newY + 'px';
}

/**
 * Stop dragging
 */
function stopDrag() {
    isDragging = false;
    currentArea = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

/**
 * Start resizing an area
 */
function startResize(areaKey, handle, e) {
    isResizing = true;
    currentArea = areaKey;
    const wrapper = textAreaElements[areaKey].wrapper;
    const startRect = wrapper.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    
    function onResize(e) {
        if (!isResizing || !currentArea) return;
        
        const wrapper = textAreaElements[currentArea].wrapper;
        const container = wrapper.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        let deltaX = e.clientX - startX;
        let deltaY = e.clientY - startY;
        
        let newWidth = startRect.width;
        let newHeight = startRect.height;
        let newLeft = startRect.left - containerRect.left;
        let newTop = startRect.top - containerRect.top;
        
        // Handle different resize directions
        if (handle.includes('e')) {
            newWidth = Math.max(50, startRect.width + deltaX);
        }
        if (handle.includes('w')) {
            newWidth = Math.max(50, startRect.width - deltaX);
            newLeft = startRect.left - containerRect.left + deltaX;
        }
        if (handle.includes('s')) {
            newHeight = Math.max(50, startRect.height + deltaY);
        }
        if (handle.includes('n')) {
            newHeight = Math.max(50, startRect.height - deltaY);
            newTop = startRect.top - containerRect.top + deltaY;
        }
        
        // Constrain to container bounds
        if (newLeft < 0) {
            newWidth += newLeft;
            newLeft = 0;
        }
        if (newTop < 0) {
            newHeight += newTop;
            newTop = 0;
        }
        if (newLeft + newWidth > containerRect.width) {
            newWidth = containerRect.width - newLeft;
        }
        if (newTop + newHeight > containerRect.height) {
            newHeight = containerRect.height - newTop;
        }
        
        wrapper.style.width = newWidth + 'px';
        wrapper.style.height = newHeight + 'px';
        wrapper.style.left = newLeft + 'px';
        wrapper.style.top = newTop + 'px';
        
        // Update resize handles positions
        updateResizeHandles(wrapper, newWidth, newHeight);
    }
    
    function stopResize() {
        isResizing = false;
        currentArea = null;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
    }
    
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
}

/**
 * Update resize handles positions
 */
function updateResizeHandles(wrapper, width, height) {
    const handles = wrapper.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
        const handleType = handle.className.match(/resize-handle-(\w+)/)[1];
        const positions = getResizeHandlePosition(handleType, width, height);
        handle.style.left = positions.x + 'px';
        handle.style.top = positions.y + 'px';
    });
}

/**
 * Save text area settings to API
 */
async function saveTextAreaSettings() {
    if (!editMode) return;
    
    const textAreas = {};
    
    const container = document.getElementById('text-area-editor-overlay');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const overlayContainer = document.querySelector('.overlay-container');
    const overlayRect = overlayContainer ? overlayContainer.getBoundingClientRect() : containerRect;
    
    // Convert pixel positions to percentages relative to overlay container
    Object.keys(textAreaElements).forEach(areaKey => {
        const wrapper = textAreaElements[areaKey].wrapper;
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // Calculate percentage positions relative to overlay container
        const x = ((wrapperRect.left - overlayRect.left) / overlayRect.width) * 100;
        const y = ((wrapperRect.top - overlayRect.top) / overlayRect.height) * 100;
        const width = (wrapperRect.width / overlayRect.width) * 100;
        const height = (wrapperRect.height / overlayRect.height) * 100;
        
        textAreas[areaKey] = {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
            width: Math.max(5, Math.min(100, width)),
            height: Math.max(5, Math.min(100, height))
        };
    });
    
    try {
        // Save text areas to current tournament (not match settings)
        console.log('💾 Saving text areas to tournament:', textAreas);
        const saveResponse = await fetch(`/api/tournaments/current/text-areas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(textAreas)
        });
        
        if (saveResponse.ok) {
            const data = await saveResponse.json();
            alert(t('textAreasSaved') || 'Text areas saved to tournament successfully!');
            // Apply settings immediately
            applyTextAreaSettings(textAreas);
            
            // Notify parent window (control panel) about the update
            if (window.opener) {
                try {
                    window.opener.postMessage({
                        type: 'textAreasUpdated',
                        textAreas: textAreas
                    }, '*');
                } catch (e) {
                    console.log('Could not notify parent window:', e);
                }
            }
            
            // Exit edit mode - close window or navigate back
            setTimeout(() => {
                if (window.opener) {
                    // If opened from control panel, close this window
                    window.close();
                } else {
                    // Otherwise, remove editMode from URL
                    window.location.search = window.location.search.replace(/[?&]editMode=true/, '');
                }
            }, 500); // Small delay to show success message
        } else {
            const error = await saveResponse.json();
            alert(`${t('error') || 'Error'}: ${error.detail || t('unknownError') || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to save text area settings:', error);
        alert(t('connectionError') || 'Connection error');
    }
}

/**
 * Apply text area settings to overlay
 */
function applyTextAreaSettings(textAreas) {
    if (!textAreas || typeof textAreas !== 'object') return;
    
    // Note: overlay-container has position: relative by default, or position: absolute when class is added
    // In both cases, percentage-based positioning on children works relative to the container
    // So text areas will be positioned correctly relative to overlay-container dimensions
    
    Object.keys(textAreas).forEach(areaKey => {
        const area = textAreas[areaKey];
        if (!area || typeof area !== 'object') return;
        
        const element = document.getElementById(`score-${areaKey}`) || 
                       (areaKey === 'info' ? elements.infoSection : null) ||
                       (areaKey === 'left' ? document.getElementById('score-left') : null) ||
                       (areaKey === 'center' ? document.getElementById('score-center') : null) ||
                       (areaKey === 'right' ? document.getElementById('score-right') : null);
        
        if (!element) {
            console.warn(`Element not found for text area: ${areaKey}`);
            return;
        }
        
        // Apply CSS variables or inline styles for positioning
        element.style.position = 'absolute';
        element.style.left = area.x + '%';
        element.style.top = area.y + '%';
        element.style.width = area.width + '%';
        element.style.height = area.height + '%';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.textAlign = 'center';
        element.style.margin = '0';
        element.style.transform = 'none'; // Remove any existing transforms for accurate positioning
        
        // Ensure text is centered within the area
        const innerElements = element.querySelectorAll('div, span');
        innerElements.forEach(inner => {
            inner.style.width = '100%';
            inner.style.textAlign = 'center';
            inner.style.display = 'flex';
            inner.style.alignItems = 'center';
            inner.style.justifyContent = 'center';
        });
        
        console.log(`📍 Applied text area ${areaKey}:`, {
            x: area.x + '%',
            y: area.y + '%',
            width: area.width + '%',
            height: area.height + '%'
        });
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
