# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Collect all frontend files
frontend_files = [
    ('../frontend/control/index.html', 'frontend/control'),
    ('../frontend/control/style.css', 'frontend/control'),
    ('../frontend/control/app.js', 'frontend/control'),
    ('../frontend/control/gfx-designer.js', 'frontend/control'),
    ('../frontend/overlay/index.html', 'frontend/overlay'),
    ('../frontend/overlay/style.css', 'frontend/overlay'),
    ('../frontend/overlay/app.js', 'frontend/overlay'),
    ('../frontend/translations.js', 'frontend'),
    ('../frontend/README.md', 'frontend'),
]

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=frontend_files,
    hiddenimports=[
        'uvicorn',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.logging',
        'fastapi',
        'fastapi.staticfiles',
        'websockets',
        'pydantic',
        'pydantic.json',
        'pydantic._internal',
        'email_validator',
        'multipart',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='vmix_score_control',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Set to False to hide console window (optional)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon path here if you have one: 'path/to/icon.ico'
)
