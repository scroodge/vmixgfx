# Backend - vMix Russian Billiard Score Control API

**Version: 0.1a (Alpha)**

FastAPI backend server providing REST API and WebSocket endpoints for real-time Russian billiard score management.

## Features

- REST API for match state management
- WebSocket server for real-time updates
- Server-side timer with automatic countdown
- Multiple match support (by match ID)
- In-memory state storage
- CORS enabled for local LAN access

## Requirements

- Python 3.8 or higher
- pip (Python package installer)

## Installation

### Step 1: Create Virtual Environment

**Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `websockets` - WebSocket support
- `python-multipart` - Form data handling
- `pydantic` - Data validation

### Step 3: Run the Server

**Option 1: Using Python directly**
```bash
python main.py
```

**Option 2: Using uvicorn (recommended for development)**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes (development only).

**Option 3: Run from project root**
```bash
cd ..
python backend/main.py
```

or

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Server Endpoints

Once running, the server will be available at:

- **API Base**: `http://localhost:8000`
- **Control Panel**: `http://localhost:8000/control`
- **Overlay**: `http://localhost:8000/overlay?matchId=1`
- **API Docs**: `http://localhost:8000/docs` (FastAPI auto-generated docs)

## Configuration

The server binds to `0.0.0.0:8000` by default, which allows:
- Local access via `localhost` or `127.0.0.1`
- LAN access via your machine's IP address (e.g., `192.168.1.100:8000`)

To change the port, edit `main.py`:

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Change port here
```

## API Endpoints

### REST API

All endpoints follow the pattern: `/api/match/{match_id}/...`

- `GET /api/match/{match_id}/state` - Get current match state
- `POST /api/match/{match_id}/setup` - Setup match (team names, period, timer)
- `POST /api/match/{match_id}/score` - Update score (`{"team": "home|away", "delta": ±int}`)
- `POST /api/match/{match_id}/reset` - Reset match to initial state
- `POST /api/match/{match_id}/timer/start` - Start countdown timer
- `POST /api/match/{match_id}/timer/stop` - Stop countdown timer
- `POST /api/match/{match_id}/timer/set` - Set timer to specific seconds
- `POST /api/match/{match_id}/period/set` - Set period number

### WebSocket

- `ws://localhost:8000/ws/match/{match_id}` - Real-time state updates

## State Structure

```json
{
  "match_id": "1",
  "homeName": "Team A",
  "awayName": "Team B",
  "homeScore": 5,
  "awayScore": 3,
  "period": 2,
  "timerSecondsRemaining": 1200,
  "timerRunning": false,
  "rev": 42
}
```

## Timer Behavior

- Timer runs in a background asyncio task
- Decrements `timerSecondsRemaining` every 1 second when `timerRunning=true`
- Automatically stops when reaching 0
- Prevents negative values
- Broadcasts state updates every second while running

## Troubleshooting

### Port Already in Use

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Import Errors

Make sure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Static Files Not Found

Ensure you're running from the project root (parent of `backend/` and `frontend/`), or adjust paths in `main.py`.

## Development

### Running with Auto-reload

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing Endpoints

Use curl or any HTTP client:

```bash
# Get state
curl http://localhost:8000/api/match/1/state

# Update score
curl -X POST http://localhost:8000/api/match/1/score \
  -H "Content-Type: application/json" \
  -d '{"team":"home","delta":1}'

# Setup match
curl -X POST http://localhost:8000/api/match/1/setup \
  -H "Content-Type: application/json" \
  -d '{"homeName":"Team A","awayName":"Team B","period":1,"timerSeconds":1800}'
```

### View API Documentation

FastAPI automatically generates interactive API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Production Considerations

For production use:
1. Remove `--reload` flag
2. Use a production ASGI server (gunicorn with uvicorn workers)
3. Configure proper CORS origins instead of `*`
4. Add authentication/authorization
5. Use HTTPS/WSS for secure connections
6. Implement persistent state storage (database) instead of in-memory
7. Add logging and monitoring
8. Use environment variables for configuration

---

**Note**: This backend serves both API endpoints and static frontend files.

---

# Беларуская мова (Belarusian) / Беларуская мова

**Версія: 0.1a (Альфа)**

## Бэкэнд - vMix Russian Billiard Score Control API

FastAPI бэкэнд сервер, які прадастаўляе REST API і WebSocket эндпоінты для кіравання лікам рускага більярда ў рэальным часе.

## Магчымасці

- REST API для кіравання станам гульні
- WebSocket сервер для абнаўленняў у рэальным часе
- Таймер на серверы з аўтаматычным адлікам
- Падтрымка некалькіх гульняў (па ID гульні)
- Захоўванне стану ў памяці
- CORS уключаны для доступу па лакальнай ЛАС

## Патрабаванні

- Python 3.8 або вышэй
- pip (устаноўшчык пакетаў Python)

## Устаноўка

### Крок 1: Стварыць віртуальнае асяроддзе

**Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Крок 2: Усталяваць залежнасці

```bash
pip install -r requirements.txt
```

Гэта ўсталюе:
- `fastapi` - Вэб-фрэймворк
- `uvicorn[standard]` - ASGI сервер
- `websockets` - Падтрымка WebSocket
- `python-multipart` - Апрацоўка форм даных
- `pydantic` - Валідацыя даных

### Крок 3: Запусціць сервер

**Варыянт 1: Выкарыстанне Python непасрэдна**
```bash
python main.py
```

**Варыянт 2: Выкарыстанне uvicorn (рэкамендуецца для распрацоўкі)**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Сцяжок `--reload` уключае аўтаматычную перазагрузку пры зменах кода (толькі для распрацоўкі).

**Варыянт 3: Запуск з кораня праекта**
```bash
cd ..
python backend/main.py
```

або

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Эндпоінты сервера

Пасля запуску сервер будзе даступны на:

- **База API**: `http://localhost:8000`
- **Панэль кіравання**: `http://localhost:8000/control`
- **Оверлей**: `http://localhost:8000/overlay?matchId=1`
- **Дакументацыя API**: `http://localhost:8000/docs` (аўтаматычна створаная дакументацыя FastAPI)

## Канфігурацыя

Сервер прывязваецца да `0.0.0.0:8000` па змаўчанні, што дазваляе:
- Лакальны доступ праз `localhost` або `127.0.0.1`
- Доступ па ЛАС праз IP-адрас вашай машыны (напрыклад, `192.168.1.100:8000`)

Каб змяніць порт, адрэдагуйце `main.py`:

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Змяніце порт тут
```

## Эндпоінты API

### REST API

Усе эндпоінты адпавядаюць шаблону: `/api/match/{match_id}/...`

- `GET /api/match/{match_id}/state` - Атрымаць бягучы стан гульні
- `POST /api/match/{match_id}/setup` - Налада гульні (імёны каманд, перыяд, таймер)
- `POST /api/match/{match_id}/score` - Абнавіць лік (`{"team": "home|away", "delta": ±int}`)
- `POST /api/match/{match_id}/reset` - Скінуць гульню ў пачатковы стан
- `POST /api/match/{match_id}/timer/start` - Запусціць таймер адліку
- `POST /api/match/{match_id}/timer/stop` - Спусціць таймер адліку
- `POST /api/match/{match_id}/timer/set` - Усталюйце таймер на канкрэтныя секунды
- `POST /api/match/{match_id}/period/set` - Усталюйце нумар перыяду

### WebSocket

- `ws://localhost:8000/ws/match/{match_id}` - Абнаўленні стану ў рэальным часе

## Структура стану

```json
{
  "match_id": "1",
  "homeName": "Каманда А",
  "awayName": "Каманда Б",
  "homeScore": 5,
  "awayScore": 3,
  "period": 2,
  "timerSecondsRemaining": 1200,
  "timerRunning": false,
  "rev": 42
}
```

## Паводзіны таймера

- Таймер працуе ў фонавай задачы asyncio
- Змяншае `timerSecondsRemaining` кожную секунду, калі `timerRunning=true`
- Аўтаматычна спыняецца пры дасягненні 0
- Прадухіляе адмоўныя значэнні
- Транслюе абнаўленні стану кожную секунду падчас працы

## Вырашэнне праблем

### Порт ужо выкарыстоўваецца

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Памылкі імпарту

Пераканайцеся, што віртуальнае асяроддзе актывавана і залежнасці ўсталяваны:
```bash
pip install -r requirements.txt
```

### Статычныя файлы не знойдзены

Пераканайцеся, што вы запускаеце з кораня праекта (бацька `backend/` і `frontend/`), або наладзьце шляхі ў `main.py`.

## Распрацоўка

### Запуск з аўта-перазагрузкай

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Тэставанне эндпоінтаў

Выкарыстоўвайце curl або любы HTTP кліент:

```bash
# Атрымаць стан
curl http://localhost:8000/api/match/1/state

# Абнавіць лік
curl -X POST http://localhost:8000/api/match/1/score \
  -H "Content-Type: application/json" \
  -d '{"team":"home","delta":1}'

# Налада гульні
curl -X POST http://localhost:8000/api/match/1/setup \
  -H "Content-Type: application/json" \
  -d '{"homeName":"Каманда А","awayName":"Каманда Б","period":1,"timerSeconds":1800}'
```

### Прагляд дакументацыі API

FastAPI аўтаматычна стварае інтэрактыўную дакументацыю API:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Меркаванні для вытворчасці

Для вытворчага выкарыстання:
1. Выдаліце сцяжок `--reload`
2. Выкарыстоўвайце вытворчы ASGI сервер (gunicorn з uvicorn воркерамі)
3. Наладзьце правільныя CORS крыніцы замест `*`
4. Дадайце аўтэнтыфікацыю/аўтарызацыю
5. Выкарыстоўвайце HTTPS/WSS для бяспечных злучэнняў
6. Рэалізуйце захаванне стану ў базе даных замест у памяці
7. Дадайце лагіраванне і маніторынг
8. Выкарыстоўвайце зменныя асяроддзя для канфігурацыі

---

**Заўвага**: Гэты бэкэнд абслугоўвае як эндпоінты API, так і статычныя фронтэнд файлы.
