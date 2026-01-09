# vMix Russian Billiard Score Control

**Version: 0.1a (Alpha)**

A complete real-time billiard score control system for vMix broadcasting. Designed specifically for Russian billiard games. Features a FastAPI backend with WebSocket support, a control panel for operators, and an animated overlay display optimized for vMix Browser Input.

## Features

- **Real-time Updates**: WebSocket-based broadcasting ensures instant score updates
- **Server-side Timer**: Accurate countdown timer with automatic stop at zero
- **Animated Overlay**: Smooth score change animations (bump/pop with glow effect)
- **Multiple Game Support**: Handle multiple games simultaneously via game IDs
- **Billiard-Specific Features**: Player 1/Player 2 scoring, game tracking, ball pocketing controls
- **Responsive Control Panel**: Clean, intuitive UI for score management
- **Reliable Reconnection**: Exponential backoff reconnection logic for overlay
- **No Build Step**: Pure HTML/CSS/JavaScript frontend, runs directly from FastAPI

## Tech Stack

- **Backend**: Python 3.8+ with FastAPI, WebSockets, Pydantic
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Server**: Uvicorn ASGI server

## Project Structure

```
/
├── backend/
│   ├── main.py              # FastAPI application with REST & WebSocket endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── vmix_score_control.spec  # PyInstaller spec file
│   └── README.md            # Backend documentation
├── frontend/
│   ├── control/             # Control Panel
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── app.js
│   │   └── gfx-designer.js
│   ├── overlay/             # vMix Overlay Display
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── translations.js      # Translations file
│   └── README.md            # Frontend documentation
├── build_windows.bat        # Windows build script (batch)
├── build_windows.ps1        # Windows build script (PowerShell)
├── BUILD.md                 # Build instructions
├── QUICK_START.txt          # Quick start guide
└── README.md                # Main documentation
```

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Windows Setup

1. **Open Command Prompt or PowerShell** in the project directory

2. **Create a virtual environment:**
   ```cmd
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   ```cmd
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```cmd
   cd backend
   pip install -r requirements.txt
   ```

5. **Return to project root and start the server:**
   ```cmd
   cd ..
   python backend/main.py
   ```

   Or using uvicorn directly:
   ```cmd
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. **Access the application:**
   - Control Panel: http://localhost:8000/control
   - Overlay: http://localhost:8000/overlay?matchId=1

### Linux/Mac Setup

1. **Open Terminal** in the project directory

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. **Return to project root and start the server:**
   ```bash
   cd ..
   python backend/main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

6. **Access the application:**
   - Control Panel: http://localhost:8000/control
   - Overlay: http://localhost:8000/overlay?matchId=1

## vMix Configuration Guide

### Adding Browser Input in vMix

1. **Open vMix** and navigate to your production

2. **Add Browser Input:**
   - Click "Add Input" button
   - Select "Browser" from the input types
   - Configure the following settings:

3. **Browser Input Settings:**
   - **URL**: `http://localhost:8000/overlay?matchId=1`
     - For a different match, change `matchId=1` to your desired match ID
     - For LAN access, replace `localhost` with the server's IP address (e.g., `http://192.168.1.100:8000/overlay?matchId=1`)
   
   - **Width**: `1920`
   - **Height**: `1080`
   - **Zoom**: `100%` (do not zoom)
   - **Scrollbars**: `Disabled` (uncheck "Show Scrollbars")
   - **Transparency**: `Enabled` (check "Transparent Background" if available)
   - **Update Rate**: `60 FPS` or `30 FPS` (for stable performance)
   - **Hardware Acceleration**: `Enabled` (recommended)

4. **Additional Tips:**
   - Use **localhost** for local testing to minimize latency
   - Ensure the server is running before adding the Browser Input
   - The overlay has a transparent background designed for vMix compositing
   - Recommended resolution is 1920x1080 for HD broadcasts
   - For 4K broadcasts, you can scale the Browser Input in vMix or adjust CSS font sizes

5. **Positioning in vMix:**
   - The overlay is centered and can be positioned anywhere on your output
   - Use vMix's position controls to adjust placement
   - Consider using vMix's borders/effects for additional styling if needed

## API Documentation

### Base URL
```
http://localhost:8000
```

### REST Endpoints

#### Get Match State
```http
GET /api/match/{match_id}/state
```

**Response:**
```json
{
  "match_id": "1",
  "homeName": "Player 1",
  "awayName": "Player 2",
  "homeScore": 8,
  "awayScore": 5,
  "period": 2,
  "timerSecondsRemaining": 1200,
  "timerRunning": false,
  "rev": 42
}
```

#### Setup Game
```http
POST /api/match/{match_id}/setup
Content-Type: application/json

{
  "homeName": "Player 1",
  "awayName": "Player 2",
  "period": 1,
  "timerSeconds": 1800
}
```

#### Update Score
```http
POST /api/match/{match_id}/score
Content-Type: application/json

{
  "team": "home",  // or "away" (Player 1 or Player 2)
  "delta": 1       // positive or negative integer (1 point per ball)
}
```

#### Reset Match
```http
POST /api/match/{match_id}/reset
```

#### Timer Controls
```http
POST /api/match/{match_id}/timer/start
POST /api/match/{match_id}/timer/stop
POST /api/match/{match_id}/timer/set
Content-Type: application/json

{
  "seconds": 600
}
```

#### Game Control
```http
POST /api/match/{match_id}/period/set
Content-Type: application/json

{
  "period": 2  // Game number (1-20)
}
```

### WebSocket Endpoint

```ws
ws://localhost:8000/ws/match/{match_id}
```

**Message Format (Server → Client):**
```json
{
  "type": "score_changed",  // "state" | "score_changed" | "timer_started" | "timer_stopped" | "period_changed" | "setup" | "reset"
  "state": {
    "match_id": "1",
    "homeName": "Player 1",
    "awayName": "Player 2",
    "homeScore": 8,
    "awayScore": 5,
    "period": 2,
    "timerSecondsRemaining": 1200,
    "timerRunning": false,
    "rev": 42
  },
  "changed": {
    "field": "score",
    "team": "home",
    "delta": 1
  },
  "ts": 1703123456789
}
```

## Usage

### Control Panel

1. **Open** http://localhost:8000/control in a web browser
2. **Set Game ID** (default: 1) in the header
3. **Configure Game:**
   - Enter Player 1 and Player 2 names
   - Set initial game number and timer
   - Click "Apply Setup"

4. **Manage Scores:**
   - Use +/- buttons to adjust scores (each ball pocketed = 1 point)
   - Use "+Ball" button for quick ball pocketing increments
   - Scores cannot go below 0
   - Changes appear instantly in the overlay

5. **Control Timer:**
   - Start/Stop the countdown timer (useful for shot clock or game time)
   - Set timer to specific time (MM:SS format)
   - Timer automatically stops at 0

6. **Manage Game:**
   - Use +/- buttons to change game number
   - Minimum game number is 1

7. **Reset:**
   - Click "Reset Game" to reset scores, game number, and timer

### Overlay

The overlay automatically connects via WebSocket and displays:
- Player names (Player 1 | Player 2 format)
- Current scores (large, readable)
- Current game number
- Timer (MM:SS or HH:MM:SS format)

**Features:**
- Score changes trigger animated bump/pop effect with glow
- Automatic reconnection with exponential backoff
- Fallback REST polling if WebSocket fails
- Transparent background for vMix compositing

**Multiple Games:**
- Use query parameter: `?matchId=2` for game ID 2
- Each game maintains independent state

## Network Configuration

### Local Access
- Server binds to `0.0.0.0:8000` (all interfaces)
- Access via `localhost` or `127.0.0.1`

### LAN Access
- Find server IP address (e.g., `192.168.1.100`)
- Access via `http://192.168.1.100:8000/control`
- Ensure firewall allows port 8000

### Security Notes
- **Development only**: CORS is open to all origins
- For production, restrict CORS origins and add authentication
- Consider using HTTPS/WSS for production deployments

## Troubleshooting

### Server won't start
- Check Python version: `python --version` (must be 3.8+)
- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip list`
- Check port 8000 is not in use: `netstat -an | grep 8000` (Linux/Mac) or `netstat -an | findstr 8000` (Windows)

### Overlay not updating
- Check WebSocket connection in browser console (F12)
- Verify server is running and accessible
- Check match ID matches between control panel and overlay
- Try refreshing the overlay page

### Control Panel not connecting
- Verify connection status indicator (top right)
- Check browser console for errors (F12)
- Ensure server is running
- Try restarting the server

### Timer not running
- Timer only runs when `timerRunning` is true
- Click "Start" button to begin countdown
- Timer stops automatically at 0

### vMix Browser Input shows blank
- Verify overlay URL is correct
- Check server is running
- Enable "Transparent Background" in Browser Input settings
- Check browser console for errors
- Try accessing URL directly in a browser first

## Development

### Running in Development Mode

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes.

### Testing API Endpoints

Use curl or any HTTP client:

```bash
# Get state
curl http://localhost:8000/api/match/1/state

# Update score
curl -X POST http://localhost:8000/api/match/1/score \
  -H "Content-Type: application/json" \
  -d '{"team":"home","delta":1}'
```

## Building Windows Executable

You can build a single Windows executable file (.exe) that contains all services. This allows you to run everything with just one file - no Python installation needed on the target machine.

### Quick Build

1. **Run the build script** from the project root:
   ```cmd
   build_windows.bat
   ```
   Or use PowerShell:
   ```powershell
   .\build_windows.ps1
   ```

2. **Wait for build to complete** (5-10 minutes on first run)

3. **Find the executable** at: `backend\dist\vmix_score_control.exe`

4. **Copy and run** the .exe file on any Windows machine (no Python needed!)

### Using the Executable

- **Double-click** `vmix_score_control.exe` to start all services
- **Control Panel**: http://localhost:8000/control
- **Overlay**: http://localhost:8000/overlay?matchId=1
- The server runs on port 8000 and is accessible on your local network

### Detailed Build Instructions

For complete build instructions, troubleshooting, and customization options, see [BUILD.md](BUILD.md).

**Requirements for Building:**
- Windows 10/11
- Python 3.8+ installed (only needed for building, not for running the .exe)
- Internet connection (for downloading dependencies)

## License

This project is provided as-is for broadcast use.

## Support

For issues or questions, check:
1. Server logs in terminal
2. Browser console (F12)
3. Network tab for API/WebSocket errors

---

**Built for reliable broadcast use with vMix**

---

# Беларуская мова (Belarusian) / Беларуская мова

**Версія: 0.1a (Альфа)**

## Апісанне

Поўная сістэма кіравання лікам у рэальным часе для трансляцыі праз vMix. Распрацавана спецыяльна для рускага більярда. Уключае FastAPI бэкэнд з падтрымкай WebSocket, панэль кіравання для аператараў і аніміраваны оверлей, аптымізаваны для vMix Browser Input.

## Магчымасці

- **Абнаўленні ў рэальным часе**: Трансляцыя на базе WebSocket забяспечвае мігатлівыя абнаўленні ліку
- **Таймер на серверы**: Дакладны таймер адліку з аўтаматычнай спынкай пры нулі
- **Аніміраваны оверлей**: Плавныя анімацыі змены ліку (эфект bump/pop з свечэннем)
- **Падтрымка некалькіх гульняў**: Адначасовы працэс некалькіх гульняў праз ID гульняў
- **Спецыфічныя функцыі для більярда**: Падлік для гульца 1/гульца 2, адсочванне гульні, кіраванне патрапленням шараў
- **Адаптыўная панэль кіравання**: Чысты, зразумелы інтэрфейс для кіравання лікам
- **Надзейнае перападлучэнне**: Логіка перападлучэння з экспанентным затармозваннем для оверлея
- **Без этапу зборкі**: Чысты HTML/CSS/JavaScript фронтэнд, працуе непасрэдна з FastAPI

## Тэхналогіі

- **Бэкэнд**: Python 3.8+ з FastAPI, WebSockets, Pydantic
- **Фронтэнд**: Vanilla HTML/CSS/JavaScript (без фрэймворкаў)
- **Сервер**: Uvicorn ASGI сервер

## Структура праекта

```
/
├── backend/
│   ├── main.py              # FastAPI дадатак з REST і WebSocket эндпоінтамі
│   ├── requirements.txt     # Python залежнасці
│   ├── vmix_score_control.spec  # PyInstaller spec файл
│   └── README.md            # Дакументацыя бэкэнда
├── frontend/
│   ├── control/             # Панэль кіравання
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── app.js
│   │   └── gfx-designer.js
│   ├── overlay/             # vMix Оверлей дысплей
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── translations.js      # Файл перакладаў
│   └── README.md            # Дакументацыя фронтэнда
├── build_windows.bat        # Скрыпт зборкі Windows (batch)
├── build_windows.ps1        # Скрыпт зборкі Windows (PowerShell)
├── BUILD.md                 # Інструкцыі па зборцы
├── QUICK_START.txt          # Хуткі даведнік па старце
└── README.md                # Галоўная дакументацыя
```

## Устаноўка і налада

### Патрабаванні

- Python 3.8 або вышэй
- pip (устаноўшчык пакетаў Python)

### Устаноўка для Windows

1. **Адкрыйце Command Prompt або PowerShell** у каталогу праекта

2. **Стварыце віртуальнае асяроддзе:**
   ```cmd
   python -m venv venv
   ```

3. **Актывуйце віртуальнае асяроддзе:**
   ```cmd
   venv\Scripts\activate
   ```

4. **Усталюйце залежнасці:**
   ```cmd
   cd backend
   pip install -r requirements.txt
   ```

5. **Вярніцеся ў корань праекта і запусціце сервер:**
   ```cmd
   cd ..
   python backend/main.py
   ```

   Або выкарыстоўваючы uvicorn непасрэдна:
   ```cmd
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. **Доступ да дадатка:**
   - Панэль кіравання: http://localhost:8000/control
   - Оверлей: http://localhost:8000/overlay?matchId=1

### Устаноўка для Linux/Mac

1. **Адкрыйце Terminal** у каталогу праекта

2. **Стварыце віртуальнае асяроддзе:**
   ```bash
   python3 -m venv venv
   ```

3. **Актывуйце віртуальнае асяроддзе:**
   ```bash
   source venv/bin/activate
   ```

4. **Усталюйце залежнасці:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. **Вярніцеся ў корань праекта і запусціце сервер:**
   ```bash
   cd ..
   python backend/main.py
   ```

   Або выкарыстоўваючы uvicorn непасрэдна:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

6. **Доступ да дадатка:**
   - Панэль кіравання: http://localhost:8000/control
   - Оверлей: http://localhost:8000/overlay?matchId=1

## Даведнік па наладах vMix

### Даданне Browser Input у vMix

1. **Адкрыйце vMix** і перайдзіце да вашай вытворчасці

2. **Дадайце Browser Input:**
   - Націсніце кнопку "Add Input"
   - Выберыце "Browser" з тыпаў уводу
   - Наладзьце наступныя параметры:

3. **Налады Browser Input:**
   - **URL**: `http://localhost:8000/overlay?matchId=1`
     - Для іншай гульні змяніце `matchId=1` на ваш жаданы ID гульні
     - Для доступу па ЛАС замяніце `localhost` на IP-адрас сервера (напрыклад, `http://192.168.1.100:8000/overlay?matchId=1`)
   
   - **Шырыня**: `1920`
   - **Вышыня**: `1080`
   - **Маштаб**: `100%` (не маштабуйце)
   - **Праколкі**: `Адключана` (зніміце "Show Scrollbars")
   - **Празрыстасць**: `Уключана` (праверце "Transparent Background" калі даступна)
   - **Хуткасць абнаўлення**: `60 FPS` або `30 FPS` (для стабільнай працы)
   - **Апаратнае паскарэнне**: `Уключана` (рэкамендуецца)

4. **Дадатковыя парады:**
   - Выкарыстоўвайце **localhost** для лакальнага тэставання для мінімізацыі затрымкі
   - Пераканайцеся, што сервер працуе перад даданнем Browser Input
   - Оверлей мае празрысты фон, распрацаваны для кампазіцыі vMix
   - Рэкамендуемае разрозненне 1920x1080 для HD трансляцый
   - Для 4K трансляцый вы можаце маштабаваць Browser Input у vMix або наладзіць памеры шрыфтоў CSS

5. **Размяшчэнне ў vMix:**
   - Оверлей цэнтруецца і можа быць размешчаны дзе заўгодна на вашым выхадзе
   - Выкарыстоўвайце элементы кіравання пазіцыяй vMix для рэгулявання размяшчэння
   - Разгледзіце выкарыстанне рамок/эфектаў vMix для дадатковага стылізавання пры неабходнасці

## Дакументацыя API

### Базовы URL
```
http://localhost:8000
```

### REST Эндпоінты

#### Атрымаць стан гульні
```http
GET /api/match/{match_id}/state
```

**Адказ:**
```json
{
  "match_id": "1",
  "homeName": "Гулец 1",
  "awayName": "Гулец 2",
  "homeScore": 8,
  "awayScore": 5,
  "period": 2,
  "timerSecondsRemaining": 1200,
  "timerRunning": false,
  "rev": 42
}
```

#### Налада гульні
```http
POST /api/match/{match_id}/setup
Content-Type: application/json

{
  "homeName": "Гулец 1",
  "awayName": "Гулец 2",
  "period": 1,
  "timerSeconds": 1800
}
```

#### Абнавіць лік
```http
POST /api/match/{match_id}/score
Content-Type: application/json

{
  "team": "home",  // або "away" (Гулец 1 або Гулец 2)
  "delta": 1       // станоўчае або адмоўнае цэлае (1 пункт за шар)
}
```

#### Скінуць гульню
```http
POST /api/match/{match_id}/reset
```

#### Кіраванне таймерам
```http
POST /api/match/{match_id}/timer/start
POST /api/match/{match_id}/timer/stop
POST /api/match/{match_id}/timer/set
Content-Type: application/json

{
  "seconds": 600
}
```

#### Кіраванне гульнёй
```http
POST /api/match/{match_id}/period/set
Content-Type: application/json

{
  "period": 2  // Нумар гульні (1-20)
}
```

### WebSocket Эндпоінт

```ws
ws://localhost:8000/ws/match/{match_id}
```

**Фармат паведамлення (Сервер → Кліент):**
```json
{
  "type": "score_changed",  // "state" | "score_changed" | "timer_started" | "timer_stopped" | "period_changed" | "setup" | "reset"
  "state": {
    "match_id": "1",
    "homeName": "Гулец 1",
    "awayName": "Гулец 2",
    "homeScore": 8,
    "awayScore": 5,
    "period": 2,
    "timerSecondsRemaining": 1200,
    "timerRunning": false,
    "rev": 42
  },
  "changed": {
    "field": "score",
    "team": "home",
    "delta": 1
  },
  "ts": 1703123456789
}
```

## Выкарыстанне

### Панэль кіравання

1. **Адкрыйце** http://localhost:8000/control у вэб-браўзеры
2. **Усталюйце Game ID** (па змаўчанні: 1) у загалоўку
3. **Наладзьце гульню:**
   - Увядзіце імёны Гульца 1 і Гульца 2
   - Усталюйце пачатковы нумар гульні і таймер
   - Націсніце "Apply Setup"

4. **Кіруйце лікам:**
   - Выкарыстоўвайце кнопкі +/- для рэгулявання ліку (кожны патрапіўшы шар = 1 пункт)
   - Выкарыстоўвайце кнопку "+Ball" для хуткага павелічэння патраплення шара
   - Лік не можа быць менш 0
   - Змены з'яўляюцца мігам у оверлеі

5. **Кіруйце таймерам:**
   - Старт/Стоп таймера адліку (карысна для часу для ўдару або часу гульні)
   - Усталюйце таймер на канкрэтны час (фармат ММ:СС)
   - Таймер аўтаматычна спыняецца пры 0

6. **Кіруйце гульнёй:**
   - Выкарыстоўвайце кнопкі +/- для змены нумара гульні
   - Мінімальны нумар гульні 1

7. **Скід:**
   - Націсніце "Reset Game" для скіду ліку, нумара гульні і таймера

### Оверлей

Оверлей аўтаматычна падключаецца праз WebSocket і адлюстроўвае:
- Імёны гульцоў (фармат Гулец 1 | Гулец 2)
- Бягучы лік (вялікі, чытальны)
- Бягучы нумар гульні
- Таймер (фармат ММ:СС або ГГ:ММ:СС)

**Магчымасці:**
- Змены ліку выклікаюць аніміраваны эфект bump/pop са свечэннем
- Аўтаматычнае перападлучэнне з экспанентным затармозваннем
- Рэзервовы REST палінг, калі WebSocket не спрацоўвае
- Празрысты фон для кампазіцыі vMix

**Некалькі гульняў:**
- Выкарыстоўвайце параметр запыту: `?matchId=2` для ID гульні 2
- Кожная гульня падтрымлівае незалежны стан

## Сеткавая канфігурацыя

### Лакальны доступ
- Сервер прывязваецца да `0.0.0.0:8000` (усе інтэрфейсы)
- Доступ праз `localhost` або `127.0.0.1`

### Доступ па ЛАС
- Знайдзіце IP-адрас сервера (напрыклад, `192.168.1.100`)
- Доступ праз `http://192.168.1.100:8000/control`
- Пераканайцеся, што файрвол дазваляе порт 8000

### Заўвагі па бяспецы
- **Толькі для распрацоўкі**: CORS адкрыты для ўсіх крыніц
- Для вытворчасці абмежавайце CORS крыніцы і дадайце аўтэнтыфікацыю
- Разгледзіце выкарыстанне HTTPS/WSS для вытворчых разгортванняў

## Вырашэнне праблем

### Сервер не запускаецца
- Праверце версію Python: `python --version` (павінна быць 3.8+)
- Пераканайцеся, што віртуальнае асяроддзе актывавана
- Праверце, што ўсе залежнасці ўсталяваны: `pip list`
- Праверце, што порт 8000 не выкарыстоўваецца: `netstat -an | grep 8000` (Linux/Mac) або `netstat -an | findstr 8000` (Windows)

### Оверлей не абнаўляецца
- Праверце падключэнне WebSocket у кансолі браўзера (F12)
- Праверце, што сервер працуе і даступны
- Праверце, што ID гульні адпавядае паміж панэллю кіравання і оверлеем
- Паспрабуйце абнавіць старонку оверлея

### Панэль кіравання не падключаецца
- Праверце індыкатар статусу падключэння (уверсе справа)
- Праверце кансоль браўзера на памылкі (F12)
- Пераканайцеся, што сервер працуе
- Паспрабуйце перазапусціць сервер

### Таймер не працуе
- Таймер працуе толькі, калі `timerRunning` роўны true
- Націсніце кнопку "Start" для пачатку адліку
- Таймер аўтаматычна спыняецца пры 0

### vMix Browser Input паказвае пуста
- Праверце, што URL оверлея правільны
- Праверце, што сервер працуе
- Уключыце "Transparent Background" у наладах Browser Input
- Праверце кансоль браўзера на памылкі
- Паспрабуйце адкрыць URL непасрэдна ў браўзеры першым

## Распрацоўка

### Запуск у рэжыме распрацоўкі

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Сцяжок `--reload` уключае аўтаматычную перазагрузку пры зменах кода.

### Тэставанне API эндпоінтаў

Выкарыстоўвайце curl або любы HTTP кліент:

```bash
# Атрымаць стан
curl http://localhost:8000/api/match/1/state

# Абнавіць лік
curl -X POST http://localhost:8000/api/match/1/score \
  -H "Content-Type: application/json" \
  -d '{"team":"home","delta":1}'
```

## Стварэнне выканальнага файла для Windows

Вы можаце стварыць адзін выканальны файл Windows (.exe), які змяшчае ўсе службы. Гэта дазваляе запускаць усё адным файлам - устаноўка Python на цэлевай машыне не патрабуецца.

### Хуткая зборка

1. **Запусціце скрыпт зборкі** з кораня праекта:
   ```cmd
   build_windows.bat
   ```
   Або выкарыстоўвайце PowerShell:
   ```powershell
   .\build_windows.ps1
   ```

2. **Пачакайце завяршэння зборкі** (5-10 хвілін пры першым запуску)

3. **Знайдзіце выканальны файл** па адрасе: `backend\dist\vmix_score_control.exe`

4. **Скапіруйце і запускайце** файл .exe на любой машыне Windows (Python не патрэбен!)

### Выкарыстанне выканальнага файла

- **Двойчы націсніце** `vmix_score_control.exe` для запуску ўсіх службаў
- **Панэль кіравання**: http://localhost:8000/control
- **Оверлей**: http://localhost:8000/overlay?matchId=1
- Сервер працуе на порце 8000 і даступны ў вашай лакальнай сетцы

### Падрабязныя інструкцыі па зборцы

Для поўных інструкцый па зборцы, вырашэння праблем і опцый налады гл. [BUILD.md](BUILD.md).

**Патрабаванні для зборкі:**
- Windows 10/11
- Python 3.8+ усталяваны (патрэбен толькі для зборкі, не для запуску .exe)
- Інтэрнэт-падключэнне (для спампоўкі залежнасцей)

## Ліцэнзія

Гэты праект прадастаўляецца як ёсць для трансляцыйнага выкарыстання.

## Падтрымка

Пры пытаннях або праблемах праверце:
1. Лагі сервера ў тэрмінале
2. Кансоль браўзера (F12)
3. Укладку сеткі для памылак API/WebSocket

---

**Створана для надзейнага трансляцыйнага выкарыстання з vMix**
