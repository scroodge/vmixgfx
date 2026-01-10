# План: Система управления турнирами с JSON персистентностью

## 1. Backend: JSON персистентность и API для турниров

### Структура данных JSON:
Файл: `backend/data/tournaments.json`
```json
{
  "tournaments": {
    "tournament_1": {
      "id": "tournament_1",
      "name": "Чемпионат 2024",
      "created_at": 1234567890,
      "players": [
        {"id": "1", "name": "Иванов", "created_at": 1234567891},
        {"id": "2", "name": "Петров", "created_at": 1234567892}
      ]
    }
  },
  "current_tournament_id": "tournament_1",
  "tournament_id_counter": 1,
  "player_id_counter": 2
}
```

### Backend изменения (`backend/main.py`):

1. **Определить путь к JSON файлу:**
   - Файл: `backend/data/tournaments.json`
   - В PyInstaller режиме: использовать BASE_DIR / "data" для сохранения
   - В dev режиме: использовать `Path(__file__).parent / "data"`
   - Создавать папку data если её нет

2. **Добавить модели Pydantic:**
   ```python
   class Tournament(BaseModel):
       id: str
       name: str
       created_at: float
       players: List[Player] = []
   
   class TournamentCreate(BaseModel):
       name: str = Field(..., min_length=1, max_length=100)
   
   class TournamentData(BaseModel):
       tournaments: Dict[str, Tournament] = {}
       current_tournament_id: Optional[str] = None
       tournament_id_counter: int = 0
       player_id_counter: int = 0
   ```

3. **Функции для работы с JSON:**
   - `get_data_directory()` - получить путь к папке data (с учетом PyInstaller)
   - `get_tournaments_file_path()` - получить путь к tournaments.json
   - `load_tournaments_data()` - загрузить данные из JSON при старте
   - `save_tournaments_data()` - сохранить данные в JSON (после каждого изменения)
   - Автоматически создавать файл с дефолтными значениями если его нет

4. **Обновить структуру хранения:**
   - Заменить `players: Dict[str, Player] = {}` и `player_id_counter = 0`
   - На `tournaments_data: TournamentData`
   - При старте сервера загружать данные из JSON
   - При изменении - сохранять в JSON (после каждого API вызова)

5. **Добавить API endpoints:**
   - `GET /api/tournaments` - список всех турниров
   - `POST /api/tournaments` - создать турнир (body: {name})
   - `GET /api/tournaments/{tournament_id}` - информация о турнире
   - `PUT /api/tournaments/{tournament_id}` - обновить название (body: {name})
   - `DELETE /api/tournaments/{tournament_id}` - удалить турнир
   - `GET /api/tournaments/current` - получить текущий выбранный турнир
   - `POST /api/tournaments/{tournament_id}/select` - выбрать турнир как текущий
   - `GET /api/tournaments/{tournament_id}/players` - получить игроков турнира
   - `POST /api/tournaments/{tournament_id}/players` - добавить игрока в турнир (body: {name})
   - `DELETE /api/tournaments/{tournament_id}/players/{player_id}` - удалить игрока

6. **Обновить существующие endpoints игроков:**
   - `POST /api/players` - добавляет в текущий турнир (или создает турнир по умолчанию)
   - `GET /api/players` - возвращает игроков текущего турнира
   - `DELETE /api/players/{player_id}` - удаляет из текущего турнира
   - Если нет текущего турнира - создавать "Default Tournament"

7. **Обработка PyInstaller:**
   - При запуске из bundle использовать BASE_DIR / "data" (будет рядом с exe)
   - В dev режиме использовать `Path(__file__).parent / "data"`
   - Создавать папку если её нет при первом запуске

## 2. Frontend: UI для управления турнирами

### Добавить секцию управления турнирами (`frontend/control/index.html`):

1. **Новая секция "Tournament Management" (перед Setup Section):**
   ```html
   <section class="panel tournament-panel">
       <h2 data-i18n="tournamentManagement">Tournament Management</h2>
       <div class="tournament-selector-group">
           <label data-i18n="currentTournament">Current Tournament:</label>
           <div style="display: flex; gap: 10px; align-items: center;">
               <select id="tournament-select" class="tournament-select"></select>
               <button id="create-tournament-btn" class="btn btn-small" data-i18n="createTournament">Create New</button>
               <button id="edit-tournament-btn" class="btn btn-small" data-i18n="editTournament">Edit</button>
               <button id="delete-tournament-btn" class="btn btn-small btn-danger" data-i18n="deleteTournament">Delete</button>
           </div>
       </div>
   </section>
   ```

2. **Модальное окно создания турнира:**
   ```html
   <div id="create-tournament-modal" class="modal-overlay" style="display: none;">
       <div class="modal">
           <div class="modal-header">
               <h3 data-i18n="createTournament">Create Tournament</h3>
               <button class="modal-close">&times;</button>
           </div>
           <div class="modal-body">
               <div class="form-group">
                   <label data-i18n="tournamentName">Tournament Name:</label>
                   <input type="text" id="new-tournament-name" maxlength="100" />
               </div>
           </div>
           <div class="modal-footer">
               <button id="create-tournament-confirm" class="btn btn-primary" data-i18n="create">Create</button>
               <button id="create-tournament-cancel" class="btn btn-small" data-i18n="cancel">Cancel</button>
           </div>
       </div>
   </div>
   ```

3. **Модальное окно редактирования турнира:**
   ```html
   <div id="edit-tournament-modal" class="modal-overlay" style="display: none;">
       <div class="modal">
           <div class="modal-header">
               <h3 data-i18n="editTournament">Edit Tournament</h3>
               <button class="modal-close">&times;</button>
           </div>
           <div class="modal-body">
               <div class="form-group">
                   <label data-i18n="tournamentName">Tournament Name:</label>
                   <input type="text" id="edit-tournament-name" maxlength="100" />
               </div>
           </div>
           <div class="modal-footer">
               <button id="edit-tournament-confirm" class="btn btn-primary" data-i18n="save">Save</button>
               <button id="edit-tournament-cancel" class="btn btn-small" data-i18n="cancel">Cancel</button>
           </div>
       </div>
   </div>
   ```

### JavaScript изменения (`frontend/control/app.js`):

1. **Добавить переменные и элементы DOM:**
   ```javascript
   let currentTournamentId = null;
   
   elements.tournamentSelect = document.getElementById('tournament-select');
   elements.createTournamentBtn = document.getElementById('create-tournament-btn');
   elements.editTournamentBtn = document.getElementById('edit-tournament-btn');
   elements.deleteTournamentBtn = document.getElementById('delete-tournament-btn');
   ```

2. **Добавить функции для работы с турнирами:**
   - `loadTournaments()` - загрузить список турниров и заполнить dropdown
   - `getCurrentTournament()` - получить текущий турнир
   - `selectTournament(tournamentId)` - выбрать турнир (установить как текущий)
   - `createTournament(name)` - создать новый турнир
   - `updateTournament(tournamentId, name)` - обновить название
   - `deleteTournament(tournamentId)` - удалить турнир
   - `showCreateTournamentModal()` - показать модальное окно создания
   - `showEditTournamentModal(tournamentId)` - показать модальное окно редактирования
   - `closeModals()` - закрыть все модальные окна

3. **Обновить функции работы с игроками:**
   - `loadPlayers()` - загружает игроков текущего турнира (или создает дефолтный)
   - `addPlayer(name)` - добавляет игрока в текущий турнир (через новый endpoint)
   - `deletePlayer(playerId)` - удаляет игрока из текущего турнира (через новый endpoint)

4. **Обработчики событий:**
   - При смене турнира в dropdown - вызывать `selectTournament()`
   - При смене турнира - обновлять список игроков
   - При создании турнира - автоматически выбирать его как текущий
   - Сохранять выбранный турнир в localStorage (для восстановления)

## 3. Упрощение секции Game Setup

### Изменения в `frontend/control/index.html`:

1. **Упростить секцию Game Setup:**
   - Убрать поля для ввода имен: `<input id="home-name">` и `<input id="away-name">`
   - Оставить только:
     - Game (period)
     - Timer (MM:SS)
     - Кнопку "Apply Setup"
   - Добавить текст под заголовком: "Имена игроков выбираются через секцию Player Names"

### JavaScript изменения (`frontend/control/app.js`):

1. **Обновить функцию setup:**
   - При вызове `/api/match/{match_id}/setup`:
     - НЕ передавать homeName и awayName (они опциональны в API)
     - Использовать текущие значения из state (которые устанавливаются через кнопки Player Names)
     - Передавать только period и timerSeconds

2. **Обновить updateUI:**
   - Убрать обновление полей `elements.homeName` и `elements.awayName` (их больше нет)
   - Имена отображаются в секции Player Names (кнопки выделяются если выбраны)
   - Обновлять только отображение имен в `elements.homeTeamNameDisplay` и `elements.awayTeamNameDisplay`

3. **Обновить элементы DOM:**
   - Убрать `homeName` и `awayName` из elements объекта (или сделать их null/undefined)

## 4. Обновление API endpoints

### Обновить `/api/match/{match_id}/setup` в `backend/main.py`:
```python
class SetupRequest(BaseModel):
    homeName: Optional[str] = Field(default=None, min_length=1, max_length=50)  # Опциональное
    awayName: Optional[str] = Field(default=None, min_length=1, max_length=50)  # Опциональное
    period: int = Field(default=1, ge=1, le=20)
    timerSeconds: int = Field(default=0, ge=0)

# В функции setup_match:
# Если homeName/awayName не переданы - использовать текущие значения из state
if request.homeName is not None:
    state.homeName = request.homeName
if request.awayName is not None:
    state.awayName = request.awayName
```

## Структура файлов для изменений:

### Новые файлы/папки:
- `backend/data/` - папка для хранения данных (создается автоматически)
- `backend/data/tournaments.json` - JSON файл с данными (создается автоматически)

### Изменяемые файлы:
- `backend/main.py` - JSON персистентность, API для турниров, обновление endpoints игроков
- `frontend/control/index.html` - секция управления турнирами, модальные окна, упрощение Game Setup
- `frontend/control/app.js` - логика управления турнирами, обновление работы с игроками
- `frontend/control/style.css` - стили для управления турнирами и модальных окон
- `frontend/translations.js` - переводы для новых элементов

## Последовательность реализации:

1. **Этап 1**: Backend JSON персистентность
   - Функции загрузки/сохранения JSON с поддержкой PyInstaller
   - Обновление моделей данных
   - Тестирование сохранения/загрузки при перезапуске

2. **Этап 2**: Backend API для турниров
   - CRUD endpoints для турниров
   - Endpoint для выбора текущего турнира
   - Обновление endpoints для игроков (работа с турнирами)
   - Тестирование API

3. **Этап 3**: Frontend UI управления турнирами
   - Секция управления турнирами
   - Модальные окна создания/редактирования
   - Интеграция dropdown выбора турнира
   - Сохранение выбранного турнира в localStorage

4. **Этап 4**: Обновление работы с игроками
   - Обновление функций для работы с текущим турниром
   - Автоматическое создание дефолтного турнира если нет текущего

5. **Этап 5**: Упрощение Game Setup
   - Удаление полей имен
   - Обновление логики setup
   - Обновление переводов
