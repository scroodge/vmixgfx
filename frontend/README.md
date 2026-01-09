# Frontend - vMix Russian Billiard Score Control

Frontend components for the vMix Russian Billiard Score Control system. Contains the control panel for operators and the overlay display for vMix Browser Input.

## Structure

```
frontend/
├── control/          # Control Panel (operator interface)
│   ├── index.html
│   ├── style.css
│   └── app.js
└── overlay/          # vMix Overlay (score display)
    ├── index.html
    ├── style.css
    └── app.js
```

## Control Panel (`control/`)

Web-based control interface for operators to manage match scores, timers, and periods.

### Features

- Real-time score control with +/- buttons
- Team name configuration
- Period management
- Timer controls (Start/Stop/Set)
- Match reset functionality
- WebSocket connection status indicator
- Responsive design

### Access

**Local:**
```
http://localhost:8000/control
```

**LAN (replace with server IP):**
```
http://192.168.1.100:8000/control
```

### Usage

1. **Set Match ID**: Enter match ID in header (default: 1)
2. **Setup Match**:
   - Enter team names
   - Set initial period and timer
   - Click "Apply Setup"
3. **Control Scores**: Use +/- buttons for each team
4. **Manage Timer**: Start/Stop or set specific time
5. **Change Period**: Use +/- buttons
6. **Reset**: Click "Reset Match" to clear everything

### Technologies

- Vanilla JavaScript (no build step)
- WebSocket API for real-time updates
- Fetch API for REST calls
- CSS3 for responsive styling

## Overlay (`overlay/`)

Transparent overlay display designed for vMix Browser Input. Shows scores, period, and timer in a broadcast-ready format.

### Features

- Transparent background for vMix compositing
- Large, readable score display
- CSS animations on score changes (bump/pop + glow)
- Real-time WebSocket updates
- Automatic reconnection with exponential backoff
- Auto-formatted timer (MM:SS or HH:MM:SS)
- Multiple match support via query parameter

### Access

**Local (Match ID 1):**
```
http://localhost:8000/overlay?matchId=1
```

**Local (Match ID 2):**
```
http://localhost:8000/overlay?matchId=2
```

**LAN (replace with server IP):**
```
http://192.168.1.100:8000/overlay?matchId=1
```

### vMix Configuration

See main `README.md` for detailed vMix Browser Input setup instructions.

**Quick Setup:**
1. Add Browser Input in vMix
2. URL: `http://localhost:8000/overlay?matchId=1`
3. Width: `1920`, Height: `1080`
4. Zoom: `100%`
5. Scrollbars: `Disabled`
6. Transparency: `Enabled`

### Display Layout

```
HomeName | HomeScore | AwayScore | AwayName
         Period: 1     Timer: 15:00
```

### Animations

- **Score Changes**: Bump/pop scale animation with golden glow effect
- **Setup/Reset**: Fade-in transition
- **Animations**: Pure CSS keyframes (no external libraries)

### Technologies

- Vanilla JavaScript (no build step)
- WebSocket API with reconnection logic
- CSS3 animations and transitions
- Fetch API for fallback polling

## Running Locally

### Prerequisites

- Backend server must be running (see `../backend/README.md`)
- Modern web browser with WebSocket support
- No build step required - files are served directly by FastAPI

### Development

1. **Start Backend Server**:
   ```bash
   cd ../backend
   python main.py
   ```

2. **Open Control Panel**:
   - Navigate to: `http://localhost:8000/control`
   - Or use the overlay: `http://localhost:8000/overlay?matchId=1`

### File Modifications

Since there's no build step, you can edit files directly:

1. **Edit HTML/CSS/JS files** in `control/` or `overlay/`
2. **Refresh browser** to see changes
3. **No compilation needed** - changes are immediate

**Note**: If backend is running with `--reload`, restart the server if you change static file paths or routing.

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

Requires browsers with:
- WebSocket API support
- Fetch API support
- ES6+ JavaScript support
- CSS3 animations support

## Network Configuration

### Local Access

Works automatically when backend runs on `localhost:8000`.

### LAN Access

1. **Find Server IP**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Linux/Mac: `ifconfig` or `ip addr`

2. **Access via IP**:
   - Control: `http://192.168.1.100:8000/control`
   - Overlay: `http://192.168.1.100:8000/overlay?matchId=1`

3. **Ensure Firewall Allows Port 8000**

## Troubleshooting

### Control Panel Not Connecting

1. Check backend server is running
2. Verify connection status indicator (top right)
3. Open browser console (F12) for errors
4. Check WebSocket connection in Network tab

### Overlay Not Updating

1. Check browser console (F12) for WebSocket errors
2. Verify match ID matches control panel
3. Check backend server is running
4. Try refreshing the overlay page
5. Verify overlay URL in vMix Browser Input settings

### Animations Not Working

1. Check browser supports CSS animations
2. Verify CSS file is loading (check Network tab)
3. Check for JavaScript errors in console

### WebSocket Reconnection Issues

- Overlay has automatic reconnection with exponential backoff
- Check server logs for WebSocket errors
- Verify firewall allows WebSocket connections
- Try accessing via `localhost` instead of IP

## Customization

### Styling

Edit CSS files directly:
- Control Panel: `control/style.css`
- Overlay: `overlay/style.css`

### Layout

Modify HTML structure:
- Control Panel: `control/index.html`
- Overlay: `overlay/index.html`

### Functionality

Extend JavaScript:
- Control Panel: `control/app.js`
- Overlay: `overlay/app.js`

**Note**: All changes take effect immediately after saving (just refresh browser).

## File Structure Details

### Control Panel Files

- `index.html`: Main HTML structure, form elements, buttons
- `style.css`: Responsive design, button styles, layout
- `app.js`: WebSocket client, REST API calls, state management, event handlers

### Overlay Files

- `index.html`: Score display layout (minimal, optimized for performance)
- `style.css`: Transparent background, animations, score display styling
- `app.js`: WebSocket client with reconnection, animation triggers, state updates

---

**Note**: These frontend files are served as static files by the FastAPI backend. No separate web server needed.

---

# Беларуская мова (Belarusian) / Беларуская мова

## Фронтэнд - vMix Russian Billiard Score Control

Фронтэнд кампаненты для сістэмы кіравання лікам рускага більярда vMix. Змяшчае панэль кіравання для аператараў і оверлей дысплей для vMix Browser Input.

## Структура

```
frontend/
├── control/          # Панэль кіравання (інтэрфейс аператара)
│   ├── index.html
│   ├── style.css
│   └── app.js
└── overlay/          # vMix Оверлей (дысплей ліку)
    ├── index.html
    ├── style.css
    └── app.js
```

## Панэль кіравання (`control/`)

Вэб-інтэрфейс кіравання для аператараў па кіраванню лікам гульні, таймерамі і перыядамі.

### Магчымасці

- Кіраванне лікам у рэальным часе з кнопкамі +/-
- Канфігурацыя імёнаў каманд
- Кіраванне перыядамі
- Кіраванне таймерам (Старт/Стоп/Устаноўка)
- Функцыя скіду гульні
- Індыкатар статусу падключэння WebSocket
- Адаптыўны дызайн

### Доступ

**Лакальна:**
```
http://localhost:8000/control
```

**ЛАС (замяніце на IP сервера):**
```
http://192.168.1.100:8000/control
```

### Выкарыстанне

1. **Усталюйце Match ID**: Увядзіце ID гульні ў загалоўку (па змаўчанні: 1)
2. **Наладзьце гульню**:
   - Увядзіце імёны каманд
   - Усталюйце пачатковы перыяд і таймер
   - Націсніце "Apply Setup"
3. **Кіруйце лікам**: Выкарыстоўвайце кнопкі +/- для кожнай каманды
4. **Кіруйце таймерам**: Старт/Стоп або ўсталюйце канкрэтны час
5. **Змяніце перыяд**: Выкарыстоўвайце кнопкі +/-
6. **Скід**: Націсніце "Reset Match" для ачысткі ўсяго

### Тэхналогіі

- Vanilla JavaScript (без этапу зборкі)
- WebSocket API для абнаўленняў у рэальным часе
- Fetch API для REST запытаў
- CSS3 для адаптыўнай стылізацыі

## Оверлей (`overlay/`)

Празрысты оверлей дысплей, распрацаваны для vMix Browser Input. Паказвае лік, перыяд і таймер у фармаце, гатовым для трансляцыі.

### Магчымасці

- Празрысты фон для кампазіцыі vMix
- Вялікі, чытальны дысплей ліку
- CSS анімацыі пры змене ліку (bump/pop + свечэнне)
- Абнаўленні WebSocket у рэальным часе
- Аўтаматычнае перападлучэнне з экспанентным затармозваннем
- Аўта-фарматаваны таймер (ММ:СС або ГГ:ММ:СС)
- Падтрымка некалькіх гульняў праз параметр запыту

### Доступ

**Лакальна (Match ID 1):**
```
http://localhost:8000/overlay?matchId=1
```

**Лакальна (Match ID 2):**
```
http://localhost:8000/overlay?matchId=2
```

**ЛАС (замяніце на IP сервера):**
```
http://192.168.1.100:8000/overlay?matchId=1
```

### Канфігурацыя vMix

Гл. галоўны `README.md` для падрабязных інструкцый па наладах vMix Browser Input.

**Хуткая налада:**
1. Дадайце Browser Input у vMix
2. URL: `http://localhost:8000/overlay?matchId=1`
3. Шырыня: `1920`, Вышыня: `1080`
4. Маштаб: `100%`
5. Праколкі: `Адключана`
6. Празрыстасць: `Уключана`

### Макет дысплея

```
HomeName | HomeScore | AwayScore | AwayName
         Перыяд: 1     Таймер: 15:00
```

### Анімацыі

- **Змены ліку**: Анімацыя маштабавання bump/pop з залатым эфектам свечэння
- **Налада/Скід**: Пераход fade-in
- **Анімацыі**: Чыстыя CSS keyframes (без знешніх бібліятэк)

### Тэхналогіі

- Vanilla JavaScript (без этапу зборкі)
- WebSocket API з логікай перападлучэння
- CSS3 анімацыі і пераходы
- Fetch API для рэзервовага палінгу

## Запуск лакальна

### Патрабаванні

- Бэкэнд сервер павінен працаваць (гл. `../backend/README.md`)
- Сучасны вэб-браўзер з падтрымкай WebSocket
- Этап зборкі не патрабуецца - файлы абслугоўваюцца непасрэдна FastAPI

### Распрацоўка

1. **Запусціце бэкэнд сервер**:
   ```bash
   cd ../backend
   python main.py
   ```

2. **Адкрыйце панэль кіравання**:
   - Перайдзіце на: `http://localhost:8000/control`
   - Або выкарыстоўвайце оверлей: `http://localhost:8000/overlay?matchId=1`

### Змены файлаў

Паколькі няма этапу зборкі, вы можаце рэдагаваць файлы непасрэдна:

1. **Адрэдагуйце HTML/CSS/JS файлы** у `control/` або `overlay/`
2. **Абновіце браўзер** для прагляду змяненняў
3. **Кампіляцыя не патрэбна** - змены імгненныя

**Заўвага**: Калі бэкэнд працуе з `--reload`, перазапусціце сервер, калі вы змяняеце шляхі статычных файлаў або маршрутызацыю.

## Сумяшчальнасць з браўзерамі

- Chrome/Edge: ✅ Поўная падтрымка
- Firefox: ✅ Поўная падтрымка
- Safari: ✅ Поўная падтрымка
- Opera: ✅ Поўная падтрымка

Патрабуе браўзеры з:
- Падтрымкай WebSocket API
- Падтрымкай Fetch API
- Падтрымкай ES6+ JavaScript
- Падтрымкай CSS3 анімацый

## Сеткавая канфігурацыя

### Лакальны доступ

Працуе аўтаматычна, калі бэкэнд працуе на `localhost:8000`.

### Доступ па ЛАС

1. **Знайдзіце IP сервера**:
   - Windows: `ipconfig` (шукайце IPv4 Address)
   - Linux/Mac: `ifconfig` або `ip addr`

2. **Доступ праз IP**:
   - Кіраванне: `http://192.168.1.100:8000/control`
   - Оверлей: `http://192.168.1.100:8000/overlay?matchId=1`

3. **Пераканайцеся, што файрвол дазваляе порт 8000**

## Вырашэнне праблем

### Панэль кіравання не падключаецца

1. Праверце, што бэкэнд сервер працуе
2. Праверце індыкатар статусу падключэння (уверсе справа)
3. Адкрыйце кансоль браўзера (F12) на памылкі
4. Праверце падключэнне WebSocket ва ўкладцы Network

### Оверлей не абнаўляецца

1. Праверце кансоль браўзера (F12) на памылкі WebSocket
2. Праверце, што ID гульні адпавядае панэлі кіравання
3. Праверце, што бэкэнд сервер працуе
4. Паспрабуйце абнавіць старонку оверлея
5. Праверце URL оверлея ў наладах vMix Browser Input

### Анімацыі не працуюць

1. Праверце, што браўзер падтрымлівае CSS анімацыі
2. Праверце, што CSS файл загружаецца (праверце ўкладку Network)
3. Праверце на памылкі JavaScript у кансолі

### Праблемы з перападлучэннем WebSocket

- Оверлей мае аўтаматычнае перападлучэнне з экспанентным затармозваннем
- Праверце лагі сервера на памылкі WebSocket
- Праверце, што файрвол дазваляе WebSocket злучэнні
- Паспрабуйце доступ праз `localhost` замест IP

## Налада

### Стылізацыя

Адрэдагуйце CSS файлы непасрэдна:
- Панэль кіравання: `control/style.css`
- Оверлей: `overlay/style.css`

### Макет

Змяніце структуру HTML:
- Панэль кіравання: `control/index.html`
- Оверлей: `overlay/index.html`

### Функцыянальнасць

Пашырце JavaScript:
- Панэль кіравання: `control/app.js`
- Оверлей: `overlay/app.js`

**Заўвага**: Усе змены набываюць моц імгненна пасля захавання (проста абновіце браўзер).

## Дэталі структуры файлаў

### Файлы панэлі кіравання

- `index.html`: Галоўная структура HTML, элементы формы, кнопкі
- `style.css`: Адаптыўны дызайн, стылі кнопак, макет
- `app.js`: WebSocket кліент, REST API запыты, кіраванне станам, апрацоўшчыкі падзей

### Файлы оверлея

- `index.html`: Макет дысплея ліку (мінімальны, аптымізаваны для прадукцыйнасці)
- `style.css`: Празрысты фон, анімацыі, стылізацыя дысплея ліку
- `app.js`: WebSocket кліент з перападлучэннем, трыгеры анімацый, абнаўленні стану

---

**Заўвага**: Гэтыя фронтэнд файлы абслугоўваюцца як статычныя файлы бэкэнд FastAPI. Асобны вэб-сервер не патрабуецца.
